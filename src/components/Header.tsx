import React, { useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { AppSettings, ThemeSettings, UserProfile } from '../types';
import { TabType } from './BottomNav';
import { AppLogo } from './AppLogo';
import { triggerHaptic } from '../services/telegram';

interface HeaderProps {
  user: UserProfile;
  settings: AppSettings;
  theme: ThemeSettings;
  activeTab?: TabType;
  onNavigate?: (tab: TabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab = 'home',
  onNavigate,
}) => {
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const handleLogoClick = () => {
    triggerHaptic('light');
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleBellClick = () => {
    triggerHaptic('light');
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 3000);
  };

  const handlePlusClick = () => {
    triggerHaptic('medium');
    if (onNavigate) {
      onNavigate('wallet');
    }
  };

  return (
    <>
      <header className="w-full flex flex-col items-center pt-2 pb-2 relative z-20">
        {/* Main Top Header Bar Matching Screenshot Exactly */}
        <div className="w-full flex items-center justify-between px-0.5 gap-2">
          {/* Left: Official Emblem + App Title */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none active:scale-[0.98] transition-transform"
          >
            {/* Logo badge */}
            <div className="relative group shrink-0" title="Scratch The UPI">
              <AppLogo className="w-9 h-9" />
            </div>

            {/* App Title & Win Subtitle */}
            <div className="min-w-0 leading-tight">
              <h1 className="font-['Outfit'] font-black text-slate-900 text-[17px] tracking-tight truncate">
                Scratch The UPI
              </h1>
              <span className="text-[11px] font-black text-[#e11d48] block leading-none tracking-tight">
                Win Up to ₹50
              </span>
            </div>
          </div>

          {/* Right: Unified Pill Matching Screenshot (Bell + Balance + Plus) */}
          <div className="flex items-center bg-white rounded-full pl-3 pr-1 py-1 shadow-sm border border-pink-100 gap-2 shrink-0 select-none">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={handleBellClick}
              aria-label="Notifications"
              className="relative p-0.5 text-[#e11d48] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            >
              <Bell className="w-4 h-4 text-[#e11d48] fill-[#e11d48]/20 stroke-[2.2]" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#e11d48] rounded-full animate-pulse" />
            </button>

            {/* Balance Text */}
            <span
              onClick={handlePlusClick}
              className="font-['Outfit'] font-black text-[#e11d48] text-sm tracking-tight whitespace-nowrap cursor-pointer hover:opacity-85"
            >
              ₹{user.balance.toFixed(2)}
            </span>

            {/* Circular Hot Pink Plus Button */}
            <button
              type="button"
              onClick={handlePlusClick}
              aria-label="Add balance or withdraw"
              className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {showNotificationToast && (
          <div className="absolute top-14 right-2 z-30 bg-slate-900/95 text-white text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-pink-500/30 backdrop-blur-md animate-slide-up flex items-center gap-2">
            <span className="text-sm">🔔</span>
            <div className="leading-tight">
              <p className="font-bold text-pink-300">Instant Payments Active</p>
              <p className="text-[10px] text-slate-300">All withdrawal requests are processed within seconds!</p>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
