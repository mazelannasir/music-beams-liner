/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MusicRunnerScene } from './three/MusicRunnerScene';
import { soundEngine } from './audio/audioEngine';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { MusicGuideModal } from './components/MusicGuideModal';
import {
  ActiveWall,
  AvatarId,
  CameraMode,
  Difficulty,
  DurationOption,
  GameStatus,
  NoteType,
} from './types/game';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MusicRunnerScene | null>(null);

  // Game Flow State
  const [gameStatus, setGameStatus] = useState<GameStatus>('title');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [duration, setDuration] = useState<DurationOption>(60);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('cyber-runner');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // HUD Dynamic Stats
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [combo, setCombo] = useState<number>(0);
  const [highestCombo, setHighestCombo] = useState<number>(0);
  const [wallsPassed, setWallsPassed] = useState<number>(0);
  const [currentLaneIndex, setCurrentLaneIndex] = useState<number>(3);
  const [upcomingWall, setUpcomingWall] = useState<ActiveWall | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('subway');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<'lives' | 'timeout'>('timeout');

  // Animated Score Floater
  const [scorePopup, setScorePopup] = useState<{ text: string; isPositive: boolean; key: number } | null>(
    null
  );

  const [webglError, setWebglError] = useState<string | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const scene = new MusicRunnerScene(containerRef.current, {
        onScoreUpdate: (newScore, delta, _pos) => {
          setScore(newScore);
          if (delta !== 0) {
            setScorePopup({
              text: delta > 0 ? `+${delta}` : `${delta}`,
              isPositive: delta > 0,
              key: Date.now(),
            });
          }
        },
        onLivesUpdate: (newLives) => {
          setLives(newLives);
        },
        onLaneChange: (laneIdx) => {
          setCurrentLaneIndex(laneIdx);
        },
        onWallSpawn: (_wall) => {
          // Wall spawned
        },
        onWallPassed: (_note: NoteType, currentCombo: number) => {
          setWallsPassed((prev) => prev + 1);
          setCombo(currentCombo);
          setHighestCombo((prev) => Math.max(prev, currentCombo));
        },
        onWallHit: (_note: NoteType) => {
          setCombo(0);
        },
        onGameOver: (reason) => {
          setGameOverReason(reason);
          setGameStatus(reason === 'timeout' ? 'victory' : 'gameover');
        },
        onUpcomingWallUpdate: (wall) => {
          setUpcomingWall(wall);
        },
      });

      sceneRef.current = scene;
      setWebglError(null);
    } catch (err: any) {
      console.error('Failed to initialize 3D scene:', err);
      setWebglError(
        err?.message ||
          'Pelayar atau peranti anda tidak dapat memulakan WebGL 3D. Sila pastikan akselerasi perkakasan (Hardware Acceleration) diaktifkan.'
      );
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, []);

  // Sync HUD timer every 250ms when playing
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      if (sceneRef.current) {
        const stats = sceneRef.current.getCurrentStats();
        setTimeRemaining(stats.timeRemaining);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [gameStatus]);

  // Actions
  const handleStartGame = useCallback(() => {
    if (!sceneRef.current) return;
    setScore(0);
    setLives(3);
    setCombo(0);
    setHighestCombo(0);
    setWallsPassed(0);
    setTimeRemaining(duration);
    setScorePopup(null);

    sceneRef.current.startGame(difficulty, duration);
    setGameStatus('playing');
  }, [difficulty, duration]);

  const handlePause = useCallback(() => {
    if (gameStatus === 'playing') {
      sceneRef.current?.pauseGame();
      setGameStatus('paused');
    }
  }, [gameStatus]);

  const handleResume = useCallback(() => {
    if (gameStatus === 'paused') {
      sceneRef.current?.resumeGame();
      setGameStatus('playing');
    }
  }, [gameStatus]);

  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  const handleHome = useCallback(() => {
    sceneRef.current?.pauseGame();
    setGameStatus('title');
  }, []);

  const handleSelectAvatar = useCallback((avatarId: AvatarId) => {
    setSelectedAvatar(avatarId);
    sceneRef.current?.setAvatar(avatarId);
    soundEngine.playNoteSuccess('G');
  }, []);

  const handleLaneUp = useCallback(() => {
    sceneRef.current?.moveLaneUp();
  }, []);

  const handleLaneDown = useCallback(() => {
    sceneRef.current?.moveLaneDown();
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  }, [isMuted]);

  const handleToggleCamera = useCallback(() => {
    if (!sceneRef.current) return;
    const modes: CameraMode[] = ['subway', 'stave', 'chase'];
    const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setCameraMode(nextMode);
    sceneRef.current.setCameraMode(nextMode);
  }, [cameraMode]);

  const handleToggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          window.open(window.location.href, '_blank');
        });
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      window.open(window.location.href, '_blank');
    }
  }, []);

  // Keyboard navigation & gestures
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (gameStatus === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleStartGame();
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (gameStatus === 'playing') handlePause();
        else if (gameStatus === 'paused') handleResume();
        return;
      }

      if (e.code === 'Escape') {
        e.preventDefault();
        if (gameStatus === 'playing') handlePause();
        else if (gameStatus === 'paused') handleHome();
        return;
      }

      if (gameStatus === 'playing') {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          handleLaneUp();
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          e.preventDefault();
          handleLaneDown();
        } else if (e.code === 'KeyC') {
          e.preventDefault();
          handleToggleCamera();
        } else if (e.code === 'KeyM') {
          e.preventDefault();
          handleToggleMute();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameStatus,
    handleStartGame,
    handlePause,
    handleResume,
    handleHome,
    handleLaneUp,
    handleLaneDown,
    handleToggleCamera,
    handleToggleMute,
  ]);

  // Swipe detection on touch screens
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameStatus !== 'playing') return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || gameStatus !== 'playing') return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Threshold for swipe
    if (Math.abs(deltaY) > 28) {
      if (deltaY < 0) {
        // Swiped UP -> Move lane up
        handleLaneUp();
      } else {
        // Swiped DOWN -> Move lane down
        handleLaneDown();
      }
    }
    touchStartY.current = null;
  };

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden bg-slate-950 font-sans select-none"
      onClick={() => {
        // Ensure iframe captures focus immediately when clicked inside Google Sites
        window.focus();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* WebGL Not Supported Fallback Screen (Prevents Blank Screen) */}
      {webglError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 text-slate-100 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-3xl">
              🎮
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              Sokongan Grafik 3D Diperlukan
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              Permainan 3D ini memerlukan pemecut perkakasan (WebGL). Sila pastikan pelayar anda menyokong WebGL atau buka melalui pelayar Chrome/Edge/Firefox pada komputer atau telefon pintar anda.
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-6 font-mono text-xs text-amber-300/90 text-left">
              {webglError}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Cuba Muat Semula Halaman
            </button>
          </div>
        </div>
      )}

      {/* Title Screen Overlay */}
      {!webglError && gameStatus === 'title' && (
        <TitleScreen
          difficulty={difficulty}
          duration={duration}
          selectedAvatar={selectedAvatar}
          onDifficultyChange={setDifficulty}
          onDurationChange={setDuration}
          onSelectAvatar={handleSelectAvatar}
          onStartGame={handleStartGame}
          onOpenGuide={() => setIsGuideOpen(true)}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Active Game HUD */}
      {gameStatus === 'playing' && (
        <GameHUD
          score={score}
          lives={lives}
          timeRemaining={timeRemaining}
          combo={combo}
          currentLaneIndex={currentLaneIndex}
          upcomingWall={upcomingWall}
          cameraMode={cameraMode}
          selectedAvatar={selectedAvatar}
          isMuted={isMuted}
          scorePopup={scorePopup}
          onLaneUp={handleLaneUp}
          onLaneDown={handleLaneDown}
          onRestart={handleRestart}
          onPause={handlePause}
          onHome={handleHome}
          onToggleMute={handleToggleMute}
          onToggleCamera={handleToggleCamera}
          onOpenGuide={() => setIsGuideOpen(true)}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Pause Modal */}
      <PauseModal
        isOpen={gameStatus === 'paused'}
        onResume={handleResume}
        onRestart={handleRestart}
        onHome={handleHome}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Game Over / Victory Modal */}
      <GameOverModal
        isOpen={gameStatus === 'gameover' || gameStatus === 'victory'}
        reason={gameOverReason}
        score={score}
        highestCombo={highestCombo}
        wallsPassed={wallsPassed}
        difficulty={difficulty}
        duration={duration}
        selectedAvatar={selectedAvatar}
        onRestart={handleRestart}
        onHome={handleHome}
      />

      {/* Interactive Music Guide Modal */}
      <MusicGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
