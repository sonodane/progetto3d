let scene, camera, renderer, controls;
let objects = [];
let animationId;
let isAnimating = true;

// Inizializzazione
function init() {
    // Verifica che Three.js sia caricato
    if (!window.THREE) {
        console.error("Three.js non è stato caricato correttamente");
        return;
    }

    // 1. Creazione scena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);
    
    // 2. Configurazione luci
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // 3. Configurazione camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // 4. Configurazione renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // 5. Controlli
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    
    // 6. Creazione oggetto iniziale
    createObject();
    
    // 7. Gestione eventi
    setupEventListeners();
    
    // 8. Avvio animazione
    animate();
}

function createObject() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    objects.push(cube);
}

function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    document.getElementById('changeColor').addEventListener('click', changeObjectColor);
    document.getElementById('addObject').addEventListener('click', addRandomObject);
    document.getElementById('toggleAnimation').addEventListener('click', toggleAnimation);
    document.getElementById('openFormBtn').addEventListener('click', showForm);
    document.querySelector('.close-btn').addEventListener('click', hideForm);
    document.getElementById('feedbackForm').addEventListener('submit', handleFormSubmit);
}

function animate() {
    if (!isAnimating) return;
    
    animationId = requestAnimationFrame(animate);
    
    objects.forEach(obj => {
        obj.rotation.x += 0.01;
        obj.rotation.y += 0.01;
    });
    
    controls.update();
    renderer.render(scene, camera);
}

// Funzioni per il form
function showForm() {
    document.getElementById('feedbackModal').style.display = 'block';
    isAnimating = false;
}

function hideForm() {
    document.getElementById('feedbackModal').style.display = 'none';
    isAnimating = true;
    animate();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        // Qui implementerai submitToGitHub
        console.log("Dati del form:", data);
        alert("Feedback inviato con successo!");
        e.target.reset();
        hideForm();
    } catch (error) {
        console.error("Errore:", error);
        alert("Errore durante l'invio del feedback");
    }
}

// Avvia l'applicazione
init();
