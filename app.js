// Inizializzazione della scena 3D
let scene, camera, renderer, controls;
let objects = [];
let animationId;
let isAnimating = true;

// Elementi UI
const changeColorBtn = document.getElementById('changeColor');
const addObjectBtn = document.getElementById('addObject');
const toggleAnimationBtn = document.getElementById('toggleAnimation');

init();
// Funzione che salva i dati su GitHub
async function saveToGitHub(data) {
    // 1. Legge il file CSV esistente
    // 2. Aggiunge una nuova riga
    // 3. Aggiorna il file via API GitHub
}
function init() {
    // Creazione della scena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);
    
    // Aggiunta luci
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Configurazione camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Configurazione renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Controlli orbit
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Creazione oggetto iniziale
    createObject();
    
    // Gestione eventi
    window.addEventListener('resize', onWindowResize);
    changeColorBtn.addEventListener('click', changeObjectColor);
    addObjectBtn.addEventListener('click', addRandomObject);
    toggleAnimationBtn.addEventListener('click', toggleAnimation);
    
    // Avvio animazione
    animate();
}

function createObject() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        shininess: 100
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    objects.push(cube);
}

function addRandomObject() {
    const geometries = [
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.ConeGeometry(0.5, 1, 32),
        new THREE.TorusGeometry(0.3, 0.2, 16, 32)
    ];
    
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        shininess: 50
    });
    
    const object = new THREE.Mesh(geometry, material);
    
    // Posizione casuale
    object.position.x = (Math.random() - 0.5) * 5;
    object.position.y = (Math.random() - 0.5) * 5;
    object.position.z = (Math.random() - 0.5) * 5;
    
    // Rotazione casuale
    object.rotation.x = Math.random() * Math.PI;
    object.rotation.y = Math.random() * Math.PI;
    
    scene.add(object);
    objects.push(object);
    
    if (objects.length > 10) {
        const oldObject = objects.shift();
        scene.remove(oldObject);
    }
}

function changeObjectColor() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    objects.forEach(obj => {
        obj.material.color.setHex(colors[Math.floor(Math.random() * colors.length)]);
    });
}

function toggleAnimation() {
    isAnimating = !isAnimating;
    if (isAnimating) {
        animate();
    } else {
        cancelAnimationFrame(animationId);
    }
}

function animate() {
    if (!isAnimating) return;
    
    animationId = requestAnimationFrame(animate);
    
    // Animazione oggetti
    objects.forEach(obj => {
        obj.rotation.x += 0.01;
        obj.rotation.y += 0.01;
    });
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
