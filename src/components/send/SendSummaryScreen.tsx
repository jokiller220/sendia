import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { geniusPay } from '../../lib/geniuspay';

export const SendSummaryScreen: React.FC = () => {
  const { sendDraft, setCurrentScreen, exchangeRate, user, wallet } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalToPay = sendDraft.amountEUR + sendDraft.feeEUR;

  const handlePayNow = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // If paying with Wallet balance — no external checkout needed
      if (sendDraft.useWalletBalance) {
        if (wallet.balanceEUR < totalToPay) {
          setError('Solde wallet insuffisant pour effectuer ce transfert.');
          setIsProcessing(false);
          return;
        }
        // Wallet deduction is handled by executeSendMoney in AppContext
        // which is triggered on send_success screen load
        localStorage.setItem('sendia_pending_send', JSON.stringify({
          ...sendDraft,
          paymentRef: `WALLET-${Date.now()}`,
          paidAt: new Date().toISOString(),
        }));
        setCurrentScreen('send_success');
        return;
      }

      // Real GeniusPay Checkout — create a hosted payment session
      const returnUrl = `${window.location.origin}${window.location.pathname}?payment_status=success&payment_type=send&amount=${sendDraft.amountEUR}&recipient=${encodeURIComponent(sendDraft.recipientName)}&phone=${encodeURIComponent(sendDraft.recipientPhone)}&country=${encodeURIComponent(sendDraft.recipientCountry)}`;

      const checkoutResult = await geniusPay.createCheckout({
        amount: Math.round(totalToPay * 100), // In centimes
        currency: 'EUR',
        description: `Transfert Sendia → ${sendDraft.recipientName} (${sendDraft.recipientPhone})`,
        customerName: user.name,
        customerPhone: user.phone,
        customerEmail: user.email,
        returnUrl,
        metadata: {
          sendia_user_id: user.id,
          sendia_recipient_name: sendDraft.recipientName,
          sendia_recipient_phone: sendDraft.recipientPhone,
          sendia_amount_xof: sendDraft.amountXOF,
          sendia_type: 'SEND',
        },
      });

      if (checkoutResult.success && checkoutResult.checkoutUrl) {
        // Save pending draft so we can complete it on return
        localStorage.setItem('sendia_pending_send', JSON.stringify({
          ...sendDraft,
          paymentRef: checkoutResult.reference,
          initiatedAt: new Date().toISOString(),
        }));

        // Redirect user to GeniusPay hosted payment page
        window.location.href = checkoutResult.checkoutUrl;
      } else {
        setError(checkoutResult.message || 'Impossible d\'initier le paiement GeniusPay. Vérifiez votre connexion.');
        setIsProcessing(false);
      }

    } catch (err) {
      console.error('[SendSummary] Erreur paiement:', err);
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setCurrentScreen('send_payment_method')}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Récapitulatif
          </h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-700">Paiement impossible</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Sender Breakdown Card */}
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 text-xs mb-4">
          <h3 className="text-xs font-extrabold uppercase text-slate-400">Détails du paiement</h3>
          <div className="flex justify-between items-center text-slate-600">
            <span>Vous envoyez</span>
            <span className="font-semibold text-slate-900">{sendDraft.amountEUR.toFixed(2)} €</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Frais Sendia</span>
            <span className="font-semibold text-slate-900">{sendDraft.feeEUR.toFixed(2)} €</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Méthode de paiement</span>
            <span className="font-semibold text-indigo-700">{sendDraft.paymentMethodTitle}</span>
          </div>

          <div className="flex justify-between items-center text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
            <span>Total à payer</span>
            <span className="text-indigo-600">{totalToPay.toFixed(2)} €</span>
          </div>
        </div>

        {/* Recipient Breakdown Card */}
        <div className="p-4 rounded-3xl bg-indigo-50/60 border border-indigo-100 space-y-3 text-xs">
          <h3 className="text-xs font-extrabold uppercase text-indigo-700">Destinataire</h3>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Nom</span>
            <span className="font-bold text-slate-900">{sendDraft.recipientName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-600">Téléphone</span>
            <span className="font-semibold text-slate-700">{sendDraft.recipientPhone}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Taux de change</span>
            <span className="font-semibold text-slate-900">1 EUR = {exchangeRate} XOF</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-indigo-100">
            <span className="font-bold text-indigo-900">Elle recevra sur son wallet</span>
            <span className="font-black text-indigo-950 text-base">
              {sendDraft.amountXOF.toLocaleString('fr-FR')} XOF
            </span>
          </div>
        </div>

        {/* GeniusPay Badge */}
        {!sendDraft.useWalletBalance && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              Vous serez redirigé vers la page de paiement sécurisée <strong>GeniusPay</strong> pour finaliser le paiement par carte bancaire.
            </p>
          </div>
        )}

        <p className="mt-3 text-[11px] text-slate-400 text-center">
          {sendDraft.useWalletBalance
            ? `Votre solde wallet sera débité de ${totalToPay.toFixed(2)} € immédiatement.`
            : `Après paiement GeniusPay, le wallet de ${sendDraft.recipientName} sera crédité automatiquement.`
          }
        </p>
      </div>

      <div className="pb-4">
        <button
          onClick={handlePayNow}
          disabled={isProcessing}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connexion à GeniusPay...</span>
            </>
          ) : sendDraft.useWalletBalance ? (
            <span>Confirmer le transfert Wallet</span>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              <span>Payer via GeniusPay →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
