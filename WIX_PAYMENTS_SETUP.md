# Wix Payments Integration Setup Guide

This guide explains how to set up and deploy the Wix Payments integration for $20/month subscriptions.

## Prerequisites

- ✅ Wix Site ID: `f76af811-2c6c-481e-9c26-9ce4cc6c49a2`
- ✅ Plan ID: `9d401c1f-0bd1-44b3-8cdf-937fe704aa49`
- ✅ Wix API Key: (stored in Supabase Edge Function secrets)

## Step 1: Database Setup

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Run the SQL script from `SUBSCRIPTIONS_SETUP.sql`
   - This creates the `subscriptions` table
   - Sets up Row Level Security policies
   - Creates helper functions

## Step 2: Configure Supabase Edge Function Secrets

1. In Supabase Dashboard, go to **Settings** → **Edge Functions**
2. Click on **Secrets** (or go to **Project Settings** → **Edge Functions** → **Secrets**)
3. Add the following secrets:

```
WIX_API_KEY=IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcImM3MmI2NmUyLWIxZWMtNDgyMy1hNmY0LWVkZjA4MzdjYzZhMFwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjQ4ZDJmNTc2LWUzMDktNGQyOS1iYWE1LTA1ZTE2ZTlkMzE0M1wifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCI0OWM3YTkzOS04OTAyLTQzZWItOWNiYy0wZjcwYWJjNDQ5ODlcIn19IiwiaWF0IjoxNzY4NDMwMTE4fQ.QjWPVBHl5wipxUf9QHqpKkzUWcK_7MLHZKRLY5UfzV_ElYZbddxs42E2pndbhsBjxEOEJ20JD3zPBXVH5-JCZcgEH0qhUAYhZkzwCT3wR2L0g_ul7d6TJg3K2Tpaw5vBcNafY1PIfFGb4qfJVELTRzFz3Ptzt_0TK92fr5qgR0_MeUhXgX0g-um2VLuF_VcYL5VBZ1l2RIyavck1M2_DPade3gZ87cLLiBym7IFtUrmev2Ydxn4J93Sd1iutAnEPAhegDKEFis0nS1LK0xaxR5rP6PqTDj-tXNZrFogeJc41MgVL-VQ_Xlj8HqDXiCbSjVh3elZEgZuvKGGkww9m6A

WIX_SITE_ID=f76af811-2c6c-481e-9c26-9ce4cc6c49a2

WIX_PLAN_ID=9d401c1f-0bd1-44b3-8cdf-937fe704aa49

APP_URL=https://your-domain.com
```

**Important**: Replace `APP_URL` with your actual production URL (e.g., `https://your-app.vercel.app`)

## Step 3: Deploy Supabase Edge Function

### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI if you haven't:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in Supabase Dashboard → Settings → General → Reference ID)

4. Deploy the function:
   ```bash
   supabase functions deploy wix-payments
   ```

### Option B: Using Supabase Dashboard

1. Go to **Edge Functions** in your Supabase Dashboard
2. Click **Create a new function**
3. Name it `wix-payments`
4. Copy the code from `supabase/functions/wix-payments/index.ts`
5. Paste it into the function editor
6. Click **Deploy**

## Step 4: Update Environment Variables

Add to your `.env` file (for local development):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For production (Vercel/Netlify), add these in your deployment platform's environment variables.

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Sign up or log in to your app

3. Navigate to `/subscription`

4. Click "Suscribirse por $20/mes"

5. You should be redirected to Wix checkout

6. Complete a test payment (use Wix's test mode if available)

7. After payment, you should be redirected back to `/subscription?success=true`

8. Verify the subscription status updates in the database

## Step 6: Set Up Webhooks (Optional but Recommended)

To automatically update subscription status when payments are processed:

1. In your Wix dashboard, go to **Settings** → **Webhooks**
2. Create a new webhook:
   - Event: Payment completed / Subscription renewed
   - URL: `https://your-supabase-project.supabase.co/functions/v1/wix-webhook`
   - Method: POST

3. Create a webhook handler Edge Function (similar to `wix-payments`) that:
   - Receives webhook events from Wix
   - Updates the subscription status in the database
   - Handles subscription renewals and cancellations

## How It Works

1. **User clicks Subscribe** → Frontend calls Supabase Edge Function
2. **Edge Function** → Calls Wix Payment Links API to create checkout URL
3. **Wix Checkout** → User completes payment on Wix-hosted page
4. **Redirect** → User returns to your app with `?success=true`
5. **Status Check** → App checks subscription status from database

## Troubleshooting

### Error: "Failed to create payment link"
- Check that your Wix API Key is correct in Supabase secrets
- Verify Wix Site ID and Plan ID are correct
- Check Edge Function logs in Supabase Dashboard

### Subscription status not updating
- Verify the database table was created correctly
- Check RLS policies allow updates
- Review Edge Function logs for errors

### Redirect not working
- Ensure `APP_URL` in Supabase secrets matches your actual domain
- Check that redirect URLs are configured correctly in Wix

### CORS errors
- The Edge Function includes CORS headers
- If issues persist, check your Supabase project CORS settings

## Security Notes

- ✅ API Key is stored securely in Supabase Edge Function secrets
- ✅ All Wix API calls are made server-side (never exposed to client)
- ✅ User authentication is verified before creating payment links
- ✅ Row Level Security protects subscription data

## Next Steps

- Set up webhooks for automatic subscription status updates
- Add email notifications for subscription events
- Implement subscription cancellation flow
- Add subscription management UI (cancel, update payment method)
