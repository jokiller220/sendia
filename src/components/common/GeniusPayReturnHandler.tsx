import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { geniusPay } from '../../lib/geniuspay';
import { supabase } from '../../lib/supabase';

/**
 * GeniusPayReturnHandler
 *
 * Runs once on app load. Detects if the user has returned from the GeniusPay
 * hosted payment page by checking URL params:
 *   ?payment_status=success&payment_type=recharge|send&amount=xxx&...
 *
 * If a valid payment_status=success is found:
 * 1. Verifies the payment reference with GeniusPay API
 * 2. Credits the user's wallet in Supabase
 * 3. Records the transaction
 * 4. Cleans up URL and localStorage
 * 5. Navigates to send_success or dashboard
 */
export const GeniusPayReturnHandler: React.FC = () => {
  const { user, wallet, simulateWebhookPaymentSuccess, setCurrentScreen, executeSendMoney } = useApp();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment_status');
    const paymentType = params.get('payment_type');

    if (!paymentStatus || paymentStatus !== 'success') return;

    // Clean up URL immediately so user doesn't re-trigger on refresh
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);

    const handlePaymentReturn = async () => {
      const amountRaw = params.get('amount');
      const amount = parseFloat(amountRaw || '0');

      if (paymentType === 'recharge') {
        // Verify the recharge payment and credit wallet
        const pendingStr = localStorage.getItem('sendia_pending_recharge');
        const pending = pendingStr ? JSON.parse(pendingStr) : null;
        localStorage.removeItem('sendia_pending_recharge');

        // If we have a reference, verify with GeniusPay first
        if (pending?.paymentRef) {
          const verification = await geniusPay.verifyPayment(pending.paymentRef);
          if (!verification.success) {
            console.warn('[GeniusPayReturn] Recharge paiement non confirmé par GeniusPay:', verification.message);
            // Don't credit if GeniusPay says not confirmed
            return;
          }
        }

        // Credit wallet in Supabase
        const creditAmount = amount || pending?.amount || 0;
        if (creditAmount > 0 && user.id && user.id !== 'usr_new') {
          const newEur = wallet.balanceEUR + creditAmount;
          const newXof = Math.round(newEur * 655);

          await supabase.from('wallets').update({
            balance_eur: newEur,
            balance_xof: newXof,
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id);

          await supabase.from('transactions').insert([{
            id: `GPAY-RC-${Math.floor(1000000 + Math.random() * 9000000)}`,
            user_id: user.id,
            type: 'RECEIVE',
            title: `Rechargement Wallet — Carte Bancaire`,
            sender_or_recipient_name: 'GeniusPay Checkout',
            amount_eur: creditAmount,
            amount_xof: Math.round(creditAmount * 655),
            fee_eur: 0,
            fee_xof: 0,
            exchange_rate: 655,
            status: 'COMPLETED',
            genius_pay_ref: pending?.paymentRef || `GPAY-RC-${Date.now()}`,
            payment_method: 'Carte Bancaire GeniusPay',
            formatted_date: 'À l\'instant',
          }]);

          // Refresh wallet state in-app
          simulateWebhookPaymentSuccess(creditAmount, 'Carte Bancaire (GeniusPay)');
        }

      } else if (paymentType === 'send') {
        // Verify the send payment and complete the transfer
        const pendingStr = localStorage.getItem('sendia_pending_send');
        const pending = pendingStr ? JSON.parse(pendingStr) : null;
        localStorage.removeItem('sendia_pending_send');

        // Verify with GeniusPay before completing
        if (pending?.paymentRef) {
          const verification = await geniusPay.verifyPayment(pending.paymentRef);
          if (!verification.success) {
            console.warn('[GeniusPayReturn] Send paiement non confirmé par GeniusPay:', verification.message);
            return;
          }
        }

        // Execute the send (records transaction, updates wallet)
        await executeSendMoney(pending);
        setCurrentScreen('send_success');
      }
    };

    handlePaymentReturn().catch(err => {
      console.error('[GeniusPayReturnHandler] Erreur traitement retour paiement:', err);
    });
  }, []); // Run once on mount only

  return null; // No UI — invisible handler
};
