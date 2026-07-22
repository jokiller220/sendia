import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, ShieldCheck, X, SlidersHorizontal } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const { user, notifications, markNotificationsAsRead, setCurrentScreen, setIsAdminOpen } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    markNotificationsAsRead();
  };

  // Derive dynamic user initials & first name
  const nameParts = user.name ? user.name.trim().split(' ') : ['Membre'];
  const firstName = nameParts[0] || 'Membre';
  const initials = nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';

  const kycLabel = user.kycStatus === 'VERIFIED'
    ? (user.kycTier === 'TIER_2' ? 'KYC Niveau 2' : 'KYC Niveau 1')
    : 'KYC Non vérifié';

  return (
    <>
      <div className="flex items-center justify-between p-5 bg-white text-slate-900 border-b border-slate-100 sticky top-0 z-30">
        {/* User Info & Avatar */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setCurrentScreen('kyc_overview')}
            className="relative cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold flex items-center justify-center text-sm shadow-md ring-2 ring-indigo-100">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900">Bonjour, {firstName}</span>
              <span className="text-base">👋</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Wallet actif • {kycLabel}</span>
            </div>
          </div>
        </div>

        {/* Action icons: Notification Bell & Admin Drawer Toggle */}
        <div className="flex items-center gap-2">
          {user.role === 'ADMIN' && (
            <button
              onClick={() => setIsAdminOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
              title="Back-Office Admin"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            </button>
          )}

          <button
            onClick={handleOpenNotifications}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center relative transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>

      {/* Notifications Drawer Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowNotifications(false)}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
