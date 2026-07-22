/**
 * GeniusPay Secure Client
 *
 * All calls are routed through a Supabase Edge Function (geniuspay-proxy)
 * which acts as a secure backend proxy. This avoids:
 * - CORS errors (browser blocks direct calls to geniuspay.ci)
 * - Secret key exposure in frontend bundle
 *
 * REAL PAYMENT FLOW:
 * 1. createCheckout() → Edge Function → GeniusPay → returns { checkoutUrl, reference }
 * 2. App redirects user to checkoutUrl (GeniusPay hosted payment page)
 * 3. User pays on GeniusPay (card details entered there)
 * 4. GeniusPay redirects back to app with ?payment_status=success&reference=xxx
 * 5. GeniusPayReturnHandler calls verifyPayment(reference) via Edge Function
 * 6. If confirmed → wallet credited in Supabase, transaction recorded
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jkfruplfaxdiufrqzeew.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2mnbMuxBoH9kugDa86HGTg_ghuk0ycN';
const PROXY_URL = `${SUPABASE_URL}/functions/v1/geniuspay-proxy`;

export interface GeniusPayCheckoutPayload {
  amount: number;       // in centimes (e.g. 5000 = 50.00 €)
  currency: string;     // 'EUR'
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  returnUrl: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

export interface GeniusPayPayoutPayload {
  amount: number;
  currency: string;
  recipientPhone: string;
  operator: string;
  description: string;
}

export interface GeniusPayResponse {
  success: boolean;
  reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'COMPLETED';
  message: string;
  checkoutUrl?: string;
  rawResponse?: any;
}

const callProxy = async (action: string, payload: Record<string, any>): Promise<GeniusPayResponse> => {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action, payload }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        reference: '',
        status: 'FAILED',
        message: data.message || `Erreur proxy (${response.status})`,
        rawResponse: data,
      };
    }

    return {
      success: data.success ?? false,
      reference: data.reference || '',
      status: data.status || 'PENDING',
      message: data.message || '',
      checkoutUrl: data.checkoutUrl,
      rawResponse: data.raw,
    };

  } catch (error) {
    console.error(`[GeniusPay Proxy] Erreur réseau action "${action}":`, error);
    return {
      success: false,
      reference: '',
      status: 'FAILED',
      message: `Erreur réseau — impossible de joindre le proxy GeniusPay`,
    };
  }
};

export const geniusPay = {
  /**
   * Create a hosted GeniusPay checkout session.
   * Returns a checkoutUrl to redirect the user to.
   */
  async createCheckout(payload: GeniusPayCheckoutPayload): Promise<GeniusPayResponse> {
    return callProxy('create_checkout', {
      amount: payload.amount,
      currency: payload.currency,
      description: payload.description,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      returnUrl: payload.returnUrl,
      cancelUrl: payload.cancelUrl || `${window.location.origin}?payment_status=cancelled`,
      metadata: payload.metadata || {},
    });
  },

  /**
   * Verify a payment by reference after user returns from GeniusPay.
   */
  async verifyPayment(reference: string): Promise<GeniusPayResponse> {
    return callProxy('verify_payment', { reference });
  },

  /**
   * Initiate a Mobile Money payout via GeniusPay.
   */
  async createPayout(payload: GeniusPayPayoutPayload): Promise<GeniusPayResponse> {
    return callProxy('create_payout', {
      amount: payload.amount,
      currency: payload.currency,
      recipientPhone: payload.recipientPhone,
      operator: payload.operator,
      description: payload.description,
    });
  },
};
