import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, Search, ArrowUpRight, X, Users, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { Beneficiary } from '../../types';
import { supabase } from '../../lib/supabase';

export const BeneficiariesScreen: React.FC = () => {
  const { beneficiaries, addBeneficiary, setSendDraft, setCurrentScreen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Beneficiary form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Togo');
  const [operator, setOperator] = useState<Beneficiary['operator']>('Flooz');

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!phone && !email)) return;

    setIsVerifying(true);
    setVerificationError(null);

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    const cleanEmail = email.trim().toLowerCase();

    // 1. Verification against Supabase database users
    try {
      let query = supabase.from('users').select('*');
      
      if (cleanEmail && cleanPhone) {
        query = query.or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`);
      } else if (cleanEmail) {
        query = query.eq('email', cleanEmail);
      } else {
        query = query.eq('phone', cleanPhone);
      }

      const { data: matchedUsers, error } = await query;

      if (error) {
        console.warn('[Beneficiaries] Erreur vérification Supabase:', error.message);
      }

      // Check if user exists
      const foundUser = matchedUsers && matchedUsers.length > 0 ? matchedUsers[0] : null;

      if (!foundUser) {
        setVerificationError("Aucun compte Sendia enregistré ne correspond à ces informations. L'utilisateur doit exister dans la base de données Sendia.");
        setIsVerifying(false);
        return;
      }

      let flag = '🇹🇬';
      if (country === "Côte d'Ivoire") flag = '🇨🇮';
      if (country === 'Sénégal') flag = '🇸🇳';
      if (country === 'Bénin') flag = '🇧🇯';

      // Use exact registered user name from DB if available
      const verifiedName = foundUser.full_name || name;

      addBeneficiary({
        name: verifiedName,
        phone: foundUser.phone || phone,
        country,
        countryCode: country === 'Togo' ? 'TG' : 'CI',
        flag,
        operator,
      });

      setName('');
      setPhone('');
      setEmail('');
      setIsVerifying(false);
      setShowAddModal(false);

    } catch (err) {
      console.error('[Beneficiaries] Exception lors de la vérification:', err);
      setVerificationError("Erreur réseau lors de la vérification dans la base Sendia.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex-1 p-5 pb-24 bg-slate-50 min-h-screen">
      {/* Header with + Ajouter */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Bénéficiaires
        </h1>
        <button
          onClick={() => { setVerificationError(null); setShowAddModal(true); }}
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
            Ajoutez les membres enregistrés sur la plateforme Sendia pour effectuer des transferts directs de wallet à wallet.
          </p>
          <button
            onClick={() => { setVerificationError(null); setShowAddModal(true); }}
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

      {/* Add Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Vérifier & Ajouter un membre</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {verificationError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{verificationError}</span>
              </div>
            )}

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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone de l'utilisateur Sendia</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+228 90 00 00 00"
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email (facultatif pour vérification)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="membre@sendia.app"
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
                disabled={isVerifying}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition mt-2 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Vérification dans la base Sendia...</span>
                  </>
                ) : (
                  <span>Vérifier & Enregistrer</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
