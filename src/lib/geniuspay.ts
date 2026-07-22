export interface GeniusPayPaymentPayload {
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod?: string;
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

const GENIUSPAY_API_URL = import.meta.env.VITE_GENIUSPAY_API_URL || 'https://geniuspay.ci/api/v1/merchant';
const GENIUSPAY_API_KEY = import.meta.env.VITE_GENIUSPAY_API_KEY || 'pk_live_wosUxndiXmm19VlRcjLiVfCa1h24fhbM';

/**
 * GeniusPay API Service Client
 *
 * REAL PAYMENT FLOW:
 * 1. createPayment() → receives { checkout_url, reference }
 * 2. App redirects user to checkout_url (GeniusPay hosted payment page)
 * 3. After payment, GeniusPay redirects to our return_url with ?payment_ref=xxx&status=success
 * 4. App detects the URL parameters on load, calls verifyPayment(reference)
 * 5. If verified → credit wallet, record transaction
 */
export const geniusPay = {
  apiKey: GENIUSPAY_API_KEY,
  baseUrl: GENIUSPAY_API_URL,

  /**
   * Create a hosted checkout session on GeniusPay.
   * Returns a checkout_url to redirect the user to.
   * The reference is stored locally so we can verify on return.
   */
  async createCheckout(payload: GeniusPayPaymentPayload & { returnUrl: string }): Promise<GeniusPayResponse> {
    try {
      const response = await fetch(`${GENIUSPAY_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': GENIUSPAY_API_KEY,
          'Authorization': `Bearer ${GENIUSPAY_API_KEY}`,
        },
        body: JSON.stringify({
          amount: payload.amount,
          currency: payload.currency,
          description: payload.description,
          customer: {
            name: payload.customerName,
            phone: payload.customerPhone,
            email: payload.customerEmail,
          },
          return_url: payload.returnUrl,
          cancel_url: `${window.location.origin}?payment_status=cancelled`,
          metadata: payload.metadata || {},
        }),
      });

      const data = await response.json();

      if (response.ok && (data.checkout_url || data.payment_url || data.redirect_url)) {
        const checkoutUrl = data.checkout_url || data.payment_url || data.redirect_url;
        return {
          success: true,
          reference: data.reference || data.id || data.transaction_id,
          status: 'PENDING',
          message: 'Session de paiement GeniusPay créée — redirection en cours',
          checkoutUrl,
          rawResponse: data,
        };
      }

      // API responded but without a checkout URL — log the response for debugging
      console.warn('[GeniusPay] Checkout response sans URL de paiement:', data);
      return {
        success: false,
        reference: '',
        status: 'FAILED',
        message: data.message || data.error || 'Impossible d\'obtenir l\'URL de paiement GeniusPay',
        rawResponse: data,
      };

    } catch (error) {
      console.error('[GeniusPay] Erreur réseau lors de la création du checkout:', error);
      return {
        success: false,
        reference: '',
        status: 'FAILED',
        message: 'Erreur réseau — impossible de joindre GeniusPay',
      };
    }
  },

  /**
   * Verify a payment by reference after the user returns from GeniusPay.
   * Called when the app detects ?payment_ref=xxx&status=success in the URL.
   */
  async verifyPayment(reference: string): Promise<GeniusPayResponse> {
    try {
      const response = await fetch(`${GENIUSPAY_API_URL}/payments/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': GENIUSPAY_API_KEY,
          'Authorization': `Bearer ${GENIUSPAY_API_KEY}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const isSuccess = ['success', 'completed', 'paid', 'COMPLETED', 'SUCCESS', 'PAID'].includes(
          data.status || data.payment_status || ''
        );
        return {
          success: isSuccess,
          reference: data.reference || data.id || reference,
          status: isSuccess ? 'COMPLETED' : 'PENDING',
          message: isSuccess ? 'Paiement GeniusPay confirmé' : `Statut: ${data.status}`,
          rawResponse: data,
        };
      }

      return {
        success: false,
        reference,
        status: 'FAILED',
        message: `Vérification échouée: ${data.message || data.error}`,
        rawResponse: data,
      };

    } catch (error) {
      console.error('[GeniusPay] Erreur vérification paiement:', error);
      return {
        success: false,
        reference,
        status: 'FAILED',
        message: 'Erreur réseau lors de la vérification',
      };
    }
  },

  /**
   * Initiate a Mobile Money payout (retrait) via GeniusPay.
   */
  async createPayout(payload: GeniusPayPayoutPayload): Promise<GeniusPayResponse> {
    try {
      const response = await fetch(`${GENIUSPAY_API_URL}/payouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': GENIUSPAY_API_KEY,
          'Authorization': `Bearer ${GENIUSPAY_API_KEY}`,
        },
        body: JSON.stringify({
          amount: payload.amount,
          currency: payload.currency,
          recipient_phone: payload.recipientPhone,
          operator: payload.operator.toLowerCase(),
          description: payload.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          reference: data.reference || data.id,
          status: 'COMPLETED',
          message: `Payout Mobile Money ${payload.operator} initié`,
          rawResponse: data,
        };
      }

      return {
        success: false,
        reference: '',
        status: 'FAILED',
        message: data.message || data.error || 'Payout échoué',
        rawResponse: data,
      };

    } catch (error) {
      console.error('[GeniusPay] Erreur payout:', error);
      return {
        success: false,
        reference: '',
        status: 'FAILED',
        message: 'Erreur réseau lors du payout',
      };
    }
  },
};
