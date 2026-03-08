import * as THREE from 'three';

const socket = io();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));
scene.add(new THREE.GridHelper(100, 100));

let players = {};
let myId = null;
const keys = {};

socket.on('init', (data) => {
    myId = data.id;
    for (let id in data.players) addPlayer(id, data.players[id]);
});

socket.on('newPlayer', (data) => addPlayer(data.id, data.player));
socket.on('playerMoved', (data) => {
    if (players[data.id]) players[data.id].position.set(data.x, data.y, data.z);
});
socket.on('removePlayer', (id) => {
    scene.remove(players[id]);
    delete players[id];
});

function addPlayer(id, data) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshStandardMaterial({ color: data.color })
    );
    mesh.position.set(data.x, data.y, data.z);
    scene.add(mesh);
    players[id] = mesh;
}

window.onkeydown = (e) => keys[e.code] = true;
window.onkeyup = (e) => keys[e.code] = false;

function update() {
    if (myId && players[myId]) {
        const p = players[myId];
        const speed = 0.15;
        if (keys['KeyW']) p.position.z -= speed;
        if (keys['KeyS']) p.position.z += speed;
        if (keys['KeyA']) p.position.x -= speed;
        if (keys['KeyD']) p.position.x += speed;

        camera.position.set(p.position.x, p.position.y + 5, p.position.z + 10);
        camera.lookAt(p.position);

        socket.emit('move', { x: p.position.x, y: p.position.y, z: p.position.z });
    }
    renderer.render(scene, camera);
    requestAnimationFrame(update);
}
update();
