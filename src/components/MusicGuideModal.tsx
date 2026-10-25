/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Volume2, X, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../audio/audioEngine';
import { NoteType } from '../types/game';

interface MusicGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicGuideModal: React.FC<MusicGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const playSample = (note: NoteType) => {
    soundEngine.playNoteSuccess(note);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Panduan Not Muzik: G, A & B
            </h2>
            <p className="text-sm text-cyan-300">Khas untuk Baluk Klef Trebel (Treble Staff)</p>
          </div>
        </div>

        {/* Interactive Diagram of Treble Staff */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3">
            Susunan 5 Garis & 4 Ruang Baluk
          </div>

          <div className="relative py-4 px-2 select-none">
            {/* Visual 5 lines and 4 spaces */}
            {/* Line 5 (F) */}
            <div className="flex items-center gap-3 my-1">
              <span className="w-20 text-xs text-slate-400 font-mono text-right">Garis 5</span>
              <div className="flex-1 h-[2px] bg-slate-600"></div>
              <span className="w-12 text-xs text-slate-500 font-bold">F</span>
            </div>

            {/* Space 4 (E) */}
            <div className="flex items-center gap-3 my-1">
              <span className="w-20 text-xs text-slate-500 font-mono text-right">Ruang 4</span>
              <div className="flex-1 h-4 flex items-center justify-center text-[11px] text-slate-600">
                (E)
              </div>
              <span className="w-12 text-xs text-slate-500">E</span>
            </div>

            {/* Line 4 (D) */}
            <div className="flex items-center gap-3 my-1">
              <span className="w-20 text-xs text-slate-400 font-mono text-right">Garis 4</span>
              <div className="flex-1 h-[2px] bg-slate-600"></div>
              <span className="w-12 text-xs text-slate-500 font-bold">D</span>
            </div>

            {/* Space 3 (C) */}
            <div className="flex items-center gap-3 my-1">
              <span className="w-20 text-xs text-slate-500 font-mono text-right">Ruang 3</span>
              <div className="flex-1 h-4 flex items-center justify-center text-[11px] text-slate-600">
                (C)
              </div>
              <span className="w-12 text-xs text-slate-500">C</span>
            </div>

            {/* Line 3 (B) - TARGET 3 */}
            <div className="flex items-center gap-3 my-1 bg-amber-500/10 py-1 rounded px-1 border border-amber-500/40">
              <span className="w-20 text-xs text-amber-300 font-mono font-bold text-right">
                Garis 3 ⭐
              </span>
              <div className="flex-1 h-[3px] bg-amber-400 shadow-[0_0_8px_#f59e0b]"></div>
              <span className="w-12 text-xs text-amber-300 font-extrabold flex items-center gap-1">
                NOT B
              </span>
            </div>

            {/* Space 2 (A) - TARGET 2 */}
            <div className="flex items-center gap-3 my-1 bg-cyan-500/10 py-1 rounded px-1 border border-cyan-500/40">
              <span className="w-20 text-xs text-cyan-300 font-mono font-bold text-right">
                Ruang 2 ⭐
              </span>
              <div className="flex-1 h-4 flex items-center justify-center text-xs text-cyan-300 font-extrabold">
                NOT A (Di antara Garis 2 & Garis 3)
              </div>
              <span className="w-12 text-xs text-cyan-300 font-extrabold">NOT A</span>
            </div>

            {/* Line 2 (G) - TARGET 1 */}
            <div className="flex items-center gap-3 my-1 bg-emerald-500/10 py-1 rounded px-1 border border-emerald-500/40">
              <span className="w-20 text-xs text-emerald-300 font-mono font-bold text-right">
                Garis 2 ⭐
              </span>
              <div className="flex-1 h-[3px] bg-emerald-400 shadow-[0_0_8px_#10b981]"></div>
              <span className="w-12 text-xs text-emerald-300 font-extrabold">NOT G</span>
            </div>

            {/* Space 1 (F) */}
            <div className="flex items-center gap-3 my-1">
              <span className="w-20 text-xs text-slate-500 font-mono text-right">Ruang 1</span>
              <div className="flex-1 h-4 flex items-center justify-center text-[11px] text-slate-600">
                (F)
              </div>
              <span className="w-12 text-xs text-slate-500">F</span>
            </div>

            {/* Line 1 (E) */}
            <div className="flex items-center gap-3 my-1">
              <span className="w-20 text-xs text-slate-400 font-mono text-right">Garis 1</span>
              <div className="flex-1 h-[2px] bg-slate-600"></div>
              <span className="w-12 text-xs text-slate-500 font-bold">E</span>
            </div>
          </div>
        </div>

        {/* Note Cards with Audio Player */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* NOT G */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
                  Garis 2
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-bold">
                  392 Hz
                </span>
              </div>
              <h3 className="text-2xl font-black text-emerald-400 mb-1">NOT G</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Terletak di <strong>Garis ke-2</strong> dari bawah. Pusingan Klef Trebel (G-Clef)
                melingkari tepat pada garisan ini!
              </p>
            </div>
            <button
              onClick={() => playSample('G')}
              className="mt-4 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-900/50 transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Uji Bunyi Not G
            </button>
          </div>

          {/* NOT A */}
          <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">
                  Ruang 2
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 rounded font-bold">
                  440 Hz
                </span>
              </div>
              <h3 className="text-2xl font-black text-cyan-400 mb-1">NOT A</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Terletak di <strong>Ruang ke-2</strong> (ruang kosong antara Garis 2 dan Garis 3).
                Mudah diingat dalam perkataan <em>F-A-C-E</em>!
              </p>
            </div>
            <button
              onClick={() => playSample('A')}
              className="mt-4 flex items-center justify-center gap-2 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-cyan-900/50 transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Uji Bunyi Not A
            </button>
          </div>

          {/* NOT B */}
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-amber-400 tracking-wider">
                  Garis 3
                </span>
                <span className="px-2 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-bold">
                  494 Hz
                </span>
              </div>
              <h3 className="text-2xl font-black text-amber-400 mb-1">NOT B</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Terletak di <strong>Garis ke-3</strong> (garisan tengah baluk muzik). Mengikut urutan
                mnemonik <em>Every Good Boy Does Fine</em>!
              </p>
            </div>
            <button
              onClick={() => playSample('B')}
              className="mt-4 flex items-center justify-center gap-2 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-amber-900/50 transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Uji Bunyi Not B
            </button>
          </div>
        </div>

        {/* Tips Belajar */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Petua Menang Semasa Bermain:</strong>
            <p className="mt-1">
              Apabila melihat tembok halangan datang, baca nama not atau lihat rajah not pada tembok.
              Segera swipe avatar anda ke lorong yang tepat sebelum tembok tiba!
            </p>
          </div>
        </div>

        {/* Close CTA */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
          >
            Faham & Kembali Bermain
          </button>
        </div>
      </div>
    </div>
  );
};
