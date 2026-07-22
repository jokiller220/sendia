import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowDownLeft, ArrowUpRight, Smartphone, ChevronRight, Inbox } from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const { transactions, setSelectedTransaction, setActiveTab } = useApp();

  const recentList = transactions.slice(0, 4);

  return (
    <div className="px-5 pb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-900">Dernières transactions</h3>
        {recentList.length > 0 && (
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Voir tout</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {recentList.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 text-center flex flex-col items-center">
          <Inbox className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-700">Aucune transaction pour le moment</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
            Rechargez votre wallet ou effectuez votre premier envoi d'argent vers l'Afrique de l'Ouest.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentList.map(tx => {
            const isReceive = tx.type === 'RECEIVE';
            const isWithdraw = tx.type === 'WITHDRAW';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTransaction(tx)}
                className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition cursor-pointer flex items-center justify-between shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  {/* Direction Icon Badge */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isReceive
                        ? 'bg-emerald-100 text-emerald-600'
                        : isWithdraw
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    {isReceive ? (
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                    ) : isWithdraw ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{tx.title}</h4>
                    <p className="text-xs text-slate-400 font-medium">{tx.formattedDate}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-extrabold block ${
                      isReceive ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isReceive ? '+' : isWithdraw ? '-' : '-'}
                    {tx.amountEUR > 0 ? `${tx.amountEUR.toFixed(2)} €` : `${tx.amountXOF.toLocaleString('fr-FR')} XOF`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {tx.amountEUR > 0 ? `= ${tx.amountXOF.toLocaleString('fr-FR')} XOF` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
