/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NoteType = 'G' | 'A' | 'B';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type DurationOption = 60 | 120; // in seconds

export type CameraMode = 'subway' | 'stave' | 'chase';

export type AvatarId = 'cyber-runner' | 'mecha-bot' | 'starlight' | 'tempo-dino';

export interface AvatarOption {
  id: AvatarId;
  name: string;
  theme: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  badge: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'cyber-runner',
    name: 'Cyber Beats',
    theme: 'Pecutan Gelombang Audio',
    description: 'Pelari neon dengan fon telinga DJ dan sayap frekuensi bunyi.',
    primaryColor: '#06b6d4',
    secondaryColor: '#38bdf8',
    badge: '🎧 Cyber DJ',
  },
  {
    id: 'mecha-bot',
    name: 'Mecha Melodi',
    theme: 'Robot Muzik Kuantum',
    description: 'Robot pintar dengan paparan visualizer equalizer dan kaki hidraulik.',
    primaryColor: '#10b981',
    secondaryColor: '#34d399',
    badge: '🤖 Mecha Bot',
  },
  {
    id: 'starlight',
    name: 'Bintang Vokal',
    theme: 'Bintang Pop Galaksi',
    description: 'Bintang pentas dengan sayap tenaga neon dan aura not muzik berkilau.',
    primaryColor: '#d946ef',
    secondaryColor: '#ec4899',
    badge: '⭐ Pop Star',
  },
  {
    id: 'tempo-dino',
    name: 'Tempo Dino',
    theme: 'Dino Not Prasejarah Cyber',
    description: 'Dino comel dengan duri bercahaya mengikut rentak tempo dan ekor klef trebel.',
    primaryColor: '#f59e0b',
    secondaryColor: '#fbbf24',
    badge: '🦖 Tempo Dino',
  },
];

export type GameStatus = 'title' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface LaneDefinition {
  index: number; // 0 to 8 (0 = bottom Line 1, 8 = top Line 5)
  type: 'line' | 'space';
  lineIndex?: number; // 1 to 5
  spaceIndex?: number; // 1 to 4
  noteName: string; // 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F'
  isTargetNote: boolean; // true for G (2), A (3), B (4)
  labelBM: string; // e.g., "Garis 2 (G)", "Ruang 2 (A)", "Garis 3 (B)"
  yOffset: number; // 3D world Y coordinate
  color: string;
}

export const LANES: LaneDefinition[] = [
  { index: 0, type: 'line', lineIndex: 1, noteName: 'E', isTargetNote: false, labelBM: 'Garis 1 (E)', yOffset: -2.0, color: '#64748b' },
  { index: 1, type: 'space', spaceIndex: 1, noteName: 'F', isTargetNote: false, labelBM: 'Ruang 1 (F)', yOffset: -1.5, color: '#64748b' },
  { index: 2, type: 'line', lineIndex: 2, noteName: 'G', isTargetNote: true, labelBM: 'Garis 2 (Not G)', yOffset: -1.0, color: '#10b981' }, // EMERALD
  { index: 3, type: 'space', spaceIndex: 2, noteName: 'A', isTargetNote: true, labelBM: 'Ruang 2 (Not A)', yOffset: -0.5, color: '#06b6d4' }, // CYAN
  { index: 4, type: 'line', lineIndex: 3, noteName: 'B', isTargetNote: true, labelBM: 'Garis 3 (Not B)', yOffset: 0.0, color: '#f59e0b' }, // AMBER
  { index: 5, type: 'space', spaceIndex: 3, noteName: 'C', isTargetNote: false, labelBM: 'Ruang 3 (C)', yOffset: 0.5, color: '#64748b' },
  { index: 6, type: 'line', lineIndex: 4, noteName: 'D', isTargetNote: false, labelBM: 'Garis 4 (D)', yOffset: 1.0, color: '#64748b' },
  { index: 7, type: 'space', spaceIndex: 4, noteName: 'E', isTargetNote: false, labelBM: 'Ruang 4 (E)', yOffset: 1.5, color: '#64748b' },
  { index: 8, type: 'line', lineIndex: 5, noteName: 'F', isTargetNote: false, labelBM: 'Garis 5 (F)', yOffset: 2.0, color: '#64748b' },
];

export const NOTE_TARGET_LANES: Record<NoteType, number> = {
  G: 2, // Garis 2
  A: 3, // Ruang 2
  B: 4, // Garis 3
};

export const NOTE_FREQUENCIES: Record<NoteType, number> = {
  G: 392.00, // G4
  A: 440.00, // A4
  B: 493.88, // B4
};

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; speed: number; spawnInterval: number; wallDistance: number }> = {
  easy: {
    label: 'Mudah (Easy)',
    speed: 12.0,
    spawnInterval: 4.2,
    wallDistance: 75,
  },
  medium: {
    label: 'Sederhana (Medium)',
    speed: 16.5,
    spawnInterval: 3.3,
    wallDistance: 85,
  },
  hard: {
    label: 'Sukar (Hard)',
    speed: 21.0,
    spawnInterval: 2.6,
    wallDistance: 95,
  },
};

export interface ActiveWall {
  id: number;
  note: NoteType;
  targetLane: number;
  z: number;
  mesh?: any;
  passed: boolean;
  resolved: boolean;
}

export interface GameScoreState {
  score: number;
  lives: number;
  timeRemaining: number;
  combo: number;
  highestCombo: number;
  wallsEncountered: number;
  wallsPassed: number;
  wallsHit: number;
  notesPassedCount: Record<NoteType, number>;
}
