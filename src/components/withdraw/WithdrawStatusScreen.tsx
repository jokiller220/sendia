import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const WithdrawStatusScreen: React.FC = () => {
  const { withdrawDraft, executeWithdrawal, setCurrentScreen, setActiveTab, transactions, setSelectedTransaction } = useApp();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Simulate GeniusPay payout processing (2.5 seconds)
    const timer = setTimeout(() => {
      executeWithdrawal();
      setIsProcessing(false);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const latestTx = transactions[0];

  const handleFinish = () => {
    if (latestTx) {
      setSelectedTransaction(latestTx);
    }
    setActiveTab('home');
    setCurrentScreen('dashboard');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen text-center">
      <div className="my-auto py-8 flex flex-col items-center">
        {/* Animated Blue Paperplane Badge */}
        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-xl shadow-indigo-500/20 relative">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
            <Send className="w-8 h-8 stroke-[2.5] -translate-y-0.5 translate-x-0.5" />
          </div>
          {isProcessing && (
            <div className="absolute inset-0 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin" />
          )}
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          {isProcessing ? 'Retrait en cours...' : 'Retrait effectué avec succès !'}
        </h1>

        <p className="mt-2 text-base text-slate-600 font-semibold max-w-xs leading-relaxed">
          Votre retrait de{' '}
          <span className="text-indigo-600 font-black">
            {withdrawDraft.amountXOF.toLocaleString('fr-FR')} XOF
          </span>{' '}
          vers <strong className="text-slate-900">{withdrawDraft.operator}</strong>{' '}
          {isProcessing ? 'est en cours de traitement via GeniusPay Payout.' : 'a été crédité sur votre compte Mobile Money.'}
        </p>

        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs w-full max-w-xs text-left space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>Référence Payout</span>
            <span className="font-mono font-bold text-slate-900">{latestTx?.id || 'WD-45879632'}</span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>Destination</span>
            <span className="font-semibold text-slate-900">{withdrawDraft.phoneOrIban}</span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>Statut GeniusPay</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Validation...' : 'PAYOUT_SUCCESS'}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="pb-4">
        <button
          onClick={handleFinish}
          disabled={isProcessing}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Traitement en cours...</span>
            </>
          ) : (
            <>
              <span>Voir le statut / reçu</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
