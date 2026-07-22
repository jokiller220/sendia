import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, CheckCircle2, Circle, ShieldCheck } from 'lucide-react';

export const KycProcessingScreen: React.FC = () => {
  const { setCurrentScreen, submitKyc, setActiveTab } = useApp();
  const [stepStatus, setStepStatus] = useState<'review' | 'validated'>('review');

  useEffect(() => {
    // Auto validate after 3 seconds simulation
    const timer = setTimeout(() => {
      setStepStatus('validated');
      submitKyc();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleFinish = () => {
    setActiveTab('home');
    setCurrentScreen('dashboard');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen text-center">
      <div className="my-auto py-8 flex flex-col items-center">
        {/* Status Illustration */}
        <div className="w-24 h-24 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-xs relative">
          <Clock className="w-12 h-12 text-indigo-600 animate-spin-slow" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Vérification en cours
        </h1>

        <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
          Nous vérifions vos informations avec nos partenaires agréés. Cela prend généralement moins de 2 minutes.
        </p>

        {/* Timeline checklist */}
        <div className="mt-8 w-full max-w-xs p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold text-slate-900">Document soumis</span>
          </div>

          <div className="flex items-center gap-3">
            {stepStatus === 'validated' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
            )}
            <span className="text-sm font-semibold text-slate-900">Vérification automatique</span>
          </div>

          <div className="flex items-center gap-3">
            {stepStatus === 'validated' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300 shrink-0 ml-0.5" />
            )}
            <span className={stepStatus === 'validated' ? 'text-sm font-semibold text-slate-900' : 'text-sm text-slate-400 font-medium'}>
              Validation du compte
            </span>
          </div>
        </div>
      </div>

      <div className="pb-4">
        <button
          onClick={handleFinish}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition"
        >
          {stepStatus === 'validated' ? 'Accéder au wallet' : 'Retour au tableau de bord'}
        </button>
      </div>
    </div>
  );
};
