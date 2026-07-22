import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SendSuccessScreen: React.FC = () => {
  const { sendDraft, setCurrentScreen, setActiveTab, transactions, setSelectedTransaction } = useApp();

  useEffect(() => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  }, []);

  const latestTx = transactions[0];

  const handleViewReceipt = () => {
    if (latestTx) {
      setSelectedTransaction(latestTx);
    }
    setActiveTab('home');
    setCurrentScreen('dashboard');
  };

  const handleHome = () => {
    setActiveTab('home');
    setCurrentScreen('dashboard');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen text-center">
      <div className="my-auto py-8 flex flex-col items-center">
        {/* Success Animated Check Badge */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6 shadow-xl shadow-emerald-500/20">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Envoi réussi !
        </h1>

        <p className="mt-2 text-base text-slate-600 font-semibold max-w-xs">
          <span className="text-indigo-600 font-black">{sendDraft.amountXOF.toLocaleString('fr-FR')} XOF</span> ont été crédités sur le wallet de {sendDraft.recipientName}.
        </p>

        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs w-full max-w-xs text-left space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span>Référence</span>
            <span className="font-mono font-bold text-slate-900">{latestTx?.id || 'SDN-124578965'}</span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>Moyen de paiement</span>
            <span className="font-semibold text-slate-900">{sendDraft.paymentMethodTitle}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pb-4">
        <button
          onClick={handleViewReceipt}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          <span>Voir le reçu</span>
        </button>

        <button
          onClick={handleHome}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
};
