/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AvatarId } from '../types/game';

export interface ArticulatedAvatar {
  rootGroup: THREE.Group;
  torsoGroup: THREE.Group;
  headGroup: THREE.Group;
  leftLegGroup: THREE.Group;
  rightLegGroup: THREE.Group;
  leftArmGroup: THREE.Group;
  rightArmGroup: THREE.Group;
  leftKnee?: THREE.Group;
  rightKnee?: THREE.Group;
  thrusterFlames: THREE.Mesh[];
  specialPartGroup?: THREE.Group;
  avatarId: AvatarId;
  baseTorsoY: number;
}

/**
 * Creates a rich, multi-part procedural 3D articulated avatar for running animations
 */
export function createAvatar(avatarId: AvatarId): ArticulatedAvatar {
  switch (avatarId) {
    case 'mecha-bot':
      return buildMechaBot();
    case 'starlight':
      return buildStarlightVocalist();
    case 'tempo-dino':
      return buildTempoDino();
    case 'cyber-runner':
    default:
      return buildCyberRunner();
  }
}

/**
 * 1. CYBER BEATS RUNNER
 * High-speed cyber runner with DJ headphones, visor, hover thrusters, and soundwave wings.
 */
function buildCyberRunner(): ArticulatedAvatar {
  const root = new THREE.Group();
  const baseTorsoY = 0.05;

  // Torso
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = baseTorsoY;
  root.add(torsoGroup);

  // Body mesh
  const bodyGeo = new THREE.CylinderGeometry(0.2, 0.32, 0.75, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.85,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  torsoGroup.add(body);

  // Cyan chest reactor core
  const coreGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16);
  coreGeo.rotateX(Math.PI / 2);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0.18, 0.12, 0);
  torsoGroup.add(core);

  // Soundwave wings (flutter during run)
  const specialPartGroup = new THREE.Group();
  const wingGeo = new THREE.BufferGeometry();
  const wingVertices = new Float32Array([
    0, 0.15, 0,
    -0.45, 0.4, 0.45,
    -0.5, 0.0, 0.35,

    0, 0.15, 0,
    -0.45, 0.4, -0.45,
    -0.5, 0.0, -0.35,
  ]);
  wingGeo.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
  wingGeo.computeVertexNormals();
  const wingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });
  const wings = new THREE.Mesh(wingGeo, wingMat);
  specialPartGroup.add(wings);
  torsoGroup.add(specialPartGroup);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.52, 0);
  torsoGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.24, 18, 18);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.2,
    metalness: 0.9,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  headGroup.add(head);

  // Visor
  const visorGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.12, 16, 1, false, 0, Math.PI);
  visorGeo.rotateY(-Math.PI / 2);
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0.02, 0, 0);
  headGroup.add(visor);

  // DJ Headphones
  const earcupGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16);
  earcupGeo.rotateX(Math.PI / 2);
  const earcupMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.8,
  });
  const leftCup = new THREE.Mesh(earcupGeo, earcupMat);
  leftCup.position.set(0, 0, 0.26);
  headGroup.add(leftCup);

  const rightCup = new THREE.Mesh(earcupGeo, earcupMat);
  rightCup.position.set(0, 0, -0.26);
  headGroup.add(rightCup);

  const headbandGeo = new THREE.TorusGeometry(0.25, 0.03, 8, 20, Math.PI);
  headbandGeo.rotateY(Math.PI / 2);
  const headband = new THREE.Mesh(headbandGeo, earcupMat);
  headband.position.set(0, 0.05, 0);
  headGroup.add(headband);

  // Left Arm
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(0, 0.22, 0.32); // shoulder pivot
  torsoGroup.add(leftArmGroup);
  const armGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.42, 10);
  armGeo.translate(0, -0.21, 0);
  const armMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArmGroup.add(leftArm);

  // Right Arm
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0, 0.22, -0.32); // shoulder pivot
  torsoGroup.add(rightArmGroup);
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArmGroup.add(rightArm);

  // Left Leg
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(0, -0.36, 0.18); // hip pivot
  torsoGroup.add(leftLegGroup);

  const legGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.45, 10);
  legGeo.translate(0, -0.22, 0);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLegGroup.add(leftLeg);

  const bootGeo = new THREE.BoxGeometry(0.3, 0.14, 0.16);
  bootGeo.translate(0.06, -0.45, 0);
  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.6,
  });
  const leftBoot = new THREE.Mesh(bootGeo, bootMat);
  leftLegGroup.add(leftBoot);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0, -0.36, -0.18); // hip pivot
  torsoGroup.add(rightLegGroup);

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLegGroup.add(rightLeg);

  const rightBoot = new THREE.Mesh(bootGeo, bootMat);
  rightLegGroup.add(rightBoot);

  // Thruster Flames
  const thrusterFlames: THREE.Mesh[] = [];
  const flameGeo = new THREE.ConeGeometry(0.08, 0.25, 8);
  flameGeo.rotateZ(Math.PI / 2);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  const flameL = new THREE.Mesh(flameGeo, flameMat);
  flameL.position.set(-0.16, -0.45, 0);
  leftLegGroup.add(flameL);
  thrusterFlames.push(flameL);

  const flameR = new THREE.Mesh(flameGeo, flameMat);
  flameR.position.set(-0.16, -0.45, 0);
  rightLegGroup.add(flameR);
  thrusterFlames.push(flameR);

  return {
    rootGroup: root,
    torsoGroup,
    headGroup,
    leftLegGroup,
    rightLegGroup,
    leftArmGroup,
    rightArmGroup,
    thrusterFlames,
    specialPartGroup,
    avatarId: 'cyber-runner',
    baseTorsoY,
  };
}

/**
 * 2. MECHA MELODI BOT
 * Retro-futuristic music robot with equalizer chest and bouncing note antenna.
 */
function buildMechaBot(): ArticulatedAvatar {
  const root = new THREE.Group();
  const baseTorsoY = 0.05;

  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = baseTorsoY;
  root.add(torsoGroup);

  // Angular Mecha Chassis
  const bodyGeo = new THREE.BoxGeometry(0.46, 0.65, 0.44);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x064e3b,
    roughness: 0.3,
    metalness: 0.8,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  torsoGroup.add(body);

  // Equalizer Display Grid on front
  const eqCanvas = document.createElement('canvas');
  eqCanvas.width = 128;
  eqCanvas.height = 128;
  const eqCtx = eqCanvas.getContext('2d')!;
  eqCtx.fillStyle = '#022c22';
  eqCtx.fillRect(0, 0, 128, 128);
  eqCtx.fillStyle = '#10b981';
  for (let bar = 0; bar < 5; bar++) {
    const h = 20 + (bar % 3) * 25 + Math.random() * 20;
    eqCtx.fillRect(15 + bar * 22, 110 - h, 14, h);
  }
  const eqTex = new THREE.CanvasTexture(eqCanvas);
  eqTex.colorSpace = THREE.SRGBColorSpace;
  const eqGeo = new THREE.PlaneGeometry(0.34, 0.34);
  eqGeo.rotateY(-Math.PI / 2);
  const eqMat = new THREE.MeshBasicMaterial({ map: eqTex });
  const eqMesh = new THREE.Mesh(eqGeo, eqMat);
  eqMesh.position.set(0.24, 0, 0);
  torsoGroup.add(eqMesh);

  // Head Group (Cubic Robo-Head)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.48, 0);
  torsoGroup.add(headGroup);

  const headGeo = new THREE.BoxGeometry(0.38, 0.32, 0.36);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x065f46,
    metalness: 0.85,
    roughness: 0.2,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  headGroup.add(head);

  // Visor eye strip (Emerald neon)
  const eyeGeo = new THREE.PlaneGeometry(0.28, 0.1);
  eyeGeo.rotateY(-Math.PI / 2);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  eye.position.set(0.2, 0.04, 0);
  headGroup.add(eye);

  // Musical Note Antenna (♪ tip that bobs)
  const specialPartGroup = new THREE.Group();
  const mastGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
  mastGeo.translate(0, 0.15, 0);
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
  const mast = new THREE.Mesh(mastGeo, mastMat);
  specialPartGroup.add(mast);

  const noteHeadGeo = new THREE.SphereGeometry(0.07, 12, 12);
  const noteHeadMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const noteHead = new THREE.Mesh(noteHeadGeo, noteHeadMat);
  noteHead.position.set(0.05, 0.3, 0);
  specialPartGroup.add(noteHead);

  specialPartGroup.position.set(0, 0.16, 0);
  headGroup.add(specialPartGroup);

  // Speaker Shoulders
  const speakerGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
  speakerGeo.rotateX(Math.PI / 2);
  const speakerMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.5,
  });

  // Left Arm (Robotic Piston)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(0, 0.2, 0.32);
  torsoGroup.add(leftArmGroup);
  const spkL = new THREE.Mesh(speakerGeo, speakerMat);
  leftArmGroup.add(spkL);
  const armGeo = new THREE.BoxGeometry(0.12, 0.4, 0.12);
  armGeo.translate(0, -0.2, 0);
  const armMat = new THREE.MeshStandardMaterial({ color: 0x064e3b });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArmGroup.add(leftArm);

  // Right Arm
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0, 0.2, -0.32);
  torsoGroup.add(rightArmGroup);
  const spkR = new THREE.Mesh(speakerGeo, speakerMat);
  rightArmGroup.add(spkR);
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArmGroup.add(rightArm);

  // Left Leg (Hydraulic Runner)
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(0, -0.34, 0.16);
  torsoGroup.add(leftLegGroup);
  const legGeo = new THREE.BoxGeometry(0.14, 0.42, 0.14);
  legGeo.translate(0, -0.21, 0);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x047857 });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLegGroup.add(leftLeg);

  const footGeo = new THREE.BoxGeometry(0.34, 0.12, 0.18);
  footGeo.translate(0.08, -0.44, 0);
  const footMat = new THREE.MeshStandardMaterial({
    color: 0x064e3b,
    emissive: 0x10b981,
    emissiveIntensity: 0.6,
  });
  const leftFoot = new THREE.Mesh(footGeo, footMat);
  leftLegGroup.add(leftFoot);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0, -0.34, -0.16);
  torsoGroup.add(rightLegGroup);
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLegGroup.add(rightLeg);
  const rightFoot = new THREE.Mesh(footGeo, footMat);
  rightLegGroup.add(rightFoot);

  // Thruster Flames
  const thrusterFlames: THREE.Mesh[] = [];
  const flameGeo = new THREE.ConeGeometry(0.07, 0.22, 8);
  flameGeo.rotateZ(Math.PI / 2);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });

  const flameL = new THREE.Mesh(flameGeo, flameMat);
  flameL.position.set(-0.16, -0.44, 0);
  leftLegGroup.add(flameL);
  thrusterFlames.push(flameL);

  const flameR = new THREE.Mesh(flameGeo, flameMat);
  flameR.position.set(-0.16, -0.44, 0);
  rightLegGroup.add(flameR);
  thrusterFlames.push(flameR);

  return {
    rootGroup: root,
    torsoGroup,
    headGroup,
    leftLegGroup,
    rightLegGroup,
    leftArmGroup,
    rightArmGroup,
    thrusterFlames,
    specialPartGroup,
    avatarId: 'mecha-bot',
    baseTorsoY,
  };
}

/**
 * 3. STARLIGHT VOCALIST
 * Galactic idol pop star with star microphone staff, radiant energy ribbons, and roller boots.
 */
function buildStarlightVocalist(): ArticulatedAvatar {
  const root = new THREE.Group();
  const baseTorsoY = 0.05;

  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = baseTorsoY;
  root.add(torsoGroup);

  // Slim idol body
  const bodyGeo = new THREE.CylinderGeometry(0.18, 0.26, 0.72, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x4a044e,
    roughness: 0.2,
    metalness: 0.7,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  torsoGroup.add(body);

  // Glowing Star Crest on chest
  const starGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const starMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const starCrest = new THREE.Mesh(starGeo, starMat);
  starCrest.position.set(0.16, 0.15, 0);
  torsoGroup.add(starCrest);

  // Flowing energy ribbons / cape (waves behind during run)
  const specialPartGroup = new THREE.Group();
  const ribbonGeo = new THREE.PlaneGeometry(0.7, 0.35);
  ribbonGeo.rotateY(Math.PI / 2);
  const ribbonMat = new THREE.MeshBasicMaterial({
    color: 0xd946ef,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
  });
  const ribbonL = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbonL.position.set(-0.35, 0.1, 0.15);
  specialPartGroup.add(ribbonL);

  const ribbonR = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbonR.position.set(-0.35, 0.1, -0.15);
  specialPartGroup.add(ribbonR);
  torsoGroup.add(specialPartGroup);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.52, 0);
  torsoGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.23, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x701a75,
    roughness: 0.2,
    metalness: 0.8,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  headGroup.add(head);

  // Idol Visor & Microphone headset
  const visorGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16, 1, false, 0, Math.PI);
  visorGeo.rotateY(-Math.PI / 2);
  const visorMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0.02, 0.02, 0);
  headGroup.add(visor);

  // Left Arm
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(0, 0.22, 0.26);
  torsoGroup.add(leftArmGroup);
  const armGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.42, 8);
  armGeo.translate(0, -0.21, 0);
  const armMat = new THREE.MeshStandardMaterial({ color: 0x4a044e });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArmGroup.add(leftArm);

  // Right Arm (holding glowing mic staff)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0, 0.22, -0.26);
  torsoGroup.add(rightArmGroup);
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArmGroup.add(rightArm);

  // Microphone wand
  const micGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8);
  micGeo.rotateX(Math.PI / 4);
  micGeo.translate(0.12, -0.32, 0);
  const micMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const mic = new THREE.Mesh(micGeo, micMat);
  rightArmGroup.add(mic);

  // Left Leg (Roller Boots)
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(0, -0.34, 0.14);
  torsoGroup.add(leftLegGroup);
  const legGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.44, 8);
  legGeo.translate(0, -0.22, 0);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x86198f });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLegGroup.add(leftLeg);

  const bootGeo = new THREE.BoxGeometry(0.3, 0.12, 0.14);
  bootGeo.translate(0.05, -0.45, 0);
  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x4a044e,
    emissive: 0xd946ef,
    emissiveIntensity: 0.7,
  });
  const leftBoot = new THREE.Mesh(bootGeo, bootMat);
  leftLegGroup.add(leftBoot);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0, -0.34, -0.14);
  torsoGroup.add(rightLegGroup);
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLegGroup.add(rightLeg);
  const rightBoot = new THREE.Mesh(bootGeo, bootMat);
  rightLegGroup.add(rightBoot);

  // Thruster Flames
  const thrusterFlames: THREE.Mesh[] = [];
  const flameGeo = new THREE.ConeGeometry(0.07, 0.22, 8);
  flameGeo.rotateZ(Math.PI / 2);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  const flameL = new THREE.Mesh(flameGeo, flameMat);
  flameL.position.set(-0.16, -0.45, 0);
  leftLegGroup.add(flameL);
  thrusterFlames.push(flameL);

  const flameR = new THREE.Mesh(flameGeo, flameMat);
  flameR.position.set(-0.16, -0.45, 0);
  rightLegGroup.add(flameR);
  thrusterFlames.push(flameR);

  return {
    rootGroup: root,
    torsoGroup,
    headGroup,
    leftLegGroup,
    rightLegGroup,
    leftArmGroup,
    rightArmGroup,
    thrusterFlames,
    specialPartGroup,
    avatarId: 'starlight',
    baseTorsoY,
  };
}

/**
 * 4. TEMPO DINO
 * Playful cyber dinosaur runner with glowing musical dorsal spines and treble-clef tail.
 */
function buildTempoDino(): ArticulatedAvatar {
  const root = new THREE.Group();
  const baseTorsoY = 0.05;

  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = baseTorsoY;
  root.add(torsoGroup);

  // Chunky dino torso
  const bodyGeo = new THREE.SphereGeometry(0.36, 16, 16);
  bodyGeo.scale(1.2, 0.95, 0.85);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.35,
    metalness: 0.6,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  torsoGroup.add(body);

  // Amber belly plate
  const bellyGeo = new THREE.SphereGeometry(0.3, 12, 12);
  bellyGeo.scale(1.1, 0.75, 0.6);
  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
  });
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  belly.position.set(0.12, -0.1, 0);
  torsoGroup.add(belly);

  // 4 Glowing Musical Spines along back
  for (let i = 0; i < 4; i++) {
    const spineGeo = new THREE.ConeGeometry(0.08, 0.22, 6);
    spineGeo.rotateZ(-Math.PI / 4);
    const spineMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    spine.position.set(-0.18 + i * 0.12, 0.32 - i * 0.04, 0);
    torsoGroup.add(spine);
  }

  // Waggling Treble-Clef Tail
  const specialPartGroup = new THREE.Group();
  const tailBaseGeo = new THREE.CylinderGeometry(0.08, 0.16, 0.45, 8);
  tailBaseGeo.rotateZ(Math.PI / 2.5);
  tailBaseGeo.translate(-0.25, 0, 0);
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
  const tailBase = new THREE.Mesh(tailBaseGeo, tailMat);
  specialPartGroup.add(tailBase);

  // Treble Clef tip
  const tailTipGeo = new THREE.TorusGeometry(0.14, 0.035, 8, 16);
  const tailTipMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const tailTip = new THREE.Mesh(tailTipGeo, tailTipMat);
  tailTip.position.set(-0.55, 0.15, 0);
  specialPartGroup.add(tailTip);

  specialPartGroup.position.set(-0.25, -0.05, 0);
  torsoGroup.add(specialPartGroup);

  // Head Group (Chibi Dino Head with snout)
  const headGroup = new THREE.Group();
  headGroup.position.set(0.28, 0.36, 0);
  torsoGroup.add(headGroup);

  const headGeo = new THREE.BoxGeometry(0.42, 0.32, 0.32);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    metalness: 0.7,
    roughness: 0.3,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0.08, 0, 0);
  headGroup.add(head);

  // Visor eye
  const visorGeo = new THREE.PlaneGeometry(0.24, 0.09);
  visorGeo.rotateY(-Math.PI / 2);
  const visorMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0.29, 0.04, 0);
  headGroup.add(visor);

  // Dino Horn
  const hornGeo = new THREE.ConeGeometry(0.06, 0.18, 6);
  hornGeo.rotateZ(-Math.PI / 5);
  const hornMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const horn = new THREE.Mesh(hornGeo, hornMat);
  horn.position.set(0.22, 0.22, 0);
  headGroup.add(horn);

  // Left Dino Arm (Small claws pumping)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(0.2, 0.05, 0.28);
  torsoGroup.add(leftArmGroup);
  const armGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.28, 8);
  armGeo.translate(0, -0.14, 0);
  const armMat = new THREE.MeshStandardMaterial({ color: 0x92400e });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArmGroup.add(leftArm);

  // Right Dino Arm
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.2, 0.05, -0.28);
  torsoGroup.add(rightArmGroup);
  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArmGroup.add(rightArm);

  // Left Leg (Chunky Dino Runner)
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.06, -0.26, 0.22);
  torsoGroup.add(leftLegGroup);
  const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.38, 10);
  legGeo.translate(0, -0.19, 0);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLegGroup.add(leftLeg);

  const footGeo = new THREE.BoxGeometry(0.35, 0.14, 0.2);
  footGeo.translate(0.08, -0.38, 0);
  const footMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.6,
  });
  const leftFoot = new THREE.Mesh(footGeo, footMat);
  leftLegGroup.add(leftFoot);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(-0.06, -0.26, -0.22);
  torsoGroup.add(rightLegGroup);
  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLegGroup.add(rightLeg);
  const rightFoot = new THREE.Mesh(footGeo, footMat);
  rightLegGroup.add(rightFoot);

  // Thruster Flames
  const thrusterFlames: THREE.Mesh[] = [];
  const flameGeo = new THREE.ConeGeometry(0.08, 0.24, 8);
  flameGeo.rotateZ(Math.PI / 2);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });

  const flameL = new THREE.Mesh(flameGeo, flameMat);
  flameL.position.set(-0.16, -0.38, 0);
  leftLegGroup.add(flameL);
  thrusterFlames.push(flameL);

  const flameR = new THREE.Mesh(flameGeo, flameMat);
  flameR.position.set(-0.16, -0.38, 0);
  rightLegGroup.add(flameR);
  thrusterFlames.push(flameR);

  return {
    rootGroup: root,
    torsoGroup,
    headGroup,
    leftLegGroup,
    rightLegGroup,
    leftArmGroup,
    rightArmGroup,
    thrusterFlames,
    specialPartGroup,
    avatarId: 'tempo-dino',
    baseTorsoY,
  };
}

/**
 * Updates the articulated running animation:
 * Leg swing, knee flexion, arm counter-swing, torso bobbing & lean, flame pulses, and special part kinematics.
 */
export function updateAvatarAnimation(
  avatar: ArticulatedAvatar,
  runCycleTime: number,
  isMovingLane: boolean = false
) {
  // 1. Legs swinging forward and back (rotating around Z axis because avatar faces +X)
  const legSwingAmp = 0.72;
  const legSwing = Math.sin(runCycleTime) * legSwingAmp;
  avatar.leftLegGroup.rotation.z = legSwing;
  avatar.rightLegGroup.rotation.z = -legSwing;

  // 2. Arms swinging in opposite phase
  const armSwingAmp = 0.65;
  avatar.leftArmGroup.rotation.z = -legSwing * armSwingAmp;
  avatar.rightArmGroup.rotation.z = legSwing * armSwingAmp;

  // 3. Torso bobbing (vertical bounce at double frequency with each footfall)
  const bounceHeight = 0.09;
  avatar.torsoGroup.position.y =
    avatar.baseTorsoY + Math.abs(Math.sin(runCycleTime)) * bounceHeight;

  // 4. Sprinting forward lean
  avatar.torsoGroup.rotation.z = -0.14 + Math.sin(runCycleTime * 2) * 0.03;

  // 5. Head compensation (stays more level to horizon for focused runner look)
  avatar.headGroup.rotation.z = -avatar.torsoGroup.rotation.z * 0.6;

  // 6. Thruster flame pulse on push-off
  const flameScale = 0.8 + Math.abs(Math.sin(runCycleTime)) * 0.55;
  avatar.thrusterFlames.forEach((flame) => {
    flame.scale.set(flameScale, flameScale, flameScale);
  });

  // 7. Special avatar kinematics
  if (avatar.specialPartGroup) {
    if (avatar.avatarId === 'tempo-dino') {
      // Dino tail wagging happily side to side
      avatar.specialPartGroup.rotation.y = Math.sin(runCycleTime) * 0.45;
    } else if (avatar.avatarId === 'mecha-bot') {
      // Mecha antenna bouncy vibration
      avatar.specialPartGroup.rotation.z = Math.sin(runCycleTime * 2) * 0.28;
    } else if (avatar.avatarId === 'starlight') {
      // Flowing star ribbons fluttering behind in the wind
      avatar.specialPartGroup.rotation.y = Math.sin(runCycleTime + 0.8) * 0.3;
    } else if (avatar.avatarId === 'cyber-runner') {
      // Soundwave wings flutter
      avatar.specialPartGroup.rotation.y = Math.sin(runCycleTime * 2.5) * 0.2;
    }
  }
}

/**
 * Disposes of all meshes, geometries, and materials within an articulated avatar
 */
export function disposeAvatar(avatar: ArticulatedAvatar) {
  avatar.rootGroup.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    }
  });
}
