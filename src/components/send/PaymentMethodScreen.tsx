import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, CreditCard, ShieldCheck, Wallet as WalletIcon } from 'lucide-react';

export const PaymentMethodScreen: React.FC = () => {
  const { sendDraft, setSendDraft, setCurrentScreen, wallet } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<string>('wallet');

  const methods = [
    {
      id: 'wallet',
      title: 'Solde Wallet Sendia (Recommandé)',
      subtitle: `Débit direct instantané (Disponible: ${wallet.balanceEUR.toFixed(2)} €)`,
      icon: <WalletIcon className="w-5 h-5 text-indigo-600" />,
      isWallet: true,
      hasEnoughBalance: wallet.balanceEUR >= (sendDraft.amountEUR + sendDraft.feeEUR),
    },
    {
      id: 'card',
      title: 'GeniusPay (Carte Bancaire & Mobile Money)',
      subtitle: 'Paiement direct sécurisé via la passerelle GeniusPay',
      icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
      isWallet: false,
    },
  ];

  const handleContinue = () => {
    const methodObj = methods.find(m => m.id === selectedMethod);
    if (methodObj) {
      setSendDraft(prev => ({
        ...prev,
        paymentMethodTitle: methodObj.title,
        useWalletBalance: methodObj.id === 'wallet',
        feeEUR: methodObj.id === 'wallet' ? 0.00 : prev.feeEUR,
      }));
    }
    setCurrentScreen('send_summary');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setCurrentScreen('send_amount')}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Méthode de paiement
          </h1>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Choisissez le moyen de paiement pour régler votre transfert de{' '}
          <strong className="text-slate-900 font-bold">{(sendDraft.amountEUR + sendDraft.feeEUR).toFixed(2)} €</strong>.
        </p>

        {/* Radio Methods List (Wallet & GeniusPay ONLY) */}
        <div className="space-y-3">
          {methods.map(m => {
            const isSelected = selectedMethod === m.id;
            const isDisabled = m.isWallet && !m.hasEnoughBalance;

            return (
              <div
                key={m.id}
                onClick={() => !isDisabled && setSelectedMethod(m.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isDisabled
                    ? 'opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed'
                    : isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100/70 flex items-center justify-center shrink-0">
                    {m.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                    <p className="text-xs text-slate-500">{m.subtitle}</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                  isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security badge */}
        <div className="mt-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Payez directement depuis votre solde Wallet ou via GeniusPay API.</span>
        </div>
      </div>

      <div className="pb-4">
        <button
          onClick={handleContinue}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition"
        >
          Continuer
        </button>
      </div>
    </div>
  );
};
