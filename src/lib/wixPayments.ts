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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/2f9c385e-5e62-41c9-b018-23f4b80c216a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wixPayments.ts:44',message:'createPaymentLink called',data:{userEmail,userName,userId,functionUrl:SUPABASE_FUNCTION_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const { data: { session } } = await import('../lib/supabase').then(m => 
      m.supabase.auth.getSession()
    );

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2f9c385e-5e62-41c9-b018-23f4b80c216a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wixPayments.ts:52',message:'Session check result',data:{hasSession:!!session,hasToken:!!session?.access_token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!session) {
      throw new Error('User not authenticated');
    }

    // Get Supabase anon key for apikey header (required by Edge Functions)
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2f9c385e-5e62-41c9-b018-23f4b80c216a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wixPayments.ts:63',message:'Config check',data:{hasFunctionUrl:!!SUPABASE_FUNCTION_URL,hasAnonKey:!!supabaseAnonKey,functionUrl:SUPABASE_FUNCTION_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (!SUPABASE_FUNCTION_URL) {
      throw new Error('Supabase URL not configured');
    }

    const requestBody = {
      action: 'create_payment_link',
      userEmail,
      userName,
      userId,
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2f9c385e-5e62-41c9-b018-23f4b80c216a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wixPayments.ts:75',message:'Before fetch request',data:{url:`${SUPABASE_FUNCTION_URL}/wix-payments`,hasAuth:!!session.access_token,hasApikey:!!supabaseAnonKey,requestBody},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const response = await fetch(`${SUPABASE_FUNCTION_URL}/wix-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey || '', // Required for Supabase Edge Functions
      },
      body: JSON.stringify(requestBody),
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2f9c385e-5e62-41c9-b018-23f4b80c216a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wixPayments.ts:88',message:'After fetch response',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2f9c385e-5e62-41c9-b018-23f4b80c216a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wixPayments.ts:97',message:'Response not OK',data:{status:response.status,statusText:response.statusText,errorText,errorData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      console.error('Edge Function error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: `${SUPABASE_FUNCTION_URL}/wix-payments`,
      });
      
      throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2f9c385e-5e62-41c9-b018-23f4b80c216a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wixPayments.ts:115',message:'Success response',data:{hasPaymentLinkUrl:!!data.paymentLinkUrl,hasPaymentLinkId:!!data.paymentLinkId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return {
      paymentLinkUrl: data.paymentLinkUrl,
      paymentLinkId: data.paymentLinkId,
    };
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/2f9c385e-5e62-41c9-b018-23f4b80c216a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wixPayments.ts:123',message:'Exception caught',data:{errorMessage:error instanceof Error ? error.message : 'Unknown',errorName:error instanceof Error ? error.name : 'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
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
