// --- Global Configurations ---
let model;
const MODEL_PATH = "./model/";

// --- 1. LOGIN PAGE LOGIC ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idInput = document.getElementById('employeeId').value;
        const passInput = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        // Simple validation check (no strict credentials yet)
        if (idInput.trim() !== '' && passInput.trim() !== '') {
            // Simulate authentication UI delay
            submitBtn.innerText = 'AUTHENTICATING...';
            submitBtn.style.opacity = '0.8';
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800); // 800ms delay to feel natural
        }
    });
}

// --- 2. DASHBOARD PAGE LOGIC ---
const dashUploadBtn = document.getElementById('dashUploadBtn');
const dashCameraBtn = document.getElementById('dashCameraBtn');
const dashFileInput = document.getElementById('dashFileInput');
const dashCameraInput = document.getElementById('dashCameraInput');

// Trigger hidden file inputs
if (dashUploadBtn) dashUploadBtn.addEventListener('click', () => dashFileInput.click());
if (dashCameraBtn) dashCameraBtn.addEventListener('click', () => dashCameraInput.click());

// Grab the image, save to session, and jump to scan.html
function passImageToScanPage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Store image in temporary memory and navigate
            sessionStorage.setItem('pendingImage', e.target.result);
            window.location.href = 'scan.html';
        };
        reader.readAsDataURL(file);
    }
}

if (dashFileInput) dashFileInput.addEventListener('change', passImageToScanPage);
if (dashCameraInput) dashCameraInput.addEventListener('change', passImageToScanPage);


// --- 3. SCAN PAGE LOGIC ---
const imagePreview = document.getElementById('imagePreview');
const clearBtn = document.getElementById('clearBtn');
const statusText = document.getElementById('statusText');
const analyzeBtn = document.getElementById('analyzeBtn');

// Initialize offline model only on scan page
if (analyzeBtn) {
    initModel();
    checkPendingImage();
}

async function initModel() {
    try {
        model = await tmImage.load(MODEL_PATH + "model.json", MODEL_PATH + "metadata.json");
        console.log("Local offline model loaded successfully.");
    } catch (err) {
        console.error("Model failed to load offline:", err);
    }
}

// Check if an image was passed from the dashboard
function checkPendingImage() {
    const pendingImage = sessionStorage.getItem('pendingImage');
    
    if (pendingImage && imagePreview) {
        imagePreview.src = pendingImage;
        imagePreview.style.display = 'block';
        if(clearBtn) clearBtn.style.display = 'flex';
        if(statusText) statusText.innerText = 'Image ready to Analyze';
        if(analyzeBtn) analyzeBtn.disabled = false;
        
        // Clean up storage after loading
        sessionStorage.removeItem('pendingImage'); 
    }
}

// Execute analysis
if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
        if (!model) {
            alert("Model is still loading locally, please wait...");
            return;
        }

        const predictions = await model.predict(imagePreview);
        sessionStorage.setItem('scanResults', JSON.stringify(predictions));
        window.location.href = "result.html";
    });
}