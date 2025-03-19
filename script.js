// Canvas und 3D-Szene einrichten
const canvas = document.getElementById('gameCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });

// Ressourcen
let money = 1000;
let materials = 500;

// Gebäude
let buildings = [];

// Herausforderungen
let challenges = [];

// Spielfunktionen
function updateResources() {
    document.getElementById('money').textContent = money;
    document.getElementById('materials').textContent = materials;
}

function buildBuilding() {
    if (money >= 200 && materials >= 100) {
        money -= 200;
        materials -= 100;
        buildings.push({}); // Gebäude hinzufügen
        updateResources();
    }
}

function upgradeBuilding() {
    if (money >= 100 && buildings.length > 0) {
        money -= 100;
        // Gebäude verbessern
        updateResources();
    }
}

function generateChallenges() {
    challenges = [
        { description: "Baue 3 Gebäude", completed: false },
        { description: "Sammle 1000 Geld", completed: false }
    ];
    updateChallenges();
}

function updateChallenges() {
    const challengeList = document.getElementById('challengeList');
    challengeList.innerHTML = '';
    challenges.forEach(challenge => {
        const li = document.createElement('li');
        li.textContent = challenge.description;
        challengeList.appendChild(li);
    });
}

// Spiel-Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Initialisierung
updateResources();
generateChallenges();
animate();

// Beispiel für ein Gebäude in der 3D-Szene
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;
