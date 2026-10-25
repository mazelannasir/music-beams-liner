/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Heart,
  RotateCcw,
  Pause,
  Home,
  Volume2,
  VolumeX,
  Camera,
  BookOpen,
  ChevronUp,
  ChevronDown,
  ArrowUpCircle,
  ArrowDownCircle,
  Sparkles,
} from 'lucide-react';
import { ActiveWall, AVATAR_OPTIONS, AvatarId, CameraMode, LANES } from '../types/game';

interface GameHUDProps {
  score: number;
  lives: number;
  timeRemaining: number;
  combo: number;
  currentLaneIndex: number;
  upcomingWall: ActiveWall | null;
  cameraMode: CameraMode;
  selectedAvatar?: AvatarId;
  isMuted: boolean;
  scorePopup: { text: string; isPositive: boolean; key: number } | null;
  onLaneUp: () => void;
  onLaneDown: () => void;
  onRestart: () => void;
  onPause: () => void;
  onHome: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onOpenGuide: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  lives,
  timeRemaining,
  combo,
  currentLaneIndex,
  upcomingWall,
  cameraMode,
  selectedAvatar,
  isMuted,
  scorePopup,
  onLaneUp,
  onLaneDown,
  onRestart,
  onPause,
  onHome,
  onToggleMute,
  onToggleCamera,
  onOpenGuide,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const avatarData = AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  const currentLane = LANES[currentLaneIndex] || LANES[3];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const cameraModeLabels: Record<CameraMode, string> = {
    subway: 'Subway 3D',
    stave: 'Baluk Penuh',
    chase: 'Belakang Runner',
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-3 sm:p-5 z-20">
      {/* Top Status Cluster (Perimeter Bar) */}
      <div className="flex items-start justify-between gap-2 max-w-7xl mx-auto w-full pointer-events-auto">
        {/* Left: Home Button + Lives */}
        <div className="flex items-center gap-2">
          {/* Main Menu Return Button */}
          <button
            onClick={onHome}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
            title="Keluar ke Menu Utama"
          >
            <Home className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Menu Utama</span>
          </button>

          {/* Lives (3 Hearts) */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                className={`w-5 h-5 transition-transform ${
                  heartIndex <= lives
                    ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)] scale-100'
                    : 'text-slate-600 fill-slate-700/50 scale-90'
                }`}
              />
            ))}
          </div>

          {/* Active Avatar Badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-2 bg-slate-900/90 border rounded-xl text-xs font-bold shadow-lg"
            style={{ borderColor: `${avatarData.primaryColor}50` }}
          >
            <span>{avatarData.badge.split(' ')[0]}</span>
            <span style={{ color: avatarData.primaryColor }}>{avatarData.name}</span>
          </div>
        </div>

        {/* Center: Current Lane Position Indicator & Score Popups */}
        <div className="flex flex-col items-center">
          <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-xl">
            <span className="text-[11px] uppercase font-mono text-slate-400">Kedudukan:</span>
            <span
              className="text-xs sm:text-sm font-black tracking-wide"
              style={{ color: currentLane.color }}
            >
              {currentLane.labelBM}
            </span>

            {/* Score Popup Floater */}
            {scorePopup && (
              <div
                key={scorePopup.key}
                className={`absolute -bottom-7 left-1/2 -translate-x-1/2 font-black text-sm px-2 py-0.5 rounded-md animate-bounce shadow-md ${
                  scorePopup.isPositive
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/50'
                    : 'bg-rose-500 text-white shadow-rose-500/50'
                }`}
              >
                {scorePopup.text}
              </div>
            )}
          </div>

          {/* Upcoming Wall Warning Radar */}
          {upcomingWall && (
            <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-slate-400 font-mono">Tembok Hadapan:</span>
              <span
                className={`font-black px-1.5 py-0.2 rounded ${
                  upcomingWall.note === 'G'
                    ? 'text-emerald-400 bg-emerald-950/60'
                    : upcomingWall.note === 'A'
                    ? 'text-cyan-400 bg-cyan-950/60'
                    : 'text-amber-400 bg-amber-950/60'
                }`}
              >
                NOT {upcomingWall.note}
              </span>
            </div>
          )}
        </div>

        {/* Right: Score & Timer */}
        <div className="flex items-center gap-2">
          {/* Combo Badge */}
          {combo >= 2 && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-black shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{combo}x KOMBO</span>
            </div>
          )}

          {/* Score Readout (Tabular Nums) */}
          <div className="flex items-center gap-1 px-3.5 py-2 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Mata:</span>
            <span className="text-base sm:text-lg font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 min-w-[3ch] text-right">
              {score}
            </span>
          </div>

          {/* Timer Clock */}
          <div className="flex items-center gap-1 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg font-mono font-bold text-xs sm:text-sm text-amber-300">
            <span>⏱️</span>
            <span className="tabular-nums">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Floating On-Screen Touch Arrows (for mobile & quick clicks) */}
      <div className="flex flex-col items-end gap-3 self-end pointer-events-auto my-auto pr-1">
        <button
          onClick={onLaneUp}
          disabled={currentLaneIndex >= 8}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-cyan-500/50 active:scale-90 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-900/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Naik ke lorong atas"
        >
          <ArrowUpCircle className="w-8 h-8" />
        </button>

        <button
          onClick={onLaneDown}
          disabled={currentLaneIndex <= 0}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-cyan-500/50 active:scale-90 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-900/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Turun ke lorong bawah"
        >
          <ArrowDownCircle className="w-8 h-8" />
        </button>
      </div>

      {/* Collapsible Unified Bottom Control Dock */}
      <div className="flex flex-col items-center pointer-events-auto max-w-3xl mx-auto w-full">
        {/* Toggle Collapse Pill */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 border-t border-x border-slate-700/80 rounded-t-xl text-[11px] font-mono text-slate-300 transition-all cursor-pointer shadow-lg mb-[-1px]"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Papar Kawalan
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Sembunyi Kawalan
            </>
          )}
        </button>

        {/* Dock Container */}
        {!isDockCollapsed && (
          <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2 sm:p-3 shadow-2xl flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold text-slate-200">
            {/* Left Actions: Home & Restart */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onHome}
                className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white rounded-xl flex items-center gap-1.5 border border-rose-500/20 transition-all cursor-pointer"
                title="Kembali ke Menu Utama"
              >
                <Home className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Menu Utama</span>
              </button>

              <button
                onClick={onRestart}
                className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                title="Mula Semula"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Mula Semula</span>
              </button>
            </div>

            {/* Center: Controls Hint or Lane Fast Selector */}
            <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <span>Gunakan</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">
                W
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">
                S
              </kbd>
              <span>atau</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">
                ↓
              </kbd>
            </div>

            {/* Right: Camera Mode, Audio, Guide, Pause */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onToggleCamera}
                className="p-2 sm:px-2.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 rounded-xl flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                title="Tukar Sudut Kamera"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span className="hidden lg:inline">{cameraModeLabels[cameraMode]}</span>
              </button>

              <button
                onClick={onToggleMute}
                className="p-2 sm:px-2.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                title={isMuted ? 'Buka Bunyi' : 'Senyap'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>

              <button
                onClick={onOpenGuide}
                className="p-2 sm:px-2.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl flex items-center gap-1 border border-slate-700 transition-all cursor-pointer"
                title="Panduan Baluk"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Panduan</span>
              </button>

              <button
                onClick={onPause}
                className="py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl flex items-center gap-1 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Jeda</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
