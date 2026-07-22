import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, ArrowDownLeft, Share2, Copy, Check } from 'lucide-react';

export const TransactionDetailModal: React.FC = () => {
  const { selectedTransaction, setSelectedTransaction } = useApp();
  const [copied, setCopied] = useState(false);

  if (!selectedTransaction) return null;

  const tx = selectedTransaction;
  const isReceive = tx.type === 'RECEIVE';
  const isWithdraw = tx.type === 'WITHDRAW';

  const handleCopyRef = () => {
    navigator.clipboard.writeText(tx.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Reçu Sendia - ${tx.id}`,
        text: `Reçu Sendia: ${tx.title} - Montant: ${tx.amountEUR} € (${tx.amountXOF} XOF) - Réf: ${tx.id}`,
      }).catch(() => {});
    } else {
      handleCopyRef();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-250 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setSelectedTransaction(null)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Transaction Header Graphic */}
        <div className="text-center pt-2 pb-4">
          <div
            className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 shadow-lg ${
              isReceive
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : isWithdraw
                ? 'bg-amber-500 text-white shadow-amber-500/30'
                : 'bg-indigo-600 text-white shadow-indigo-500/30'
            }`}
          >
            {isReceive ? (
              <ArrowDownLeft className="w-8 h-8 stroke-[3]" />
            ) : (
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            )}
          </div>

          <h2 className="text-lg font-extrabold text-slate-900">{tx.title}</h2>

          <div className="mt-2 flex items-baseline justify-center gap-1">
            <span
              className={`text-2xl sm:text-3xl font-black ${
                isReceive ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {isReceive ? '+' : '-'}
              {tx.amountEUR > 0 ? `${tx.amountEUR.toFixed(2)} €` : `${tx.amountXOF.toLocaleString('fr-FR')} XOF`}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            = {tx.amountXOF.toLocaleString('fr-FR')} XOF
          </p>

          <div className="mt-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Terminée</span>
            </span>
          </div>
        </div>

        {/* Details Breakdown Table */}
        <div className="my-4 border-t border-b border-slate-100 py-4 space-y-3 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Date</span>
            <span className="font-semibold text-slate-900">{tx.formattedDate}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Référence</span>
            <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
              <span>{tx.id}</span>
              <button onClick={handleCopyRef} className="text-slate-400 hover:text-slate-600 p-0.5">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Réf. GeniusPay</span>
            <span className="font-mono font-semibold text-slate-700">{tx.geniusPayRef}</span>
          </div>

          {tx.paymentMethod && (
            <div className="flex justify-between items-center text-slate-600">
              <span>Moyen de paiement</span>
              <span className="font-semibold text-slate-900">{tx.paymentMethod}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-600">
            <span>Taux de change</span>
            <span className="font-semibold text-slate-900">1 EUR = {tx.exchangeRate} XOF</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Frais Sendia</span>
            <span className="font-semibold text-slate-900">{tx.feeEUR.toFixed(2)} €</span>
          </div>

          <div className="flex justify-between items-center text-slate-900 font-bold pt-2 border-t border-slate-100 text-sm">
            <span>Total reçu/crédité</span>
            <span className="text-indigo-600">{tx.amountEUR > 0 ? `${tx.amountEUR.toFixed(2)} €` : `${tx.amountXOF.toLocaleString('fr-FR')} XOF`}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleShare}
          className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>Partager le reçu</span>
        </button>
      </div>
    </div>
  );
};
