import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Send, Flame, Sparkles, X, RotateCcw, Moon, Sun, Gift, Users } from 'lucide-react';
import { AppSettings, UserProfile } from '../types';
import { TabType } from './BottomNav';
import {
  completeScratchAndClaimReward,
  creditReferralAfterFirstSpin,
} from '../services/store';
import { triggerHaptic, openExternalOrTelegramLink } from '../services/telegram';
import scratchWinBannerArt from '../assets/images/scratch_win_banner_art_1791385622302.jpg?inline';

interface HomeScreenProps {
  user: UserProfile;
  settings: AppSettings;
  onNavigate: (tab: TabType) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  settings,
  onNavigate,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const [isScratched, setIsScratched] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [hasClaimedCurrentCard, setHasClaimedCurrentCard] = useState(false);
  const [wonModal, setWonModal] = useState<{ amount: number } | null>(null);
  const [noScratchesModal, setNoScratchesModal] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const isPointerDownRef = useRef(false);
  const isScratchingRef = useRef(false);
  const hasTriggeredWinRef = useRef(false);
  const hasClaimedRef = useRef(false);
  const scratchStrokeCountRef = useRef(0);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const winAmount = 5;

  // -------------------------------------------------------------
  // Draw the exact Silver Scratch Foil Canvas with Crown & SCRATCH CARD (Matches Screenshot)
  // -------------------------------------------------------------
  const initFoilCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    // 1. Clean Uniform Metallic Silver Foil Base Gradient (pure vertical, zero diagonal streaks or frozen highlights)
    const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
    baseGrad.addColorStop(0, '#d8dee9');
    baseGrad.addColorStop(0.3, '#c2c9d4');
    baseGrad.addColorStop(0.7, '#b0b8c4');
    baseGrad.addColorStop(1, '#9aa3b0');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Micro-brushed horizontal silver striations
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < height; i += 2) {
      ctx.fillRect(0, i, width, 1);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let i = 1; i < height; i += 3) {
      ctx.fillRect(0, i, width, 1);
    }

    // 3. Subtle metallic silver borders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.strokeStyle = 'rgba(71, 85, 105, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(11, 11, width - 22, height - 22);

    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // 4. Golden Crown at top of SCRATCH CARD (Matches Screenshot)
    const crownY = centerY - 44;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    // Golden gradient for crown
    const crownGrad = ctx.createLinearGradient(centerX - 30, crownY - 20, centerX + 30, crownY + 15);
    crownGrad.addColorStop(0, '#fef08a');
    crownGrad.addColorStop(0.35, '#f59e0b');
    crownGrad.addColorStop(0.75, '#d97706');
    crownGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = crownGrad;

    ctx.beginPath();
    // Crown base & 5 spikes
    ctx.moveTo(centerX - 24, crownY + 10);
    ctx.lineTo(centerX - 28, crownY - 14);
    ctx.lineTo(centerX - 14, crownY - 2);
    ctx.lineTo(centerX, crownY - 22);
    ctx.lineTo(centerX + 14, crownY - 2);
    ctx.lineTo(centerX + 28, crownY - 14);
    ctx.lineTo(centerX + 24, crownY + 10);
    ctx.closePath();
    ctx.fill();

    // Crown rim
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(centerX - 24, crownY + 8, 48, 4);

    // Jewels on crown peaks
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(centerX - 28, crownY - 14, 2.5, 0, Math.PI * 2);
    ctx.arc(centerX, crownY - 22, 3.5, 0, Math.PI * 2);
    ctx.arc(centerX + 28, crownY - 14, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Center Embossed "SCRATCH CARD" text (Matches Screenshot 1)
    ctx.save();
    ctx.font = '900 33px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Pinkish/Red 3D Shadow Layer
    ctx.fillStyle = '#be123c';
    ctx.fillText('SCRATCH CARD', centerX, centerY + 19);

    ctx.fillStyle = '#e11d48';
    ctx.fillText('SCRATCH CARD', centerX, centerY + 18);

    // Front Face (clean white with crisp contrast on silver foil)
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillText('SCRATCH CARD', centerX, centerY + 15);
    ctx.restore();

    hasTriggeredWinRef.current = false;
    hasClaimedRef.current = false;
    scratchStrokeCountRef.current = 0;
    isScratchingRef.current = false;
    isPointerDownRef.current = false;
    lastPointRef.current = null;
  }, []);

  useEffect(() => {
    initFoilCanvas();
    const animId = requestAnimationFrame(() => {
      initFoilCanvas();
    });
    return () => cancelAnimationFrame(animId);
  }, [initFoilCanvas, cardKey]);

  // Reveal prize
  const handleRevealPrize = useCallback(() => {
    if (hasTriggeredWinRef.current || !isScratchingRef.current) return;
    if (userRef.current.spins <= 0) {
      setNoScratchesModal(true);
      return;
    }

    hasTriggeredWinRef.current = true;
    setIsScratched(true);
    setIsScratching(false);
    triggerHaptic('success');

    // Confetti burst
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#ff0055', '#e11d48', '#f59e0b', '#fbbf24', '#ffffff'],
    });

    setWonModal({ amount: winAmount });
  }, [winAmount]);

  const handleClaimReward = (actionAfter: 'close' | 'next_card' = 'close') => {
    if (hasClaimedRef.current) {
      setWonModal(null);
      if (actionAfter === 'next_card') {
        setIsScratched(false);
        setHasClaimedCurrentCard(false);
        setCardKey((prev) => prev + 1);
      }
      return;
    }

    hasClaimedRef.current = true;
    setHasClaimedCurrentCard(true);
    triggerHaptic('medium');

    completeScratchAndClaimReward(userRef.current.id, winAmount);
    creditReferralAfterFirstSpin(userRef.current.id);

    setWonModal(null);

    if (actionAfter === 'next_card') {
      setIsScratched(false);
      setHasClaimedCurrentCard(false);
      setCardKey((prev) => prev + 1);
    }
  };

  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || hasTriggeredWinRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let transparent = 0;
      const totalSampled = Math.max(1, Math.floor(pixels.length / 32));

      for (let i = 3; i < pixels.length; i += 32) {
        if (pixels[i] < 128) {
          transparent++;
        }
      }

      const percent = (transparent / totalSampled) * 100;
      if (percent > 16 || scratchStrokeCountRef.current >= 10) {
        handleRevealPrize();
      }
    } catch {
      if (scratchStrokeCountRef.current >= 8) {
        handleRevealPrize();
      }
    }
  }, [handleRevealPrize]);

  const scratchAtPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || hasTriggeredWinRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 54;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, 27, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPointRef.current = { x, y };

    scratchStrokeCountRef.current += 1;
    triggerHaptic('scratch');

    if (scratchStrokeCountRef.current % 2 === 0) {
      checkScratchPercentage();
    }
  }, [checkScratchPercentage]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isScratched || hasTriggeredWinRef.current) return;

    if (userRef.current.spins <= 0) {
      triggerHaptic('error');
      setNoScratchesModal(true);
      return;
    }

    if (!isScratchingRef.current) {
      isScratchingRef.current = true;
      setIsScratching(true);
      triggerHaptic('medium');
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }

    isPointerDownRef.current = true;
    lastPointRef.current = null;
    scratchAtPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current || isScratched || hasTriggeredWinRef.current) return;
    scratchAtPoint(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = false;
    lastPointRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
    checkScratchPercentage();
  };

  const handleOpenChannel = () => {
    triggerHaptic('light');
    const channelUrl = settings.telegramChannelUrl || 'https://t.me/scratch_the_win';
    openExternalOrTelegramLink(channelUrl);
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 pb-24 animate-fade-in select-none relative">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HERO BANNER CARD (Exact Match to Screenshot 1)          */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full relative">
        <div className="w-full bg-gradient-to-r from-pink-50/95 via-rose-50/40 to-pink-100/60 rounded-[28px] p-4 sm:p-5 shadow-md border-[3px] border-[#e11d48] relative overflow-hidden">
          {/* Top-Right Badge: "Win Up to ₹50" */}
          <div className="absolute top-3.5 right-3.5 z-20">
            <span className="bg-[#e11d48] text-white font-['Outfit'] font-black text-[10px] px-3 py-1 rounded-full shadow-sm tracking-tight inline-block">
              Win Up to ₹50
            </span>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* Left Copy & Join Channel Button */}
            <div className="flex-1 min-w-0 pr-1">
              <h2 className="font-['Outfit'] font-black text-slate-900 text-xl sm:text-2xl tracking-tight leading-tight">
                Scratch &amp; Win
              </h2>
              <h3 className="font-['Outfit'] font-black text-[#e11d48] text-lg sm:text-xl tracking-tight leading-tight mb-1.5">
                Win Up to ₹50 Cash
              </h3>
              <p className="text-slate-600 text-[11px] sm:text-xs font-medium leading-relaxed mb-3">
                Scratch card &amp; Win Up to ₹50 real cash directly in your wallet!
              </p>

              <button
                type="button"
                onClick={handleOpenChannel}
                className="bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-['Outfit'] font-black text-xs px-4 py-2 rounded-full flex items-center gap-1.5 shadow-md shadow-rose-500/25 active:scale-95 transition-all uppercase tracking-wide cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 fill-white" />
                <span>JOIN CHANNEL</span>
              </button>
            </div>

            {/* Right Visual Ticket Art with Coins & Scratching Hand */}
            <div className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 relative flex items-center justify-center">
              <img
                src={scratchWinBannerArt}
                alt="Scratch and Win Art"
                className="w-full h-full object-contain filter drop-shadow-md rounded-2xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STATS STRIP: 1 SIGN UP = 1 SCRATCH | 1 REFER = 1 SCRATCH       */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full bg-white rounded-2xl py-2.5 px-4 shadow-sm border border-pink-100/90 flex items-center justify-around text-slate-800 mt-2.5">
          {/* Left: 1 SIGN UP = 1 SCRATCH */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#e11d48]">
              <Gift className="w-4.5 h-4.5 stroke-[2.4]" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-[10px] font-black tracking-tight text-slate-900">
                1 SIGN UP
              </div>
              <div className="text-[11px] font-black text-[#e11d48]">
                = 1 SCRATCH
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-slate-100" />

          {/* Right: 1 REFER = 1 SCRATCH */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onNavigate('invite');
            }}
            className="flex items-center gap-2.5 text-left active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-[#e11d48]">
              <Users className="w-4.5 h-4.5 stroke-[2.4]" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-black tracking-tight text-slate-900">
                1 REFER
              </div>
              <div className="text-[11px] font-black text-[#e11d48]">
                = 1 SCRATCH
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SECTION HEADER: Flame Badge + "Scratch & Win" + Dark Mode  */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full flex items-center justify-between px-0.5 gap-2 mt-0.5">
        {/* Left Pill: Scratch & Win Win Up to ₹50 */}
        <div className="bg-white rounded-2xl px-3.5 py-2 shadow-sm border border-pink-100/90 flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48] shrink-0">
            <Flame className="w-4.5 h-4.5 fill-[#e11d48] text-[#e11d48]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-['Outfit'] font-black text-slate-900 text-sm sm:text-base tracking-tight leading-none truncate">
              Scratch &amp; Win
            </h2>
            <span className="text-[10px] font-black text-[#e11d48] block mt-0.5 leading-none">
              Win Up to ₹50
            </span>
          </div>
        </div>

        {/* Right Pill: Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            if (onToggleDarkMode) onToggleDarkMode();
          }}
          aria-label="Toggle Dark Mode"
          className="bg-white rounded-2xl px-3.5 py-2 shadow-sm border border-pink-100/90 flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-[#e11d48] shrink-0">
            {isDarkMode ? (
              <Moon className="w-4 h-4 fill-[#e11d48] text-[#e11d48]" />
            ) : (
              <Sun className="w-4 h-4 text-[#e11d48]" />
            )}
          </div>

          <div className="text-left pr-0.5">
            <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">
              DARK MODE
            </span>
            <span className="block font-['Outfit'] font-black text-xs leading-tight mt-0.5 text-slate-700">
              {isDarkMode ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Toggle Indicator Slider */}
          <div
            className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
              isDarkMode ? 'bg-[#e11d48] justify-end' : 'bg-slate-200 justify-start'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform" />
          </div>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CENTER STAGE: VIBRANT PINK NEON ARCADE SCRATCH CARD STAGE   */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full relative flex flex-col items-center justify-center py-1 select-none">
        <div className="relative z-10 w-full max-w-[420px]">
          {/* Glowing Pink/Magenta Neon Border Frame with Arcade Bulbs (Matches Screenshot 1) */}
          <div className="w-full rounded-[30px] sm:rounded-[34px] p-2.5 sm:p-3 bg-gradient-to-b from-[#ff0055] via-[#e11d48] to-[#be123c] shadow-[0_0_25px_rgba(255,0,85,0.4)] border-2 border-pink-300/80 relative overflow-hidden">
            {/* Embedded Glowing Arcade LED Bulbs Along Top Border */}
            <div className="absolute top-1 left-0 right-0 flex justify-around px-4 pointer-events-none z-20">
              {[...Array(9)].map((_, i) => (
                <span
                  key={`top-led-${i}`}
                  className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>

            {/* Embedded Glowing Arcade LED Bulbs Along Bottom Border */}
            <div className="absolute bottom-1 left-0 right-0 flex justify-around px-4 pointer-events-none z-20">
              {[...Array(9)].map((_, i) => (
                <span
                  key={`bot-led-${i}`}
                  className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse"
                  style={{ animationDelay: `${(8 - i) * 120}ms` }}
                />
              ))}
            </div>

            {/* Inner Metallic Card Bevel */}
            <div className="w-full rounded-[24px] sm:rounded-[28px] p-1 bg-gradient-to-br from-[#9f1239] via-[#881337] to-[#4c0519] relative">
              {/* Card Canvas Container: aspect-[16/11] */}
              <div className="relative w-full aspect-[16/11] rounded-[20px] sm:rounded-[24px] overflow-hidden bg-[#242832] shadow-2xl">
                {/* ----------------- LAYER 1: UNDERNEATH REVEALED PRIZE CARD ----------------- */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#fef08a] via-[#f59e0b] to-[#ea580c] flex flex-col items-center justify-center p-4 text-center select-none overflow-hidden">
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

                  <div className="absolute top-2 left-3 text-amber-200 text-sm">✨</div>
                  <div className="absolute bottom-2 right-3 text-amber-200 text-sm">✨</div>
                  <div className="absolute top-2 right-3 text-amber-200 text-sm">🎉</div>

                  <span className="font-['Outfit'] font-black text-slate-950 text-xs uppercase tracking-wider bg-white/90 px-3 py-0.5 rounded-full shadow-sm mb-1">
                    🎉 INSTANT CASH WON!
                  </span>

                  <div className="font-['Outfit'] font-black text-white text-5xl sm:text-6xl tracking-tighter drop-shadow-md flex items-center justify-center leading-none my-1">
                    <span>₹{winAmount}</span>
                  </div>

                  <p className="text-amber-100 text-[11px] font-bold tracking-tight">
                    Credited directly to your wallet!
                  </p>
                </div>

                {/* ----------------- LAYER 2: INTERACTIVE FOIL CANVAS ----------------- */}
                {!isScratched && (
                  <>
                    <canvas
                      key={`scratch-foil-canvas-${cardKey}`}
                      ref={canvasRef}
                      width={380}
                      height={260}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10 select-none"
                      style={{ touchAction: 'none' }}
                    />

                    {/* Single Moving Gloss Reflection Sweep Effect */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px] sm:rounded-[24px] z-15">
                      <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-25 animate-shimmer" />
                    </div>
                  </>
                )}

                {/* Rub Finger Helper Pill at Bottom */}
                {!isScratched && !isScratching && (
                  <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-[10px] font-extrabold text-white/95 bg-black/75 px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <span>👉</span>
                      <span>Rub finger here to scratch</span>
                    </span>
                  </div>
                )}

                {/* Revealed state overlay with instant Claim */}
                {isScratched && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-3 pointer-events-auto bg-black/20 backdrop-blur-[1px]">
                    <button
                      type="button"
                      onClick={() => handleClaimReward('next_card')}
                      className="bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] active:scale-95 text-white font-['Outfit'] font-black text-xs px-5 py-2.5 rounded-full shadow-lg shadow-rose-950/40 flex items-center gap-1.5 transition-all cursor-pointer border border-pink-300"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {hasClaimedCurrentCard
                          ? 'Scratch Next Card 🚀'
                          : `Claim ₹${winAmount} & Next Card 🎁`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Soft Pink Grounding Glow */}
        <div className="w-4/5 h-3.5 bg-rose-500/15 rounded-[100%] blur-md mx-auto -mt-1 mb-1 pointer-events-none" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. SCRATCHES AVAILABLE & "+ GET MORE" BAR (Matches Screenshot 1) */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full bg-white rounded-2xl px-3.5 py-2.5 shadow-sm border border-pink-100/90 flex items-center justify-between gap-2">
        {/* Left: Pink Rupee Ticket + "Scratches Available" + Bold Red/Pink Count */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-7 rounded-lg bg-gradient-to-r from-[#e11d48] to-[#f43f5e] text-white flex items-center justify-center font-['Outfit'] font-black text-xs shadow-sm shadow-rose-500/30">
            <span className="text-white text-xs font-black">₹</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-left leading-tight">
              <span className="text-[11px] font-bold text-slate-700 block leading-tight">
                Scratches
              </span>
              <span className="text-[11px] font-bold text-slate-700 block leading-tight">
                Available
              </span>
            </div>

            <span className="font-['Outfit'] font-black text-xl text-[#e11d48] pl-1">
              {user.spins}
            </span>
          </div>
        </div>

        {/* Right: + Get More Hot Pink Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            onNavigate('invite');
          }}
          className="bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-['Outfit'] font-black text-xs px-4 py-2 rounded-full shadow-md shadow-rose-500/25 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>+ Get More</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: Congratulations Cash Won                                 */}
      {/* ------------------------------------------------------------- */}
      {wonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 text-center shadow-2xl border border-pink-100 animate-scale-up relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-[#e11d48] mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
              🎉
            </div>

            <h3 className="font-['Outfit'] font-black text-slate-900 text-2xl tracking-tight leading-tight mb-1">
              Congratulations!
            </h3>
            <p className="text-xs text-slate-500 font-semibold mb-4">
              You won guaranteed instant wallet cash!
            </p>

            <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 rounded-2xl p-4 border border-rose-200/60 mb-5">
              <span className="text-xs font-bold text-[#e11d48] uppercase tracking-wider block mb-0.5">
                CASH REWARD
              </span>
              <span className="font-['Outfit'] font-black text-5xl text-[#e11d48] tracking-tight">
                ₹{wonModal.amount}
              </span>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleClaimReward('next_card')}
                className="w-full bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-['Outfit'] font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-rose-500/30 active:scale-95 transition-all cursor-pointer"
              >
                Claim ₹{wonModal.amount} &amp; Scratch Again 🚀
              </button>
              <button
                type="button"
                onClick={() => handleClaimReward('close')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: 0 Scratches Remaining (Invite Friends)                  */}
      {/* ------------------------------------------------------------- */}
      {noScratchesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 text-center shadow-2xl border border-pink-100 animate-scale-up relative">
            <button
              onClick={() => setNoScratchesModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-[#e11d48] mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
              🎁
            </div>

            <h3 className="font-['Outfit'] font-black text-slate-900 text-xl tracking-tight leading-tight mb-1">
              0 Scratch Cards Remaining
            </h3>
            <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">
              Apne doston ko invite karein! Har 1 invite par aapko milta hai strictly <strong>+1 Free Scratch Card</strong>.
            </p>

            <button
              type="button"
              onClick={() => {
                setNoScratchesModal(false);
                onNavigate('invite');
              }}
              className="w-full bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] text-white font-['Outfit'] font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-rose-500/30 active:scale-95 transition-all cursor-pointer"
            >
              👥 Invite Friends (+1 Scratch Per Friend)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
