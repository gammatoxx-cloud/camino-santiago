-- Subscriptions Setup for Wix Payments Integration
-- Run this SQL in your Supabase SQL Editor

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  wix_order_id TEXT, -- Wix order/transaction ID
  wix_payment_link_id TEXT, -- Wix payment link ID
  plan_id TEXT NOT NULL, -- Wix plan ID: 9d401c1f-0bd1-44b3-8cdf-937fe704aa49
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'canceled', 'expired', 'past_due')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One active subscription per user
);

-- Create index for efficient queries
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_wix_order_id ON subscriptions(wix_order_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own subscription (for status changes from webhooks)
-- Note: Webhooks will use service role, so we need a policy that allows updates
-- We'll use a function for webhook updates
CREATE POLICY "Users can update own subscription" ON subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM subscriptions 
    WHERE subscriptions.user_id = user_id_param 
    AND subscriptions.status = 'active'
    AND subscriptions.current_period_end > NOW()
    AND (subscriptions.cancel_at_period_end = FALSE OR subscriptions.canceled_at IS NULL)
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION has_active_subscription(UUID) TO authenticated;

-- Function to update subscription from webhook (for service role)
CREATE OR REPLACE FUNCTION update_subscription_from_webhook(
  p_user_id UUID,
  p_wix_order_id TEXT,
  p_status TEXT,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_id UUID;
BEGIN
  -- Insert or update subscription
  INSERT INTO subscriptions (
    user_id,
    wix_order_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    updated_at
  )
  VALUES (
    p_user_id,
    p_wix_order_id,
    '9d401c1f-0bd1-44b3-8cdf-937fe704aa49', -- Your plan ID
    p_status,
    p_period_start,
    p_period_end,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    wix_order_id = EXCLUDED.wix_order_id,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = NOW()
  RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
END;
$$;

-- Grant execute permissions (service role will use this)
GRANT EXECUTE ON FUNCTION update_subscription_from_webhook(UUID, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;

-- Add subscription status helper to profiles (optional, for quick checks)
-- This is just for convenience - you can query subscriptions table directly
COMMENT ON TABLE subscriptions IS 'Stores user subscription information from Wix Payments';
