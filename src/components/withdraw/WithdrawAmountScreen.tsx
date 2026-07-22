import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ArrowRight, AlertCircle } from 'lucide-react';

export const WithdrawAmountScreen: React.FC = () => {
  const { wallet, withdrawDraft, setWithdrawDraft, setCurrentScreen, exchangeRate } = useApp();

  const handleAmountXofChange = (val: string) => {
    const xof = parseInt(val, 10) || 0;
    const eur = Math.round((xof / exchangeRate) * 100) / 100;
    const feeXof = xof > 0 ? 500 : 0; // 500 XOF flat withdrawal fee

    setWithdrawDraft(prev => ({
      ...prev,
      amountXOF: xof,
      amountEUR: eur,
      feeXOF: feeXof,
    }));
  };

  const operators = [
    { id: 'Flooz', label: 'Flooz (Moov Togo / Bénin)', type: 'mobile' },
    { id: 'T-Money', label: 'T-Money (Togocom)', type: 'mobile' },
    { id: 'Orange Money', label: "Orange Money (Côte d'Ivoire / Sénégal)", type: 'mobile' },
    { id: 'Wave', label: 'Wave (Sénégal / CI)', type: 'mobile' },
    { id: 'MTN MoMo', label: 'MTN MoMo (CI / Bénin)', type: 'mobile' },
    { id: 'Bank', label: 'Compte bancaire (IBAN SEPA - sens Afrique→Europe)', type: 'bank' },
  ];

  const netXof = Math.max(0, withdrawDraft.amountXOF - withdrawDraft.feeXOF);
  const isBalanceEnough = wallet.balanceXOF >= withdrawDraft.amountXOF;

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Retirer de l'argent
          </h1>
        </div>

        {/* Available Balance Box */}
        <div className="p-4 rounded-3xl bg-indigo-950 text-white shadow-md mb-6">
          <span className="text-xs font-bold text-indigo-300 uppercase">Solde disponible</span>
          <div className="text-2xl font-black mt-1">
            {wallet.balanceEUR.toFixed(2)} € <span className="text-xs font-normal text-indigo-200">(= {wallet.balanceXOF.toLocaleString('fr-FR')} XOF)</span>
          </div>
        </div>

        {/* XOF Amount Input */}
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Montant à retirer (XOF)
          </label>
          <div className="flex items-center justify-between">
            <input
              type="number"
              step="1000"
              value={withdrawDraft.amountXOF || ''}
              onChange={e => handleAmountXofChange(e.target.value)}
              className="w-full text-3xl font-extrabold text-slate-900 bg-transparent focus:outline-none"
              placeholder="50000"
            />
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-sm font-extrabold text-slate-800 shadow-xs shrink-0">
              🌍 XOF
            </span>
          </div>
        </div>

        {!isBalanceEnough && (
          <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Solde insuffisant pour ce montant de retrait.</span>
          </p>
        )}

        {/* Operator Selection */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
            Moyen de retrait
          </label>
          <select
            value={withdrawDraft.operator}
            onChange={e => setWithdrawDraft(prev => ({ ...prev, operator: e.target.value }))}
            className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 bg-white focus:border-indigo-600 focus:outline-none shadow-xs"
          >
            {operators.map(op => (
              <option key={op.id} value={op.id}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Number / IBAN Input */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
            {withdrawDraft.operator === 'Bank' ? 'IBAN du compte' : 'Numéro Mobile Money'}
          </label>
          <input
            type="text"
            value={withdrawDraft.phoneOrIban}
            onChange={e => setWithdrawDraft(prev => ({ ...prev, phoneOrIban: e.target.value }))}
            placeholder={withdrawDraft.operator === 'Bank' ? 'FR76 1234 5678 9012 3456 7890 123' : '+228 90 12 34 56'}
            className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
          />
        </div>

        {/* Fees Breakdown Box */}
        <div className="mt-6 p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Frais de retrait Mobile Money</span>
            <span className="font-semibold text-slate-900">{withdrawDraft.feeXOF.toLocaleString('fr-FR')} XOF</span>
          </div>

          <div className="flex justify-between items-center text-slate-900 font-bold pt-2 border-t border-slate-100 text-sm">
            <span>Vous recevrez sur votre compte</span>
            <span className="text-indigo-600">{netXof.toLocaleString('fr-FR')} XOF</span>
          </div>
        </div>
      </div>

      <div className="pb-4">
        <button
          onClick={() => setCurrentScreen('withdraw_status')}
          disabled={withdrawDraft.amountXOF <= 0 || !isBalanceEnough}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
        >
          <span>Continuer</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
