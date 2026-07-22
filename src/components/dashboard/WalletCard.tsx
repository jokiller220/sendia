import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff, PlusCircle, X, CreditCard } from 'lucide-react';

export const WalletCard: React.FC = () => {
  const { wallet, activeCurrency, setActiveCurrency, setCurrentScreen, rechargeWallet } = useApp();
  const [showBalance, setShowBalance] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('100');
  const [isRecharging, setIsRecharging] = useState(false);

  const formattedEur = wallet.balanceEUR.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedXof = wallet.balanceXOF.toLocaleString('fr-FR');

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount) || 0;
    if (amount <= 0) return;

    setIsRecharging(true);
    await rechargeWallet(amount);
    setIsRecharging(false);
    setShowRechargeModal(false);
  };

  return (
    <div className="p-5">
      {/* Wallet Balance Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 text-white shadow-2xl overflow-hidden border border-white/10">
        {/* Background Glowing Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 rounded-full bg-blue-500/20 blur-2xl" />

        {/* Card Header: Label & Currency selector */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
              Solde total
            </span>
            <button
              onClick={() => setShowBalance(s => !s)}
              className="text-indigo-300 hover:text-white transition"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/10">
            <button
              onClick={() => setActiveCurrency('EUR')}
              className={`px-3 py-1 rounded-full text-xs font-extrabold transition ${
                activeCurrency === 'EUR'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              EUR
            </button>
            <button
              onClick={() => setActiveCurrency('XOF')}
              className={`px-3 py-1 rounded-full text-xs font-extrabold transition ${
                activeCurrency === 'XOF'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              XOF
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="relative z-10 mt-4 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {showBalance ? (
                  activeCurrency === 'EUR' ? `${formattedEur} €` : `${formattedXof} XOF`
                ) : (
                  '••••••••'
                )}
              </span>
            </div>

            <p className="text-xs text-indigo-200 font-semibold mt-1">
              {showBalance && (
                activeCurrency === 'EUR' ? `= ${formattedXof} XOF` : `= ${formattedEur} €`
              )}
            </p>
          </div>

          {/* Quick Recharge Button */}
          <button
            onClick={() => setShowRechargeModal(true)}
            className="py-2 px-3 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Recharger</span>
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setCurrentScreen('send_amount')}
            className="py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-indigo-600/40 transition flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            <span>Envoyer</span>
          </button>

          <button
            onClick={() => setCurrentScreen('withdraw_amount')}
            className="py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md active:scale-[0.98] text-white font-bold text-sm border border-white/15 transition flex items-center justify-center gap-2"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
            <span>Retirer</span>
          </button>
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Recharger le Wallet</h3>
              </div>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecharge} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Montant à ajouter (EUR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="10"
                    required
                    value={rechargeAmount}
                    onChange={e => setRechargeAmount(e.target.value)}
                    className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-200 text-xl font-extrabold text-slate-900 focus:border-indigo-600 focus:outline-none"
                    placeholder="100"
                  />
                  <span className="absolute right-4 top-4 font-bold text-slate-400">€</span>
                </div>
              </div>

              {/* Quick Select Pills */}
              <div className="grid grid-cols-3 gap-2">
                {['50', '100', '250'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRechargeAmount(val)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      rechargeAmount === val
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    +{val} €
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Paiement sécurisé via Carte bancaire GeniusPay.</span>
              </div>

              <button
                type="submit"
                disabled={isRecharging}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition"
              >
                {isRecharging ? 'Rechargement...' : 'Confirmer le rechargement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
