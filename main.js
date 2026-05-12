import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- SCÉNA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Světle modrá obloha
scene.fog = new THREE.Fog(0x87CEEB, 1, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- MATERIÁLY A GEOMETRIE ---
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const textureLoader = new THREE.TextureLoader();

// Pokud nemáš textury, použijeme barvy, ale lépe definované
const materials = {
    grass: new THREE.MeshLambertMaterial({ color: 0x48a044 }),
    dirt: new THREE.MeshLambertMaterial({ color: 0x866043 }),
    stone: new THREE.MeshLambertMaterial({ color: 0x808080 })
};

// --- GENERACE TERÉNU ---
const blocks = [];
function createWorld() {
    for (let x = -15; x < 15; x++) {
        for (let z = -15; z < 15; z++) {
            // Jednoduchá matematika pro kopce
            const height = Math.floor(Math.sin(x / 4) * Math.sin(z / 4) * 2) + 2;
            
            for (let y = 0; y <= height; y++) {
                let material = materials.dirt;
                if (y === height) material = materials.grass;
                if (y < height - 1) material = materials.stone;

                const block = new THREE.Mesh(boxGeo, material);
                block.position.set(x, y, z);
                scene.add(block);
                blocks.push(block);
            }
        }
    }
}
createWorld();

// --- SVĚTLO ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const sun = new THREE.PointLight(0xffffff, 1.2);
sun.position.set(10, 20, 10);
scene.add(sun);

// --- HRÁČ A FYZIKA ---
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
    if (e.code === 'Space' && canJump) {
        velocity.y += 10;
        canJump = false;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveF = false;
    if (e.code === 'KeyS') moveB = false;
    if (e.code === 'KeyA') moveL = false;
    if (e.code === 'KeyD') moveR = false;
});

// Startovní pozice hráče (nad terénem)
camera.position.set(0, 10, 0);

// --- ANIMACE ---
let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked) {
        // Tření a pohyb
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 25.0 * delta; // Gravitace

        if (moveF) velocity.z -= 150.0 * delta;
        if (moveB) velocity.z += 150.0 * delta;
        if (moveL) velocity.x -= 150.0 * delta;
        if (moveR) velocity.x += 150.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        camera.position.y += velocity.y * delta;

        // Jednoduchá detekce země
        if (camera.position.y < 2.5) {
            velocity.y = 0;
            camera.position.y = 2.5;
            canJump = true;
        }
    }

    renderer.render(scene, camera);
    prevTime = time;
}
animate();
