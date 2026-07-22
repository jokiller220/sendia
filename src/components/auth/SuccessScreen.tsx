import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SuccessScreen: React.FC = () => {
  const { setCurrentScreen, setActiveTab } = useApp();

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#10B981', '#F59E0B', '#6366F1'],
    });
  }, []);

  const handleGoToDashboard = () => {
    setActiveTab('home');
    setCurrentScreen('dashboard');
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen text-center">
      <div className="my-auto py-12 flex flex-col items-center">
        {/* Celebration Check Badge Icon */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-75" />
          <div className="relative w-24 h-24 rounded-full bg-indigo-600 shadow-xl shadow-indigo-500/40 flex items-center justify-center text-white">
            <Check className="w-12 h-12 stroke-[3]" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Compte créé <br />avec succès !
        </h1>

        <p className="mt-3 text-base text-slate-600 font-medium max-w-xs">
          Bienvenue sur Sendia 🎉 <br />
          Votre wallet est maintenant configuré et prêt pour vos transferts.
        </p>
      </div>

      <div className="pb-4">
        <button
          onClick={handleGoToDashboard}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition"
        >
          Aller à mon compte
        </button>
      </div>
    </div>
  );
};
