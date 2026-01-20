// Supabase Edge Function for Wix Payments API
// This handles server-side calls to Wix API (keeps API key secure)
//
// IMPORTANT: Must use 'npm:' prefix for Deno/Supabase Edge Functions
// DO NOT change this to '@supabase/supabase-js' - it will cause deployment errors

import { createClient } from 'npm:@supabase/supabase-js@2';

const WIX_API_KEY = Deno.env.get('WIX_API_KEY') || '';
const WIX_SITE_ID = Deno.env.get('WIX_SITE_ID') || 'f76af811-2c6c-481e-9c26-9ce4cc6c49a2';
const WIX_PLAN_ID = Deno.env.get('WIX_PLAN_ID') || '9d401c1f-0bd1-44b3-8cdf-937fe704aa49';
const WIX_API_BASE = 'https://www.wixapis.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  action: string;
  userEmail?: string;
  userName?: string;
  userId: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate required environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error', details: 'Missing Supabase credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!WIX_API_KEY) {
      console.error('Missing WIX_API_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error', details: 'Missing Wix API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase client
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = await req.json() as RequestBody;
    const { action, userEmail, userName, userId } = requestBody;

    if (action === 'create_payment_link') {
      // Use Payment Links API with simple structure (no line items, just amount)
      // This avoids the member authentication issues with Pricing Plans API
      
      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
      
      // Get plan details to get the price
      const planResponse = await fetch(
        `${WIX_API_BASE}/pricing-plans/v3/plans/${WIX_PLAN_ID}`,
        {
          method: 'GET',
          headers: {
            'Authorization': WIX_API_KEY,
            'wix-site-id': WIX_SITE_ID,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!planResponse.ok) {
        const errorText = await planResponse.text();
        console.error('Error fetching plan:', { status: planResponse.status, error: errorText });
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch plan details',
            details: `Wix API returned ${planResponse.status}: ${errorText}`,
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const planData = await planResponse.json();
      
      // Extract price from plan (structure may vary)
      // Ensure price is a valid decimal string (e.g., "20.00" not 20 or undefined)
      let planPrice = planData.plan?.pricing?.price?.value || 
                     planData.plan?.pricing?.recurring?.price?.value || 
                     planData.plan?.pricing?.singlePaymentForDuration?.price?.value ||
                     '20.00';
      
      // Ensure price is a string and has proper decimal format
      if (typeof planPrice === 'number') {
        planPrice = planPrice.toFixed(2);
      } else if (typeof planPrice !== 'string') {
        planPrice = '20.00';
      }
      
      // Ensure it has at least one decimal place
      if (!planPrice.includes('.')) {
        planPrice = `${planPrice}.00`;
      }
      
      const planCurrency = planData.plan?.pricing?.price?.currency || 
                          planData.plan?.pricing?.recurring?.price?.currency ||
                          planData.plan?.pricing?.singlePaymentForDuration?.price?.currency ||
                          'USD';
      const planName = planData.plan?.name || 'Camino Santiago Monthly Subscription';

      // Create payment link with minimal line item
      // When type is ECOM, ecomPaymentLink.lineItems is required with at least 1 item
      const lineItem = {
        type: 'CUSTOM',
        custom_item: {
          name: planName,
        },
        options: {
          customItem: {
            price: String(planPrice || '20.00'),
            quantity: 1,
          },
        },
      };

      const paymentLinkRequestBody = {
        paymentLink: {
          type: 'ECOM',
          title: planName,
          description: 'Monthly access to the Camino Santiago training program',
          currency: planCurrency,
          paymentsLimit: 1,
          source: {
            appId: '1380b703-ce81-ff05-f115-39571d94dfcd', // Wix eCommerce appDefId
          },
          ecomPaymentLink: {
            lineItems: [lineItem],
          },
          callbacks: {
            successUrl: `${appUrl}/subscription?success=true&userId=${userId}`,
            errorUrl: `${appUrl}/subscription?error=true`,
          },
        },
      };

      const paymentLinkResponse = await fetch(
        `${WIX_API_BASE}/payment-links/v1/payment-links`,
        {
          method: 'POST',
          headers: {
            'Authorization': WIX_API_KEY,
            'wix-site-id': WIX_SITE_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentLinkRequestBody),
        }
      );

      if (!paymentLinkResponse.ok) {
        const errorText = await paymentLinkResponse.text();
        console.error('Error creating payment link:', {
          status: paymentLinkResponse.status,
          statusText: paymentLinkResponse.statusText,
          error: errorText,
          requestBody: paymentLinkRequestBody,
        });
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create payment link',
            details: `Wix API returned ${paymentLinkResponse.status}: ${errorText}`,
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentLinkData = await paymentLinkResponse.json();
      
      const paymentLink = paymentLinkData.paymentLink || paymentLinkData;
      const paymentLinkUrl = paymentLink.url || paymentLink.urls?.primary || paymentLink.checkoutUrl || '';
      const paymentLinkId = paymentLink.id || '';
      
      // Store pending subscription in database
      const { error: dbError } = await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: userId,
          wix_payment_link_id: paymentLinkId,
          plan_id: WIX_PLAN_ID,
          status: 'pending',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (dbError) {
        console.error('Error saving subscription:', dbError);
      }

      return new Response(
        JSON.stringify({
          paymentLinkUrl: paymentLinkUrl,
          paymentLinkId: paymentLinkId,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in wix-payments function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
