import React, { useState, useEffect } from 'react';
import { Send, Check, Copy, Users, RotateCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppSettings, UserProfile } from '../types';
import {
  getUserLastReferrals,
  fetchUserLastReferralsFromRemote,
  subscribeRealtime,
  UserReferralEntry,
  syncUserWithRemote,
} from '../services/store';
import { triggerHaptic, openExternalOrTelegramLink } from '../services/telegram';

interface InviteScreenProps {
  user: UserProfile;
  settings: AppSettings;
}

export const InviteScreen: React.FC<InviteScreenProps> = ({ user, settings }) => {
  const [copiedBot, setCopiedBot] = useState(false);
  const [lastReferrals, setLastReferrals] = useState<UserReferralEntry[]>(() =>
    getUserLastReferrals(user.id, 10)
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const rawBot = (settings.botUsername || 'Scratch_upi_win_bot').trim().replace(/^@/, '');
  const botUsername =
    !rawBot ||
    rawBot.toLowerCase() === 'rohitgiveawaybot' ||
    rawBot.toLowerCase() === 'scratch_the_win_bot' ||
    rawBot.toLowerCase() === 'spin_the_win_bot'
      ? 'Scratch_upi_win_bot'
      : rawBot;
  const botReferralLink = `https://t.me/${botUsername}?start=ref_${user.id}`;
  const totalReferralEarning = Math.max(
    (user.friendsJoined || 0) * (settings.spinWinAmount || 5),
    Math.round(user.balance || 0)
  );

  const loadLatestReferrals = async () => {
    try {
      const refs = await fetchUserLastReferralsFromRemote(user.id, 10);
      if (refs && refs.length > 0) {
        setLastReferrals(refs);
      } else {
        setLastReferrals(getUserLastReferrals(user.id, 10));
      }
    } catch {
      setLastReferrals(getUserLastReferrals(user.id, 10));
    }
  };

  useEffect(() => {
    loadLatestReferrals();
    const unsub = subscribeRealtime(() => {
      loadLatestReferrals();
    });
    return unsub;
  }, [user.id]);

  const handleCopyBot = () => {
    triggerHaptic('light');
    try {
      navigator.clipboard.writeText(botReferralLink);
      setCopiedBot(true);
      setTimeout(() => setCopiedBot(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShareTelegram = () => {
    triggerHaptic('medium');
    const text = encodeURIComponent(
      `🎁 Join ${settings.appTitle || 'Scratch The Win'}! Scratch the card & Win Up to ₹50 instant real cash directly into your UPI/Bank! 100% Guaranteed Cash Win!`
    );
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botReferralLink)}&text=${text}`;
    openExternalOrTelegramLink(shareUrl);
  };

  const handleRefreshData = async () => {
    triggerHaptic('light');
    setIsRefreshing(true);
    await Promise.all([
      syncUserWithRemote(user.id),
      loadLatestReferrals(),
    ]);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Only real referrals from database
  const displayReferrals: UserReferralEntry[] = lastReferrals;

  return (
    <div className="w-full flex flex-col items-center gap-3 pb-24 animate-fade-in select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP INVITE HERO BANNER CARD (Exact Match to Screenshot 2)   */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full bg-white rounded-[28px] shadow-sm border-[3px] border-pink-400 overflow-hidden p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          {/* Left Copy */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="inline-flex items-center gap-1 bg-rose-50 text-[#e11d48] border border-rose-200/80 font-['Outfit'] font-black text-[10px] px-3 py-0.5 rounded-full mb-1.5">
              <span>Win Up to ₹50 Per Scratch</span>
            </div>
            <h2 className="font-['Outfit'] font-black text-slate-900 text-xl sm:text-2xl tracking-tight leading-tight">
              Invite Friends
            </h2>
            <h3 className="font-['Outfit'] font-black text-[#e11d48] text-xl sm:text-2xl tracking-tight leading-tight mb-2">
              &amp; Win Up to ₹50
            </h3>
            <p className="text-slate-600 text-[11px] sm:text-xs font-medium leading-relaxed">
              Get <strong className="text-slate-900 font-bold">1 Scratch Card</strong> for every friend who joins!
              <br />
              Your friend also gets <strong className="text-slate-900 font-bold">1 Free Scratch Card!</strong>
            </p>
          </div>

          {/* Right 3D Visual: Telegram Plane + Pink Gift Box + Gold Coins */}
          <div className="shrink-0 w-28 h-28 relative flex items-center justify-center">
            {/* Cyan Telegram Plane Flying */}
            <div className="absolute top-1 right-2 z-20 w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] shadow-lg shadow-sky-500/30 flex items-center justify-center -rotate-12 border border-sky-200/60">
              <Send className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>

            {/* Floating Gold Coin */}
            <div className="absolute top-3 left-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border border-yellow-100 shadow-sm flex items-center justify-center text-amber-950 font-['Outfit'] font-black text-[10px] z-10">
              ₹
            </div>
            <div className="absolute bottom-2 left-0 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border border-yellow-100 shadow-sm flex items-center justify-center text-amber-950 font-['Outfit'] font-black text-[9px] z-10">
              ₹
            </div>

            {/* 3D Pink Gift Box */}
            <div className="relative mt-6 ml-2 w-20 h-20 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
                {/* Yellow Ribbon Loops */}
                <path d="M50 26 C36 10, 20 18, 32 32 C40 36, 46 32, 50 28 Z" fill="#fbbf24" />
                <path d="M50 26 C64 10, 80 18, 68 32 C60 36, 54 32, 50 28 Z" fill="#f59e0b" />
                {/* Gift Box Lid */}
                <rect x="22" y="32" width="56" height="15" rx="4" fill="#fb7185" stroke="#f43f5e" strokeWidth="1.5" />
                {/* Gift Box Body */}
                <rect x="26" y="47" width="48" height="38" rx="4" fill="#e11d48" />
                {/* Yellow Vertical Ribbon */}
                <rect x="44" y="32" width="12" height="53" fill="#fde047" />
                {/* Shadow at bottom */}
                <ellipse cx="50" cy="88" rx="28" ry="4" fill="rgba(0,0,0,0.15)" />
              </svg>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* YOUR REFERRAL LINK INPUT & BUTTONS                           */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-800">
              Your Referral Link
            </span>
            <button
              type="button"
              onClick={handleRefreshData}
              className="text-xs font-black text-[#e11d48] flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Fetch Data</span>
            </button>
          </div>

          <div className="bg-slate-50 border-[3px] border-pink-400 rounded-2xl p-1.5 flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono text-slate-600 px-2.5 truncate">
              {botReferralLink}
            </span>
            <button
              type="button"
              onClick={handleCopyBot}
              className="bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-['Outfit'] font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              {copiedBot ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBot ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleShareTelegram}
            className="w-full bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-['Outfit'] font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 fill-white" />
            <span>Invite Friends on Telegram</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. REFERRAL STATISTICS (3 White Cards Grid)                    */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#e11d48] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
            </div>
            <h2 className="font-['Outfit'] font-black text-slate-900 text-base tracking-tight">
              Referral Statistics
            </h2>
          </div>

          <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Realtime</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Friends Joined */}
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-pink-100/90 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48] mb-1.5">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-['Outfit'] font-black text-2xl text-[#e11d48] leading-tight">
              {user.friendsJoined || 0}
            </span>
            <span className="text-[10px] font-bold text-slate-500 leading-tight mt-0.5">
              Friends Joined
            </span>
          </div>

          {/* Card 2: Scratch Cards Earned */}
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-pink-100/90 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48] mb-1.5">
              <span className="font-black text-sm">₹</span>
            </div>
            <span className="font-['Outfit'] font-black text-2xl text-[#e11d48] leading-tight">
              {user.spinsEarned || 0}
            </span>
            <span className="text-[10px] font-bold text-slate-500 leading-tight mt-0.5">
              Scratch Cards Earned
            </span>
          </div>

          {/* Card 3: Total Earning */}
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-pink-100/90 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48] mb-1.5">
              <span className="font-black text-sm">₹</span>
            </div>
            <span className="font-['Outfit'] font-black text-2xl text-[#e11d48] leading-tight">
              ₹{totalReferralEarning || 0}
            </span>
            <span className="text-[10px] font-bold text-slate-500 leading-tight mt-0.5">
              Total Earning
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. RECENT REFERRAL ACTIVITY (List with Verified Badges)       */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#e11d48] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
            </div>
            <h2 className="font-['Outfit'] font-black text-slate-900 text-base tracking-tight">
              Recent Referral Activity
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowAllActivity((prev) => !prev)}
            className="text-xs font-black text-[#e11d48] hover:underline cursor-pointer"
          >
            {showAllActivity ? 'Show Less' : `View All (${displayReferrals.length})`}
          </button>
        </div>

        <div className="space-y-2">
          {displayReferrals.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-pink-100/90 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#e11d48] flex items-center justify-center text-2xl mb-2">
                👥
              </div>
              <span className="font-['Outfit'] font-black text-slate-900 text-sm mb-1">
                No Referrals Yet
              </span>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Invite friends via Telegram to get 1 Free Scratch Card for each referral!
              </p>
            </div>
          ) : (
            displayReferrals.map((ref, idx) => {
              const isCompleted =
                ref.rewardGiven === true ||
                ref.status === 'completed_first_spin' ||
                ref.status === 'completed' ||
                ref.status === 'rewarded' ||
                ref.status === 'active';
            const formattedDate = ref.createdAt
              ? new Date(ref.createdAt).toLocaleDateString('en-GB') + ' ' + new Date(ref.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '10/10/2026 09:54 PM';

            return (
              <div
                key={ref.id || `ref-${idx}`}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-pink-100/90 flex items-center justify-between gap-3"
              >
                {/* Left: Avatar + Green Check + Name & Username */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-sm font-black text-[#e11d48]">
                      {(ref.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    {/* Small Green Checkmark Badge on avatar */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>

                  <div className="min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-['Outfit'] font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {ref.name || 'Friend'}
                      </span>
                      {ref.username && (
                        <span className="text-[11px] text-slate-400 truncate">
                          (@{ref.username})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Right Badge: +1 Card (green) or Pending Scratch (orange) */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black px-2.5 py-1 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>+1 Card</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-full">
                      <span>⏱ Pending Scratch</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
};
