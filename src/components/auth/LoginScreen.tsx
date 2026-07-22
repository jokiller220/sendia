import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Mail, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

export const LoginScreen: React.FC = () => {
  const { setCurrentScreen, setUser, setWallet, setTransactions, setBeneficiaries, setIsAuthenticated } = useApp();
  
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      let searchQuery = '';
      if (mode === 'phone') {
        const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
        searchQuery = `${selectedCountry.prefix} ${cleanPhone}`;
      } else {
        searchQuery = emailInput.trim();
      }

      // Query user in Supabase
      const query = supabase.from('users').select('*');
      if (mode === 'phone') {
        query.eq('phone', searchQuery);
      } else {
        query.eq('email', searchQuery);
      }

      const { data: userData, error: userError } = await query.maybeSingle();

      if (userError) {
        console.error('[Login] User query error:', userError);
        setErrorMsg('Erreur lors de la recherche du compte. Réessayez.');
        setIsLoading(false);
        return;
      }

      if (!userData) {
        setErrorMsg(
          mode === 'phone'
            ? 'Numéro de téléphone non enregistré.'
            : 'Adresse email non enregistrée.'
        );
        setIsLoading(false);
        return;
      }

      // Fetch Wallet from Supabase
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle();

      if (walletError) {
        console.error('[Login] Wallet query error:', walletError);
      }

      // Fetch Transactions from Supabase
      const { data: txsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      // Fetch Beneficiaries from Supabase
      const { data: benData } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', userData.id);

      // Successfully authenticated
      const userProfile = {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        country: userData.country,
        countryCode: userData.country_code,
        flag: userData.flag,
        kycStatus: userData.kyc_status,
        kycTier: userData.kyc_tier,
      };

      const userWallet = {
        id: walletData?.id || 'wal_temp',
        userId: userData.id,
        balanceEUR: walletData ? parseFloat(walletData.balance_eur) : 0.0,
        balanceXOF: walletData ? parseInt(walletData.balance_xof, 10) : 0,
        updatedAt: walletData?.updated_at || new Date().toISOString(),
      };

      // Set user session in LocalStorage
      localStorage.setItem('sendia_user', JSON.stringify(userProfile));
      localStorage.setItem('sendia_wallet', JSON.stringify(userWallet));

      const formattedTxs = (txsData || []).map(t => ({
        id: t.id,
        type: t.type,
        title: t.title,
        senderOrRecipientName: t.sender_or_recipient_name,
        senderOrRecipientPhone: t.sender_or_recipient_phone,
        amountEUR: parseFloat(t.amount_eur),
        amountXOF: parseInt(t.amount_xof, 10),
        feeEUR: parseFloat(t.fee_eur),
        feeXOF: parseInt(t.fee_xof, 10),
        exchangeRate: parseFloat(t.exchange_rate),
        status: t.status,
        geniusPayRef: t.genius_pay_ref,
        paymentMethod: t.payment_method,
        createdAt: t.created_at,
        formattedDate: t.formatted_date || 'Récemment',
      }));

      const formattedBens = (benData || []).map(b => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        country: b.country,
        countryCode: b.country_code,
        flag: b.flag,
        operator: b.operator,
        avatarBg: b.avatar_bg || 'bg-indigo-500',
      }));

      localStorage.setItem('sendia_transactions', JSON.stringify(formattedTxs));
      localStorage.setItem('sendia_beneficiaries', JSON.stringify(formattedBens));

      setUser(userProfile);
      setWallet(userWallet);
      setTransactions(formattedTxs);
      setBeneficiaries(formattedBens);
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');

    } catch (err) {
      console.error('[Login] Exception:', err);
      setErrorMsg('Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
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
          Connexion à Sendia
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Entrez vos identifiants pour accéder à votre espace
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {/* Email or Phone Selector */}
          {mode === 'phone' ? (
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Téléphone mobile
              </label>
              <div className="flex rounded-2xl border border-slate-300 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 overflow-hidden shadow-xs">
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

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-300 text-base font-semibold text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition mt-6 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <span>Se connecter</span>
            )}
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
              <span>Se connecter par email</span>
            </>
          ) : (
            <>
              <Phone className="w-4 h-4 text-indigo-600" />
              <span>Se connecter par téléphone</span>
            </>
          )}
        </button>
      </div>

      {/* Footer link to Register */}
      <div className="pb-4 text-center">
        <p className="text-sm text-slate-500">
          Pas encore de compte ?{' '}
          <button
            onClick={() => setCurrentScreen('register')}
            className="text-indigo-600 font-bold hover:underline"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
};
