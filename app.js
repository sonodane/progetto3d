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
async function submitToGitHub(data) {
    const repoOwner = 'TUO_USERNAME';
    const repoName = 'NOME_REPO';
    const filePath = 'feedback/data.csv';
    const token = 'TUO_TOKEN_GITHUB'; // Usa un token con permessi repo

    // Leggi il file esistente
    const existingData = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
        headers: { 'Authorization': `token ${token}` }
    }).then(res => res.json()).catch(() => null);

    let csvContent = 'Name,Email,Message,Timestamp\n';
    
    if (existingData && existingData.content) {
        csvContent = atob(existingData.content.replace(/\n/g, ''));
    }

    // Aggiungi nuova riga
    csvContent += `${data.name},${data.email},"${data.message}",${new Date().toISOString()}\n`;

    // Aggiorna il file
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
        method: 'PUT',
        headers: { 'Authorization': `token ${token}` },
        body: JSON.stringify({
            message: 'Aggiunto feedback',
            content: btoa(csvContent),
            sha: existingData?.sha
        })
    });

    return response.json();
}
// Nel tuo app.js
function showForm() {
    document.querySelector('.form-container').style.display = 'block';
    // Pausa l'animazione 3D
    isAnimating = false;
}
// Leggi e visualizza i feedback come oggetti 3D
async function loadFeedback() {
    const response = await fetch('https://raw.githubusercontent.com/TUO_USERNAME/NOME_REPO/main/feedback/data.csv');
    const data = await response.text();
    // Crea testo 3D con Three.js
    data.split('\n').forEach(createTextMesh);
}
// Aggiungi un pulsante 3D che chiama showForm()
// Gestisci submit del form
document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        await submitToGitHub(data);
        alert('Grazie per il feedback!');
        e.target.reset();
    } catch (error) {
        console.error(error);
        alert('Errore nell\'invio');
    }
});
// In produzione, usa variabili d'ambiente
const token = process.env.GITHUB_TOKEN; 
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
