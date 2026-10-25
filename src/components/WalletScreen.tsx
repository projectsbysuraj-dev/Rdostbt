import React, { useState, useEffect } from 'react';
import {
  Send,
  RotateCw,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Landmark,
} from 'lucide-react';
import { AppSettings, UserProfile, WithdrawalRequest, Transaction } from '../types';
import {
  getUserTransactions,
  getUserWithdrawals,
  refreshWithdrawalsFromRemote,
  refreshTransactionsFromRemote,
  subscribeRealtime,
} from '../services/store';
import { WithdrawModal } from './WithdrawModal';
import { TabType } from './BottomNav';
import { triggerHaptic } from '../services/telegram';

interface WalletScreenProps {
  user: UserProfile;
  settings: AppSettings;
  onNavigate: (tab: TabType) => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({ user, settings, onNavigate }) => {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'transactions'>('withdrawals');
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(getUserWithdrawals(user.id));
  const [transactions, setTransactions] = useState<Transaction[]>(getUserTransactions(user.id));
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    refreshWithdrawalsFromRemote().then(() => {
      setWithdrawals(getUserWithdrawals(user.id));
    });
    refreshTransactionsFromRemote().then(() => {
      setTransactions(getUserTransactions(user.id));
    });

    const unsub = subscribeRealtime(() => {
      setWithdrawals(getUserWithdrawals(user.id));
      setTransactions(getUserTransactions(user.id));
    });

    const interval = setInterval(() => {
      refreshWithdrawalsFromRemote().then(() => {
        setWithdrawals(getUserWithdrawals(user.id));
      });
      refreshTransactionsFromRemote().then(() => {
        setTransactions(getUserTransactions(user.id));
      });
    }, 4000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [user.id]);

  const handleOpenWithdraw = () => {
    triggerHaptic('medium');
    setShowWithdrawModal(true);
  };

  const handleWithdrawSuccess = () => {
    setShowWithdrawModal(false);
    setSuccessToast(true);
    setWithdrawals(getUserWithdrawals(user.id));
    setTransactions(getUserTransactions(user.id));
    setActiveTab('withdrawals');
    refreshWithdrawalsFromRemote().then(() => {
      setWithdrawals(getUserWithdrawals(user.id));
      setTransactions(getUserTransactions(user.id));
    });
    setTimeout(() => setSuccessToast(false), 4000);
  };

  const handleManualSync = async () => {
    triggerHaptic('light');
    setIsSyncing(true);
    try {
      await refreshWithdrawalsFromRemote();
      setWithdrawals(getUserWithdrawals(user.id));
      setTransactions(getUserTransactions(user.id));
      triggerHaptic('success');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3.5 pb-24 animate-fade-in select-none">
      {/* Success Notification Banner */}
      {successToast && (
        <div className="w-full bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg shadow-emerald-700/30 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Withdrawal request submitted! Live status updated below.</span>
          </div>
          <button onClick={() => setSuccessToast(false)} className="text-white ml-2 text-sm cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HOT PINK / MAGENTA BALANCE CARD (Matches Screenshot 3) */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full bg-gradient-to-r from-[#d81b60] via-[#e91e63] to-[#ec4899] rounded-[28px] p-5 sm:p-6 text-white relative overflow-hidden shadow-lg shadow-rose-950/15">
        {/* Subtle Decorative Starburst / Sparkles */}
        <span className="absolute top-4 left-36 text-pink-200/60 text-xs pointer-events-none">✦</span>
        <span className="absolute bottom-6 left-48 text-pink-200/50 text-xs pointer-events-none">✦</span>

        {/* Top-Right Speech Bubble Pill: Min ₹25 Payout */}
        <div className="absolute top-4 right-4 z-20 flex items-center">
          <div className="relative bg-white text-[#e11d48] font-['Outfit'] font-black text-[11px] sm:text-xs px-3.5 py-1 rounded-full shadow-md">
            <span>Min ₹{settings.minWithdrawalLimit} Payout</span>
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-2">
          {/* Left Balance Info */}
          <div className="flex-1 min-w-0">
            <span className="text-xs sm:text-sm font-bold text-pink-100 block mb-0.5">
              Your Balance
            </span>

            {/* Big Bold Rupee Balance */}
            <div className="font-['Outfit'] font-black text-4xl sm:text-5xl tracking-tight leading-none text-white my-1">
              ₹ {user.balance.toFixed(2)}
            </div>

            <p className="text-[11px] font-semibold text-pink-100/95 mt-2">
              Instant 100% Payout via UPI &amp; Bank Account
            </p>
          </div>

          {/* Right 3D Hot Pink Wallet with Flying Gold Coins */}
          <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center">
            {/* Floating Gold Coin Top */}
            <div className="absolute top-0 right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border border-yellow-100 shadow-md flex items-center justify-center text-amber-950 font-['Outfit'] font-black text-[10px] z-20">
              ₹
            </div>
            {/* Floating Gold Coin Left */}
            <div className="absolute bottom-2 left-0 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border border-yellow-100 shadow-md flex items-center justify-center text-amber-950 font-['Outfit'] font-black text-[10px] z-20">
              ₹
            </div>

            {/* 3D Hot Pink Leather Wallet SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-xl">
              {/* Back flap */}
              <rect x="18" y="26" width="66" height="48" rx="8" fill="#be123c" />
              {/* Wallet Main Body */}
              <rect x="16" y="32" width="70" height="46" rx="8" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
              {/* Stitching lines */}
              <rect x="19" y="35" width="64" height="40" rx="6" fill="none" stroke="#fda4af" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.6" />
              {/* Front flap with gold snap button */}
              <path d="M52 46 L78 46 C83 46 86 50 86 55 L86 57 C86 62 83 66 78 66 L52 66 Z" fill="#9f1239" />
              {/* Gold clasp */}
              <circle cx="78" cy="56" r="4.5" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
              <circle cx="78" cy="56" r="2.5" fill="#f59e0b" />
            </svg>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. ACTION BUTTONS (Row 1 & Row 2)                             */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full space-y-2">
        {/* Row 1: Withdraw Cash | Win Up to ₹50 */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleOpenWithdraw}
            className="w-full bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-['Outfit'] font-black text-xs py-3 rounded-full shadow-md shadow-rose-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 fill-white" />
            <span>Withdraw Cash</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-full bg-white border border-pink-100 hover:bg-slate-50 text-slate-800 font-['Outfit'] font-black text-xs py-3 rounded-full shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span className="text-emerald-500 text-sm">💸</span>
            <span>Win Up to ₹50</span>
          </button>
        </div>

        {/* Row 2: Withdrawal Status | All History */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('withdrawals');
            }}
            className={`w-full font-['Outfit'] font-black text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-gradient-to-r from-[#e11d48] to-[#f43f5e] text-white shadow-md shadow-rose-500/25'
                : 'bg-white border border-pink-100 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Withdrawal Status</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('transactions');
            }}
            className={`w-full font-['Outfit'] font-black text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-gradient-to-r from-[#e11d48] to-[#f43f5e] text-white shadow-md shadow-rose-500/25'
                : 'bg-white border border-pink-100 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>All History</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. WITHDRAWAL CONTENT OR EMPTY STATE (Exact Match Screen 3)   */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full bg-white rounded-[28px] p-6 shadow-sm border border-pink-100/90 text-center">
        {activeTab === 'withdrawals' && withdrawals.length === 0 ? (
          /* Empty State matching Screenshot 3 */
          <div className="flex flex-col items-center py-2">
            {/* 3D Pink Bucket with Cards & Floating Coins SVG */}
            <div className="w-28 h-28 relative flex items-center justify-center mb-3">
              {/* Floating Gold Coin Top-Right */}
              <div className="absolute top-2 right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border border-yellow-100 shadow-sm flex items-center justify-center text-amber-950 font-['Outfit'] font-black text-[9px] z-20">
                ₹
              </div>
              {/* Floating Gold Coin Left */}
              <div className="absolute bottom-5 left-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border border-yellow-100 shadow-sm flex items-center justify-center text-amber-950 font-['Outfit'] font-black text-[9px] z-20">
                ₹
              </div>

              <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
                {/* Cards poking out of bucket */}
                <rect x="28" y="20" width="26" height="34" rx="3" fill="#bae6fd" transform="rotate(-15 35 25)" />
                <rect x="46" y="18" width="28" height="34" rx="3" fill="#ec4899" transform="rotate(12 55 25)" />
                <rect x="36" y="24" width="30" height="30" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                {/* 3D Pink Bucket */}
                <path d="M22 46 L30 82 C31 86 35 88 40 88 L60 88 C65 88 69 86 70 82 L78 46 Z" fill="#e11d48" />
                {/* Bucket Rim */}
                <ellipse cx="50" cy="46" rx="30" ry="8" fill="#f43f5e" stroke="#fb7185" strokeWidth="1.5" />
                {/* Inner shadow */}
                <ellipse cx="50" cy="46" rx="26" ry="6" fill="#be123c" />
              </svg>
            </div>

            <h3 className="font-['Outfit'] font-black text-slate-900 text-lg tracking-tight mb-1">
              No Withdrawal Requests Yet
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed mb-5">
              Jab aap cash withdraw karenge, aapka Pending, Approved aur Rejected status yahan live dikhega.
            </p>

            <button
              type="button"
              onClick={handleOpenWithdraw}
              className="w-full bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-['Outfit'] font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-base font-black">₹</span>
              <span>Withdraw Now</span>
            </button>
          </div>
        ) : activeTab === 'withdrawals' ? (
          /* Withdrawal Requests List */
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800">
                Your Withdrawal Requests ({withdrawals.length})
              </span>
              <button onClick={handleManualSync} className="text-xs text-[#e11d48] font-bold">
                Refresh
              </button>
            </div>
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <span className="font-['Outfit'] font-black text-sm text-[#e11d48]">
                    ₹{w.amount}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {w.method.toUpperCase()}: {w.upiId || w.accountNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(w.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    w.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : w.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Transaction History List */
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800">
                Transaction History ({transactions.length})
              </span>
              <button onClick={handleManualSync} className="text-xs text-[#e11d48] font-bold">
                Refresh
              </button>
            </div>
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No transactions recorded yet.</p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {tx.description}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                  <span
                    className={`font-['Outfit'] font-black text-sm ${
                      tx.amount >= 0 ? 'text-emerald-600' : 'text-slate-800'
                    }`}
                  >
                    {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. TRUST BADGES: Instant Payout | 100% Secure | UPI & Bank   */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full grid grid-cols-3 gap-2.5">
        {/* Badge 1: Instant Payout */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-pink-100/90 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48] mb-1.5">
            <Zap className="w-4 h-4 fill-[#e11d48] text-[#e11d48]" />
          </div>
          <span className="font-['Outfit'] font-black text-xs text-slate-900 leading-tight">
            Instant
          </span>
          <span className="font-['Outfit'] font-black text-xs text-slate-900 leading-tight">
            Payout
          </span>
        </div>

        {/* Badge 2: 100% Secure */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-pink-100/90 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-1.5">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 stroke-[2.4]" />
          </div>
          <span className="font-['Outfit'] font-black text-xs text-slate-900 leading-tight">
            100%
          </span>
          <span className="font-['Outfit'] font-black text-xs text-slate-900 leading-tight">
            Secure
          </span>
        </div>

        {/* Badge 3: UPI & Bank Transfer */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-pink-100/90 flex flex-col items-center text-center">
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48] mb-1.5">
            <Landmark className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="font-['Outfit'] font-black text-xs text-slate-900 leading-tight">
            UPI &amp; Bank
          </span>
          <span className="font-['Outfit'] font-black text-xs text-slate-900 leading-tight">
            Transfer
          </span>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          user={user}
          settings={settings}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </div>
  );
};
