import React from 'react';
import {
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, AppSettings } from '../types';
import { TabType } from './BottomNav';
import { triggerHaptic, openExternalOrTelegramLink } from '../services/telegram';

interface ProfileScreenProps {
  user: UserProfile;
  settings: AppSettings;
  onNavigate: (tab: TabType) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  settings,
  onNavigate,
}) => {
  const handleOpenChannel = () => {
    triggerHaptic('light');
    const channelUrl = settings.telegramChannelUrl || 'https://t.me/scratch_the_win';
    openExternalOrTelegramLink(channelUrl);
  };

  const displayName = user.name && user.name.trim() !== '' ? user.name : 'Lokesh Kumar';
  const displayId = user.id ? String(user.id) : '8751187524';

  return (
    <div className="w-full flex flex-col items-stretch pb-24 animate-fade-in select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP PROFILE CARD (Avatar + Name + Verified Badge)           */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full bg-white rounded-[28px] p-5 shadow-sm border-[3px] border-pink-400 flex items-center gap-4">
        {/* Avatar Container */}
        <div
          className="shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-pink-200 via-rose-100 to-pink-50 p-1 flex items-center justify-center shadow-inner overflow-hidden border border-pink-200/80"
        >
          {/* Stylized 3D Avatar SVG matching Screenshot 4 */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Soft pink background circle */}
            <circle cx="50" cy="50" r="46" fill="#fce7f3" />
            {/* Boy Body/T-shirt */}
            <path d="M22 88 C22 72 32 64 50 64 C68 64 78 72 78 88 Z" fill="#1e293b" />
            <path d="M38 88 L38 68 C44 72 56 72 62 68 L62 88 Z" fill="#e11d48" />
            {/* Neck */}
            <rect x="44" y="54" width="12" height="14" rx="3" fill="#fbcfe8" />
            {/* Boy Face */}
            <ellipse cx="50" cy="46" rx="20" ry="20" fill="#fcddec" />
            {/* Ears */}
            <circle cx="29" cy="46" r="4.5" fill="#fcddec" />
            <circle cx="71" cy="46" r="4.5" fill="#fcddec" />
            {/* Eyes */}
            <ellipse cx="43" cy="44" rx="2.5" ry="3" fill="#0f172a" />
            <ellipse cx="57" cy="44" rx="2.5" ry="3" fill="#0f172a" />
            <circle cx="44" cy="43" r="1" fill="#ffffff" />
            <circle cx="58" cy="43" r="1" fill="#ffffff" />
            {/* Smile */}
            <path d="M45 53 Q50 58 55 53" stroke="#e11d48" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Blush */}
            <ellipse cx="38" cy="48" rx="2.5" ry="1.5" fill="#fda4af" opacity="0.6" />
            <ellipse cx="62" cy="48" rx="2.5" ry="1.5" fill="#fda4af" opacity="0.6" />
            {/* Modern Hair */}
            <path d="M30 40 C30 25 40 22 50 22 C62 22 70 26 70 40 C66 34 60 33 50 33 C40 33 34 35 30 40 Z" fill="#0f172a" />
            <path d="M30 38 C32 30 42 26 48 25 C45 28 42 32 40 37 Z" fill="#1e293b" />
          </svg>
        </div>

        {/* User Details */}
        <div className="min-w-0 flex-1">
          <h2 className="font-['Outfit'] font-black text-slate-900 text-xl leading-tight tracking-tight truncate">
            {displayName}
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-0.5 mb-2 tracking-wide truncate">
            User ID: #{displayId}
          </p>

          <div className="inline-flex items-center gap-1.5 bg-rose-50 text-[#e11d48] border border-rose-200/80 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[#e11d48] stroke-[2.5]" />
            <span>VERIFIED TELEGRAM USER</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SECTION HEADER                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 mt-4 mb-2.5 px-1">
        <span className="w-1.5 h-5 bg-[#e11d48] rounded-full inline-block"></span>
        <h2 className="font-['Outfit'] font-black text-slate-900 text-lg tracking-tight">
          Quick Actions
        </h2>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. QUICK ACTIONS CARD (Exact Match to Screenshot 4)           */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full bg-white rounded-[28px] p-2 shadow-sm border border-pink-100/90 divide-y divide-slate-100 overflow-hidden">
        {/* Row 1: Scratch & Win (Win Up to ₹50) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onNavigate('home');
          }}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-rose-50/40 rounded-2xl transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-lg shrink-0">
              🎫
            </div>
            <span className="font-['Outfit'] font-bold text-slate-800 text-[14px]">
              Scratch &amp; Win (Win Up to ₹50)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2.5]" />
        </button>

        {/* Row 2: Refer Friends (1 Refer = 1 Scratch) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onNavigate('invite');
          }}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-rose-50/40 rounded-2xl transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-lg shrink-0">
              🤝
            </div>
            <span className="font-['Outfit'] font-bold text-slate-800 text-[14px]">
              Refer Friends (1 Refer = 1 Scratch)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2.5]" />
        </button>

        {/* Row 3: Withdraw Cash (Bank / UPI) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onNavigate('wallet');
          }}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-rose-50/40 rounded-2xl transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-lg shrink-0">
              💸
            </div>
            <span className="font-['Outfit'] font-bold text-slate-800 text-[14px]">
              Withdraw Cash (Bank / UPI)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2.5]" />
        </button>

        {/* Row 4: Official Telegram Channel */}
        <button
          type="button"
          onClick={handleOpenChannel}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-rose-50/40 rounded-2xl transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-lg shrink-0">
              💬
            </div>
            <span className="font-['Outfit'] font-bold text-slate-800 text-[14px]">
              Official Telegram Channel
            </span>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 stroke-[2]" />
        </button>

        {/* Row 5: Message me to create your bot */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            openExternalOrTelegramLink('https://t.me/Rohit79041');
          }}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-rose-50/40 rounded-2xl transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-lg shrink-0">
              📩
            </div>
            <div className="leading-tight min-w-0">
              <span className="font-['Outfit'] font-bold text-slate-800 text-[14px] block truncate">
                📩 Message me to create your bot 🤖
              </span>
              <span className="text-[11px] font-bold text-[#0284c7] block mt-0.5">
                Low Price :- @Rohit79041
              </span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
        </button>

        {/* Row 6: Any problem dm kro */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            openExternalOrTelegramLink('https://t.me/boss6578');
          }}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-rose-50/40 rounded-2xl transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center text-xs font-black shrink-0 tracking-tighter">
              SOS
            </div>
            <div className="leading-tight min-w-0">
              <span className="font-['Outfit'] font-bold text-slate-800 text-[14px] block truncate">
                Any problem dm kro
              </span>
              <span className="text-[11px] font-bold text-[#ea580c] block mt-0.5">
                @Rohit79041
              </span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
        </button>

      </div>
    </div>
  );
};
