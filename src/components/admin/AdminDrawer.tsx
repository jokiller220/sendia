import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sliders, Zap, ShieldAlert, RefreshCw, CheckCircle2, Database, KeyRound } from 'lucide-react';
import { geniusPay } from '../../lib/geniuspay';

export const AdminDrawer: React.FC = () => {
  const { isAdminOpen, setIsAdminOpen, simulateWebhookPaymentSuccess, resetAppState, user, setUser, supabaseUrl } = useApp();
  const [webhookAmount, setWebhookAmount] = useState('50');
  const [senderName, setSenderName] = useState('Tante Fatou');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isAdminOpen) return null;

  const handleSimulateInbound = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(webhookAmount) || 50;
    simulateWebhookPaymentSuccess(num, senderName);
    setNotification(`Webhook payment.success reçu: +${num}€ de ${senderName} crédités!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleKycTier = () => {
    setUser(prev => ({
      ...prev,
      kycTier: prev.kycTier === 'TIER_1' ? 'TIER_2' : 'TIER_1',
      kycStatus: 'VERIFIED',
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-slate-900 text-white h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Back-Office & API GeniusPay</h2>
            </div>
            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* GeniusPay Live API Credentials Status Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-indigo-950/90 border border-indigo-500/40 text-xs">
            <div className="flex items-center justify-between font-bold text-indigo-300">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>GeniusPay API Live</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                PRODUCTION ⚡
              </span>
            </div>
            <p className="mt-2 font-mono text-[10px] text-slate-300 truncate">
              Public Key: {geniusPay.apiKey}
            </p>
            <p className="font-mono text-[10px] text-slate-400 truncate">
              Endpoint: {geniusPay.baseUrl}
            </p>
          </div>

          {/* Supabase Connection Status Card */}
          <div className="mt-3 p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Supabase Database</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                CONNECTÉ ⚡
              </span>
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-slate-400 truncate">
              {supabaseUrl}
            </p>
          </div>

          {/* Webhook notification alert */}
          {notification && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Webhook Simulation Form */}
          <div className="mt-6">
            <h3 className="text-xs font-extrabold uppercase text-indigo-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Simuler un Webhook GeniusPay (Entrant)</span>
            </h3>

            <form onSubmit={handleSimulateInbound} className="space-y-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Expéditeur (Europe)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Montant payé (EUR)
                </label>
                <input
                  type="number"
                  value={webhookAmount}
                  onChange={e => setWebhookAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
              >
                Déclencher Webhook GeniusPay (`payment.success`)
              </button>
            </form>
          </div>

          {/* KYC Tier Controls */}
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-indigo-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Contrôle Conformité / KYC</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Palier KYC Actuel</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{user.kycTier} (Plafond: {user.kycTier === 'TIER_1' ? '1 000 €/j' : '10 000 €/j'})</div>
              </div>
              <button
                onClick={handleToggleKycTier}
                className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
              >
                Changer Palier
              </button>
            </div>
          </div>
        </div>

        {/* Reset App State */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              resetAppState();
              setIsAdminOpen(false);
            }}
            className="w-full py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réinitialiser les données de démo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
