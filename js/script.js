/* ==========================================================================
   PICS - Plant Pathogen Image Classification System
   Main JS Controller
    Consider this to include React JS to make it more maintainable, less line counts, and easier to read.
   ========================================================================== */

const MODEL_PATH = "model/";

/**
 * Compresses high-res photos using an off-screen canvas.
 * If hindi na-resize yung high MB phone images, sessionStorage will fucked up.
 * AI prompt engineering is used here. 
 */
function compressAndStoreImage(file, callback) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 800; // 800px is more than enough for TM
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Turn into compact base64 JPEG
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

            try {
                sessionStorage.setItem('pendingImage', compressedBase64);
                if (callback) callback(compressedBase64);
            } catch (err) {
                console.error("Storage full or browser acting like a idiot:", err);
                alert("Image is way too damn big. Pick another one.");
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- 1. LOGIN PAGE LOGIC ---
// Fake authentication because auth backend isn't my job right now. Someone has do it.
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const idInput = document.getElementById('employeeId').value;
        const passInput = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        if (idInput.trim() !== '' && passInput.trim() !== '') {
            submitBtn.innerText = 'AUTHENTICATING...';
            submitBtn.style.opacity = '0.8';

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 600);
        }
    });
}

// --- 2. DASHBOARD PAGE LOGIC ---
// Trigger file pickers, squish the photo, and jump over to scan preview.
const dashUploadBtn = document.getElementById('dashUploadBtn');
const dashCameraBtn = document.getElementById('dashCameraBtn');
const dashFileInput = document.getElementById('dashFileInput');
const dashCameraInput = document.getElementById('dashCameraInput');

if (dashUploadBtn && dashFileInput) {
    dashUploadBtn.addEventListener('click', () => dashFileInput.click());
    dashFileInput.addEventListener('change', (e) => {
        compressAndStoreImage(e.target.files[0], () => {
            window.location.href = 'scan.html';
        });
    });
}

if (dashCameraBtn && dashCameraInput) {
    dashCameraBtn.addEventListener('click', () => dashCameraInput.click());
    dashCameraInput.addEventListener('change', (e) => {
        compressAndStoreImage(e.target.files[0], () => {
            window.location.href = 'scan.html';
        });
    });
}

// --- 3. SCAN PREVIEW LOGIC ---
// Handles previewing, clearing, changing photos without leaving, and navigating to results.
const imagePreview = document.getElementById('imagePreview');
const clearBtn = document.getElementById('clearBtn');
const statusText = document.getElementById('statusText');
const scanAnalyzeBtn = document.getElementById('scanAnalyzeBtn') || document.getElementById('analyzeBtn');
const scanCameraBtn = document.getElementById('scanCameraBtn');
const scanUploadBtn = document.getElementById('scanUploadBtn');
const fileInput = document.getElementById('fileInput');
const cameraInput = document.getElementById('cameraInput');

if (imagePreview) {
    const pendingImg = sessionStorage.getItem('pendingImage');
    if (pendingImg) {
        imagePreview.src = pendingImg;
        imagePreview.style.display = 'block';
        if (clearBtn) clearBtn.style.display = 'flex';
        if (statusText) statusText.innerText = 'Image ready to Analyze';
    } else {
        if (statusText) statusText.innerText = 'No image selected';
    }
}

// Wipe photo and go back home if user hits X on the top right of the preview.
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        sessionStorage.removeItem('pendingImage');
        window.location.href = 'dashboard.html';
    });
}

// Let users pick a new photo directly on scan.html without kicking them back to dash
if (scanUploadBtn && fileInput) {
    scanUploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        compressAndStoreImage(e.target.files[0], (newImgBase64) => {
            imagePreview.src = newImgBase64;
            imagePreview.style.display = 'block';
            if (clearBtn) clearBtn.style.display = 'flex';
            if (statusText) statusText.innerText = 'Image ready to Analyze';
        });
    });
}

if (scanCameraBtn && cameraInput) {
    scanCameraBtn.addEventListener('click', () => cameraInput.click());
    cameraInput.addEventListener('change', (e) => {
        compressAndStoreImage(e.target.files[0], (newImgBase64) => {
            imagePreview.src = newImgBase64;
            imagePreview.style.display = 'block';
            if (clearBtn) clearBtn.style.display = 'flex';
            if (statusText) statusText.innerText = 'Image ready to Analyze';
        });
    });
}

// Trigger analysis navigation
if (scanAnalyzeBtn) {
    scanAnalyzeBtn.addEventListener('click', () => {
        const pendingImg = sessionStorage.getItem('pendingImage');
        if (!pendingImg) {
            alert("Upload or snap a picture first.");
            return;
        }
        window.location.href = 'result.html';
    });
}

// --- 4. RESULT PAGE & AI INFERENCE LOGIC ---
// Runs yung local model and pulls characteristics from data.js
const scannedImageDisplay = document.getElementById('scannedImageDisplay');

if (scannedImageDisplay) {
    runInferenceAndPopulate();
}

/**
 * Loads the offline TM model, runs prediction on the stored image,
 * builds the probability bars, and grabs traits from data.js.
 * Removed the stupid onload wrapper because Base64 images load instantly.
 */
async function runInferenceAndPopulate() {
    const storedImg = sessionStorage.getItem('pendingImage');
    if (!storedImg) {
        alert("No image found to analyze. Kicking you back to the dashboard...");
        window.location.href = 'dashboard.html';
        return;
    }

    // Set the image instantly from memory
    scannedImageDisplay.src = storedImg;

    try {
        console.log("Loading AI model... please hold.");
        
        // --- THE IOS WEBGL FIX ---
        // Force TensorFlow to use the CPU because Safari's GPU engine is being ass. tangina ng iOS talaga.
        await tf.setBackend('cpu');
        await tf.ready();
        // -------------------------
        
        // 1. Load local model (this takes a second or two)
        const model = await tmImage.load(MODEL_PATH + "model.json", MODEL_PATH + "metadata.json");
        const maxPredictions = model.getTotalClasses();
        
        console.log("Model loaded. Running prediction...");

        // 2. Predict instantly (No need to wait for onload, the image is already there)
        const predictions = await model.predict(scannedImageDisplay);

        // Sort highest probability first
        predictions.sort((a, b) => b.probability - a.probability);
        const topMatch = predictions[0];
        const confidencePercent = (topMatch.probability * 100).toFixed(0);

        // 3. Fill top match UI
        const speciesNameEl = document.getElementById('speciesName');
        const topScoreBadgeEl = document.getElementById('topScoreBadge');
        const confidenceTextEl = document.getElementById('confidenceText');

        if (speciesNameEl) speciesNameEl.innerText = topMatch.className;
        if (topScoreBadgeEl) topScoreBadgeEl.innerText = confidencePercent + "%";
        if (confidenceTextEl) confidenceTextEl.innerText = confidencePercent + "%";

        // 4. Build probability bars (clear out any old crap first)
        const matrixContainer = document.getElementById('matrixRows');
        if (matrixContainer) {
            matrixContainer.innerHTML = '';
            predictions.forEach(pred => {
                const probVal = (pred.probability * 100).toFixed(0);
                const row = document.createElement('div');
                row.className = 'matrix-row';
                row.innerHTML = `
                    <div class="matrix-label">
                        <span>${pred.className}</span>
                        <span>${probVal}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${probVal}%;"></div>
                    </div>
                `;
                matrixContainer.appendChild(row);
            });
        }

        // 5. Grab characteristics from data.js object
        if (typeof AspergillusData !== 'undefined') {
            const traits = AspergillusData[topMatch.className];
            if (traits) {
                if (document.getElementById("charGrowthRate")) document.getElementById("charGrowthRate").innerText = traits.growthRate;
                if (document.getElementById("charSurfaceColor")) document.getElementById("charSurfaceColor").innerText = traits.surfaceColor;
                if (document.getElementById("charReverseColor")) document.getElementById("charReverseColor").innerText = traits.reverseColor;
                if (document.getElementById("charMycelium")) document.getElementById("charMycelium").innerText = traits.myceliumTexture;
            } else {
                console.warn(`Whoops, no traits found in data.js for: ${topMatch.className}`);
            }
        } else {
            console.error("data.js is missing! Did you link it in result.html?");
        }

    } catch (err) {
        console.error("AI Model completely shit the bed:", err);
        // Force the actual error message into the alert box
        alert("MODEL CRASH: " + err.name + " - " + err.message);
    }
}

// Back button
const backToDashBtn = document.getElementById('backToDashBtn');
if (backToDashBtn) {
    backToDashBtn.addEventListener('click', () => {
        window.location.href = 'scan.html';
    });
}

// Classify another sample button
const classifyAnotherBtn = document.getElementById('classifyAnotherBtn');
if (classifyAnotherBtn) {
    classifyAnotherBtn.addEventListener('click', () => {
        sessionStorage.removeItem('pendingImage');
        window.location.href = 'dashboard.html';
    });
}