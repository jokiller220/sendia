import React from 'react';
import { useApp, type DashboardTab } from '../../context/AppContext';
import { Home, History, Users, User, ArrowUpRight } from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, currentScreen, setCurrentScreen } = useApp();

  // Only display on dashboard tab screens
  if (currentScreen !== 'dashboard') return null;

  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Accueil', icon: <Home className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <History className="w-5 h-5" /> },
    { id: 'beneficiaries', label: 'Bénéficiaires', icon: <Users className="w-5 h-5" /> },
    { id: 'profile', label: 'Profil', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[600px] md:max-w-[720px] lg:max-w-[900px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 py-2 z-40 shadow-lg">
      <div className="flex items-center justify-around relative">
        {/* Tab 1 & Tab 2 */}
        {tabs.slice(0, 2).map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-col items-center py-1.5 px-4 transition rounded-2xl ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {t.icon}
              <span className="text-[11px] mt-1 tracking-tight">{t.label}</span>
            </button>
          );
        })}

        {/* Central Floating Quick Send Action Button */}
        <div className="relative -top-5">
          <button
            onClick={() => setCurrentScreen('send_amount')}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 ring-4 ring-white active:scale-95 transition"
            title="Envoyer de l'argent"
          >
            <ArrowUpRight className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab 3 & Tab 4 */}
        {tabs.slice(2, 4).map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-col items-center py-1.5 px-4 transition rounded-2xl ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {t.icon}
              <span className="text-[11px] mt-1 tracking-tight">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
