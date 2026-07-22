import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';

export const CreatePasswordScreen: React.FC = () => {
  const { setCurrentScreen, user, registerNewAccount } = useApp();
  const [password, setPassword] = useState('Passwor123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Criteria validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isFormValid = hasMinLength && hasUppercase && hasDigit && hasSpecialChar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setIsSubmitting(true);
      await registerNewAccount(user.name, user.phone, user.email);
      setIsSubmitting(false);
      setCurrentScreen('auth_success');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-900 min-h-screen">
      <div>
        <button
          onClick={() => setCurrentScreen('otp')}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Créer un mot de passe
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Votre mot de passe doit contenir au moins 8 caractères
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-300 text-base font-semibold text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {hasMinLength ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
              )}
              <span className={hasMinLength ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                Au moins 8 caractères
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-medium">
              {hasUppercase ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
              )}
              <span className={hasUppercase ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                Une lettre majuscule
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-medium">
              {hasDigit ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
              )}
              <span className={hasDigit ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                Un chiffre
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-medium">
              {hasSpecialChar ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
              )}
              <span className={hasSpecialChar ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                Un caractère spécial
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition mt-4"
          >
            {isSubmitting ? 'Création du compte...' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  );
};
