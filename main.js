import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- INICIALIZACE ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Azurová obloha
scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- MATERIÁLY ---
const materials = [
    new THREE.MeshLambertMaterial({ color: 0x55aa44 }), // Tráva (1)
    new THREE.MeshLambertMaterial({ color: 0x8b4513 }), // Hlína (2)
    new THREE.MeshLambertMaterial({ color: 0x808080 })  // Kámen (3)
];
let selectedMaterial = 0;

// --- GENERACE SVĚTA ---
const blocks = [];
const boxGeo = new THREE.BoxGeometry(1, 1, 1);

for (let x = -16; x < 16; x++) {
    for (let z = -16; z < 16; z++) {
        // Podlaha
        const block = new THREE.Mesh(boxGeo, materials[0]);
        block.position.set(x, 0, z);
        scene.add(block);
        blocks.push(block);

        // Náhodné hory
        const h = Math.floor(Math.random() * 3);
        if (h > 0) {
            for (let y = 1; y <= h; y++) {
                const m = y === h ? materials[0] : materials[1];
                const extra = new THREE.Mesh(boxGeo, m);
                extra.position.set(x, y, z);
                scene.add(extra);
                blocks.push(extra);
            }
        }
    }
}

// --- OSVĚTLENÍ ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 20, 10);
scene.add(sun);

// --- OVLÁDÁNÍ ---
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

let moveF = false, moveB = false, moveL = false, moveR = false;
let velocity = new THREE.Vector3();
let canJump = false;

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') moveF = true;
    if (e.code === 'KeyS') moveB = true;
    if (e.code === 'KeyA') moveL = true;
    if (e.code === 'KeyD') moveR = true;
    if (e.code === 'Space' && canJump) { velocity.y += 10; canJump = false; }
    
    // Inventář 1, 2, 3
    if (e.key === '1') setActiveSlot(0);
    if (e.key === '2') setActiveSlot(1);
    if (e.key === '3') setActiveSlot(2);
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveF = false;
    if (e.code === 'KeyS') moveB = false;
    if (e.code === 'KeyA') moveL = false;
    if (e.code === 'KeyD') moveR = false;
});

function setActiveSlot(index) {
    selectedMaterial = index;
    document.querySelectorAll('.slot').forEach((s, i) => {
        s.classList.toggle('active', i === index);
    });
}

// --- STAVĚNÍ A TĚŽENÍ ---
const raycaster = new THREE.Raycaster();
document.addEventListener('mousedown', (e) => {
    if (!controls.isLocked) return;
    
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(blocks);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        if (e.button === 0) { // Levý klik = Těžit
            scene.remove(intersect.object);
            blocks.splice(blocks.indexOf(intersect.object), 1);
        } else if (e.button === 2) { // Pravý klik = Stavět
            const pos = intersect.point.add(intersect.face.normal.clone().multiplyScalar(0.5));
            const b = new THREE.Mesh(boxGeo, materials[selectedMaterial]);
            b.position.set(Math.round(pos.x), Math.round(pos.y), Math.round(pos.z));
            scene.add(b);
            blocks.push(b);
        }
    }
});
document.addEventListener('contextmenu', e => e.preventDefault());

// --- HLAVNÍ SMYČKA ---
camera.position.set(0, 5, 5);
let prevTime = performance.now();

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 30.0 * delta; // Gravitace

        if (moveF) velocity.z -= 150.0 * delta;
        if (moveB) velocity.z += 150.0 * delta;
        if (moveL) velocity.x -= 150.0 * delta;
        if (moveR) velocity.x += 150.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        camera.position.y += velocity.y * delta;

        if (camera.position.y < 2) {
            velocity.y = 0;
            camera.position.y = 2;
            canJump = true;
        }
    }
    renderer.render(scene, camera);
    prevTime = time;
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log("WebCraft úspěšně nastartován!");
