/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NOTE_FREQUENCIES, NoteType } from '../types/game';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;
  private tempo: number = 124; // BPM

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.22, this.ctx.currentTime);
        this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);

        this.bgmGain.connect(this.ctx.destination);
        this.sfxGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.bgmGain && this.sfxGain) {
      const t = this.ctx.currentTime;
      this.bgmGain.gain.setValueAtTime(muted ? 0 : 0.22, t);
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.45, t);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playLaneSwitch(laneIndex: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch rises slightly with higher stave lanes
      const baseFreq = 260 + laneIndex * 35;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, t + 0.08);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Played when player passes the wall successfully!
   * Plays the exact musical pitch for G4 (392Hz), A4 (440Hz), or B4 (494Hz)
   * with bright bell/chime harmonics to teach children ear training.
   */
  public playNoteSuccess(note: NoteType) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const baseFreq = NOTE_FREQUENCIES[note] || 440;

      // Primary clear bell synth tone
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq, t);

      // Higher shimmer harmonic
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 2, t);

      // Octave sub for fullness
      const osc3 = this.ctx.createOscillator();
      const gain3 = this.ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(baseFreq / 2, t);

      gain1.gain.setValueAtTime(0.4, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      gain2.gain.setValueAtTime(0.25, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      gain3.gain.setValueAtTime(0.2, t);
      gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc1.connect(gain1);
      osc2.connect(gain2);
      osc3.connect(gain3);

      gain1.connect(this.sfxGain);
      gain2.connect(this.sfxGain);
      gain3.connect(this.sfxGain);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);

      osc1.stop(t + 0.6);
      osc2.stop(t + 0.4);
      osc3.stop(t + 0.45);
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Collision sound when player fails to match the note or hits the obstacle wall
   */
  public playCollisionSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Low sub impact boom
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);

      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.42);

      // 2. White noise punch crash
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.07));
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(800, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(150, t + 0.25);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.26);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Countdown beeps (3, 2, 1, MULA!)
   */
  public playCountdownBeep(isFinal: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isFinal ? 880 : 440, t);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.35 : 0.15));

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + (isFinal ? 0.4 : 0.2));
    } catch {
      // Audio fallback
    }
  }

  /**
   * Victory Fanfare when player completes duration
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [392, 440, 493.88, 587.33, 783.99]; // G, A, B, D, G
    const times = [0, 0.14, 0.28, 0.44, 0.62];

    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (i === notes.length - 1 ? 0.9 : 0.22));

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 1.0);
      }, times[i] * 1000);
    });
  }

  /**
   * Game Over sound
   */
  public playGameOverSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [493.88, 440, 392, 329.63]; // B4, A4, G4, E4 descending
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t);
        osc.stop(t + 0.45);
      }, idx * 160);
    });
  }

  /**
   * Procedural Synthwave BGM Loop
   * Rhythmic bassline + cyber arpeggio + drum pulse using Web Audio oscillators.
   */
  public startBGM() {
    this.initContext();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    let step = 0;
    const bassPattern = [130.81, 130.81, 146.83, 146.83, 164.81, 164.81, 196.00, 174.61]; // C, D, E, G, F bassline
    const arpNotes = [392, 440, 493.88, 587.33, 493.88, 440, 392, 329.63]; // G, A, B melodic cyber pattern

    const stepDuration = 60 / this.tempo / 2; // 16th notes / 8th notes

    const tickBGM = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

      const t = this.ctx.currentTime;

      // 1. Bassline hit every 2 steps
      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const bassFreq = bassPattern[(step / 2) % bassPattern.length] / 2;

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, t);
        filter.frequency.exponentialRampToValueAtTime(180, t + stepDuration * 1.5);

        bassGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.7);

        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(t);
        bassOsc.stop(t + stepDuration * 1.8);
      }

      // 2. High Cyber Arp
      const arpFreq = arpNotes[step % arpNotes.length];
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      arpOsc.type = 'triangle';
      arpOsc.frequency.setValueAtTime(arpFreq, t);

      arpGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, t);
      arpGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.9);

      arpOsc.connect(arpGain);
      arpGain.connect(this.bgmGain);
      arpOsc.start(t);
      arpOsc.stop(t + stepDuration);

      // 3. Cyber Hi-hat on every step, kick on beat 0 and 4
      if (step % 4 === 0) {
        // Kick
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(140, t);
        kickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.12);
        kickGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.15);
      }

      step++;
    };

    this.bgmIntervalId = window.setInterval(tickBGM, stepDuration * 1000);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public dispose() {
    this.stopBGM();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const soundEngine = new AudioEngine();
