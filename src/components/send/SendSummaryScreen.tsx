import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Loader2, ExternalLink, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { geniusPay } from '../../lib/geniuspay';

type PayStep = 'summary' | 'waiting' | 'confirmed';

export const SendSummaryScreen: React.FC = () => {
  const { sendDraft, setCurrentScreen, exchangeRate, user, wallet, executeSendMoney } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<PayStep>('summary');
  const [pendingRef, setPendingRef] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const checkoutUrlRef = useRef<string | null>(null);

  const totalToPay = sendDraft.amountEUR + sendDraft.feeEUR;

  // ─── Auto-poll GeniusPay every 4s while waiting ───────────────────
  useEffect(() => {
    if (step !== 'waiting' || !pendingRef) return;

    const interval = setInterval(async () => {
      setPollCount(c => c + 1);
      try {
        const result = await geniusPay.verifyPayment(pendingRef);
        if (result.success && result.status === 'COMPLETED') {
          clearInterval(interval);
          await executeSendMoney();
          setStep('confirmed');
          setTimeout(() => setCurrentScreen('send_success'), 1500);
        }
      } catch (e) {
        console.warn('[Poll] Erreur vérification:', e);
      }
    }, 4000);

    // Timeout after 15 min
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 15 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [step, pendingRef]);

  const handlePayNow = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // ── Wallet balance payment ──────────────────────────────────────
      if (sendDraft.useWalletBalance) {
        if (wallet.balanceEUR < totalToPay) {
          setError('Solde wallet insuffisant pour effectuer ce transfert.');
          setIsProcessing(false);
          return;
        }
        await executeSendMoney();
        setCurrentScreen('send_success');
        return;
      }

      // ── GeniusPay hosted checkout ───────────────────────────────────
      const returnUrl = `${window.location.origin}${window.location.pathname}?payment_status=success&payment_type=send`;

      const result = await geniusPay.createCheckout({
        amount: Math.round(totalToPay * 100),
        currency: 'EUR',
        description: `Transfert Sendia → ${sendDraft.recipientName} (${sendDraft.recipientPhone})`,
        customerName: user.name,
        customerPhone: user.phone,
        customerEmail: user.email,
        returnUrl,
        cancelUrl: `${window.location.origin}${window.location.pathname}?payment_status=cancelled`,
        metadata: {
          sendia_user_id: user.id,
          sendia_recipient: sendDraft.recipientName,
          sendia_phone: sendDraft.recipientPhone,
          sendia_xof: sendDraft.amountXOF,
          sendia_type: 'SEND',
        },
      });

      if (result.success && result.checkoutUrl) {
        // Store checkout URL so "Reopen" button works
        checkoutUrlRef.current = result.checkoutUrl;
        setPendingRef(result.reference);

        // Save pending data to localStorage
        localStorage.setItem('sendia_pending_send', JSON.stringify({
          ...sendDraft,
          paymentRef: result.reference,
          initiatedAt: new Date().toISOString(),
        }));

        // ✅ Open GeniusPay in a NEW TAB — PWA stays open!
        window.open(result.checkoutUrl, '_blank', 'noopener,noreferrer');

        setStep('waiting');
        setIsProcessing(false);

      } else {
        setError(result.message || 'Impossible d\'initier le paiement. Réessayez.');
        setIsProcessing(false);
      }

    } catch (err) {
      console.error('[SendSummary]', err);
      setError('Erreur inattendue. Réessayez.');
      setIsProcessing(false);
    }
  };

  // ─── Waiting Screen ───────────────────────────────────────────────
  if (step === 'waiting') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white min-h-screen text-center">
        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-6 animate-pulse">
          <Clock className="w-10 h-10 text-indigo-600" />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-2">En attente du paiement</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-xs">
          La page GeniusPay a été ouverte dans un nouvel onglet. Finalisez votre paiement par carte bancaire là-bas.
        </p>

        <div className="w-full max-w-xs bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-left space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Montant</span>
            <span className="font-bold text-slate-900">{totalToPay.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Destinataire</span>
            <span className="font-bold text-slate-900">{sendDraft.recipientName}</span>
          </div>
          {pendingRef && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Référence</span>
              <span className="font-mono text-indigo-600 text-[10px]">{pendingRef}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Vérification automatique toutes les 4s… ({pollCount})</span>
        </div>

        <div className="w-full max-w-xs space-y-3">
          {checkoutUrlRef.current && (
            <button
              onClick={() => window.open(checkoutUrlRef.current!, '_blank', 'noopener,noreferrer')}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Rouvrir la page GeniusPay</span>
            </button>
          )}

          <button
            onClick={() => { setStep('summary'); setPendingRef(null); setPollCount(0); }}
            className="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold text-sm"
          >
            Annuler et revenir
          </button>
        </div>
      </div>
    );
  }

  // ─── Confirmed Screen ──────────────────────────────────────────────
  if (step === 'confirmed') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white min-h-screen text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Paiement confirmé !</h2>
        <p className="text-sm text-slate-500">Transfert en cours de traitement…</p>
        <Loader2 className="mt-4 w-5 h-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  // ─── Summary Screen ────────────────────────────────────────────────
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Récapitulatif</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-700">Paiement impossible</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

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

        {!sendDraft.useWalletBalance && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <ExternalLink className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-medium">
              La page de paiement <strong>GeniusPay</strong> s'ouvrira dans un <strong>nouvel onglet</strong>. Cette page restera ouverte et se mettra à jour automatiquement.
            </p>
          </div>
        )}
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
              <span>Connexion à GeniusPay…</span>
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
