import * as THREE from 'three';

const gameEl = document.getElementById('game');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const chakraFillEl = document.getElementById('chakraFill');

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xbfd8ff, 40, 130);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 250);
camera.position.set(0, 8, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
gameEl.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xffffee, 0x35563d, 0.7);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff7df, 1.1);
sun.position.set(16, 26, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 80;
sun.shadow.camera.left = -40;
sun.shadow.camera.right = 40;
sun.shadow.camera.top = 40;
sun.shadow.camera.bottom = -40;
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const colors = {
  grass: 0x57bb4f,
  dirt: 0x8f6b47,
  rock: 0x6d7988,
  wood: 0x99653d,
  rope: 0xb68e64,
};

const material = {
  grass: new THREE.MeshStandardMaterial({ color: colors.grass, roughness: 0.95 }),
  dirt: new THREE.MeshStandardMaterial({ color: colors.dirt, roughness: 0.98 }),
  rock: new THREE.MeshStandardMaterial({ color: colors.rock, roughness: 0.85 }),
  wood: new THREE.MeshStandardMaterial({ color: colors.wood, roughness: 0.9 }),
  rope: new THREE.MeshStandardMaterial({ color: colors.rope, roughness: 0.9 }),
  spring: new THREE.MeshStandardMaterial({ color: 0xb5bccb, metalness: 0.55, roughness: 0.3 }),
  trampoline: new THREE.MeshStandardMaterial({ color: 0xdb844f, roughness: 0.6 }),
  trampolineCenter: new THREE.MeshStandardMaterial({ color: 0x2f3544, roughness: 0.6 }),
  accent: new THREE.MeshStandardMaterial({ color: 0xffd550, roughness: 0.45 }),
  jacket: new THREE.MeshStandardMaterial({ color: 0x0d1b30, roughness: 0.8 }),
  pants: new THREE.MeshStandardMaterial({ color: 0xe88539, roughness: 0.8 }),
};

function makePlateau({ x, z, w, d, h = 5 }) {
  const group = new THREE.Group();
  const dirt = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material.dirt);
  dirt.position.y = h / 2;
  dirt.castShadow = true;
  dirt.receiveShadow = true;

  const grass = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.55, d + 0.3), material.grass);
  grass.position.y = h + 0.25;
  grass.castShadow = true;
  grass.receiveShadow = true;

  group.add(dirt, grass);
  group.position.set(x, 0, z);
  world.add(group);
}

makePlateau({ x: 0, z: 0, w: 38, d: 32, h: 1.3 });
makePlateau({ x: -14, z: -16, w: 11, d: 12, h: 7 });
makePlateau({ x: 14, z: -16, w: 11, d: 12, h: 7 });
makePlateau({ x: 0, z: -33, w: 16, d: 10, h: 10 });

for (let i = 0; i < 12; i += 1) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 + Math.random() * 1.1), material.rock);
  rock.position.set((Math.random() - 0.5) * 34, 0.7, (Math.random() - 0.5) * 26);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.castShadow = true;
  rock.receiveShadow = true;
  world.add(rock);
}

const bridge = new THREE.Group();
world.add(bridge);

const plankGeo = new THREE.BoxGeometry(1.1, 0.2, 1.7);
for (let i = 0; i < 18; i += 1) {
  const t = i / 17;
  const x = THREE.MathUtils.lerp(-10, 10, t);
  const sag = Math.sin(t * Math.PI) * -2.4;
  const plank = new THREE.Mesh(plankGeo, material.wood);
  plank.position.set(x, 9.6 + sag, -15.5);
  plank.rotation.z = Math.sin(t * Math.PI) * 0.08;
  plank.castShadow = true;
  plank.receiveShadow = true;
  bridge.add(plank);
}

const ropeCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-10.8, 10.7, -15.5),
  new THREE.Vector3(-5, 9.9, -15.5),
  new THREE.Vector3(0, 8.9, -15.5),
  new THREE.Vector3(5, 9.9, -15.5),
  new THREE.Vector3(10.8, 10.7, -15.5),
]);
const ropePoints = ropeCurve.getPoints(60);
const ropeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ropePoints), 60, 0.12, 8, false);
const rope1 = new THREE.Mesh(ropeGeo, material.rope);
const rope2 = rope1.clone();
rope1.position.z -= 1;
rope2.position.z += 1;
bridge.add(rope1, rope2);

function makeBoxStack(x, z, levels = 3) {
  for (let y = 0; y < levels; y += 1) {
    for (let i = 0; i < levels - y; i += 1) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), material.wood);
      crate.position.set(x + i * 1.9 - (levels - y - 1) * 0.95, y * 1.9 + 0.9, z);
      crate.castShadow = true;
      crate.receiveShadow = true;
      world.add(crate);
    }
  }
}

makeBoxStack(-13, 8, 2);
makeBoxStack(12.5, 9, 3);

const trampolines = [];
function makeTrampoline(x, z, radius = 2.1) {
  const group = new THREE.Group();

  const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 1.1, 12, 1), material.spring);
  spring.position.y = 0.6;

  const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.35, radius + 0.35, 0.6, 36), material.trampoline);
  rim.position.y = 1.25;

  const center = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.46, 36), material.trampolineCenter);
  center.position.y = 1.34;

  group.add(spring, rim, center);
  group.position.set(x, 0, z);
  group.trampoline = { radius, bounce: 14.5 };
  group.children.forEach((child) => {
    child.castShadow = true;
    child.receiveShadow = true;
  });

  world.add(group);
  trampolines.push(group);
}

makeTrampoline(-10, 11, 2.2);
makeTrampoline(10, 11, 2.2);
makeTrampoline(0, -2, 1.55);

const player = new THREE.Group();
world.add(player);

const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.2, 8, 12), material.jacket);
body.position.y = 1.6;
body.castShadow = true;
player.add(body);

const pants = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.85, 12), material.pants);
pants.position.y = 0.8;
pants.castShadow = true;
player.add(pants);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 18), new THREE.MeshStandardMaterial({ color: 0xffda8c, roughness: 0.7 }));
head.position.y = 2.45;
head.castShadow = true;
player.add(head);

const hairGeo = new THREE.ConeGeometry(0.2, 0.55, 6);
for (let i = 0; i < 11; i += 1) {
  const spike = new THREE.Mesh(hairGeo, material.accent);
  const a = (i / 11) * Math.PI * 2;
  spike.position.set(Math.cos(a) * 0.48, 2.95 + Math.sin(i * 1.7) * 0.08, Math.sin(a) * 0.48);
  spike.rotation.x = Math.PI;
  spike.rotation.z = Math.sin(a) * 0.45;
  spike.rotation.y = Math.cos(a) * 0.45;
  spike.castShadow = true;
  player.add(spike);
}

player.position.set(0, 0, 7);

const keys = new Set();
const moveDirection = new THREE.Vector3();
const velocity = new THREE.Vector3();
let onGround = true;
let score = 0;
let chakra = 34;
let timeLeft = 6 * 60 + 9;

const clock = new THREE.Clock();
let timerAccumulator = 0;

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);

  if (event.code === 'Space') {
    event.preventDefault();
    if (onGround && chakra > 4) {
      velocity.y = 8.2;
      onGround = false;
      chakra = Math.max(chakra - 4, 0);
    }
  }
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.key.toLowerCase());
});

function updateHUD() {
  scoreEl.textContent = String(score).padStart(3, '0');
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timeEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
  chakraFillEl.style.width = `${chakra}%`;
}

function updateMovement(dt) {
  moveDirection.set(0, 0, 0);

  if (keys.has('w')) moveDirection.z -= 1;
  if (keys.has('s')) moveDirection.z += 1;
  if (keys.has('a')) moveDirection.x -= 1;
  if (keys.has('d')) moveDirection.x += 1;

  if (moveDirection.lengthSq() > 0) {
    moveDirection.normalize();
    const speed = 6.3;
    velocity.x = moveDirection.x * speed;
    velocity.z = moveDirection.z * speed;
    player.rotation.y = Math.atan2(velocity.x, velocity.z);
  } else {
    velocity.x *= 0.84;
    velocity.z *= 0.84;
  }

  velocity.y -= 19 * dt;
  player.position.addScaledVector(velocity, dt);

  if (player.position.y <= 0) {
    player.position.y = 0;
    velocity.y = 0;
    onGround = true;
  }

  for (const tramp of trampolines) {
    const center = tramp.position;
    const dx = player.position.x - center.x;
    const dz = player.position.z - center.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < tramp.trampoline.radius && player.position.y <= 0.24 && velocity.y <= 0) {
      velocity.y = tramp.trampoline.bounce;
      onGround = false;
      score += 10;
      chakra = Math.min(chakra + 8, 100);
    }
  }

  player.position.x = THREE.MathUtils.clamp(player.position.x, -17.5, 17.5);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -35, 14);
}

function updateCamera(dt) {
  const target = new THREE.Vector3(player.position.x, player.position.y + 2, player.position.z + 0.5);
  const idealPos = new THREE.Vector3(player.position.x, player.position.y + 7.5, player.position.z + 13);
  camera.position.lerp(idealPos, 1 - Math.exp(-5 * dt));
  camera.lookAt(target);
}

function updateTimer(dt) {
  timerAccumulator += dt;
  if (timerAccumulator >= 1) {
    timerAccumulator -= 1;
    if (timeLeft > 0) {
      timeLeft -= 1;
      chakra = Math.min(chakra + 1, 100);
    }
  }
}

function spawnLeaves() {
  const leafGeo = new THREE.PlaneGeometry(0.14, 0.08);
  const leafMat = new THREE.MeshBasicMaterial({ color: 0x5bb55d, side: THREE.DoubleSide });

  for (let i = 0; i < 70; i += 1) {
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set((Math.random() - 0.5) * 40, 8 + Math.random() * 12, (Math.random() - 0.5) * 42 - 8);
    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    leaf.userData = {
      speed: 0.9 + Math.random() * 1.2,
      sway: Math.random() * Math.PI * 2,
    };
    world.add(leaf);
  }
}

spawnLeaves();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);

  updateMovement(dt);
  updateCamera(dt);
  updateTimer(dt);

  world.children.forEach((obj) => {
    if (obj.userData?.speed) {
      obj.userData.sway += dt;
      obj.position.y -= obj.userData.speed * dt;
      obj.position.x += Math.sin(obj.userData.sway) * 0.008;
      if (obj.position.y < 0.2) {
        obj.position.y = 10 + Math.random() * 12;
      }
    }
  });

  updateHUD();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

updateHUD();
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
