import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, ArrowRight } from 'lucide-react';

export const SendAmountScreen: React.FC = () => {
  const { sendDraft, setSendDraft, setCurrentScreen, beneficiaries, exchangeRate } = useApp();

  const handleAmountChange = (val: string) => {
    const num = parseFloat(val) || 0;
    const xof = Math.round(num * exchangeRate);
    const fee = num > 0 ? 1.00 : 0.00; // 1€ flat fee for demonstration

    setSendDraft(prev => ({
      ...prev,
      amountEUR: num,
      amountXOF: xof,
      feeEUR: fee,
    }));
  };

  const handleSelectBeneficiary = (b: typeof beneficiaries[0]) => {
    setSendDraft(prev => ({
      ...prev,
      recipientName: b.name,
      recipientPhone: b.phone,
      recipientCountry: b.country,
    }));
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen">
      <div>
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Envoyer de l'argent
          </h1>
        </div>

        {/* EUR Send Amount Input Box */}
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Vous envoyez
          </label>
          <div className="flex items-center justify-between">
            <input
              type="number"
              step="5"
              value={sendDraft.amountEUR || ''}
              onChange={e => handleAmountChange(e.target.value)}
              className="w-full text-3xl font-extrabold text-slate-900 bg-transparent focus:outline-none"
              placeholder="100.00"
            />
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-sm font-extrabold text-slate-800 shadow-xs shrink-0">
              💶 EUR
            </span>
          </div>
        </div>

        {/* Recipient Selection Card */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">
            Destinataire
          </label>
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm">
                {sendDraft.recipientName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{sendDraft.recipientName}</h4>
                <p className="text-xs text-slate-500">{sendDraft.recipientPhone}</p>
              </div>
            </div>

            <select
              value={sendDraft.recipientName}
              onChange={e => {
                const b = beneficiaries.find(x => x.name === e.target.value);
                if (b) handleSelectBeneficiary(b);
              }}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100 focus:outline-none cursor-pointer"
            >
              {beneficiaries.map(b => (
                <option key={b.id} value={b.name}>
                  {b.name} ({b.operator})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* XOF Receive Amount Calculation Box */}
        <div className="mt-4 p-4 rounded-3xl bg-indigo-50/60 border border-indigo-100">
          <label className="block text-xs font-semibold text-indigo-700 uppercase mb-1">
            Elle recevra sur son wallet
          </label>
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-indigo-950">
              {sendDraft.amountXOF.toLocaleString('fr-FR')} XOF
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white border border-indigo-100 text-sm font-extrabold text-indigo-900 shadow-xs shrink-0">
              🌍 XOF
            </span>
          </div>
        </div>

        {/* Fees Breakdown Box */}
        <div className="mt-6 p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Taux de change</span>
            <span className="font-semibold text-slate-900">1 EUR = {exchangeRate} XOF</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Frais Sendia</span>
            <span className="font-semibold text-slate-900">{sendDraft.feeEUR.toFixed(2)} €</span>
          </div>

          <div className="flex justify-between items-center text-slate-900 font-bold pt-2 border-t border-slate-100 text-sm">
            <span>Total à payer</span>
            <span className="text-indigo-600">{(sendDraft.amountEUR + sendDraft.feeEUR).toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="pb-4">
        <button
          onClick={() => setCurrentScreen('send_payment_method')}
          disabled={sendDraft.amountEUR <= 0}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
        >
          <span>Continuer</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
