import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, Search, ArrowUpRight, X, Users } from 'lucide-react';
import type { Beneficiary } from '../../types';

export const BeneficiariesScreen: React.FC = () => {
  const { beneficiaries, addBeneficiary, setSendDraft, setCurrentScreen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Beneficiary form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Togo');
  const [operator, setOperator] = useState<Beneficiary['operator']>('Flooz');

  const filtered = beneficiaries.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.phone.includes(searchQuery) ||
    b.operator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuickSend = (b: Beneficiary) => {
    setSendDraft(prev => ({
      ...prev,
      recipientName: b.name,
      recipientPhone: b.phone,
      recipientCountry: b.country,
    }));
    setCurrentScreen('send_amount');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    let flag = '🇹🇬';
    if (country === "Côte d'Ivoire") flag = '🇨🇮';
    if (country === 'Sénégal') flag = '🇸🇳';
    if (country === 'Bénin') flag = '🇧🇯';

    addBeneficiary({
      name,
      phone,
      country,
      countryCode: country === 'Togo' ? 'TG' : 'CI',
      flag,
      operator,
    });

    setName('');
    setPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 p-5 pb-24 bg-slate-50 min-h-screen">
      {/* Header with + Ajouter */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Bénéficiaires
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ Ajouter</span>
        </button>
      </div>

      {/* Search Bar */}
      {beneficiaries.length > 0 && (
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, téléphone ou opérateur..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
          />
        </div>
      )}

      {/* Beneficiaries Cards List or Empty State */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center flex flex-col items-center">
          <Users className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-800">Aucun bénéficiaire enregistré</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mb-4">
            Ajoutez les membres de votre famille ou vos contacts en Afrique de l'Ouest pour effectuer des transferts rapides.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
          >
            + Ajouter mon premier bénéficiaire
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div
              key={b.id}
              onClick={() => handleQuickSend(b)}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition cursor-pointer flex items-center justify-between shadow-xs group"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl ${b.avatarBg || 'bg-indigo-500'} text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0`}>
                  {b.name.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {b.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 font-medium">{b.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs">{b.flag}</span>
                    <span className="text-[11px] font-semibold text-slate-600">{b.country}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {b.operator}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={e => {
                  e.stopPropagation();
                  handleQuickSend(b);
                }}
                className="w-9 h-9 rounded-full bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 flex items-center justify-center transition"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Ajouter un bénéficiaire</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: Kossi Amégée"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+228 90 00 00 00"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pays</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                  >
                    <option value="Togo">🇹🇬 Togo</option>
                    <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
                    <option value="Sénégal">🇸🇳 Sénégal</option>
                    <option value="Bénin">🇧🇯 Bénin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Opérateur</label>
                  <select
                    value={operator}
                    onChange={e => setOperator(e.target.value as Beneficiary['operator'])}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                  >
                    <option value="Flooz">Flooz</option>
                    <option value="T-Money">T-Money</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Wave">Wave</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition mt-2"
              >
                Enregistrer le bénéficiaire
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
