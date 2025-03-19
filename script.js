// Canvas und 3D-Szene einrichten
const canvas = document.getElementById('gameCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Physik-Welt erstellen
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Ressourcen
let money = 1000;
let materials = 500;

// Gebäude
let buildings = [];

// Herausforderungen
let challenges = [];

// Charakter
let character;
let mixer;

// Karte erstellen
const mapGeometry = new THREE.PlaneGeometry(20, 20);
const mapMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const map = new THREE.Mesh(mapGeometry, mapMaterial);
map.rotation.x = -Math.PI / 2;
scene.add(map);

// Physikalischer Körper für die Karte
const mapShape = new CANNON.Plane();
const mapBody = new CANNON.Body({ mass: 0 });
mapBody.addShape(mapShape);
mapBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(mapBody);

// Charakter erstellen und laden
const loader = new THREE.GLTFLoader();
loader.load('character.gltf', (gltf) => {
    character = gltf.scene;
    scene.add(character);
    mixer = new THREE.AnimationMixer(character);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, 'Run');
    const action = mixer.clipAction(clip);
    action.play();

    // Physikalischer Körper für den Charakter
    const characterShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
    const characterBody = new CANNON.Body({ mass: 1 });
    characterBody.addShape(characterShape);
    characterBody.position.set(0, 2, 0);
    world.addBody(characterBody);
});

// Maus- und Touch-Ereignisse
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('touchstart', onTouchStart, false);
canvas.addEventListener('touchmove', onTouchMove, false);

let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
    };
}

function onTouchStart(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
    };
}

function onTouchMove(event) {
    if (!isDragging) return;

    const deltaMove = {
        x: event.touches[0].clientX - previousMousePosition.x,
        y: event.touches[0].clientY - previousMousePosition.y
    };

    camera.position.x -= deltaMove.x * 0.01;
    camera.position.y += deltaMove.y * 0.01;

    previousMousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
    };
}

canvas.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

    const deltaMove = {
        x: event.offsetX - previousMousePosition.x,
        y: event.offsetY - previousMousePosition.y
    };

    camera.position.x -= deltaMove.x * 0.01;
    camera.position.y += deltaMove.y * 0.01;

    previousMousePosition = {
        x: event.offsetX,
        y: event.offsetY
    };
});

canvas.addEventListener('mouseup', () => isDragging = false, false);
canvas.addEventListener('mouseleave', () => isDragging = false, false);
canvas.addEventListener('touchend', () => isDragging = false, false);

// Spielfunktionen
function updateResources() {
    document.getElementById('money').textContent = money;
    document.getElementById('materials').textContent = materials;
}

function buildBuilding() {
    if (money >= 200 && materials >= 100) {
        money -= 200;
        materials -= 100;
        buildings.push({});
        updateResources();
        addBuildingToScene();
    }
}

function upgradeBuilding() {
    if (money >= 100 && buildings.length > 0) {
        money -= 100;
        updateResources();
    }
}

const bonusTypes = [
    { type: "Geld", amount: 500 },
    { type: "Materialien", amount: 250 },
    { type: "Gebäude-Rabatt", amount: 0.2 },
    { type: "Produktionssteigerung", amount: 0.1 }
];

function getRandomBonus() {
    const randomIndex = Math.floor(Math.random() * bonusTypes.length);
    return bonusTypes[randomIndex];
}

function generateChallenges() {
    challenges = [
        { description: "Baue 3 Gebäude", completed: false, bonus: getRandomBonus() },
        { description: "Sammle 1000 Geld", completed: false, bonus: getRandomBonus() }
    ];
    updateChallenges();
}

function updateChallenges() {
    const challengeList = document.getElementById('challengeList');
    challengeList.innerHTML = '';
    challenges.forEach((challenge, index) => {
        const li = document.createElement('li');
        li.textContent = `${challenge.description} - Bonus: <span class="math-inline">\{challenge\.bonus\.type\} \(</span>{challenge.bonus.amount})`;
        const button = document.createElement('button');
        button.textContent = "Abschließen";
        button.onclick = () => completeChallenge(index);
        li.appendChild(button);
        challengeList.appendChild(li);
    });
}

function addBuildingToScene() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material
