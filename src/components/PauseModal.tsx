/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Home, BookOpen } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenGuide: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onHome,
  onOpenGuide,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-center text-slate-100">
        <h2 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-2">
          PERMAINAN DIJEDA
        </h2>
        <p className="text-sm text-slate-400 mb-6">Ambil nafas dan semak semula not sebelum meneruskan larian!</p>

        {/* Quick Reference Pill */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-6 text-xs">
          <div className="p-2 rounded bg-emerald-950/50 border border-emerald-500/30">
            <div className="font-black text-emerald-400 text-sm">NOT G</div>
            <div className="text-[11px] text-slate-300">Garis 2</div>
          </div>
          <div className="p-2 rounded bg-cyan-950/50 border border-cyan-500/30">
            <div className="font-black text-cyan-400 text-sm">NOT A</div>
            <div className="text-[11px] text-slate-300">Ruang 2</div>
          </div>
          <div className="p-2 rounded bg-amber-950/50 border border-amber-500/30">
            <div className="font-black text-amber-400 text-sm">NOT B</div>
            <div className="text-[11px] text-slate-300">Garis 3</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer text-base"
          >
            <Play className="w-5 h-5 fill-current" /> Sambung Bermain
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Mula Semula Larian
          </button>

          <button
            onClick={onOpenGuide}
            className="w-full py-2.5 px-4 bg-slate-800/60 hover:bg-slate-800 text-cyan-300 font-medium rounded-xl flex items-center justify-center gap-2 border border-slate-700/60 transition-all cursor-pointer text-xs"
          >
            <BookOpen className="w-4 h-4" /> Buka Panduan Baluk
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 px-4 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-rose-800/40 transition-all cursor-pointer text-sm mt-2"
          >
            <Home className="w-4 h-4" /> Berhenti & Ke Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};
