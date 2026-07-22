import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, CreditCard, Shield, Settings, HelpCircle, LogOut, ChevronRight, CheckCircle2, X, Lock, Globe, Smartphone, ExternalLink } from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, resetAppState, setCurrentScreen, activeCurrency, setActiveCurrency } = useApp();
  
  // Modals state
  const [activeModal, setActiveModal] = useState<'none' | 'withdraw_methods' | 'security' | 'settings' | 'support'>('none');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  const nameParts = user.name ? user.name.trim().split(' ') : ['Membre'];
  const initials = nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';

  const kycLabel = user.kycStatus === 'VERIFIED'
    ? (user.kycTier === 'TIER_2' ? 'Compte Vérifié • Tier 2 (5 000€/jour)' : 'Compte Vérifié • Tier 1 (1 000€/jour)')
    : 'KYC Non vérifié (Plafond 250€)';

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length >= 8) {
      setPasswordSaved(true);
      setTimeout(() => {
        setPasswordSaved(false);
        setActiveModal('none');
        setCurrentPassword('');
        setNewPassword('');
      }, 1500);
    }
  };

  return (
    <div className="flex-1 p-5 pb-24 bg-slate-50 min-h-screen">
      <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-6">
        Profil
      </h1>

      {/* User Header Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-extrabold flex items-center justify-center text-xl shadow-lg ring-4 ring-indigo-50 shrink-0">
          {initials}
        </div>

        <div>
          <h2 className="text-base font-extrabold text-slate-900">{user.name}</h2>
          <p className="text-xs text-slate-500 font-medium">{user.phone}</p>
          <p className="text-[11px] text-slate-400 font-medium">{user.email}</p>

          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{kycLabel}</span>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-3">
        {/* 1. Informations personnelles */}
        <button
          onClick={() => setCurrentScreen('kyc_overview')}
          className="w-full p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Informations personnelles & KYC
              </h4>
              <p className="text-xs text-slate-400">Pièces d'identité et niveau de vérification</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 2. Moyens de retrait */}
        <button
          onClick={() => setActiveModal('withdraw_methods')}
          className="w-full p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Moyens de retrait enregistrés
              </h4>
              <p className="text-xs text-slate-400">Flooz, T-Money, Orange Money, Wave, IBAN</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 3. Sécurité */}
        <button
          onClick={() => setActiveModal('security')}
          className="w-full p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Sécurité
              </h4>
              <p className="text-xs text-slate-400">Changer le mot de passe & 2FA</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 4. Paramètres */}
        <button
          onClick={() => setActiveModal('settings')}
          className="w-full p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Paramètres de l'application
              </h4>
              <p className="text-xs text-slate-400">Devise par défaut ({activeCurrency}) & Langue</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 5. Aide et support */}
        <button
          onClick={() => setActiveModal('support')}
          className="w-full p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Aide et support
              </h4>
              <p className="text-xs text-slate-400">FAQ, assistance GeniusPay & réclamation</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Logout Button */}
        <button
          onClick={resetAppState}
          className="w-full mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 hover:bg-rose-100/80 text-rose-600 transition flex items-center justify-center gap-2 font-bold text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </div>

      {/* --- MODAL 1: MOYENS DE RETRAIT --- */}
      {activeModal === 'withdraw_methods' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold">Moyens de retrait enregistrés</h3>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { name: 'Flooz (Togo)', phone: user.phone || '+228 90 00 00 00', icon: '🇹🇬' },
                { name: 'T-Money (Togo)', phone: user.phone || '+228 91 00 00 00', icon: '🇹🇬' },
                { name: 'Orange Money (CI)', phone: '+225 07 00 00 00', icon: '🇨🇮' },
                { name: 'Wave (Sénégal)', phone: '+221 77 00 00 00', icon: '🇸🇳' },
              ].map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{m.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                      <p className="text-[11px] text-slate-500">{m.phone}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Actif
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setActiveModal('none');
                setCurrentScreen('withdraw_amount');
              }}
              className="w-full mt-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              Lancer un retrait vers Mobile Money
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: SÉCURITÉ --- */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold">Sécurité & Mot de passe</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordSaved ? (
              <div className="p-6 text-center text-emerald-600">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm font-bold">Mot de passe mis à jour avec succès !</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                  🔒 Authentification 2FA activée par SMS via Supabase Auth.
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
                >
                  Enregistrer le mot de passe
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 3: PARAMÈTRES --- */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold">Paramètres de l'application</h3>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Devise d'affichage principale
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCurrency('EUR')}
                    className={`py-3 rounded-xl text-xs font-bold border transition ${
                      activeCurrency === 'EUR'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    EUR (€)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCurrency('XOF')}
                    className={`py-3 rounded-xl text-xs font-bold border transition ${
                      activeCurrency === 'XOF'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    XOF (CFA)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Langue de l'interface
                </label>
                <div className="p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Français (France)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Notifications
                </label>
                <div className="p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                  <span className="font-semibold">Alertes de crédit SMS & Push</span>
                  <input type="checkbox" defaultChecked className="accent-indigo-600 w-4 h-4" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="w-full mt-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 4: AIDE & SUPPORT --- */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold">Aide et support GeniusPay</h3>
              <button
                onClick={() => setActiveModal('none')}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900">
                <h4 className="font-bold mb-1">Besoin d'assistance rapide ?</h4>
                <p>Support technique actif 24/7 sur les corridors Europe ↔ Afrique de l'Ouest.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Support Client GeniusPay</span>
                  <span className="text-[11px] text-slate-500">support@geniuspay.ci</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Assistance Téléphonique</span>
                  <span className="text-[11px] text-slate-500">+228 90 00 00 00 / +33 1 00 00 00</span>
                </div>
                <Smartphone className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="w-full mt-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              Fermer le support
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
