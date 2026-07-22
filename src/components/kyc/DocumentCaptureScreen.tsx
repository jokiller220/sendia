import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Camera, Zap } from 'lucide-react';

export const DocumentCaptureScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [flash, setFlash] = useState(false);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-slate-900 text-white min-h-screen relative overflow-hidden">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={() => setCurrentScreen('kyc_doc_select')}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white transition hover:bg-white/20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-white">Recto de la pièce</span>
        <button
          onClick={() => setFlash(f => !f)}
          className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition ${
            flash ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Viewfinder Area */}
      <div className="my-auto relative flex flex-col items-center justify-center">
        {/* Shimmer animated scanning line */}
        <div className="w-full max-w-xs h-52 rounded-2xl border-2 border-indigo-400/80 bg-slate-800/60 backdrop-blur-xs relative overflow-hidden shadow-2xl flex items-center justify-center">
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-scan-line shadow-lg shadow-indigo-400/50" />
          
          {/* Mock ID Card Graphic inside scanner */}
          <div className="w-64 h-36 rounded-xl border border-white/20 bg-gradient-to-tr from-slate-700/80 to-slate-600/80 p-3 flex flex-col justify-between shadow-inner">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-10 rounded bg-indigo-500/40 border border-white/20 flex items-center justify-center text-[10px] font-bold text-indigo-200">
                  PHOTO
                </div>
                <div className="space-y-1">
                  <div className="w-20 h-2 rounded bg-white/40" />
                  <div className="w-14 h-1.5 rounded bg-white/20" />
                </div>
              </div>
              <div className="text-[9px] font-extrabold text-white/50 uppercase tracking-widest">
                RÉPUBLIQUE FRANÇAISE
              </div>
            </div>
            <div className="space-y-1">
              <div className="w-32 h-1.5 rounded bg-white/30" />
              <div className="w-24 h-1.5 rounded bg-white/20" />
            </div>
          </div>

          {/* Corner Guides */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />
        </div>

        <p className="mt-6 text-xs text-slate-300 text-center max-w-xs leading-relaxed">
          Prenez en photo le recto de votre pièce d'identité. Placez le document dans le cadre et assurez-vous qu'il est bien lisible.
        </p>
      </div>

      {/* Shutter Action */}
      <div className="pb-6 flex flex-col items-center">
        <button
          onClick={() => setCurrentScreen('kyc_selfie_capture')}
          className="w-20 h-20 rounded-full border-4 border-white p-1.5 transition active:scale-95 shadow-xl"
        >
          <div className="w-full h-full rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white">
            <Camera className="w-8 h-8" />
          </div>
        </button>
      </div>
    </div>
  );
};
