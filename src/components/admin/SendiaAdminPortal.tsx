import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { geniusPay } from '../../lib/geniuspay';
import {
  LayoutDashboard,
  Users,
  Wallet as WalletIcon,
  ArrowLeftRight,
  ShieldCheck,
  Zap,
  Search,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Lock,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';
import type { KycTier } from '../../types';

export const SendiaAdminPortal: React.FC = () => {
  const { exchangeRate, simulateWebhookPaymentSuccess, setIsAdminOpen } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'users' | 'wallets' | 'transactions' | 'kyc' | 'geniuspay' | 'treasury'
  >('overview');

  // Admin Login Session State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('sendia_admin_auth');
    return saved === 'true';
  });

  const [adminEmail, setAdminEmail] = useState<string>('admin@sendia.app');
  const [adminPassword, setAdminPassword] = useState<string>('AdminSendia2026!');
  const [adminPin, setAdminPin] = useState<string>('8899');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Supabase Live Data State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [walletsList, setWalletsList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Treasury & Commissions States
  const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000000';
  const [treasuryWallet, setTreasuryWallet] = useState<any | null>(null);
  const [treasuryTransactions, setTreasuryTransactions] = useState<any[]>([]);

  // Payout states
  const [treasuryPayoutAmount, setTreasuryPayoutAmount] = useState<string>('10');
  const [treasuryPayoutPhone, setTreasuryPayoutPhone] = useState<string>('');
  const [treasuryPayoutOperator, setTreasuryPayoutOperator] = useState<string>('Wave');
  const [treasuryStatusMsg, setTreasuryStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isTreasurySubmitting, setIsTreasurySubmitting] = useState<boolean>(false);

  // Selected User Modal for Edit / Manual Balance Credit
  const [selectedUserForCredit, setSelectedUserForCredit] = useState<any | null>(null);
  const [creditAmountInput, setCreditAmountInput] = useState<string>('50');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Webhook Simulator State
  const [webhookAmountEUR, setWebhookAmountEUR] = useState<string>('100');
  const [webhookSenderName, setWebhookSenderName] = useState<string>('Mama Koffi (Togo)');
  const [webhookSuccessMsg, setWebhookSuccessMsg] = useState<string>('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@sendia.app' && adminPassword === 'AdminSendia2026!' && adminPin === '8899') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('sendia_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Identifiants administrateur incorrects. Vérifiez l\'email, le mot de passe et le PIN.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('sendia_admin_auth');
  };

  // Fetch real-time data from Supabase
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Users
      const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (usersData) setUsersList(usersData);

      // 2. Fetch Wallets
      const { data: walletsData } = await supabase.from('wallets').select('*');
      if (walletsData) setWalletsList(walletsData);

      // 3. Fetch Transactions
      const { data: txsData } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
      if (txsData) setTransactionsList(txsData);

      // 4. Fetch Treasury Wallet
      const { data: tresWalletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', ADMIN_USER_ID)
        .maybeSingle();
      if (tresWalletData) {
        setTreasuryWallet(tresWalletData);
      } else {
        setTreasuryWallet({ balance_eur: '0.00', balance_xof: 0 });
      }

      // 5. Fetch Treasury Transactions
      const { data: tresTxsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', ADMIN_USER_ID)
        .order('created_at', { ascending: false });
      if (tresTxsData) {
        setTreasuryTransactions(tresTxsData);
      }
    } catch (err) {
      console.log('Admin load note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTreasuryPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTreasurySubmitting(true);
    setTreasuryStatusMsg(null);

    const eurToWithdraw = parseFloat(treasuryPayoutAmount) || 0;
    const xofToWithdraw = Math.round(eurToWithdraw * exchangeRate);

    if (!treasuryWallet) {
      setTreasuryStatusMsg({ type: 'error', text: 'Portefeuille trésorerie introuvable.' });
      setIsTreasurySubmitting(false);
      return;
    }

    const currentBalanceEur = parseFloat(treasuryWallet.balance_eur) || 0;

    if (eurToWithdraw <= 0) {
      setTreasuryStatusMsg({ type: 'error', text: 'Le montant doit être supérieur à 0.' });
      setIsTreasurySubmitting(false);
      return;
    }

    if (eurToWithdraw > currentBalanceEur) {
      setTreasuryStatusMsg({ type: 'error', text: 'Solde de trésorerie insuffisant.' });
      setIsTreasurySubmitting(false);
      return;
    }

    try {
      const gpayRes = await geniusPay.createPayout({
        amount: xofToWithdraw,
        currency: 'XOF',
        recipientPhone: treasuryPayoutPhone,
        operator: treasuryPayoutOperator,
        description: `Commission withdrawal from Sendia Treasury`
      });

      if (gpayRes.success) {
        const newEurBalance = Math.max(0, currentBalanceEur - eurToWithdraw);
        const newXofBalance = Math.max(0, (parseInt(treasuryWallet.balance_xof, 10) || 0) - xofToWithdraw);

        await supabase
          .from('wallets')
          .update({
            balance_eur: newEurBalance,
            balance_xof: newXofBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', ADMIN_USER_ID);

        // Log transaction for admin
        await supabase.from('transactions').insert([{
          id: `WD-${Math.floor(100000000 + Math.random() * 900000000)}`,
          user_id: ADMIN_USER_ID,
          type: 'WITHDRAW',
          title: `Retrait Commission ${treasuryPayoutOperator}`,
          sender_or_recipient_name: `Compte ${treasuryPayoutOperator}`,
          sender_or_recipient_phone: treasuryPayoutPhone,
          amount_eur: eurToWithdraw,
          amount_xof: xofToWithdraw,
          fee_eur: 0,
          fee_xof: 0,
          exchange_rate: exchangeRate,
          status: 'COMPLETED',
          genius_pay_ref: gpayRes.reference || `GPAY-WD-${Math.floor(10000 + Math.random() * 90000)}`,
          payment_method: `${treasuryPayoutOperator} (${treasuryPayoutPhone})`,
          formatted_date: 'À l\'instant',
        }]);

        setTreasuryStatusMsg({ 
          type: 'success', 
          text: `Retrait de ${eurToWithdraw.toFixed(2)} € (${xofToWithdraw.toLocaleString()} XOF) effectué avec succès !` 
        });
        setTreasuryPayoutAmount('10');
        setTreasuryPayoutPhone('');
        loadAdminData();
      } else {
        setTreasuryStatusMsg({ 
          type: 'error', 
          text: gpayRes.message || 'Erreur lors du traitement du retrait via GeniusPay.' 
        });
      }
    } catch (err: any) {
      console.error('Treasury payout exception:', err);
      setTreasuryStatusMsg({ type: 'error', text: `Une erreur est survenue : ${err.message || err}` });
    } finally {
      setIsTreasurySubmitting(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadAdminData();
    }
  }, [isAdminAuthenticated]);

  // Action: Elevate KYC Status in Supabase
  const handleUpdateKycStatus = async (userId: string, newStatus: string, newTier: KycTier) => {
    setIsUpdating(true);
    try {
      await supabase.from('users').update({
        kyc_status: newStatus,
        kyc_tier: newTier,
      }).eq('id', userId);
      await loadAdminData();
    } catch (e) {
      console.log('Update KYC error:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  // Action: Manual Balance Adjustment (Credit / Debit) in Supabase
  const handleManualWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForCredit) return;

    const amount = parseFloat(creditAmountInput) || 0;
    setIsUpdating(true);

    try {
      const existingWallet = walletsList.find(w => w.user_id === selectedUserForCredit.id);
      const currentEur = existingWallet ? parseFloat(existingWallet.balance_eur) : 0;
      const newEur = Math.max(0, currentEur + amount);
      const newXof = Math.round(newEur * exchangeRate);

      await supabase.from('wallets').upsert({
        id: existingWallet ? existingWallet.id : `wal_${Date.now()}`,
        user_id: selectedUserForCredit.id,
        balance_eur: newEur,
        balance_xof: newXof,
        updated_at: new Date().toISOString(),
      });

      await supabase.from('transactions').insert([{
        id: `ADMIN-ADJ-${Math.floor(1000000 + Math.random() * 9000000)}`,
        user_id: selectedUserForCredit.id,
        type: amount >= 0 ? 'RECEIVE' : 'WITHDRAW',
        title: `Régularisation Admin (${amount >= 0 ? '+' : ''}${amount} €)`,
        sender_or_recipient_name: 'Back-Office Sendia Admin',
        amount_eur: Math.abs(amount),
        amount_xof: Math.abs(Math.round(amount * exchangeRate)),
        fee_eur: 0,
        fee_xof: 0,
        exchange_rate: exchangeRate,
        status: 'COMPLETED',
        genius_pay_ref: `ADMIN-ADJ-${Date.now()}`,
        payment_method: 'Ajustement Comptable',
        formatted_date: 'À l\'instant',
      }]);

      setSelectedUserForCredit(null);
      await loadAdminData();
    } catch (err) {
      console.log('Manual adjustment error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Action: Execute Webhook Simulation
  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(webhookAmountEUR) || 100;
    simulateWebhookPaymentSuccess(amount, webhookSenderName);
    setWebhookSuccessMsg(`Webhook payment.success déclenché pour +${amount} € !`);
    setTimeout(() => setWebhookSuccessMsg(''), 3000);
    await loadAdminData();
  };

  // Calculated Metrics
  const totalUsersCount = usersList.length;
  const totalEurVolume = transactionsList.reduce((acc, t) => acc + (parseFloat(t.amount_eur) || 0), 0);
  const totalXofVolume = transactionsList.reduce((acc, t) => acc + (parseInt(t.amount_xof, 10) || 0), 0);
  const verifiedUsersCount = usersList.filter(u => u.kyc_status === 'VERIFIED').length;

  // --- UNAUTHENTICATED ADMIN LOGIN SCREEN ---
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative">
        <button
          onClick={() => {
            setIsAdminOpen(false);
            window.history.pushState({}, '', window.location.pathname);
            window.dispatchEvent(new Event('popstate'));
          }}
          className="absolute top-6 left-6 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-2 border border-slate-700/60 shadow-lg cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
          <span>Retour à l'application</span>
        </button>

        <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-indigo-600/30">
              S
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Sendia Operations Admin</h1>
            <p className="text-xs text-slate-400">Portail Administrateur Back-Office (Accès Réseau Restreint)</p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
                Email Administrateur
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@sendia.app"
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
                Mot de passe Admin
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm font-semibold text-white focus:border-indigo-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(s => !s)}
                  className="absolute right-4 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Code PIN de Sécurité (4 Chiffres)</span>
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={adminPin}
                onChange={e => setAdminPin(e.target.value)}
                placeholder="8899"
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-center text-lg font-mono font-extrabold tracking-widest text-indigo-400 focus:border-indigo-600 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>🔑 <strong>Identifiants Démo Admin :</strong></div>
              <div>• Email: <code className="text-indigo-300">admin@sendia.app</code></div>
              <div>• Mot de passe: <code className="text-indigo-300">AdminSendia2026!</code></div>
              <div>• Code PIN: <code className="text-indigo-300">8899</code></div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Se Connecter au Back-Office</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* --- DESKTOP HEADER --- */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">Sendia Operations</h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30">
                BACK-OFFICE DESKTOP
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Supervision en temps réel Europe ↔ Afrique de l'Ouest</p>
          </div>
        </div>

        {/* Live System Status Badges */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Supabase DB: Connecté ⚡</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Zap className="w-3.5 h-3.5" />
            <span>GeniusPay API: LIVE ⚡ (pk_live_wosUxndi...)</span>
          </div>

          <button
            onClick={loadAdminData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleAdminLogout}
            className="py-1.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Déconnexion Admin</span>
          </button>

          <button
            onClick={() => {
              setIsAdminOpen(false);
              window.history.pushState({}, '', window.location.pathname);
              window.dispatchEvent(new Event('popstate'));
            }}
            className="py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Retour App</span>
          </button>
        </div>
      </header>

      {/* --- DESKTOP BODY LAYOUT --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-slate-950/60 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Navigation Admin
            </div>

            <button
              onClick={() => setActiveAdminTab('overview')}
              className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                activeAdminTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de Bord</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('users')}
              className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                activeAdminTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Gestion Utilisateurs</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {totalUsersCount}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('wallets')}
              className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                activeAdminTab === 'wallets'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <WalletIcon className="w-4 h-4" />
                <span>Wallets & Comptabilité</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {walletsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('transactions')}
              className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                activeAdminTab === 'transactions'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <ArrowLeftRight className="w-4 h-4" />
                <span>Supervision Flux</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {transactionsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('kyc')}
              className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                activeAdminTab === 'kyc'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Vault KYC & Pièces</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                {verifiedUsersCount} vérifiés
              </span>
            </button>

            <button
              onClick={() => setActiveAdminTab('geniuspay')}
              className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-3 ${
                activeAdminTab === 'geniuspay'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Passerelle GeniusPay</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('treasury')}
              className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                activeAdminTab === 'treasury'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Trésorerie & Commissions</span>
              </div>
              {treasuryWallet && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-400 font-bold">
                  {(parseFloat(treasuryWallet.balance_eur) || 0).toFixed(2)} €
                </span>
              )}
            </button>
          </div>

          {/* Admin Profile Box */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              AD
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">admin@sendia.app</span>
              <span className="text-[10px] text-emerald-400">Accès Réseau Total</span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-900">
          {/* TAB 1: OVERVIEW METRICS */}
          {activeAdminTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Tableau de bord d'exploitation
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Vue d'ensemble des métriques de transfert d'argent Sendia
                </p>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Utilisateurs Inscrits</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{totalUsersCount}</div>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-2">
                    +{verifiedUsersCount} comptes vérifiés
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Volume Total Transigé (EUR)</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400">
                    {totalEurVolume.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-2">
                    = {totalXofVolume.toLocaleString('fr-FR')} XOF
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Nombre de Transactions</span>
                    <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white">{transactionsList.length}</div>
                  <p className="text-[11px] text-slate-400 font-medium mt-2">Corridor Europe ↔ Afrique</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold">Frais & Marge Brute</span>
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-amber-400">
                    {(transactionsList.reduce((acc, t) => acc + (parseFloat(t.fee_eur) || 0), 0)).toFixed(2)} €
                  </div>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-2">Intégration GeniusPay Live</p>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <h3 className="text-base font-bold text-white mb-4">Flux récents en direct</h3>
                <div className="space-y-2">
                  {transactionsList.slice(0, 5).map(tx => (
                    <div key={tx.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {tx.type === 'RECEIVE' ? 'IN' : tx.type === 'WITHDRAW' ? 'WD' : 'OUT'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{tx.title}</h4>
                          <span className="text-[10px] text-slate-400">{tx.genius_pay_ref} • {tx.formatted_date}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-400 block">{tx.amount_eur} €</span>
                        <span className="text-[10px] text-slate-400">{tx.amount_xof} XOF</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS MANAGEMENT */}
          {activeAdminTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Gestion des Utilisateurs Supabase</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Supervisez les comptes clients, le niveau KYC et les soldes de wallet
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      placeholder="Rechercher nom, tel..."
                      className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Utilisateur</th>
                      <th className="p-4">Téléphone / Email</th>
                      <th className="p-4">Pays</th>
                      <th className="p-4">Statut KYC</th>
                      <th className="p-4">Actions Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {usersList
                      .filter(u =>
                        u.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                        u.phone?.includes(searchFilter)
                      )
                      .map(u => {
                        const isVerified = u.kyc_status === 'VERIFIED';
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/80 transition">
                            <td className="p-4 font-bold text-white flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                                {u.name ? u.name.slice(0, 2).toUpperCase() : 'US'}
                              </div>
                              <span>{u.name || 'Membre Sendia'}</span>
                            </td>

                            <td className="p-4">
                              <div className="font-semibold text-slate-300">{u.phone}</div>
                              <div className="text-[10px] text-slate-500">{u.email}</div>
                            </td>

                            <td className="p-4 font-semibold">
                              {u.flag} {u.country || 'France'}
                            </td>

                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  isVerified
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {isVerified ? 'VERIFIED (Tier 1)' : 'NON VÉRIFIÉ'}
                              </span>
                            </td>

                            <td className="p-4 flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateKycStatus(u.id, isVerified ? 'NOT_STARTED' : 'VERIFIED', isVerified ? 'UNVERIFIED' : 'TIER_1')
                                }
                                disabled={isUpdating}
                                className={`py-1.5 px-3 rounded-lg text-[11px] font-bold border transition ${
                                  isVerified
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                }`}
                              >
                                {isVerified ? 'Rétrograder KYC' : 'Valider KYC (Tier 1)'}
                              </button>

                              <button
                                onClick={() => setSelectedUserForCredit(u)}
                                className="py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold transition"
                              >
                                Créditer / Ajuster Wallet
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: WALLETS LEDGER */}
          {activeAdminTab === 'wallets' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Ledger Comptable des Wallets</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Registre complet des soldes internes provisionnés dans Supabase
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Wallet ID</th>
                      <th className="p-4">User ID</th>
                      <th className="p-4">Solde EUR (€)</th>
                      <th className="p-4">Solde XOF (CFA)</th>
                      <th className="p-4">Dernière Mise à Jour</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {walletsList.map(w => (
                      <tr key={w.id} className="hover:bg-slate-800/80 transition">
                        <td className="p-4 font-mono text-indigo-400 font-bold">{w.id}</td>
                        <td className="p-4 font-mono text-slate-400">{w.user_id}</td>
                        <td className="p-4 text-base font-extrabold text-emerald-400">{parseFloat(w.balance_eur).toFixed(2)} €</td>
                        <td className="p-4 text-sm font-bold text-slate-300">{parseInt(w.balance_xof, 10).toLocaleString('fr-FR')} XOF</td>
                        <td className="p-4 text-slate-400 text-[11px]">{new Date(w.updated_at || Date.now()).toLocaleString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSACTIONS SUPERVISION */}
          {activeAdminTab === 'transactions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Supervision des Flux GeniusPay</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Historique de l'intégralité des envois, réceptions et retraits
                </p>
              </div>

              <div className="rounded-2xl bg-slate-800/60 border border-slate-700/60 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Intitulé</th>
                      <th className="p-4">Montant EUR</th>
                      <th className="p-4">Montant XOF</th>
                      <th className="p-4">Réf GeniusPay</th>
                      <th className="p-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {transactionsList.map(t => (
                      <tr key={t.id} className="hover:bg-slate-800/80 transition">
                        <td className="p-4 font-mono font-bold text-indigo-400">{t.id}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.type === 'RECEIVE'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : t.type === 'WITHDRAW'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-indigo-500/20 text-indigo-400'
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-white">{t.title}</td>
                        <td className="p-4 font-bold text-emerald-400">{t.amount_eur} €</td>
                        <td className="p-4 text-slate-300">{t.amount_xof} XOF</td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">{t.genius_pay_ref}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                            {t.status || 'COMPLETED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: VAULT KYC */}
          {activeAdminTab === 'kyc' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Vault de Validation KYC</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Examen des pièces d'identité et vérification de la conformité
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {usersList.map(u => (
                  <div key={u.id} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{u.name || 'Membre Sendia'}</h4>
                        <p className="text-xs text-slate-400">{u.phone} • {u.email}</p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.kyc_status === 'VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {u.kyc_status || 'NOT_STARTED'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300 space-y-1">
                      <div>📄 Document: CNI / Passeport européen</div>
                      <div>📸 Selfie Guide: Validé avec détection faciale</div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleUpdateKycStatus(u.id, 'VERIFIED', 'TIER_1')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                      >
                        Approuver KYC Tier 1
                      </button>
                      <button
                        onClick={() => handleUpdateKycStatus(u.id, 'VERIFIED', 'TIER_2')}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
                      >
                        Élever Tier 2 (5 000€)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: GENIUSPAY GATEWAY & WEBHOOKS */}
          {activeAdminTab === 'geniuspay' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Passerelle GeniusPay & Webhooks Live</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Surveillance de l'API de paiement et déclenchement de webhooks de test
                </p>
              </div>

              {/* API Credentials Card */}
              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Clés API GeniusPay Production</span>
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">API PUBLIC KEY:</span>
                    <span className="text-indigo-400 font-bold">pk_live_wosUxndiXmm19VlRcjLiVfCa1h24fhbM</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">ENDPOINT BASE:</span>
                    <span className="text-emerald-400 font-bold">https://geniuspay.ci/api/v1/merchant</span>
                  </div>
                </div>
              </div>

              {/* Webhook Event Simulator */}
              <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-4">
                <h3 className="text-sm font-bold text-white">Simulateur de Webhook Inbound GeniusPay (`payment.success`)</h3>
                <p className="text-xs text-slate-400">
                  Simulez la réception d'un événement `payment.success` envoyé par les serveurs GeniusPay lors d'un paiement CB.
                </p>

                <form onSubmit={handleSimulateWebhook} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs text-slate-300 font-bold mb-1">Montant crédité (EUR)</label>
                    <input
                      type="number"
                      value={webhookAmountEUR}
                      onChange={e => setWebhookAmountEUR(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-bold mb-1">Expéditeur Externe</label>
                    <input
                      type="text"
                      value={webhookSenderName}
                      onChange={e => setWebhookSenderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Déclencher l'événement payment.success ⚡
                  </button>

                  {webhookSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                      {webhookSuccessMsg}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: TREASURY & COMMISSIONS */}
          {activeAdminTab === 'treasury' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Gestion de la Trésorerie Sendia
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Suivez les commissions accumulées (frais de transaction) et effectuez des retraits
                </p>
              </div>

              {/* Status Notifications */}
              {treasuryStatusMsg && (
                <div className={`p-4 rounded-2xl text-xs font-bold border ${
                  treasuryStatusMsg.type === 'success' 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}>
                  {treasuryStatusMsg.text}
                </div>
              )}

              <div className="grid grid-cols-3 gap-6">
                {/* Solde Trésorerie Card */}
                <div className="col-span-1 p-6 rounded-3xl bg-indigo-950/80 border border-indigo-500/40 text-white shadow-xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">Solde Commissions Collectées</span>
                    <div className="text-4xl font-black mt-2 text-indigo-100">
                      {(parseFloat(treasuryWallet?.balance_eur) || 0.00).toFixed(2)} €
                    </div>
                    <div className="text-xs text-indigo-300 mt-1">
                      (= {Math.round((parseFloat(treasuryWallet?.balance_eur) || 0.00) * exchangeRate).toLocaleString('fr-FR')} XOF)
                    </div>
                  </div>

                  <div className="mt-8 p-3 rounded-2xl bg-indigo-900/50 border border-indigo-800 text-[11px] text-indigo-200">
                    ℹ️ Chaque transfert d'argent charge <strong>1,00 €</strong> de frais fixes, immédiatement transférés sur ce portefeuille de trésorerie.
                  </div>
                </div>

                {/* Retrait de Trésorerie Form */}
                <div className="col-span-2 p-6 rounded-3xl bg-slate-800/80 border border-slate-700/60 shadow-lg">
                  <h3 className="text-sm font-bold text-white mb-4">Effectuer un Retrait de Commissions</h3>

                  <form onSubmit={handleTreasuryPayout} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                          Moyen de retrait
                        </label>
                        <select
                          value={treasuryPayoutOperator}
                          onChange={e => setTreasuryPayoutOperator(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                        >
                          <option value="Wave">Wave (Sénégal / Côte d'Ivoire)</option>
                          <option value="Orange Money">Orange Money</option>
                          <option value="MTN MoMo">MTN MoMo</option>
                          <option value="Flooz">Flooz (Moov)</option>
                          <option value="T-Money">T-Money</option>
                          <option value="Bank">Virement Bancaire (IBAN)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                          Montant à retirer (EUR)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={treasuryPayoutAmount}
                            onChange={e => setTreasuryPayoutAmount(e.target.value)}
                            className="w-full pl-3 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                            placeholder="50"
                          />
                          <span className="absolute right-3 top-3 text-[10px] font-bold text-slate-500">EUR (€)</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                        {treasuryPayoutOperator === 'Bank' ? 'IBAN du Compte Bénéficiaire' : 'Numéro de Téléphone Mobile Money'}
                      </label>
                      <input
                        type="text"
                        required
                        value={treasuryPayoutPhone}
                        onChange={e => setTreasuryPayoutPhone(e.target.value)}
                        placeholder={treasuryPayoutOperator === 'Bank' ? 'FR76 3000 6000 0123 4567 8901 234' : '+228 90 12 34 56'}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 text-[11px] text-slate-400 flex justify-between items-center">
                      <span>Équivalent retiré (XOF) :</span>
                      <strong className="text-amber-400 text-xs">
                        {Math.round((parseFloat(treasuryPayoutAmount) || 0) * exchangeRate).toLocaleString()} XOF
                      </strong>
                    </div>

                    <button
                      type="submit"
                      disabled={isTreasurySubmitting}
                      className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isTreasurySubmitting ? (
                        <span>Traitement du Payout...</span>
                      ) : (
                        <span>Initier le retrait de Commissions</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Historique des transactions de trésorerie */}
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <h3 className="text-base font-bold text-white mb-4">Historique des Flux de Trésorerie</h3>
                <div className="space-y-2">
                  {treasuryTransactions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Aucun mouvement de trésorerie enregistré pour le moment.
                    </div>
                  ) : (
                    treasuryTransactions.map(tx => (
                      <div key={tx.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs ${
                            tx.type === 'RECEIVE' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {tx.type === 'RECEIVE' ? 'FEE' : 'OUT'}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{tx.title}</h4>
                            <span className="text-[10px] text-slate-500">{tx.payment_method} • {tx.formatted_date}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-sm font-bold block ${
                            tx.type === 'RECEIVE' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {tx.type === 'RECEIVE' ? '+' : '-'}{tx.amount_eur} €
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {tx.type === 'RECEIVE' ? '+' : '-'}{tx.amount_xof.toLocaleString()} XOF
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL: MANUAL WALLET CREDIT ADJUSTMENT --- */}
      {selectedUserForCredit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Régularisation Manuelle du Wallet</h3>
              <button
                onClick={() => setSelectedUserForCredit(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Utilisateur : <strong className="text-white">{selectedUserForCredit.name}</strong> ({selectedUserForCredit.phone})
            </div>

            <form onSubmit={handleManualWalletAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Ajustement Solde EUR (+ pour crédit, - pour débit)
                </label>
                <input
                  type="number"
                  step="5"
                  required
                  value={creditAmountInput}
                  onChange={e => setCreditAmountInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-lg font-extrabold text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
              >
                {isUpdating ? 'Mise à jour Supabase...' : 'Valider la Régularisation Comptable'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
