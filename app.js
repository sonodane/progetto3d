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
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
}

function setupControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
}

function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    changeColorBtn.addEventListener('click', changeObjectColor);
    addObjectBtn.addEventListener('click', addRandomObject);
    toggleAnimationBtn.addEventListener('click', toggleAnimation);
    openFormBtn.addEventListener('click', showForm);
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
    document.getElementById('feedbackModal').style.display = 'block';
    isAnimating = false;
}

async function submitToGitHub(data) {
    const repoOwner = 'TUO_USERNAME_GITHUB';
    const repoName = 'NOME_REPOSITORY';
    const filePath = 'feedback/data.csv';
    const token = 'TUO_TOKEN_GITHUB'; // Sostituisci con un token valido
    
    try {
        // 1. Leggi il file esistente
        const existingData = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
            headers: { 'Authorization': `token ${token}` }
        }).then(res => res.json()).catch(() => null);

        // 2. Prepara il contenuto CSV
        let csvContent = 'Name,Email,Message,Timestamp\n';
        
        if (existingData && existingData.content) {
            csvContent = atob(existingData.content.replace(/\n/g, ''));
        }

        // 3. Aggiungi nuova riga
        csvContent += `${data.name},${data.email},"${data.message.replace(/"/g, '""')}",${new Date().toISOString()}\n`;

        // 4. Aggiorna il file
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}` },
            body: JSON.stringify({
                message: 'Aggiunto feedback',
                content: btoa(unescape(encodeURIComponent(csvContent))),
                sha: existingData?.sha
            })
        });

        const result = await response.json();
        console.log('Feedback salvato:', result);
        return result;
    } catch (error) {
        console.error('Errore nel salvataggio:', error);
        throw error;
    }
}

// =============================================
// EVENT LISTENER PER IL FORM
// =============================================

document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Invio in corso...';
        
        await submitToGitHub(data);
        
        alert('Grazie per il tuo feedback!');
        e.target.reset();
        document.getElementById('feedbackModal').style.display = 'none';
        isAnimating = true;
        animate();
    } catch (error) {
        alert('Si è verificato un errore durante l\'invio del feedback');
        console.error(error);
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Invia';
    }
});

// Chiudi il modale quando si clicca fuori dal form
document.querySelector('.close-btn').addEventListener('click', () => {
    document.getElementById('feedbackModal').style.display = 'none';
    isAnimating = true;
    animate();
});

window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('feedbackModal')) {
        document.getElementById('feedbackModal').style.display = 'none';
        isAnimating = true;
        animate();
    }
});

// =============================================
// AVVIO APPLICAZIONE
// =============================================

init();
