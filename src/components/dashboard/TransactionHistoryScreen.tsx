import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, ArrowDownLeft, ArrowUpRight, Smartphone, Calendar } from 'lucide-react';

export const TransactionHistoryScreen: React.FC = () => {
  const { transactions, setSelectedTransaction } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'SEND' | 'RECEIVE' | 'WITHDRAW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(tx => {
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.senderOrRecipientName && tx.senderOrRecipientName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex-1 p-5 pb-24 bg-slate-50 min-h-screen">
      <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-4">
        Historique des transactions
      </h1>

      {/* Search & Filter bar */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un nom, un montant ou une réf..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              filterType === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterType('SEND')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              filterType === 'SEND'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Envois
          </button>
          <button
            onClick={() => setFilterType('RECEIVE')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              filterType === 'RECEIVE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Réceptions
          </button>
          <button
            onClick={() => setFilterType('WITHDRAW')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              filterType === 'WITHDRAW'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Retraits
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Aucune transaction trouvée</h3>
          <p className="text-xs text-slate-400 mt-1">Essayez de modifier votre recherche ou vos filtres.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(tx => {
            const isReceive = tx.type === 'RECEIVE';
            const isWithdraw = tx.type === 'WITHDRAW';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTransaction(tx)}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-200 transition cursor-pointer flex items-center justify-between shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
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
                    {isReceive ? '+' : '-'}
                    {tx.amountEUR > 0 ? `${tx.amountEUR.toFixed(2)} €` : `${tx.amountXOF.toLocaleString('fr-FR')} XOF`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
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
