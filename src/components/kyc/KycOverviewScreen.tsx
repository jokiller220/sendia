import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, CreditCard, User, FileText, Lock, ChevronRight } from 'lucide-react';

export const KycOverviewScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen">
      <div>
        <button
          onClick={() => setCurrentScreen('dashboard')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Vérification d'identité
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pour sécuriser votre compte et débloquer vos plafonds de transfert, nous devons vérifier votre identité.
        </p>

        {/* Steps List */}
        <div className="mt-8 space-y-4">
          <button
            onClick={() => setCurrentScreen('kyc_doc_select')}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pièce d'identité</h3>
                <p className="text-xs text-slate-500">Carte nationale, passeport ou titre de séjour</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setCurrentScreen('kyc_doc_select')}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Selfie</h3>
                <p className="text-xs text-slate-500">Prenez un selfie clairement visible</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setCurrentScreen('kyc_doc_select')}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Informations personnelles</h3>
                <p className="text-xs text-slate-500">Vérifiez vos informations de profil</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-8 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3 text-xs text-indigo-900">
          <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Vos données sont sécurisées et cryptées selon les normes bancaires UEMOA / PCI-DSS.</span>
        </div>
      </div>

      <div className="pb-4">
        <button
          onClick={() => setCurrentScreen('kyc_doc_select')}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition"
        >
          Commencer
        </button>
      </div>
    </div>
  );
};
