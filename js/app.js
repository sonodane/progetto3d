// app.js - Versione corretta e funzionante

// =============================================
// INIZIALIZZAZIONE SCENA 3D
// =============================================

// Variabili globali
let scene, camera, renderer, controls;
let objects = [];
let animationId;
let isAnimating = true;

// Elementi UI
const changeColorBtn = document.getElementById('changeColor');
const addObjectBtn = document.getElementById('addObject');
const toggleAnimationBtn = document.getElementById('toggleAnimation');
const openFormBtn = document.getElementById('openFormBtn');

// Verifica che Three.js sia disponibile
if (!window.THREE) {
    console.error("Three.js non è stato caricato correttamente!");
    alert("Errore: Three.js non è stato caricato. Controlla la connessione internet.");
}

// Inizializzazione
function init() {
    // 1. Creazione scena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);
    
    // 2. Configurazione luci
    setupLights();
    
    // 3. Configurazione camera
    setupCamera();
    
    // 4. Configurazione renderer
    setupRenderer();
    
    // 5. Controlli
    setupControls();
    
    // 6. Creazione oggetto iniziale
    createObject();
    
    // 7. Gestione eventi
    setupEventListeners();
    
    // 8. Avvio animazione
    animate();
}

// =============================================
// FUNZIONI DI SETUP
// =============================================

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
}

function setupCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
}

function setupRenderer() {
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        const container = document.getElementById('canvas-container');
        if (!container) {
            throw new Error("Contenitore canvas non trovato!");
        }
        container.appendChild(renderer.domElement);
    } catch (error) {
        console.error("Errore nel renderer:", error);
        alert("Errore nell'inizializzazione della scena 3D");
    }
}

function setupControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
}

function setupEventListeners() {
    // Verifica che i pulsanti esistano
    if (changeColorBtn) changeColorBtn.addEventListener('click', changeObjectColor);
    if (addObjectBtn) addObjectBtn.addEventListener('click', addRandomObject);
    if (toggleAnimationBtn) toggleAnimationBtn.addEventListener('click', toggleAnimation);
    if (openFormBtn) openFormBtn.addEventListener('click', showForm);
    
    window.addEventListener('resize', onWindowResize);
    
    // Listener per il form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(e);
        });
    }
    
    // Listener per chiudere il form
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideForm);
    }
}

// =============================================
// LOGICA 3D PRINCIPALE
// =============================================

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
        () => new THREE.BoxGeometry(0.5, 0.5, 0.5),
        () => new THREE.SphereGeometry(0.5, 32, 32),
        () => new THREE.ConeGeometry(0.5, 1, 32),
        () => new THREE.TorusGeometry(0.3, 0.2, 16, 32)
    ];
    
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    
    const geometry = geometries[Math.floor(Math.random() * geometries.length)]();
    const material = new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        shininess: 50
    });
    
    const object = new THREE.Mesh(geometry, material);
    
    // Posizione casuale
    object.position.set(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
    );
    
    // Rotazione casuale
    object.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0
    );
    
    scene.add(object);
    objects.push(object);
    
    // Limita il numero di oggetti
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

// =============================================
// GESTIONE FORM FEEDBACK
// =============================================

function showForm() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.style.display = 'block';
        isAnimating = false;
    }
}

function hideForm() {
    const modal = document.getElementById('feedbackModal');
    if (modal) {
        modal.style.display = 'none';
        isAnimating = true;
        animate();
    }
}

async function handleFormSubmit(e) {
    const form = e.target;
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Invio in corso...';
        
        // Simulazione invio (sostituisci con la tua logica)
        console.log("Dati da inviare:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        alert('Grazie per il tuo feedback!');
        form.reset();
        hideForm();
    } catch (error) {
        console.error("Errore nell'invio:", error);
        alert("Si è verificato un errore durante l'invio");
    } finally {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Invia';
        }
    }
}

// =============================================
// AVVIO APPLICAZIONE
// =============================================

// Attendiamo che il DOM sia completamente caricato
document.addEventListener('DOMContentLoaded', function() {
    // Verifica che Three.js e OrbitControls siano disponibili
    if (window.THREE && window.THREE.OrbitControls) {
        init();
    } else {
        console.error("Three.js o OrbitControls non sono disponibili");
        alert("Errore: Le librerie necessarie non sono state caricate correttamente");
    }
});
