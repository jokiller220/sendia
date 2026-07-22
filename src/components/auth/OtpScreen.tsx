import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Info } from 'lucide-react';

export const OtpScreen: React.FC = () => {
  const { setCurrentScreen, user } = useApp();
  const [otp, setOtp] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
  const [timer, setTimer] = useState<number>(45);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = () => {
    setCurrentScreen('password');
  };

  const formattedTimer = `00:${timer < 10 ? '0' : ''}${timer}`;

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen">
      <div>
        <button
          onClick={() => setCurrentScreen('register')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Vérification du téléphone
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Nous avons envoyé un code de confirmation à{' '}
          <span className="font-semibold text-slate-800">{user.phone || '+33 6 12 34 56 78'}</span>
        </p>

        {/* Demo Helper Banner */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs text-indigo-700">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-indigo-600" />
            <span>Code de démonstration: <strong>123456</strong></span>
          </div>
          <button
            onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
            className="px-2 py-1 rounded bg-indigo-600 text-white font-bold text-[10px]"
          >
            Remplir
          </button>
        </div>

        {/* OTP Inputs Grid */}
        <div className="mt-8 flex justify-between gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none bg-slate-50 transition"
            />
          ))}
        </div>

        {/* Resend Link */}
        <div className="mt-6 text-center">
          {timer > 0 ? (
            <p className="text-xs text-slate-400 font-medium">
              Renvoyer le code dans <span className="font-bold text-indigo-600">{formattedTimer}</span>
            </p>
          ) : (
            <button
              onClick={() => setTimer(45)}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Renvoyer un nouveau code
            </button>
          )}
        </div>
      </div>

      {/* Number Keypad UI (Visual matching mockup) & Action */}
      <div className="pb-4">
        <button
          onClick={handleVerify}
          className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition"
        >
          Valider le code
        </button>
      </div>
    </div>
  );
};
