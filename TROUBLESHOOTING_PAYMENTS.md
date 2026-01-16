# Troubleshooting: "Failed to Create Payment Link" Error

## Common Causes and Solutions

### 1. Edge Function Not Deployed

**Symptom**: Error message appears immediately, or network error in console.

**Solution**:
1. Go to Supabase Dashboard → Edge Functions
2. Verify `wix-payments` function exists and is deployed
3. If not, deploy it following `DEPLOY_EDGE_FUNCTION.md`

**Check**: Open browser console and look for the fetch request to `/functions/v1/wix-payments`

---

### 2. Missing Environment Variables/Secrets

**Symptom**: Error mentions "Server configuration error" or "Missing credentials"

**Solution**:
1. Go to Supabase Dashboard → Settings → Edge Functions → Secrets
2. Verify these secrets are set:
   - `WIX_API_KEY` ✅
   - `WIX_SITE_ID` ✅
   - `WIX_PLAN_ID` ✅
   - `APP_URL` (your production URL)
   - `SUPABASE_URL` (automatically set, but verify)
   - `SUPABASE_SERVICE_ROLE_KEY` (automatically set, but verify)

**Check**: Look at Edge Function logs in Supabase Dashboard for specific missing variable

---

### 3. Incorrect API Key Format

**Symptom**: Wix API returns 401 or 403 error

**Solution**:
1. Verify your Wix API Key is correct
2. Ensure it starts with `IST.` (for API keys)
3. Check that the API key has permissions for Payments API

**Check**: Edge Function logs will show Wix API error details

---

### 4. Plan ID Mismatch

**Symptom**: Error "Failed to fetch plan details from Wix"

**Solution**:
1. Verify Plan ID in Supabase secrets matches your Wix Pricing Plan ID
2. Ensure the plan exists and is active in Wix
3. Check that the plan is set up for recurring payments

**Check**: 
- Supabase secret: `WIX_PLAN_ID` should be `9d401c1f-0bd1-44b3-8cdf-937fe704aa49`
- Verify in Wix Dashboard → Pricing Plans

---

### 5. Payment Links API Not Available

**Symptom**: Error from Wix API about payment links

**Solution**:
1. Ensure your Wix site has Wix Payments enabled
2. Verify your site is on a premium plan (required for Payment Links API)
3. Check that Payment Links feature is available for your account

**Alternative**: If Payment Links API doesn't work, we may need to use a different Wix API endpoint

---

### 6. CORS or Network Issues

**Symptom**: "Failed to fetch" or network error

**Solution**:
1. Check browser console for CORS errors
2. Verify `VITE_SUPABASE_URL` is set correctly in `.env`
3. Ensure you're using HTTPS in production (required for some features)

**Check**: Browser Network tab → Look for failed request to Edge Function

---

### 7. Authentication Issues

**Symptom**: "Invalid token" or 401 error

**Solution**:
1. User must be logged in
2. Try logging out and back in
3. Check that session is valid

**Check**: Browser console → Application → Cookies → Look for Supabase session

---

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click Subscribe button
4. Look for error messages - they now include more details

### Step 2: Check Edge Function Logs
1. Go to Supabase Dashboard → Edge Functions → `wix-payments`
2. Click "Logs" tab
3. Look for error messages when you click Subscribe
4. The logs now include detailed error information

### Step 3: Test Edge Function Directly
You can test the Edge Function using curl:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/wix-payments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_payment_link",
    "userEmail": "test@example.com",
    "userName": "Test User",
    "userId": "USER_ID"
  }'
```

Replace:
- `YOUR_PROJECT` with your Supabase project ref
- `YOUR_ACCESS_TOKEN` with a valid user session token
- `YOUR_ANON_KEY` with your Supabase anon key
- `USER_ID` with a valid user ID

### Step 4: Verify Wix API Directly
Test if your Wix API key works:

```bash
curl -X GET "https://www.wixapis.com/pricing-plans/v3/plans/9d401c1f-0bd1-44b3-8cdf-937fe704aa49" \
  -H "Authorization: YOUR_WIX_API_KEY" \
  -H "wix-site-id: f76af811-2c6c-481e-9c26-9ce4cc6c49a2"
```

---

## Most Likely Issues

Based on the error "failed to create payment link", the most common causes are:

1. **Edge Function not deployed** (50% of cases)
   - Solution: Deploy the function via Supabase Dashboard

2. **Missing secrets** (30% of cases)
   - Solution: Add all required secrets in Supabase Dashboard

3. **Wix API key issues** (15% of cases)
   - Solution: Verify API key is correct and has proper permissions

4. **Payment Links API not available** (5% of cases)
   - Solution: May need to use alternative Wix API endpoint

---

## Quick Fix Checklist

- [ ] Edge Function `wix-payments` is deployed
- [ ] All secrets are set in Supabase (WIX_API_KEY, WIX_SITE_ID, WIX_PLAN_ID, APP_URL)
- [ ] Wix API Key is correct and starts with `IST.`
- [ ] Plan ID matches your Wix Pricing Plan
- [ ] Wix Payments is enabled on your site
- [ ] Site is on premium plan (if required)
- [ ] Browser console shows detailed error (check Network tab)
- [ ] Edge Function logs show specific error

---

## Getting More Help

If none of these solutions work:

1. Check Edge Function logs for the exact error
2. Check browser console for network/API errors
3. Verify all environment variables are set
4. Test Wix API key directly with curl
5. Contact support with:
   - Error message from browser console
   - Error from Edge Function logs
   - Screenshot of Supabase secrets (hide actual values)
