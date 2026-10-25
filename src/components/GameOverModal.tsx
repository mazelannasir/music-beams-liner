/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, AlertTriangle, RotateCcw, Home, Sparkles } from 'lucide-react';
import { AVATAR_OPTIONS, AvatarId, Difficulty, DurationOption } from '../types/game';

interface GameOverModalProps {
  isOpen: boolean;
  reason: 'lives' | 'timeout';
  score: number;
  highestCombo: number;
  wallsPassed: number;
  difficulty: Difficulty;
  duration: DurationOption;
  selectedAvatar?: AvatarId;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  reason,
  score,
  highestCombo,
  wallsPassed,
  difficulty,
  duration,
  selectedAvatar,
  onRestart,
  onHome,
}) => {
  const isVictory = reason === 'timeout';
  const avatarData = AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  useEffect(() => {
    if (isOpen && isVictory) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#f59e0b', '#d946ef'],
        });
      } catch {
        // silent
      }
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-center text-slate-100 relative overflow-hidden">
        {/* Glow Header Accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${
            isVictory ? 'from-emerald-400 via-cyan-400 to-amber-400' : 'from-rose-500 to-amber-500'
          }`}
        />

        {/* Status Badge & Icon */}
        <div className="flex justify-center mb-4">
          {isVictory ? (
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
              <AlertTriangle className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black tracking-tight text-white mb-1">
          {isVictory ? 'TAHNIAH! LARIAN SELESAI!' : 'PERMAINAN TAMAT!'}
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          {isVictory
            ? `Hebat! Anda berjaya bertahan selama ${duration / 60} minit dengan jayanya!`
            : 'Nyawa anda telah habis terlanggar tembok. Jangan berputus asa, cuba lagi!'}
        </p>

        {/* Selected Avatar Info */}
        <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/70 border border-slate-800 text-xs font-semibold text-slate-300">
          <span>Watak Pelari:</span>
          <span className="font-bold flex items-center gap-1" style={{ color: avatarData.primaryColor }}>
            {avatarData.badge}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Final Score */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">
              Skor Keseluruhan
            </span>
            <span className="text-3xl sm:text-4xl font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mt-1">
              {score}
            </span>
          </div>

          {/* Walls Passed */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">
              Tembok Dilepasi
            </span>
            <span className="text-3xl sm:text-4xl font-black tabular-nums text-emerald-400 mt-1">
              {wallsPassed}
            </span>
          </div>

          {/* Highest Combo */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">
              Kombo Tertinggi
            </span>
            <span className="text-2xl sm:text-3xl font-black tabular-nums text-amber-400 mt-1">
              {highestCombo}x
            </span>
          </div>

          {/* Level Info */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">
              Tahap & Masa
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-200 mt-2 capitalize">
              {difficulty} · {duration / 60}m
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer text-base"
          >
            <RotateCcw className="w-5 h-5" /> Main Semula
          </button>

          <button
            onClick={onHome}
            className="flex-1 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer text-base"
          >
            <Home className="w-5 h-5 text-cyan-400" /> Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};
