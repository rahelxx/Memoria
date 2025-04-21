// Storage for codes and their associated images
const codeStorage = {};

// DOM Elements
const elements = {
    generateBtn: document.getElementById('generate-btn'),
    codeDisplay: document.getElementById('code-display'),
    submitBtn: document.getElementById('submit-btn'),
    codeInput: document.getElementById('code-input'),
    filenameInput: document.getElementById('filename-input'),
    errorMessage: document.getElementById('error-message'),
    filenameErrorMessage: document.getElementById('filename-error-message'),
    mainPage: document.getElementById('main-page'),
    galleryPage: document.getElementById('gallery-page'),
    uploadPage: document.getElementById('upload-page'),
    imageUpload: document.getElementById('image-upload'),
    uploadBtn: document.getElementById('upload-btn'),
    viewGalleryBtn: document.getElementById('view-gallery-btn'),
    imageContainer: document.getElementById('image-container'),
    backBtn: document.getElementById('back-btn'),
    downloadAllBtn: document.getElementById('download-all-btn')
};

// Generate a unique code with optional filename prefix
function generateUniqueCode(filename = '') {
    let code;
    const prefix = filename ? filename.substring(0, 3).toUpperCase() : '';
    
    do {
        const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        code = prefix + randomPart;
    } while (codeStorage[code]);
    
    // Initialize storage for this code
    codeStorage[code] = [];
    localStorage.setItem(code, JSON.stringify([]));
    return code;
}

// Display the gallery with images for a specific code
function showGallery(code) {
    elements.mainPage.style.display = 'none';
    elements.uploadPage.style.display = 'none';
    elements.galleryPage.style.display = 'block';
    
    // Clear and rebuild the image gallery
    elements.imageContainer.innerHTML = '';
    codeStorage[code].forEach((imgSrc, index) => {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'image-wrapper';
        
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `Uploaded image ${index + 1}`;
        img.loading = 'lazy';
        
        imgWrapper.appendChild(img);
        elements.imageContainer.appendChild(imgWrapper);
    });
}

// Event Listeners

// Generate code with filename prefix
elements.generateBtn.addEventListener('click', () => {
    const filename = elements.filenameInput.value.trim();
    
    if (!filename) {
        elements.filenameErrorMessage.textContent = 'Please enter a file name first';
        return;
    }
    
    elements.filenameErrorMessage.textContent = '';
    const code = generateUniqueCode(filename);
    elements.codeDisplay.textContent = code;
    elements.codeInput.value = code;
    localStorage.setItem('lastGeneratedCode', code);
});

// Submit code to view/upload images
elements.submitBtn.addEventListener('click', () => {
    const enteredCode = elements.codeInput.value.trim().toUpperCase();
    
    if (!enteredCode) {
        elements.errorMessage.textContent = 'Please enter a code';
        return;
    }
    
    // Check if code exists in storage
    if (localStorage.getItem(enteredCode) !== null) {
        // Load images from storage
        const savedImages = JSON.parse(localStorage.getItem(enteredCode));
        codeStorage[enteredCode] = savedImages || [];
        
        if (savedImages && savedImages.length > 0) {
            showGallery(enteredCode);
        } else {
            elements.mainPage.style.display = 'none';
            elements.uploadPage.style.display = 'block';
            elements.galleryPage.style.display = 'none';
        }
        elements.errorMessage.textContent = '';
    } else {
        elements.errorMessage.textContent = 'Invalid code, please try again';
    }
});

// Upload images
elements.uploadBtn.addEventListener('click', () => {
    const files = elements.imageUpload.files;
    const enteredCode = elements.codeInput.value.trim().toUpperCase();
    
    if (files.length === 0) {
        alert('Please select at least one image');
        return;
    }
    
    if (!codeStorage[enteredCode]) {
        codeStorage[enteredCode] = [];
    }
    
    let uploadCount = 0;
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
        alert('Please select valid image files only');
        return;
    }
    
    validFiles.forEach((file) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            codeStorage[enteredCode].push(e.target.result);
            uploadCount++;
            
            if (uploadCount === validFiles.length) {
                localStorage.setItem(enteredCode, JSON.stringify(codeStorage[enteredCode]));
                alert(`Successfully uploaded ${uploadCount} image(s)`);
                showGallery(enteredCode);
            }
        };
        
        reader.readAsDataURL(file);
    });
});

// View gallery from upload page
elements.viewGalleryBtn.addEventListener('click', () => {
    const enteredCode = elements.codeInput.value.trim().toUpperCase();
    if (codeStorage[enteredCode] && codeStorage[enteredCode].length > 0) {
        showGallery(enteredCode);
    } else {
        alert('No images uploaded yet for this code');
    }
});

// Download all images as ZIP
elements.downloadAllBtn.addEventListener('click', () => {
    const enteredCode = elements.codeInput.value.trim().toUpperCase();
    const images = codeStorage[enteredCode];
    
    if (!images || images.length === 0) {
        alert('No images available to download');
        return;
    }

    const zip = new JSZip();
    const folder = zip.folder(`Memoria_Photos_${enteredCode}`);
    
    images.forEach((imgData, index) => {
        const imgDataParts = imgData.split(',');
        const contentType = imgDataParts[0].match(/:(.*?);/)[1];
        const imgContent = imgDataParts[1];
        folder.file(`image_${index+1}.${contentType.split('/')[1]}`, imgContent, {base64: true});
    });
    
    zip.generateAsync({type:"blob"}).then(content => {
        saveAs(content, `Memoria_Photos_${enteredCode}.zip`);
    }).catch(error => {
        console.error('Error creating ZIP file:', error);
        alert('Error creating download file. Please try again.');
    });
});

// Return to homepage
elements.backBtn.addEventListener('click', () => {
    elements.galleryPage.style.display = 'none';
    elements.uploadPage.style.display = 'none';
    elements.mainPage.style.display = 'block';
    elements.codeInput.value = '';
    elements.errorMessage.textContent = '';
    elements.filenameInput.value = '';
    elements.filenameErrorMessage.textContent = '';
});

// Initialize on page load
window.addEventListener('load', () => {
    const lastCode = localStorage.getItem('lastGeneratedCode');
    if (lastCode) {
        elements.codeDisplay.textContent = lastCode;
    }
    
    elements.uploadPage.style.display = 'none';
    elements.galleryPage.style.display = 'none';
});