/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { soundEngine } from '../audio/audioEngine';
import {
  ActiveWall,
  AvatarId,
  CameraMode,
  DIFFICULTY_CONFIG,
  Difficulty,
  LANES,
  NOTE_TARGET_LANES,
  NoteType,
} from '../types/game';
import {
  ArticulatedAvatar,
  createAvatar,
  updateAvatarAnimation,
  disposeAvatar,
} from './AvatarBuilder';

export interface SceneCallbacks {
  onScoreUpdate: (score: number, change: number, position: { x: number; y: number }) => void;
  onLivesUpdate: (lives: number) => void;
  onLaneChange: (laneIndex: number) => void;
  onWallSpawn: (wall: ActiveWall) => void;
  onWallPassed: (note: NoteType, combo: number) => void;
  onWallHit: (note: NoteType) => void;
  onGameOver: (reason: 'lives' | 'timeout') => void;
  onUpcomingWallUpdate: (wall: ActiveWall | null) => void;
}

export class MusicRunnerScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private animationFrameId: number = 0;
  private isDestroyed: boolean = false;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // Game configuration & state
  private difficulty: Difficulty = 'easy';
  private gameDuration: number = 60; // seconds
  private timeRemaining: number = 60;
  private score: number = 0;
  private lives: number = 3;
  private combo: number = 0;
  private highestCombo: number = 0;
  private currentLaneIndex: number = 3; // Starts at Space 2 (Not A)
  private targetLaneIndex: number = 3;
  private callbacks: SceneCallbacks;

  // Camera settings
  private cameraMode: CameraMode = 'subway';
  private cameraShakeIntensity: number = 0;

  // Scene objects & Avatar
  private playerGroup: THREE.Group = new THREE.Group();
  private currentAvatar: ArticulatedAvatar | null = null;
  private currentAvatarId: AvatarId = 'cyber-runner';
  private runCycleTime: number = 0;
  private laneMarkerRing: THREE.Mesh | null = null;
  private laneBeam: THREE.Mesh | null = null;
  private staffLinesGroup: THREE.Group = new THREE.Group();
  private trebleClefGroup: THREE.Group = new THREE.Group();
  private activeWalls: ActiveWall[] = [];
  private wallMeshPool: THREE.Group[] = [];
  private nextWallId: number = 1;
  private timeSinceLastWall: number = 0;
  private particlesGroup: THREE.Group = new THREE.Group();
  private particlePool: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number }[] = [];

  // Track & background speed
  private runSpeed: number = 12.0;
  private staffPulseOffset: number = 0;
  private beatBarsGroup: THREE.Group = new THREE.Group();

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Detect software WebGL safely
    const isSoftwareGl = (() => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Setup renderer with fallback guard
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch (err) {
      console.warn('Primary WebGL initialization failed, attempting standard fallback:', err);
      this.renderer = new THREE.WebGLRenderer({ alpha: false });
    }

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Fog (Neon dark synthwave atmosphere)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060814);
    this.scene.fog = new THREE.FogExp2(0x060814, 0.015);

    // 4. Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 300);
    this.updateCameraTransform(0);

    // 5. RoomEnvironment for crisp metallic & neon reflections
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback
    }

    // 6. Lighting
    this.setupLighting();

    // 7. Build Environment & Staff Runway
    this.buildCyberBackground();
    this.buildMusicalStaff();
    this.buildTrebleClef();
    this.buildPlayerAvatar();
    this.setupParticles();

    // 8. Event listeners
    window.addEventListener('resize', this.onWindowResize);

    // Pre-warm shaders
    if (!isSoftwareGl) {
      try {
        this.renderer.compile(this.scene, this.camera);
      } catch {
        // silent
      }
    }

    // Start render loop
    this.animate();
  }

  private setupLighting() {
    // Ambient / Hemisphere
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.85);
    this.scene.add(hemiLight);

    // Directional Key Light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(-15, 20, 25);
    this.scene.add(dirLight);

    // Neon Rim / Accent lights
    const cyanLight = new THREE.PointLight(0x06b6d4, 2.5, 50);
    cyanLight.position.set(0, 5, 5);
    this.scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xd946ef, 2.2, 50);
    magentaLight.position.set(20, -5, -10);
    this.scene.add(magentaLight);
  }

  /**
   * Builds the 5 musical stave lines and 4 space lanes.
   * Stave lines run along X from X = -12 to X = +90.
   * Y values correspond to LANES 0 through 8:
   * Lane 0: Line 1 (Y = -2.4)
   * Lane 1: Space 1 (Y = -1.8)
   * Lane 2: Line 2 (Y = -1.2) -> Target Note G
   * Lane 3: Space 2 (Y = -0.6) -> Target Note A
   * Lane 4: Line 3 (Y = 0.0)  -> Target Note B
   * Lane 5: Space 3 (Y = +0.6)
   * Lane 6: Line 4 (Y = +1.2)
   * Lane 7: Space 4 (Y = +1.8)
   * Lane 8: Line 5 (Y = +2.4)
   */
  private buildMusicalStaff() {
    this.staffLinesGroup = new THREE.Group();

    // 5 Glowing Stave Rails (Lines 1 to 5)
    const lineIndices = [0, 2, 4, 6, 8];
    const railGeometry = new THREE.CylinderGeometry(0.045, 0.045, 110, 16);
    railGeometry.rotateZ(Math.PI / 2); // align along X axis

    lineIndices.forEach((laneIdx) => {
      const lane = LANES[laneIdx];
      const y = lane.yOffset * 1.2;

      // Special bright neon coloring for Target lines: Line 2 (G) and Line 3 (B)
      let emissiveColor = 0x38bdf8; // electric cyan for standard lines
      let emissiveIntensity = 1.0;

      if (laneIdx === 2) {
        // Line 2: Note G
        emissiveColor = 0x10b981; // emerald
        emissiveIntensity = 1.6;
      } else if (laneIdx === 4) {
        // Line 3: Note B
        emissiveColor = 0xf59e0b; // amber
        emissiveIntensity = 1.6;
      }

      const railMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: emissiveColor,
        emissiveIntensity: emissiveIntensity,
        metalness: 0.8,
        roughness: 0.2,
      });

      const rail = new THREE.Mesh(railGeometry, railMaterial);
      rail.position.set(40, y, 0);
      this.staffLinesGroup.add(rail);

      // Subtle glowing halo beam along each line
      const glowGeo = new THREE.PlaneGeometry(110, 0.22);
      glowGeo.rotateZ(0);
      const glowMat = new THREE.MeshBasicMaterial({
        color: emissiveColor,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(40, y, 0);
      glow.rotation.x = Math.PI / 2;
      this.staffLinesGroup.add(glow);
    });

    // 4 Space Track Beams (subtle cyber lanes between lines)
    const spaceIndices = [1, 3, 5, 7];
    spaceIndices.forEach((spaceIdx) => {
      const lane = LANES[spaceIdx];
      const y = lane.yOffset * 1.2;
      const isTargetA = spaceIdx === 3; // Ruang 2 = Not A

      const spacePlaneGeo = new THREE.PlaneGeometry(110, 0.52);
      const spaceMat = new THREE.MeshBasicMaterial({
        color: isTargetA ? 0x06b6d4 : 0x1e1b4b,
        transparent: true,
        opacity: isTargetA ? 0.16 : 0.05,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const spaceMesh = new THREE.Mesh(spacePlaneGeo, spaceMat);
      spaceMesh.position.set(40, y, -0.05);
      this.staffLinesGroup.add(spaceMesh);
    });

    // Vertical Measure Bar lines (garisan bar baluk) that scroll across
    this.beatBarsGroup = new THREE.Group();
    const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 5.2, 8);
    const barMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1,
    });

    for (let i = 0; i < 12; i++) {
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(i * 12 - 10, 0, 0);
      this.beatBarsGroup.add(bar);
    }
    this.staffLinesGroup.add(this.beatBarsGroup);

    this.scene.add(this.staffLinesGroup);
  }

  /**
   * Prominent, beautiful glowing 3D Treble Clef (𝄞)
   * Positioned at the front of the staff lines (X = -2 to 0).
   * Circling Line 2 (Garis 2) just like in standard sheet music!
   */
  private buildTrebleClef() {
    this.trebleClefGroup = new THREE.Group();

    // 1. Procedural Treble Clef Canvas Texture with neon glow
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 512, 1024);

    // Glowing Treble Clef Symbol
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 35;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 820px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('𝄞', 256, 520);

    // Colored accent rim
    ctx.shadowColor = '#10b981'; // green accent on Line 2 loop
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 14;
    ctx.strokeText('𝄞', 256, 520);

    const clefTexture = new THREE.CanvasTexture(canvas);
    clefTexture.colorSpace = THREE.SRGBColorSpace;

    // Clef plane placed right across the stave lines
    const clefPlaneGeo = new THREE.PlaneGeometry(3.6, 7.2);
    const clefMat = new THREE.MeshBasicMaterial({
      map: clefTexture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const clefMesh = new THREE.Mesh(clefPlaneGeo, clefMat);
    // Align clef so that its central loop specifically sits over Line 2 (y = -1.2)
    clefMesh.position.set(-1.8, 0.1, 0.15);
    this.trebleClefGroup.add(clefMesh);

    // Add back reflection layer for 3D fullness
    const backClefMesh = clefMesh.clone();
    backClefMesh.position.set(-1.8, 0.1, -0.15);
    this.trebleClefGroup.add(backClefMesh);

    // 3D glowing base ring for clef grounding
    const ringGeo = new THREE.TorusGeometry(0.8, 0.06, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.8,
    });
    const clefRing = new THREE.Mesh(ringGeo, ringMat);
    clefRing.position.set(-1.8, -1.2, 0); // At Garis 2 (G)
    this.trebleClefGroup.add(clefRing);

    this.scene.add(this.trebleClefGroup);
  }

  /**
   * Procedural Composite Player Avatar ("Beats Runner")
   * 3-12 parts: Core body, visor, headphones, jet hover boots, audio wings,
   * plus a precision lane indicator ring and beam so the player clearly knows
   * which line or space they are currently positioned on!
   */
  private buildPlayerAvatar() {
    this.playerGroup = new THREE.Group();

    // 1. Precision Lane Indicator Ring & Alignment Beam
    // Shows EXACTLY which line or space the avatar is resting on!
    const ringGeo = new THREE.RingGeometry(0.5, 0.65, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.laneMarkerRing = new THREE.Mesh(ringGeo, ringMat);
    this.laneMarkerRing.position.set(0, -0.5, 0);
    this.playerGroup.add(this.laneMarkerRing);

    // Horizontal alignment laser pointer across the stave
    const beamGeo = new THREE.CylinderGeometry(0.02, 0.02, 6, 8);
    beamGeo.rotateZ(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    this.laneBeam = new THREE.Mesh(beamGeo, beamMat);
    this.laneBeam.position.set(2, 0, 0);
    this.playerGroup.add(this.laneBeam);

    // 2. Build initial articulated avatar
    this.setAvatar(this.currentAvatarId);

    // Initial player position
    this.playerGroup.position.set(0, LANES[this.currentLaneIndex].yOffset * 1.2, 0);
    this.scene.add(this.playerGroup);
  }

  /**
   * Sets and renders the chosen avatar with distinct procedural 3D model
   */
  public setAvatar(avatarId: AvatarId) {
    if (this.currentAvatar) {
      this.playerGroup.remove(this.currentAvatar.rootGroup);
      disposeAvatar(this.currentAvatar);
      this.currentAvatar = null;
    }

    this.currentAvatarId = avatarId;
    this.currentAvatar = createAvatar(avatarId);
    this.playerGroup.add(this.currentAvatar.rootGroup);

    this.updatePlayerLaneVisuals();
  }

  public getAvatarId(): AvatarId {
    return this.currentAvatarId;
  }

  /**
   * Cyber synthwave background with mountain silhouettes, neon grid, and musical particles
   */
  private buildCyberBackground() {
    // 1. Cyber Grid Floor
    const gridHelper = new THREE.GridHelper(180, 45, 0xd946ef, 0x1e1b4b);
    gridHelper.position.set(40, -5, 0);
    this.scene.add(gridHelper);

    // 2. Horizon Neon Sun / Light disc
    const sunGeo = new THREE.CircleGeometry(22, 32);
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 256;
    sunCanvas.height = 256;
    const sctx = sunCanvas.getContext('2d')!;
    const grad = sctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#f43f5e');
    grad.addColorStop(0.5, '#fb923c');
    grad.addColorStop(1, '#a855f7');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 256, 256);

    // Striped sun lines
    sctx.fillStyle = '#060814';
    for (let i = 120; i < 256; i += 16) {
      sctx.fillRect(0, i, 256, (i - 100) * 0.08);
    }

    const sunTexture = new THREE.CanvasTexture(sunCanvas);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture,
      transparent: true,
      opacity: 0.65,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(90, 8, -35);
    sunMesh.rotation.y = -Math.PI / 6;
    this.scene.add(sunMesh);

    // 3. Floating Musical Note Constellation Particles
    const noteCount = 120;
    const noteGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(noteCount * 3);
    for (let i = 0; i < noteCount; i++) {
      pos[i * 3] = (Math.random() - 0.2) * 120;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    noteGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const notePointsMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.6,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const notePoints = new THREE.Points(noteGeo, notePointsMat);
    this.scene.add(notePoints);
  }

  /**
   * Particle burst system for correct note passes and obstacle hits
   */
  private setupParticles() {
    this.particlesGroup = new THREE.Group();
    const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);

    for (let i = 0; i < 90; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.visible = false;
      this.particlesGroup.add(mesh);
      this.particlePool.push({
        mesh,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
      });
    }
    this.scene.add(this.particlesGroup);
  }

  public triggerParticleBurst(origin: THREE.Vector3, colorHex: number, count: number = 24) {
    let spawned = 0;
    for (const p of this.particlePool) {
      if (p.life <= 0 && spawned < count) {
        p.mesh.position.copy(origin);
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1;
        p.mesh.visible = true;

        p.vel.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.3) * 14,
          (Math.random() - 0.5) * 12
        );
        p.maxLife = 0.5 + Math.random() * 0.4;
        p.life = p.maxLife;

        spawned++;
      }
    }
  }

  /**
   * Creates a solid full obstacle wall with high-contrast note diagram
   * G, A, or B randomly chosen.
   */
  private createObstacleWallMesh(note: NoteType): THREE.Group {
    const wallGroup = new THREE.Group();

    // Solid tall cyber wall spanning all 9 lanes (Y from -3.6 to +3.6, Z from -3.2 to +3.2)
    const wallWidth = 0.6; // along X
    const wallHeight = 7.5; // along Y
    const wallDepth = 6.4; // along Z

    const wallBoxGeo = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);

    // Wall frame material
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.3,
      metalness: 0.9,
    });
    const wallBody = new THREE.Mesh(wallBoxGeo, frameMat);
    wallGroup.add(wallBody);

    // Glowing energy edges
    const edgeGeo = new THREE.EdgesGeometry(wallBoxGeo);
    const edgeColor = note === 'G' ? 0x10b981 : note === 'A' ? 0x06b6d4 : 0xf59e0b;
    const edgeMat = new THREE.LineBasicMaterial({
      color: edgeColor,
      linewidth: 2,
    });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    wallGroup.add(edgeLines);

    // Holographic Display Texture on the front face (facing towards player at -X)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // 1. Dark tech background with cyber grid
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let x = 0; x < 512; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y < 512; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Border glow
    const noteColorStr = note === 'G' ? '#10b981' : note === 'A' ? '#06b6d4' : '#f59e0b';
    ctx.strokeStyle = noteColorStr;
    ctx.lineWidth = 12;
    ctx.strokeRect(10, 10, 492, 492);

    // 2. Heading
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HALANGAN TEMBOK NOT', 256, 55);

    // 3. Huge Glowing Note Letter
    ctx.shadowColor = noteColorStr;
    ctx.shadowBlur = 30;
    ctx.fillStyle = noteColorStr;
    ctx.font = '900 135px sans-serif';
    ctx.fillText(`NOT ${note}`, 256, 175);

    // 4. Stave Diagram showing exact note on staff!
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#090e1a';
    ctx.fillRect(40, 225, 432, 190);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 225, 432, 190);

    // Draw 5 mini stave lines inside the box
    const staffYBase = 255;
    const lineGap = 30;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;

    for (let i = 0; i < 5; i++) {
      const ly = staffYBase + i * lineGap;
      ctx.beginPath();
      ctx.moveTo(60, ly);
      ctx.lineTo(450, ly);
      ctx.stroke();
    }

    // Draw Treble Clef in diagram
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 100px serif';
    ctx.textAlign = 'left';
    ctx.fillText('𝄞', 70, staffYBase + 3 * lineGap + 10);

    // Draw the target Notehead (G, A, or B)
    // Remember: Line 5 is top (index 0 here), Line 1 is bottom (index 4 here)
    // Line 1: y = 255 + 4*30 = 375 (E)
    // Ruang 1: y = 360 (F)
    // Line 2: y = 255 + 3*30 = 345 (G) -> Garis 2!
    // Ruang 2: y = 330 (A) -> Ruang 2!
    // Line 3: y = 255 + 2*30 = 315 (B) -> Garis 3!
    let noteHeadY = 345;
    let noteLabelText = 'Garis 2';

    if (note === 'G') {
      noteHeadY = staffYBase + 3 * lineGap; // 345
      noteLabelText = 'Garis 2 (Not G)';
    } else if (note === 'A') {
      noteHeadY = staffYBase + 2.5 * lineGap; // 330
      noteLabelText = 'Ruang 2 (Not A)';
    } else if (note === 'B') {
      noteHeadY = staffYBase + 2 * lineGap; // 315
      noteLabelText = 'Garis 3 (Not B)';
    }

    // Draw notehead
    ctx.shadowColor = noteColorStr;
    ctx.shadowBlur = 20;
    ctx.fillStyle = noteColorStr;
    ctx.beginPath();
    ctx.ellipse(320, noteHeadY, 18, 13, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // Note stem
    ctx.lineWidth = 4;
    ctx.strokeStyle = noteColorStr;
    ctx.beginPath();
    ctx.moveTo(336, noteHeadY);
    ctx.lineTo(336, noteHeadY - 55);
    ctx.stroke();

    // Subtitle instruction
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Pilih: ${noteLabelText}`, 256, 470);

    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;

    // Display plane mounted on the front face of the wall
    const displayGeo = new THREE.PlaneGeometry(wallDepth * 0.95, wallHeight * 0.95);
    displayGeo.rotateY(-Math.PI / 2); // Facing negative X (towards player)
    const displayMat = new THREE.MeshBasicMaterial({
      map: canvasTexture,
      transparent: false,
    });
    const displayMesh = new THREE.Mesh(displayGeo, displayMat);
    displayMesh.position.set(-wallWidth / 2 - 0.02, 0, 0);
    wallGroup.add(displayMesh);

    // Also mount back face display for 360 degree cleanliness
    const backDisplayGeo = new THREE.PlaneGeometry(wallDepth * 0.95, wallHeight * 0.95);
    backDisplayGeo.rotateY(Math.PI / 2);
    const backDisplayMesh = new THREE.Mesh(backDisplayGeo, displayMat);
    backDisplayMesh.position.set(wallWidth / 2 + 0.02, 0, 0);
    wallGroup.add(backDisplayMesh);

    return wallGroup;
  }

  /**
   * Spawns a new random obstacle wall (G, A, or B)
   */
  private spawnObstacleWall() {
    const notes: NoteType[] = ['G', 'A', 'B'];
    const chosenNote = notes[Math.floor(Math.random() * notes.length)];
    const targetLane = NOTE_TARGET_LANES[chosenNote];

    const wallMesh = this.createObstacleWallMesh(chosenNote);
    const startX = DIFFICULTY_CONFIG[this.difficulty].wallDistance;
    wallMesh.position.set(startX, 0, 0);
    this.scene.add(wallMesh);

    const wallData: ActiveWall = {
      id: this.nextWallId++,
      note: chosenNote,
      targetLane,
      z: startX, // Using z property as position along the runway (X axis)
      mesh: wallMesh,
      passed: false,
      resolved: false,
    };

    this.activeWalls.push(wallData);
    this.callbacks.onWallSpawn(wallData);
    this.updateUpcomingWallRadar();
  }

  /**
   * Updates upcoming wall radar for HUD
   */
  private updateUpcomingWallRadar() {
    const upcoming = this.activeWalls.find((w) => !w.resolved && w.z > 0);
    this.callbacks.onUpcomingWallUpdate(upcoming || null);
  }

  /**
   * Player Lane Movement Controls (Swipe Up / Down or Keys)
   * 0 (bottom Line 1) to 8 (top Line 5)
   */
  public moveLaneUp() {
    if (!this.isRunning || this.isPaused) return;
    if (this.targetLaneIndex < 8) {
      this.targetLaneIndex++;
      soundEngine.playLaneSwitch(this.targetLaneIndex);
      this.updatePlayerLaneVisuals();
      this.callbacks.onLaneChange(this.targetLaneIndex);
    }
  }

  public moveLaneDown() {
    if (!this.isRunning || this.isPaused) return;
    if (this.targetLaneIndex > 0) {
      this.targetLaneIndex--;
      soundEngine.playLaneSwitch(this.targetLaneIndex);
      this.updatePlayerLaneVisuals();
      this.callbacks.onLaneChange(this.targetLaneIndex);
    }
  }

  public setLaneDirect(index: number) {
    if (!this.isRunning || this.isPaused) return;
    const clamped = Math.max(0, Math.min(8, Math.round(index)));
    if (clamped !== this.targetLaneIndex) {
      this.targetLaneIndex = clamped;
      soundEngine.playLaneSwitch(this.targetLaneIndex);
      this.updatePlayerLaneVisuals();
      this.callbacks.onLaneChange(this.targetLaneIndex);
    }
  }

  private updatePlayerLaneVisuals() {
    const lane = LANES[this.targetLaneIndex];
    if (this.laneMarkerRing && this.laneBeam) {
      let colorHex = 0x64748b;
      if (this.targetLaneIndex === 2) colorHex = 0x10b981; // G
      else if (this.targetLaneIndex === 3) colorHex = 0x06b6d4; // A
      else if (this.targetLaneIndex === 4) colorHex = 0xf59e0b; // B

      (this.laneMarkerRing.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
      (this.laneBeam.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
    }
  }

  /**
   * Start / Restart Game with chosen difficulty & duration
   */
  public startGame(difficulty: Difficulty, duration: number) {
    this.difficulty = difficulty;
    this.gameDuration = duration;
    this.timeRemaining = duration;
    this.runSpeed = DIFFICULTY_CONFIG[difficulty].speed;

    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.highestCombo = 0;
    this.targetLaneIndex = 3; // Space 2 (Not A)
    this.currentLaneIndex = 3;
    this.timeSinceLastWall = 0;

    // Clear existing walls
    for (const w of this.activeWalls) {
      if (w.mesh) this.scene.remove(w.mesh);
    }
    this.activeWalls = [];

    this.updatePlayerLaneVisuals();
    this.playerGroup.position.set(0, LANES[this.currentLaneIndex].yOffset * 1.2, 0);

    this.isRunning = true;
    this.isPaused = false;
    soundEngine.startBGM();

    this.callbacks.onLaneChange(this.currentLaneIndex);
    this.callbacks.onLivesUpdate(this.lives);
    this.callbacks.onScoreUpdate(this.score, 0, { x: 0, y: 0 });

    // Spawn first wall shortly
    this.spawnObstacleWall();
  }

  public pauseGame() {
    this.isPaused = true;
    soundEngine.stopBGM();
  }

  public resumeGame() {
    this.isPaused = false;
    soundEngine.startBGM();
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
  }

  public getCameraMode(): CameraMode {
    return this.cameraMode;
  }

  private updateCameraTransform(delta: number) {
    let targetPos = new THREE.Vector3(-10, 1.2, 13);
    let lookTarget = new THREE.Vector3(12, 0, 0);

    if (this.cameraMode === 'subway') {
      // Dynamic 3D Subway Surfers perspective running along the neon stave
      targetPos.set(-8.5, 2.4, 8.5);
      lookTarget.set(16, LANES[this.targetLaneIndex].yOffset * 0.4, 0);
    } else if (this.cameraMode === 'stave') {
      // Direct side view (score sheet perspective)
      targetPos.set(1.5, 0, 14);
      lookTarget.set(1.5, 0, 0);
    } else if (this.cameraMode === 'chase') {
      // Tight dynamic over-the-shoulder chase view
      targetPos.set(-5.5, LANES[this.targetLaneIndex].yOffset * 0.8 + 1.2, 4.5);
      lookTarget.set(18, LANES[this.targetLaneIndex].yOffset * 0.8, 0);
    }

    // Smooth camera damping
    this.camera.position.lerp(targetPos, Math.min(1, delta * 5.0));

    // Decaying camera shake on collisions
    if (this.cameraShakeIntensity > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity *= Math.exp(-delta * 9.0);
    } else {
      this.cameraShakeIntensity = 0;
    }

    this.camera.lookAt(lookTarget);
  }

  /**
   * Main 60fps Animation Loop with Delta Clamping
   */
  private animate = () => {
    if (this.isDestroyed) return;

    this.animationFrameId = requestAnimationFrame(this.animate);

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05); // Delta clamping

    // Advance camera
    this.updateCameraTransform(delta);

    // 60fps Running Kinematics (animated during both Title Screen & Playing!)
    const runCadence = this.isRunning && !this.isPaused ? this.runSpeed * 0.95 : 7.5;
    this.runCycleTime += delta * runCadence;
    if (this.currentAvatar) {
      updateAvatarAnimation(this.currentAvatar, this.runCycleTime);
    }

    if (this.isRunning && !this.isPaused) {
      // 1. Timer countdown
      this.timeRemaining -= delta;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.isRunning = false;
        soundEngine.stopBGM();
        soundEngine.playVictoryFanfare();
        this.callbacks.onGameOver('timeout');
      }

      // 2. Smooth exponential damping for player lane movement
      const targetY = LANES[this.targetLaneIndex].yOffset * 1.2;
      this.playerGroup.position.y = THREE.MathUtils.damp(
        this.playerGroup.position.y,
        targetY,
        14,
        delta
      );

      // Dynamic banking tilt when changing lanes
      const bankTilt = (targetY - this.playerGroup.position.y) * 0.28;
      this.playerGroup.rotation.x = THREE.MathUtils.damp(
        this.playerGroup.rotation.x,
        bankTilt,
        12,
        delta
      );

      // 3. Scroll measure bar lines for running sensation
      this.staffPulseOffset += delta * this.runSpeed;
      this.beatBarsGroup.children.forEach((bar, idx) => {
        let newX = ((bar.position.x - delta * this.runSpeed + 20) % 130) - 20;
        bar.position.x = newX;
      });

      // 4. Spawn obstacle walls based on interval
      this.timeSinceLastWall += delta;
      const spawnInterval = DIFFICULTY_CONFIG[this.difficulty].spawnInterval;
      if (this.timeSinceLastWall >= spawnInterval) {
        this.timeSinceLastWall = 0;
        this.spawnObstacleWall();
      }

      // 5. Update active obstacle walls
      for (let i = this.activeWalls.length - 1; i >= 0; i--) {
        const wall = this.activeWalls[i];
        wall.z -= delta * this.runSpeed; // moving towards player (X <= 0)

        if (wall.mesh) {
          wall.mesh.position.x = wall.z;

          // Pulse glow effect as wall approaches
          const dist = Math.abs(wall.z);
          if (dist < 15 && wall.mesh.children[1]) {
            const edgeMat = (wall.mesh.children[1] as THREE.LineSegments).material as THREE.LineBasicMaterial;
            edgeMat.linewidth = 3;
          }
        }

        // Check Collision / Passing trigger at X = 0 (Player position)
        if (!wall.resolved && wall.z <= 0.6) {
          wall.resolved = true;
          this.resolveWallEncounter(wall);
        }

        // Remove walls that moved far past player
        if (wall.z < -18) {
          if (wall.mesh) this.scene.remove(wall.mesh);
          this.activeWalls.splice(i, 1);
          this.updateUpcomingWallRadar();
        }
      }

      // 6. Update particles
      for (const p of this.particlePool) {
        if (p.life > 0) {
          p.life -= delta;
          p.mesh.position.addScaledVector(p.vel, delta);
          p.vel.y -= delta * 9.8; // gravity
          const alpha = p.life / p.maxLife;
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = alpha;
          if (p.life <= 0) {
            p.mesh.visible = false;
          }
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Wall Encounter Resolution
   * Check if player current lane matches target note lane!
   */
  private resolveWallEncounter(wall: ActiveWall) {
    const isCorrect = this.targetLaneIndex === wall.targetLane;

    if (isCorrect) {
      // SUCCESS! PASSED THE WALL!
      wall.passed = true;
      this.combo++;
      if (this.combo > this.highestCombo) this.highestCombo = this.combo;

      const pointsGained = 5;
      this.score += pointsGained;

      // Play exact note audio pitch (G4, A4, or B4)
      soundEngine.playNoteSuccess(wall.note);

      // Trigger vibrant particle celebration
      const noteColorHex = wall.note === 'G' ? 0x10b981 : wall.note === 'A' ? 0x06b6d4 : 0xf59e0b;
      this.triggerParticleBurst(
        new THREE.Vector3(0, LANES[this.targetLaneIndex].yOffset * 1.2, 0),
        noteColorHex,
        32
      );

      // Flash wall green & fade
      if (wall.mesh) {
        wall.mesh.position.y += 0.4;
      }

      this.callbacks.onWallPassed(wall.note, this.combo);
      this.callbacks.onScoreUpdate(this.score, pointsGained, { x: 0, y: 0 });
    } else {
      // COLLISION! WRONG LANE!
      wall.passed = false;
      this.combo = 0;
      this.lives--;

      // Minus 10 points (floor at 0)
      const pointsLost = Math.min(this.score, 10);
      this.score = Math.max(0, this.score - 10);

      // Sound effect "terlanggar sesuatu"
      soundEngine.playCollisionSound();

      // Screen shake
      this.cameraShakeIntensity = 0.55;

      // Red impact sparks
      this.triggerParticleBurst(
        new THREE.Vector3(0, LANES[this.targetLaneIndex].yOffset * 1.2, 0),
        0xef4444,
        28
      );

      this.callbacks.onWallHit(wall.note);
      this.callbacks.onLivesUpdate(this.lives);
      this.callbacks.onScoreUpdate(this.score, -pointsLost, { x: 0, y: 0 });

      // Check Game Over by lives
      if (this.lives <= 0) {
        this.isRunning = false;
        soundEngine.stopBGM();
        soundEngine.playGameOverSound();
        this.callbacks.onGameOver('lives');
      }
    }

    this.updateUpcomingWallRadar();
  }

  private onWindowResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public getCurrentStats() {
    return {
      score: this.score,
      lives: this.lives,
      timeRemaining: Math.ceil(this.timeRemaining),
      combo: this.combo,
      highestCombo: this.highestCombo,
      currentLane: this.targetLaneIndex,
    };
  }

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onWindowResize);

    soundEngine.stopBGM();

    // Clean up Three.js objects
    if (this.currentAvatar) {
      disposeAvatar(this.currentAvatar);
      this.currentAvatar = null;
    }

    for (const wall of this.activeWalls) {
      if (wall.mesh) this.scene.remove(wall.mesh);
    }
    this.activeWalls = [];

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
