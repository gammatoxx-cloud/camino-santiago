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
      // Use Pricing Plans Checkout API for subscriptions (not Payment Links API)
      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
      
      // Step 1: Find or create a Wix member for this user
      let wixMemberId: string | null = null;
      
      console.log('Starting member lookup/creation for:', { userEmail, userName, userId });
      
      if (!userEmail) {
        console.error('No userEmail provided');
        return new Response(
          JSON.stringify({ 
            error: 'User email is required',
            details: 'userEmail must be provided in the request body',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // First, try to find existing member by email
      console.log('Querying for existing member with email:', userEmail);
      const queryMemberResponse = await fetch(
        `${WIX_API_BASE}/members/v1/members/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': WIX_API_KEY,
            'wix-site-id': WIX_SITE_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: {
              filter: {
                loginEmail: { $eq: userEmail },
              },
              paging: { limit: 1 },
            },
          }),
        }
      );

      const queryMemberStatus = queryMemberResponse.status;
      console.log('Member query response status:', queryMemberStatus);

      if (queryMemberResponse.ok) {
        const memberQueryData = await queryMemberResponse.json();
        console.log('Member query response data:', JSON.stringify(memberQueryData, null, 2));
        if (memberQueryData.members && memberQueryData.members.length > 0) {
          wixMemberId = memberQueryData.members[0].id;
          console.log('Found existing Wix member with ID:', wixMemberId);
        } else {
          console.log('No existing member found, will create new one');
        }
      } else {
        const queryMemberErrorText = await queryMemberResponse.text();
        console.error('Error querying Wix member:', { status: queryMemberStatus, error: queryMemberErrorText });
        // Continue to try creating a member
      }

      // If member doesn't exist, create one
      if (!wixMemberId) {
        console.log('Creating new Wix member with email:', userEmail);
        const createMemberResponse = await fetch(
          `${WIX_API_BASE}/members/v1/members`,
          {
            method: 'POST',
            headers: {
              'Authorization': WIX_API_KEY,
              'wix-site-id': WIX_SITE_ID,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              member: {
                loginEmail: userEmail,
                contactInfo: {
                  firstName: userName?.split(' ')[0] || '',
                  lastName: userName?.split(' ').slice(1).join(' ') || '',
                },
              },
            }),
          }
        );

        const createMemberStatus = createMemberResponse.status;
        console.log('Member creation response status:', createMemberStatus);

        if (createMemberResponse.ok) {
          const memberData = await createMemberResponse.json();
          console.log('Member creation response data:', JSON.stringify(memberData, null, 2));
          wixMemberId = memberData.member?.id || null;
          console.log('Created new Wix member with ID:', wixMemberId);
        } else {
          const createMemberErrorText = await createMemberResponse.text();
          console.error('Error creating Wix member:', { status: createMemberStatus, error: createMemberErrorText });
        }
      }

      console.log('Final member ID check:', { hasWixMemberId: !!wixMemberId, wixMemberId, hasUserEmail: !!userEmail, userEmail });

      if (!wixMemberId) {
        console.error('No Wix member ID available - cannot create order');
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create or find Wix member',
            details: 'A Wix member is required to create a subscription order. The API key may not have "Manage Members" permission, or there was an error creating the member.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Step 2: Create an online order for the pricing plan with member ID
      // When using API key (not member session), we need both onBehalf and buyer
      console.log('Creating order with member ID:', wixMemberId);
      const createOrderRequestBody = {
        planId: WIX_PLAN_ID,
        onBehalf: {
          memberId: wixMemberId,
          orderMethod: 1, // MOTO
        },
        buyer: {
          memberId: wixMemberId,
        },
      };

      const orderResponse = await fetch(
        `${WIX_API_BASE}/pricing-plans/v2/checkout/orders/online`,
        {
          method: 'POST',
          headers: {
            'Authorization': WIX_API_KEY,
            'wix-site-id': WIX_SITE_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createOrderRequestBody),
        }
      );

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error('Error creating order:', {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          error: errorText,
          requestBody: createOrderRequestBody,
        });
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create subscription order',
            details: `Wix API returned ${orderResponse.status}: ${errorText}`,
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const orderData = await orderResponse.json();
      const wixPayOrderId = orderData.wixPayOrderId;
      const orderId = orderData.id;
      
      console.log('Order created successfully:', { orderId, wixPayOrderId });

      if (!wixPayOrderId) {
        console.error('No wixPayOrderId in order response:', orderData);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to get payment order ID',
            details: 'Order created but no payment order ID returned',
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Step 3: Start payment using Wix Pay API to get checkout URL
      const startPaymentRequestBody = {
        orderId: wixPayOrderId,
        redirectUrl: `${appUrl}/subscription?success=true&userId=${userId}`,
        errorUrl: `${appUrl}/subscription?error=true`,
      };

      console.log('Starting payment with order ID:', wixPayOrderId);
      const paymentResponse = await fetch(
        `${WIX_API_BASE}/wix-payments/v1/payment-provider/start-payment`,
        {
          method: 'POST',
          headers: {
            'Authorization': WIX_API_KEY,
            'wix-site-id': WIX_SITE_ID,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(startPaymentRequestBody),
        }
      );

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error('Error starting payment:', {
          status: paymentResponse.status,
          statusText: paymentResponse.statusText,
          error: errorText,
        });
        return new Response(
          JSON.stringify({ 
            error: 'Failed to start payment',
            details: `Wix Pay API returned ${paymentResponse.status}: ${errorText}`,
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const paymentData = await paymentResponse.json();
      const checkoutUrl = paymentData.checkoutUrl || paymentData.url || '';
      
      console.log('Payment URL retrieved:', checkoutUrl);
      
      // Store pending subscription in database
      const { error: dbError } = await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: userId,
          wix_payment_link_id: orderId,
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
          paymentLinkUrl: checkoutUrl,
          paymentLinkId: orderId,
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
