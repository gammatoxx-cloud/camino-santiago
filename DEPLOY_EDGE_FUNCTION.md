# Deploy Edge Function via Supabase Dashboard

Since CLI deployment requires interactive authentication, here's how to deploy via the Supabase Dashboard:

## Step 1: Access Edge Functions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. In the left sidebar, click **Edge Functions**

## Step 2: Create New Function

1. Click **Create a new function** button
2. Name it: `wix-payments`
3. Click **Create function**

## Step 3: Copy Function Code

1. Open the file: `supabase/functions/wix-payments/index.ts`
2. Copy ALL the code from that file
3. Paste it into the function editor in the Supabase Dashboard

## Step 4: Verify Secrets Are Set

Make sure you've added these secrets in **Settings → Edge Functions → Secrets**:
- `WIX_API_KEY` ✅
- `WIX_SITE_ID` ✅
- `WIX_PLAN_ID` ✅
- `APP_URL` (your production URL, e.g., `https://your-app.vercel.app`)

## Step 5: Deploy

1. Click **Deploy** button in the Supabase Dashboard
2. Wait for deployment to complete (usually takes 30-60 seconds)

## Step 6: Test the Function

After deployment, you can test it by:

1. Going to your app: `/subscription`
2. Clicking "Suscribirse por $20/mes"
3. It should redirect to Wix checkout

## Alternative: Deploy via CLI (if you prefer)

If you want to use CLI instead:

1. Get your access token from: https://supabase.com/dashboard/account/tokens
2. Set it as environment variable:
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_token_here
   ```
3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find project ref in: Settings → General → Reference ID)
4. Deploy:
   ```bash
   supabase functions deploy wix-payments
   ```
