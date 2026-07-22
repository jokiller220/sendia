import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { setCurrentScreen, setIsAdminOpen } = useApp();
  const [language, setLanguage] = useState<'FR' | 'EN'>('FR');

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-white via-indigo-50/30 to-white text-slate-900 min-h-screen">
      {/* Top Header with Language Picker */}
      <div className="flex justify-between items-center pt-2">
        <div 
          onClick={() => {
            setIsAdminOpen(true);
            window.history.pushState({}, '', `${window.location.pathname}?admin`);
            window.dispatchEvent(new Event('popstate'));
          }}
          className="flex items-center gap-2 cursor-pointer select-none active:opacity-70 transition"
          title="Ouvrir le portail d'administration"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20">
            S
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              Sendia
            </span>
            <span className="block text-[10px] text-indigo-600 font-semibold tracking-wider uppercase -mt-1">
              Wallet & Pay
            </span>
          </div>
        </div>

        <button
          onClick={() => setLanguage(l => (l === 'FR' ? 'EN' : 'FR'))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <span>{language}</span>
          <span className="text-slate-400">▾</span>
        </button>
      </div>

      {/* Hero Graphic & Content */}
      <div className="my-auto py-8 text-center flex flex-col items-center">
        <div className="relative w-56 h-56 mb-8 flex items-center justify-center">
          {/* Decorative glowing background rings */}
          <div className="absolute inset-0 rounded-full bg-indigo-200/40 animate-pulse-glow" />
          <div className="absolute inset-4 rounded-full bg-indigo-300/30" />
          
          {/* Center Graphic */}
          <div className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-700 p-1 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center p-4 text-white overflow-hidden relative">
              <Globe className="w-20 h-20 text-indigo-400 opacity-90 animate-spin-slow" />
              
              {/* Floating badges on globe */}
              <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-400 flex items-center gap-1 border border-white/10">
                <span>🇪🇺 EUR</span>
              </div>
              <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-400 flex items-center gap-1 border border-white/10">
                <span>🌍 XOF</span>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Transferts sécurisés <br />
          <span className="text-indigo-600">Europe ↔ Afrique</span> de l'Ouest
        </h1>

        <p className="mt-3 text-sm text-slate-600 max-w-xs leading-relaxed">
          Envoyez et recevez de l'argent en toute simplicité. Conservez votre solde en wallet ou retirez instantanément.
        </p>

        {/* Value Prop Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sécurisé</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span>Instantané</span>
          </div>
          <span>•</span>
          <div>PWA Mobile</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pb-4">
        <button
          onClick={() => setCurrentScreen('register')}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 group"
        >
          <span>Créer un compte</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => {
            setCurrentScreen('login');
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm transition"
        >
          Déjà un compte ? <span className="text-indigo-600 font-bold">Se connecter</span>
        </button>
      </div>
    </div>
  );
};
