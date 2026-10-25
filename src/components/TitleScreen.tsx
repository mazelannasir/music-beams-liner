/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, BookOpen, Music, Gauge, Clock, Sparkles, UserCheck } from 'lucide-react';
import {
  AVATAR_OPTIONS,
  AvatarId,
  Difficulty,
  DurationOption,
} from '../types/game';

interface TitleScreenProps {
  difficulty: Difficulty;
  duration: DurationOption;
  selectedAvatar: AvatarId;
  onDifficultyChange: (d: Difficulty) => void;
  onDurationChange: (dur: DurationOption) => void;
  onSelectAvatar: (avatarId: AvatarId) => void;
  onStartGame: () => void;
  onOpenGuide: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  difficulty,
  duration,
  selectedAvatar,
  onDifficultyChange,
  onDurationChange,
  onSelectAvatar,
  onStartGame,
  onOpenGuide,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 pointer-events-auto bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-slate-950/90 select-none overflow-y-auto">
      {/* Top Bar / Brand */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
          <Music className="w-3.5 h-3.5 text-cyan-400" />
          <span>Edisi Pembelajaran Not Baluk</span>
        </div>

        <button
          onClick={onOpenGuide}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400/50 rounded-xl text-xs font-bold text-cyan-300 transition-all cursor-pointer shadow-lg"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Panduan Baluk (G, A, B)</span>
        </button>
      </div>

      {/* Centerpiece: Title Lockup & Setup */}
      <div className="flex flex-col items-center justify-center my-auto text-center max-w-4xl mx-auto py-4">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="relative mb-2">
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-amber-500/20 blur-xl rounded-full opacity-70" />

          <svg
            className="w-full max-w-[500px] h-auto drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]"
            viewBox="0 0 540 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            <line x1="30" y1="20" x2="510" y2="20" stroke="#334155" strokeWidth="1.5" />
            <line x1="30" y1="26" x2="510" y2="26" stroke="#334155" strokeWidth="1.5" />
            <line x1="30" y1="32" x2="510" y2="32" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 3" />

            <text x="42" y="78" fill="#38bdf8" fontSize="62" fontFamily="serif" fontWeight="bold">
              𝄞
            </text>

            <text
              x="95"
              y="74"
              fill="url(#neonGradient)"
              fontSize="44"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              letterSpacing="2.5"
            >
              MUSIC BEAMS
            </text>

            <text
              x="96"
              y="104"
              fill="#f8fafc"
              fontSize="24"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="800"
              letterSpacing="8"
            >
              LINER RUNNER
            </text>
          </svg>
        </div>

        {/* Subtitle Badge */}
        <p className="text-slate-300 text-xs sm:text-sm max-w-lg mb-5 leading-relaxed font-medium">
          Lari dan swipe ke lorong baluk yang betul mengikut gambar not{' '}
          <strong className="text-emerald-400">G</strong>, <strong className="text-cyan-400">A</strong>, dan{' '}
          <strong className="text-amber-400">B</strong> untuk lepasi tembok halangan tinggi!
        </p>

        {/* 1. PELBAGAIKAN AVATAR: Avatar Selection Carousel for Students */}
        <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3 text-left">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase text-slate-300 font-bold">
                Pilih Avatar Murid (Animasi Berlari 3D)
              </span>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">
              Avatar aktif berlari di trek baluk!
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-left">
            {AVATAR_OPTIONS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              return (
                <button
                  key={avatar.id}
                  onClick={() => onSelectAvatar(avatar.id)}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 shadow-lg scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  style={{
                    borderColor: isSelected ? avatar.primaryColor : undefined,
                    boxShadow: isSelected ? `0 0 16px ${avatar.primaryColor}35` : undefined,
                  }}
                >
                  {/* Active Selection Badge */}
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 text-[10px] font-black px-1.5 py-0.5 rounded-full text-slate-950 flex items-center gap-0.5"
                      style={{ backgroundColor: avatar.primaryColor }}
                    >
                      ✓ AKTIF
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5 mb-0.5">
                      <span>{avatar.badge.split(' ')[0]}</span>
                      <span>{avatar.name}</span>
                    </div>
                    <div
                      className="text-[10px] font-bold tracking-wide uppercase mb-1.5"
                      style={{ color: avatar.secondaryColor }}
                    >
                      {avatar.theme}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {avatar.description}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Animasi: Larian</span>
                    <span style={{ color: avatar.primaryColor }}>Pilih Watak</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Game Mode Configuration Box */}
        <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty Selection */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 mb-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Tahap Kelajuan</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onDifficultyChange('easy')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    difficulty === 'easy'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🟢 Mudah
                </button>
                <button
                  onClick={() => onDifficultyChange('medium')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    difficulty === 'medium'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔵 Sederhana
                </button>
                <button
                  onClick={() => onDifficultyChange('hard')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    difficulty === 'hard'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔴 Sukar
                </button>
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Durasi Masa Larian</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onDurationChange(60)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    duration === 60
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⏱️ 1 Minit (60s)
                </button>
                <button
                  onClick={() => onDurationChange(120)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    duration === 120
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⏱️ 2 Minit (120s)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Start CTA Button */}
        <button
          onClick={onStartGame}
          className="group relative inline-flex items-center justify-center gap-3 py-3.5 px-10 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 text-slate-950 font-black text-lg sm:text-xl rounded-2xl shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>MULA BERMAIN</span>
          <Sparkles className="w-5 h-5 opacity-75" />
        </button>
      </div>

      {/* Flat Control-Hint Line */}
      <div className="text-center shrink-0">
        <div className="inline-block py-1.5 px-4 rounded-full bg-slate-900/70 border border-slate-800 text-xs font-mono text-slate-400">
          Swipe ↑ / ↓ · Kekunci W/S atau Panah · Space Jeda · Tekan Enter untuk Mula
        </div>
      </div>
    </div>
  );
};
