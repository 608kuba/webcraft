import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// Nastavení scény
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Osvětlení
const light = new THREE.HemisphereLight(0xeeeeee, 0x888888, 1.5);
scene.add(light);

// Pomocné proměnné
const blocks = [];
const controls = new PointerLockControls(camera, document.body);
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let moveF = false, moveB = false, moveL = false, moveR = false;

// Generování světa (Jednoduché podloží)
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshLambertMaterial({ color: 0x55aa44 });

for(let x = -10; x < 10; x++) {
    for(let z = -10; z < 10; z++) {
        const cube = new THREE.Mesh(boxGeo, mat);
        cube.position.set(x, 0, z);
        scene.add(cube);
        blocks.push(cube);
    }
}

// Ovládání
document.addEventListener('keydown', (e) => {
    if(e.code === 'KeyW') moveF = true;
    if(e.code === 'KeyS') moveB = true;
    if(e.code === 'KeyA') moveL = true;
    if(e.code === 'KeyD') moveR = true;
    if(e.code === 'Space' && camera.position.y <= 1.6) velocity.y = 10;
});
document.addEventListener('keyup', (e) => {
    if(e.code === 'KeyW') moveF = false;
    if(e.code === 'KeyS') moveB = false;
    if(e.code === 'KeyA') moveL = false;
    if(e.code === 'KeyD') moveR = false;
});
document.body.addEventListener('click', () => controls.lock());

// Herní smyčka
let prevTime = performance.now();
function update() {
    requestAnimationFrame(update);
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 3.0 * delta; // Gravitace

        direction.z = Number(moveF) - Number(moveB);
        direction.x = Number(moveR) - Number(moveL);
        direction.normalize();

        if (moveF || moveB) velocity.z -= direction.z * 100.0 * delta;
        if (moveL || moveR) velocity.x -= direction.x * 100.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        camera.position.y += (velocity.y * delta);

        if (camera.position.y < 1.6) {
            velocity.y = 0;
            camera.position.y = 1.6;
        }
    }

    renderer.render(scene, camera);
    prevTime = time;
}
update();
