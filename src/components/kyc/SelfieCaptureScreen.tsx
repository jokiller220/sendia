import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft } from 'lucide-react';

export const SelfieCaptureScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-900 text-white min-h-screen relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('kyc_doc_capture')}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white transition hover:bg-white/20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-white">Selfie</span>
        <div className="w-10" />
      </div>

      {/* Selfie Circular Frame Guide */}
      <div className="my-auto flex flex-col items-center text-center">
        <div className="relative w-64 h-64 rounded-full border-4 border-dashed border-indigo-400 p-2 flex items-center justify-center overflow-hidden bg-slate-800 shadow-2xl">
          {/* Simulated Selfie Face Preview */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-indigo-900/40 via-indigo-950 to-slate-950 flex items-center justify-center relative overflow-hidden">
            <div className="w-36 h-36 rounded-full bg-gradient-to-b from-amber-200/80 to-amber-400/80 border-2 border-amber-300 shadow-lg flex flex-col items-center justify-end pb-2 overflow-hidden">
              {/* Face features graphic */}
              <div className="w-16 h-12 rounded-t-full bg-slate-800/80 mb-6" />
            </div>
            
            {/* Alignment Ring Overlay */}
            <div className="absolute inset-0 border-2 border-emerald-400/50 rounded-full" />
          </div>
        </div>

        <h3 className="mt-6 text-lg font-bold text-white">Prenez un selfie</h3>
        <p className="mt-1 text-xs text-slate-300 max-w-xs">
          Assurez-vous que votre visage est bien éclairé et directement centré dans le cercle.
        </p>
      </div>

      {/* Capture Action Button */}
      <div className="pb-6">
        <button
          onClick={() => setCurrentScreen('kyc_processing')}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition"
        >
          Prendre la photo
        </button>
      </div>
    </div>
  );
};
