/**
 * Wix Payments API Client
 * 
 * This file contains client-side functions that call Supabase Edge Functions
 * to interact with Wix Payments API (server-side calls are required for security)
 */

// Get Supabase URL from environment
const getSupabaseFunctionUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return '';
  // Ensure URL doesn't already have /functions/v1
  if (supabaseUrl.includes('/functions/v1')) return supabaseUrl;
  return `${supabaseUrl}/functions/v1`;
};

const SUPABASE_FUNCTION_URL = getSupabaseFunctionUrl();

export interface CreatePaymentLinkRequest {
  userEmail: string;
  userName: string;
  userId: string;
}

export interface CreatePaymentLinkResponse {
  paymentLinkUrl: string;
  paymentLinkId: string;
  error?: string;
}

export interface SubscriptionStatus {
  id: string;
  status: 'pending' | 'active' | 'canceled' | 'expired' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan_id: string;
}

/**
 * Create a payment link for subscription checkout
 * This calls the Supabase Edge Function which handles the Wix API call
 */
export async function createPaymentLink(
  userEmail: string,
  userName: string,
  userId: string
): Promise<CreatePaymentLinkResponse> {
  try {
    const { data: { session } } = await import('../lib/supabase').then(m => 
      m.supabase.auth.getSession()
    );

    if (!session) {
      throw new Error('User not authenticated');
    }

    // Get Supabase anon key for apikey header (required by Edge Functions)
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!SUPABASE_FUNCTION_URL) {
      throw new Error('Supabase URL not configured');
    }

    const requestBody = {
      action: 'create_payment_link',
      userEmail,
      userName,
      userId,
    };

    const response = await fetch(`${SUPABASE_FUNCTION_URL}/wix-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey || '', // Required for Supabase Edge Functions
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
      }
      
      console.error('Edge Function error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: `${SUPABASE_FUNCTION_URL}/wix-payments`,
      });
      
      throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      paymentLinkUrl: data.paymentLinkUrl,
      paymentLinkId: data.paymentLinkId,
    };
  } catch (error) {
    console.error('Error creating payment link:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide more helpful error messages
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      return {
        paymentLinkUrl: '',
        paymentLinkId: '',
        error: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      };
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('Invalid token')) {
      return {
        paymentLinkUrl: '',
        paymentLinkId: '',
        error: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
      };
    }
    
    if (errorMessage.includes('Supabase URL not configured')) {
      return {
        paymentLinkUrl: '',
        paymentLinkId: '',
        error: 'Error de configuración. Por favor, contacta al soporte.',
      };
    }
    
    return {
      paymentLinkUrl: '',
      paymentLinkId: '',
      error: errorMessage,
    };
  }
}

/**
 * Get user's subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  try {
    const { data: { session } } = await import('../lib/supabase').then(m => 
      m.supabase.auth.getSession()
    );

    if (!session) {
      return null;
    }

    const { supabase } = await import('../lib/supabase');
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const subscription = data as any;
    return {
      id: subscription.id,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      plan_id: subscription.plan_id,
    } as SubscriptionStatus;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const subscription = await getSubscriptionStatus();
  
  if (!subscription) {
    return false;
  }

  if (subscription.status !== 'active') {
    return false;
  }

  const periodEnd = new Date(subscription.current_period_end);
  const now = new Date();

  if (periodEnd < now) {
    return false;
  }

  if (subscription.cancel_at_period_end) {
    return false;
  }

  return true;
}
