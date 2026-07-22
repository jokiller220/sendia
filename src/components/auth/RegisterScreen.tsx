import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Mail, Phone } from 'lucide-react';

interface CountryOption {
  code: string;
  name: string;
  prefix: string;
  flag: string;
}

const COUNTRIES: CountryOption[] = [
  { code: 'FR', name: 'France', prefix: '+33', flag: '🇫🇷' },
  { code: 'TG', name: 'Togo', prefix: '+228', flag: '🇹🇬' },
  { code: 'CI', name: "Côte d'Ivoire", prefix: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Sénégal', prefix: '+221', flag: '🇸🇳' },
  { code: 'BJ', name: 'Bénin', prefix: '+229', flag: '🇧🇯' },
  { code: 'BF', name: 'Burkina Faso', prefix: '+226', flag: '🇧🇫' },
  { code: 'ML', name: 'Mali', prefix: '+223', flag: '🇲🇱' },
];

export const RegisterScreen: React.FC = () => {
  const { setCurrentScreen, setUser } = useApp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [emailInput, setEmailInput] = useState('');

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Nouveau Membre';
    
    setUser(prev => ({
      ...prev,
      name: fullName,
      phone: `${selectedCountry.prefix} ${phoneNumber.trim()}`,
      email: emailInput.trim() || `${phoneNumber.replace(/\s+/g, '')}@sendia.app`,
      country: selectedCountry.name,
      countryCode: selectedCountry.code,
      flag: selectedCountry.flag,
    }));
    setCurrentScreen('otp');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen">
      {/* Header */}
      <div>
        <button
          onClick={() => setCurrentScreen('welcome')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Créer un compte Sendia
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Renseignez vos informations personnelles
        </p>

        {/* Input Form */}
        <form onSubmit={handleContinue} className="mt-6 space-y-4">
          {/* Nom & Prénom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Prénom
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Nom
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Phone or Email input */}
          {mode === 'phone' ? (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Téléphone mobile
              </label>
              <div className="flex rounded-2xl border border-slate-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 overflow-hidden shadow-xs">
                {/* Country selector */}
                <select
                  value={selectedCountry.code}
                  onChange={e => {
                    const c = COUNTRIES.find(x => x.code === e.target.value);
                    if (c) setSelectedCountry(c);
                  }}
                  className="bg-slate-50 border-r border-slate-200 px-3 py-3.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.prefix}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="6 12 34 56 78"
                  className="flex-1 px-4 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none tracking-wide"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Pays de résidence */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Pays de résidence
            </label>
            <select
              value={selectedCountry.code}
              onChange={e => {
                const c = COUNTRIES.find(x => x.code === e.target.value);
                if (c) setSelectedCountry(c);
              }}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:border-indigo-600 focus:outline-none cursor-pointer"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition mt-4"
          >
            Continuer
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 uppercase font-medium">ou</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Switch Mode Button */}
        <button
          onClick={() => setMode(m => (m === 'phone' ? 'email' : 'phone'))}
          className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-2"
        >
          {mode === 'phone' ? (
            <>
              <Mail className="w-4 h-4 text-indigo-600" />
              <span>S'inscrire par email</span>
            </>
          ) : (
            <>
              <Phone className="w-4 h-4 text-indigo-600" />
              <span>S'inscrire par téléphone</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Legal Terms */}
      <div className="pb-4 text-center">
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
          En continuant, vous acceptez nos{' '}
          <a href="#" className="underline font-medium text-slate-600">Conditions d'utilisation</a>{' '}
          et notre{' '}
          <a href="#" className="underline font-medium text-slate-600">Politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
};
