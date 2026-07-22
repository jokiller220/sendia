import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, Search, ArrowUpRight, X, Users, CheckCircle2, Loader2, UserCheck } from 'lucide-react';
import type { Beneficiary } from '../../types';
import { supabase } from '../../lib/supabase';

export const BeneficiariesScreen: React.FC = () => {
  const { beneficiaries, addBeneficiary, setSendDraft, setCurrentScreen, user: currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Live User Search State
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal Selection Details
  const [selectedDbUser, setSelectedDbUser] = useState<any | null>(null);
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

  // Live search users in Supabase DB
  const handleSearchUsers = async (queryVal: string) => {
    setDbSearchQuery(queryVal);
    setSelectedDbUser(null);
    const q = queryVal.trim();

    if (q.length < 1) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Clean phone number variations (e.g. +228 91 61 65 31 vs +22891616531 vs 91616531)
      const cleanQ = q.replace(/\s+/g, '').replace(/\+/g, '');
      
      // Search in 'name', 'email', 'phone' (matching the SQL schema columns)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,phone.ilike.%${cleanQ}%`)
        .limit(10);

      if (error) {
        console.warn('[Beneficiaries] Search DB note:', error.message);
        // Fallback: search by name or email or phone individually if .or query failed
        const { data: fallbackData } = await supabase
          .from('users')
          .select('*')
          .ilike('name', `%${q}%`)
          .limit(10);

        const otherUsers = (fallbackData || []).filter(u => u.id !== currentUser.id && u.email !== currentUser.email);
        setSearchResults(otherUsers);
      } else {
        // Exclude current user from search results
        const otherUsers = (data || []).filter(u => u.id !== currentUser.id && u.email !== currentUser.email);
        setSearchResults(otherUsers);
      }
    } catch (err) {
      console.error('[Beneficiaries] Search exception:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddSelectedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDbUser) return;

    let flag = '🇹🇬';
    if (country === "Côte d'Ivoire") flag = '🇨🇮';
    if (country === 'Sénégal') flag = '🇸🇳';
    if (country === 'Bénin') flag = '🇧🇯';

    addBeneficiary({
      name: selectedDbUser.full_name || selectedDbUser.name || 'Membre Sendia',
      phone: selectedDbUser.phone || '+228 90 00 00 00',
      country,
      countryCode: country === 'Togo' ? 'TG' : 'CI',
      flag,
      operator,
    });

    // Reset state & close modal
    setDbSearchQuery('');
    setSearchResults([]);
    setSelectedDbUser(null);
    setHasSearched(false);
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
          onClick={() => {
            setDbSearchQuery('');
            setSearchResults([]);
            setSelectedDbUser(null);
            setHasSearched(false);
            setShowAddModal(true);
          }}
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
            Recherchez un utilisateur Sendia par son nom ou son numéro pour l'ajouter et lui envoyer de l'argent.
          </p>
          <button
            onClick={() => {
              setDbSearchQuery('');
              setSearchResults([]);
              setSelectedDbUser(null);
              setHasSearched(false);
              setShowAddModal(true);
            }}
            className="py-2.5 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
          >
            + Rechercher & Ajouter un utilisateur
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
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1">
                    <span>{b.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
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

      {/* Add Beneficiary Search Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Rechercher un membre Sendia</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Search Input */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Tapez un nom, un prénom ou un numéro de téléphone
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  autoFocus
                  value={dbSearchQuery}
                  onChange={e => handleSearchUsers(e.target.value)}
                  placeholder="ex: Joakim, +228 91..."
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin absolute right-3.5 top-3.5" />
                )}
              </div>
            </div>

            {/* Search Results List */}
            <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
              {searchResults.map(u => (
                <div
                  key={u.id}
                  onClick={() => setSelectedDbUser(u)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    selectedDbUser?.id === u.id
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {(u.name || u.full_name || 'US').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <span>{u.name || u.full_name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </h4>
                      <p className="text-[11px] text-slate-500">{u.phone || u.email}</p>
                    </div>
                  </div>
                  {selectedDbUser?.id === u.id ? (
                    <UserCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  ) : (
                    <span className="text-[11px] font-semibold text-indigo-600">Sélectionner</span>
                  )}
                </div>
              ))}

              {hasSearched && searchResults.length === 0 && !isSearching && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-600">Aucun utilisateur trouvé</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Vérifiez l'orthographe du nom ou le numéro tapé.</p>
                </div>
              )}
            </div>

            {/* If user is selected, show operator & country selection and submit */}
            {selectedDbUser && (
              <form onSubmit={handleAddSelectedUser} className="mt-4 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pays du bénéficiaire</label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
                    >
                      <option value="Togo">🇹🇬 Togo</option>
                      <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
                      <option value="Sénégal">🇸🇳 Sénégal</option>
                      <option value="Bénin">🇧🇯 Bénin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Opérateur Wallet</label>
                    <select
                      value={operator}
                      onChange={e => setOperator(e.target.value as Beneficiary['operator'])}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
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
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ajouter {selectedDbUser.full_name || selectedDbUser.name}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
