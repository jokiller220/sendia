import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Loader2 } from 'lucide-react';

export const SendSummaryScreen: React.FC = () => {
  const { sendDraft, executeSendMoney, setCurrentScreen, exchangeRate } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayNow = () => {
    setIsProcessing(true);
    // Simulate GeniusPay payment authorization (2 seconds)
    setTimeout(() => {
      executeSendMoney();
      setIsProcessing(false);
      setCurrentScreen('send_success');
    }, 2000);
  };

  const totalToPay = sendDraft.amountEUR + sendDraft.feeEUR;

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

        <p className="mt-4 text-[11px] text-slate-400 text-center">
          En cliquant sur "Payer maintenant", le wallet de {sendDraft.recipientName} sera crédité immédiatement.
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
              <span>Traitement GeniusPay...</span>
            </>
          ) : (
            <span>Payer maintenant</span>
          )}
        </button>
      </div>
    </div>
  );
};
