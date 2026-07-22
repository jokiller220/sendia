import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const GENIUSPAY_API_URL = Deno.env.get('VITE_GENIUSPAY_API_URL') ?? 'https://geniuspay.ci/api/v1/merchant'
const GENIUSPAY_API_KEY = Deno.env.get('VITE_GENIUSPAY_API_KEY') ?? ''
const GENIUSPAY_API_SECRET = Deno.env.get('VITE_GENIUSPAY_API_SECRET') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, payload } = body

    if (action === 'create_checkout') {
      // Create a hosted checkout session on GeniusPay
      const gpResponse = await fetch(`${GENIUSPAY_API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': GENIUSPAY_API_KEY,
          'Authorization': `Bearer ${GENIUSPAY_API_SECRET}`,
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
          cancel_url: payload.cancelUrl,
          metadata: payload.metadata || {},
        }),
      })

      const data = await gpResponse.json()

      if (!gpResponse.ok) {
        return new Response(
          JSON.stringify({ success: false, message: data.message || data.error || 'GeniusPay error', raw: data }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const checkoutUrl = data.checkout_url || data.payment_url || data.redirect_url || data.url

      return new Response(
        JSON.stringify({
          success: true,
          reference: data.reference || data.id || data.transaction_id,
          checkoutUrl,
          status: 'PENDING',
          raw: data,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'verify_payment') {
      // Verify a payment by reference
      const { reference } = payload

      const gpResponse = await fetch(`${GENIUSPAY_API_URL}/payments/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': GENIUSPAY_API_KEY,
          'Authorization': `Bearer ${GENIUSPAY_API_SECRET}`,
        },
      })

      const data = await gpResponse.json()

      const successStatuses = ['success', 'completed', 'paid', 'COMPLETED', 'SUCCESS', 'PAID']
      const isSuccess = successStatuses.includes(data.status || data.payment_status || '')

      return new Response(
        JSON.stringify({
          success: isSuccess,
          reference: data.reference || data.id || reference,
          status: isSuccess ? 'COMPLETED' : 'PENDING',
          message: isSuccess ? 'Paiement confirmé' : `Statut: ${data.status}`,
          raw: data,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'create_payout') {
      // Mobile Money payout
      const gpResponse = await fetch(`${GENIUSPAY_API_URL}/payouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': GENIUSPAY_API_KEY,
          'Authorization': `Bearer ${GENIUSPAY_API_SECRET}`,
        },
        body: JSON.stringify({
          amount: payload.amount,
          currency: payload.currency,
          recipient_phone: payload.recipientPhone,
          operator: payload.operator?.toLowerCase(),
          description: payload.description,
        }),
      })

      const data = await gpResponse.json()

      if (!gpResponse.ok) {
        return new Response(
          JSON.stringify({ success: false, message: data.message || data.error, raw: data }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          reference: data.reference || data.id,
          status: 'COMPLETED',
          message: `Payout ${payload.operator} initié`,
          raw: data,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      return new Response(
        JSON.stringify({ success: false, message: `Action inconnue: ${action}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: `Erreur serveur: ${error}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
