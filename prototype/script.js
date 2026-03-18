import * as THREE from 'three';
import { EffectComposer } from 'https://unpkg.com/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.164.1/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.164.1/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'https://unpkg.com/three@0.164.1/examples/jsm/postprocessing/SSAOPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.164.1/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'https://unpkg.com/three@0.164.1/examples/jsm/shaders/FXAAShader.js';

const gameEl = document.getElementById('game');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const speedEl = document.getElementById('speed');
const chakraFillEl = document.getElementById('chakraFill');
const stateLabelEl = document.getElementById('stateLabel');

if (!gameEl || !scoreEl || !timeEl || !speedEl || !chakraFillEl || !stateLabelEl) {
  throw new Error('Elementos obrigatórios da HUD não foram encontrados.');
}

if (!window.WebGLRenderingContext) {
  gameEl.innerHTML = '<p style="padding:20px;color:#fff">Seu navegador não suporta WebGL.</p>';
  throw new Error('WebGL não suportado.');
}

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x96b8ea, 45, 190);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 350);
camera.position.set(0, 8, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
gameEl.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.35, 0.88);
composer.addPass(bloomPass);
const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
ssaoPass.kernelRadius = 14;
ssaoPass.minDistance = 0.005;
ssaoPass.maxDistance = 0.09;
composer.addPass(ssaoPass);
const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.material.uniforms.resolution.value.set(1 / (window.innerWidth * renderer.getPixelRatio()), 1 / (window.innerHeight * renderer.getPixelRatio()));
composer.addPass(fxaaPass);

const hemiLight = new THREE.HemisphereLight(0xddefff, 0x30503b, 0.75);
scene.add(hemiLight);

const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.6);
keyLight.position.set(26, 30, 10);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -50;
keyLight.shadow.camera.right = 50;
keyLight.shadow.camera.top = 50;
keyLight.shadow.camera.bottom = -50;
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 140;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x6bb7ff, 0.5);
rimLight.position.set(-16, 11, -18);
scene.add(rimLight);

const sky = new THREE.Mesh(
  new THREE.SphereGeometry(280, 64, 64),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0x7bb3ff) },
      bottomColor: { value: new THREE.Color(0xe7f2ff) },
      offset: { value: 22 },
      exponent: { value: 0.75 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
  }),
);
scene.add(sky);

const world = new THREE.Group();
scene.add(world);

const sharedMaterials = {
  ground: new THREE.MeshStandardMaterial({ color: 0x4c9e44, roughness: 0.9, metalness: 0.03 }),
  dirt: new THREE.MeshStandardMaterial({ color: 0x825b37, roughness: 0.98 }),
  rock: new THREE.MeshStandardMaterial({ color: 0x788390, roughness: 0.85 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x656d7c, roughness: 0.75 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xa56a3f, roughness: 0.9 }),
  rope: new THREE.MeshStandardMaterial({ color: 0xc79a68, roughness: 0.9 }),
  spring: new THREE.MeshStandardMaterial({ color: 0xb9c2d2, metalness: 0.6, roughness: 0.28 }),
  black: new THREE.MeshStandardMaterial({ color: 0x1e2431, roughness: 0.65 }),
  orange: new THREE.MeshStandardMaterial({ color: 0xe7863a, roughness: 0.72 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xffd496, roughness: 0.76 }),
  hair: new THREE.MeshStandardMaterial({ color: 0xfed24a, roughness: 0.58 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xa8b5cf, roughness: 0.3, metalness: 0.8 }),
};

function createGroundTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  const grd = ctx.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, '#5bc955');
  grd.addColorStop(1, '#3d8c38');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 1800; i += 1) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2.4;
    ctx.fillStyle = `rgba(20, 70, 25, ${0.07 + Math.random() * 0.08})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const groundTexture = createGroundTexture();
if (groundTexture) {
  sharedMaterials.ground.map = groundTexture;
}

function createPlateau({ x, z, w, d, h }) {
  const group = new THREE.Group();
  const dirt = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), sharedMaterials.dirt);
  dirt.position.y = h * 0.5;
  dirt.castShadow = true;
  dirt.receiveShadow = true;

  const grassTop = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.6, d + 0.4), sharedMaterials.ground);
  grassTop.position.y = h + 0.28;
  grassTop.castShadow = true;
  grassTop.receiveShadow = true;

  group.position.set(x, 0, z);
  group.add(dirt, grassTop);
  world.add(group);
}

createPlateau({ x: 0, z: 0, w: 44, d: 36, h: 1.8 });
createPlateau({ x: -16, z: -19, w: 13, d: 13, h: 8 });
createPlateau({ x: 16, z: -19, w: 13, d: 13, h: 8 });
createPlateau({ x: 0, z: -37, w: 18, d: 12, h: 11 });

for (let i = 0; i < 18; i += 1) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7 + Math.random() * 1.5), sharedMaterials.rock);
  rock.position.set((Math.random() - 0.5) * 39, 0.8, (Math.random() - 0.5) * 31);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.castShadow = true;
  rock.receiveShadow = true;
  world.add(rock);
}

const bridgeGroup = new THREE.Group();
world.add(bridgeGroup);
for (let i = 0; i < 22; i += 1) {
  const t = i / 21;
  const x = THREE.MathUtils.lerp(-12.2, 12.2, t);
  const sag = Math.sin(t * Math.PI) * -2.8;
  const plank = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.2, 1.7), sharedMaterials.wood);
  plank.position.set(x, 10.4 + sag, -18);
  plank.rotation.z = Math.sin(t * Math.PI) * 0.09;
  plank.castShadow = true;
  plank.receiveShadow = true;
  bridgeGroup.add(plank);
}

function createRope(offsetZ) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-12.9, 11.8, -18 + offsetZ),
    new THREE.Vector3(-6, 10.7, -18 + offsetZ),
    new THREE.Vector3(0, 9.2, -18 + offsetZ),
    new THREE.Vector3(6, 10.7, -18 + offsetZ),
    new THREE.Vector3(12.9, 11.8, -18 + offsetZ),
  ]);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.13, 9, false), sharedMaterials.rope);
  mesh.castShadow = true;
  bridgeGroup.add(mesh);
}

createRope(1.2);
createRope(-1.2);

function createCrates(x, z, levels = 3) {
  for (let y = 0; y < levels; y += 1) {
    for (let i = 0; i < levels - y; i += 1) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), sharedMaterials.wood);
      crate.position.set(x + i * 2.06 - (levels - y - 1) * 1.03, y * 2.02 + 1.02, z + (Math.random() - 0.5) * 0.2);
      crate.castShadow = true;
      crate.receiveShadow = true;
      world.add(crate);
    }
  }
}

createCrates(-14.5, 10.5, 2);
createCrates(14.2, 10.5, 3);

const trampolines = [];
function createTrampoline(x, z, radius) {
  const group = new THREE.Group();
  const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.7, 1.2, 16), sharedMaterials.spring);
  spring.position.y = 0.65;

  const ring = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.38, radius + 0.38, 0.52, 48), sharedMaterials.orange);
  ring.position.y = 1.3;

  const center = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.43, 48), sharedMaterials.black);
  center.position.y = 1.36;

  group.position.set(x, 0, z);
  group.trampoline = { radius, bounce: 15.4 };
  group.add(spring, ring, center);
  group.children.forEach((mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });

  world.add(group);
  trampolines.push(group);
}

createTrampoline(-12, 12, 2.35);
createTrampoline(12, 12, 2.35);
createTrampoline(0, -2.5, 1.65);

const jumpParticles = [];
const jumpParticleMaterial = new THREE.MeshBasicMaterial({ color: 0x8ce0ff, transparent: true, opacity: 0.8 });
for (let i = 0; i < 40; i += 1) {
  const p = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), jumpParticleMaterial);
  p.visible = false;
  p.userData.life = 0;
  jumpParticles.push(p);
  world.add(p);
}

function emitJumpBurst(position) {
  for (const p of jumpParticles) {
    if (p.userData.life <= 0) {
      p.visible = true;
      p.position.copy(position);
      p.position.y += 0.2;
      p.userData.life = 0.5 + Math.random() * 0.4;
      p.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 3.2, 3.5 + Math.random() * 2.2, (Math.random() - 0.5) * 3.2);
    }
  }
}

function updateJumpParticles(dt) {
  for (const p of jumpParticles) {
    if (p.userData.life > 0) {
      p.userData.life -= dt;
      p.position.addScaledVector(p.userData.velocity, dt);
      p.userData.velocity.y -= 9 * dt;
      p.material.opacity = Math.max(0, p.userData.life * 1.5);
      if (p.userData.life <= 0) {
        p.visible = false;
      }
    }
  }
}

const dashTrails = [];
const dashTrailMaterial = new THREE.MeshBasicMaterial({ color: 0x85d6ff, transparent: true, opacity: 0.45 });
for (let i = 0; i < 50; i += 1) {
  const trail = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), dashTrailMaterial);
  trail.visible = false;
  trail.userData.life = 0;
  dashTrails.push(trail);
  world.add(trail);
}

function emitDashTrail(position) {
  for (const trail of dashTrails) {
    if (trail.userData.life <= 0) {
      trail.visible = true;
      trail.position.copy(position);
      trail.position.y += 0.65 + Math.random() * 0.5;
      trail.userData.life = 0.22 + Math.random() * 0.12;
      trail.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 1.2, 0.8 + Math.random(), (Math.random() - 0.5) * 1.2);
      return;
    }
  }
}

function updateDashTrails(dt) {
  for (const trail of dashTrails) {
    if (trail.userData.life > 0) {
      trail.userData.life -= dt;
      trail.position.addScaledVector(trail.userData.velocity, dt);
      trail.material.opacity = Math.max(0, trail.userData.life * 2.1);
      if (trail.userData.life <= 0) {
        trail.visible = false;
      }
    }
  }
}

const player = new THREE.Group();
world.add(player);

const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 1.32, 8, 16), sharedMaterials.black);
torso.position.y = 1.78;

const pants = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.95, 18), sharedMaterials.orange);
pants.position.y = 0.88;

const head = new THREE.Mesh(new THREE.SphereGeometry(0.57, 24, 24), sharedMaterials.skin);
head.position.y = 2.58;

const headband = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.08, 16, 32), sharedMaterials.black);
headband.position.y = 2.62;
headband.rotation.x = Math.PI / 2;
const headbandPlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.2, 0.07), sharedMaterials.metal);
headbandPlate.position.set(0, 2.62, 0.54);

const leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.78, 4, 8), sharedMaterials.orange);
leftLeg.position.set(-0.18, 0.35, 0);
const rightLeg = leftLeg.clone();
rightLeg.position.x = 0.18;

const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.72, 4, 8), sharedMaterials.black);
leftArm.position.set(-0.63, 1.68, 0);
leftArm.rotation.z = 0.2;
const rightArm = leftArm.clone();
rightArm.position.x = 0.63;
rightArm.rotation.z = -0.2;

for (let i = 0; i < 13; i += 1) {
  const spike = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.58, 7), sharedMaterials.hair);
  const angle = (i / 13) * Math.PI * 2;
  spike.position.set(Math.cos(angle) * 0.5, 3.08 + Math.sin(i * 1.7) * 0.07, Math.sin(angle) * 0.5);
  spike.rotation.x = Math.PI;
  spike.rotation.z = Math.sin(angle) * 0.5;
  spike.rotation.y = Math.cos(angle) * 0.45;
  spike.castShadow = true;
  player.add(spike);
}

player.add(torso, pants, head, headband, headbandPlate, leftLeg, rightLeg, leftArm, rightArm);
player.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});

player.position.set(0, 0, 8);

const leaves = [];
const leafGeometry = new THREE.PlaneGeometry(0.16, 0.09);
const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x67d36d, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
for (let i = 0; i < 100; i += 1) {
  const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
  leaf.position.set((Math.random() - 0.5) * 56, 8 + Math.random() * 20, (Math.random() - 0.5) * 56);
  leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  leaf.userData.speed = 1 + Math.random() * 1.8;
  leaf.userData.sway = Math.random() * Math.PI * 2;
  leaves.push(leaf);
  world.add(leaf);
}

const clouds = [];
const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xf2f7ff, roughness: 0.95, transparent: true, opacity: 0.9 });
for (let i = 0; i < 18; i += 1) {
  const cloud = new THREE.Group();
  const puffs = 3 + Math.floor(Math.random() * 3);
  for (let j = 0; j < puffs; j += 1) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1.4 + Math.random() * 1.8, 12, 12), cloudMaterial);
    puff.position.set((Math.random() - 0.5) * 3.8, (Math.random() - 0.5) * 0.7, (Math.random() - 0.5) * 2);
    cloud.add(puff);
  }
  cloud.position.set((Math.random() - 0.5) * 130, 30 + Math.random() * 18, -60 - Math.random() * 110);
  cloud.userData.speed = 0.9 + Math.random() * 1.8;
  clouds.push(cloud);
  world.add(cloud);
}

const keys = new Set();
const velocity = new THREE.Vector3();
const desiredMove = new THREE.Vector3();
const horizontalVelocity = new THREE.Vector3();

const gameState = {
  onGround: true,
  score: 0,
  chakra: 42,
  timeLeft: 6 * 60 + 9,
  timerAccumulator: 0,
  bounceCooldown: 0,
  dashCooldown: 0,
  dashTimer: 0,
  isGameOver: false,
};

const clock = new THREE.Clock();

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);

  if (event.code === 'Space') {
    event.preventDefault();
    if (gameState.onGround && gameState.chakra > 4 && !gameState.isGameOver) {
      velocity.y = 8.6;
      gameState.onGround = false;
      gameState.chakra = Math.max(0, gameState.chakra - 4);
      emitJumpBurst(player.position);
    }
  }
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.key.toLowerCase());
});

function getInputDirection() {
  desiredMove.set(0, 0, 0);
  if (keys.has('w')) desiredMove.z -= 1;
  if (keys.has('s')) desiredMove.z += 1;
  if (keys.has('a')) desiredMove.x -= 1;
  if (keys.has('d')) desiredMove.x += 1;

  if (desiredMove.lengthSq() > 0) {
    desiredMove.normalize();
  }
  return desiredMove;
}

function updateMovement(dt) {
  const inputDir = getInputDirection();

  gameState.dashCooldown = Math.max(0, gameState.dashCooldown - dt);
  gameState.bounceCooldown = Math.max(0, gameState.bounceCooldown - dt);
  gameState.dashTimer = Math.max(0, gameState.dashTimer - dt);

  if (keys.has('shift') && inputDir.lengthSq() > 0 && gameState.chakra > 8 && gameState.dashCooldown === 0 && !gameState.isGameOver) {
    gameState.dashTimer = 0.18;
    gameState.dashCooldown = 1.1;
    gameState.chakra = Math.max(0, gameState.chakra - 8);
  }

  const targetSpeed = gameState.dashTimer > 0 ? 14 : 7;
  const acceleration = gameState.dashTimer > 0 ? 42 : 24;

  const targetVelocity = new THREE.Vector3(inputDir.x * targetSpeed, 0, inputDir.z * targetSpeed);
  horizontalVelocity.lerp(targetVelocity, 1 - Math.exp(-acceleration * dt));

  velocity.x = horizontalVelocity.x;
  velocity.z = horizontalVelocity.z;

  if (inputDir.lengthSq() > 0.001) {
    const desiredYaw = Math.atan2(velocity.x, velocity.z);
    player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, desiredYaw, 1 - Math.exp(-12 * dt));
  }

  velocity.y -= 21.5 * dt;
  player.position.addScaledVector(velocity, dt);

  if (gameState.dashTimer > 0 && inputDir.lengthSq() > 0) {
    emitDashTrail(player.position);
  }

  if (player.position.y <= 0) {
    if (!gameState.onGround && velocity.y < -7.5) {
      emitJumpBurst(player.position);
    }
    player.position.y = 0;
    velocity.y = 0;
    gameState.onGround = true;
  }

  if (gameState.bounceCooldown === 0) {
    for (const tramp of trampolines) {
      const dx = player.position.x - tramp.position.x;
      const dz = player.position.z - tramp.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= tramp.trampoline.radius && player.position.y <= 0.28 && velocity.y <= 0) {
        velocity.y = tramp.trampoline.bounce;
        gameState.onGround = false;
        gameState.score += 12;
        gameState.chakra = Math.min(100, gameState.chakra + 10);
        gameState.bounceCooldown = 0.2;
        emitJumpBurst(player.position);
        break;
      }
    }
  }

  player.position.x = THREE.MathUtils.clamp(player.position.x, -20.5, 20.5);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -42, 15);
}

function animateCharacter(dt) {
  const runSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  const stride = Math.min(runSpeed / 8, 1.2);
  const phase = performance.now() * 0.012;

  if (gameState.onGround && runSpeed > 0.15) {
    leftLeg.rotation.x = Math.sin(phase) * 0.85 * stride;
    rightLeg.rotation.x = -Math.sin(phase) * 0.85 * stride;
    leftArm.rotation.x = -Math.sin(phase) * 0.7 * stride;
    rightArm.rotation.x = Math.sin(phase) * 0.7 * stride;
    torso.position.y = 1.78 + Math.cos(phase * 2) * 0.07 * stride;
  } else {
    leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0.05, 1 - Math.exp(-10 * dt));
    rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, -0.05, 1 - Math.exp(-10 * dt));
    leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, -0.1, 1 - Math.exp(-10 * dt));
    rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0.1, 1 - Math.exp(-10 * dt));
    torso.position.y = THREE.MathUtils.lerp(torso.position.y, 1.78, 1 - Math.exp(-8 * dt));
  }

  if (!gameState.onGround) {
    leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, -0.35, 1 - Math.exp(-7 * dt));
    rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0.35, 1 - Math.exp(-7 * dt));
  }

  if (gameState.dashTimer > 0) {
    torso.rotation.z = THREE.MathUtils.lerp(torso.rotation.z, 0.12, 1 - Math.exp(-22 * dt));
    torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, -0.28, 1 - Math.exp(-22 * dt));
  } else {
    torso.rotation.z = THREE.MathUtils.lerp(torso.rotation.z, 0, 1 - Math.exp(-14 * dt));
    torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, 0, 1 - Math.exp(-14 * dt));
  }
}

const cameraTarget = new THREE.Vector3();
const cameraIdeal = new THREE.Vector3();
const cameraCurrentTarget = new THREE.Vector3();

function updateCamera(dt) {
  cameraTarget.set(player.position.x, player.position.y + 2.2, player.position.z + 0.2);

  const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
  cameraIdeal.set(
    player.position.x - Math.sin(player.rotation.y) * (8.8 + speed * 0.15),
    player.position.y + 6.9 + speed * 0.03,
    player.position.z - Math.cos(player.rotation.y) * (8.8 + speed * 0.15),
  );

  camera.position.lerp(cameraIdeal, 1 - Math.exp(-6 * dt));
  cameraCurrentTarget.lerp(cameraTarget, 1 - Math.exp(-7 * dt));
  const speedKick = THREE.MathUtils.clamp(speed / 16, 0, 1);
  camera.fov = THREE.MathUtils.lerp(camera.fov, 60 + speedKick * 8, 1 - Math.exp(-8 * dt));
  camera.updateProjectionMatrix();
  camera.lookAt(cameraCurrentTarget);
}

function updateTimer(dt) {
  gameState.timerAccumulator += dt;
  while (gameState.timerAccumulator >= 1) {
    gameState.timerAccumulator -= 1;
    if (gameState.timeLeft > 0) {
      gameState.timeLeft -= 1;
      gameState.chakra = Math.min(100, gameState.chakra + 0.8);
    }
  }

  if (gameState.timeLeft <= 0) {
    gameState.isGameOver = true;
    keys.clear();
  }
}

function updateLeaves(dt) {
  for (const leaf of leaves) {
    leaf.userData.sway += dt * 1.7;
    leaf.position.y -= leaf.userData.speed * dt;
    leaf.position.x += Math.sin(leaf.userData.sway) * 0.02;
    leaf.position.z += Math.cos(leaf.userData.sway * 0.7) * 0.007;
    if (leaf.position.y < 0.1) {
      leaf.position.y = 10 + Math.random() * 18;
      leaf.position.x = (Math.random() - 0.5) * 56;
      leaf.position.z = (Math.random() - 0.5) * 56;
    }
  }
}

function updateClouds(dt) {
  for (const cloud of clouds) {
    cloud.position.x += cloud.userData.speed * dt;
    if (cloud.position.x > 80) {
      cloud.position.x = -80 - Math.random() * 25;
      cloud.position.z = -50 - Math.random() * 120;
      cloud.position.y = 30 + Math.random() * 18;
    }
  }
}

function updateHUD() {
  const mins = Math.floor(gameState.timeLeft / 60);
  const secs = gameState.timeLeft % 60;
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);

  scoreEl.textContent = String(gameState.score).padStart(3, '0');
  timeEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
  speedEl.textContent = speed.toFixed(1);
  chakraFillEl.style.width = `${gameState.chakra}%`;

  if (gameState.isGameOver) {
    stateLabelEl.textContent = 'TIME OVER';
  } else if (gameState.dashTimer > 0) {
    stateLabelEl.textContent = 'DASH';
  } else if (speed > 8) {
    stateLabelEl.textContent = 'BOOST';
  } else {
    stateLabelEl.textContent = 'NORMAL';
  }
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);

  if (!gameState.isGameOver) {
    updateMovement(dt);
    updateTimer(dt);
  }

  updateLeaves(dt);
  updateClouds(dt);
  updateJumpParticles(dt);
  updateDashTrails(dt);
  animateCharacter(dt);
  updateCamera(dt);
  updateHUD();
  composer.render();
  requestAnimationFrame(animate);
}

updateHUD();
animate();

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
  ssaoPass.setSize(width, height);
  fxaaPass.material.uniforms.resolution.value.set(1 / (width * renderer.getPixelRatio()), 1 / (height * renderer.getPixelRatio()));
});
