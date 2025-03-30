document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const sourceUpload = document.getElementById('source-upload');
    const sourcePreview = document.getElementById('source-preview');
    const sourceCameraBtn = document.getElementById('source-camera');
    const targetUpload = document.getElementById('target-upload');
    const targetPreview = document.getElementById('target-preview');
    const swapButton = document.getElementById('swap-button');
    const resultPreview = document.getElementById('result-preview');
    const downloadBtn = document.getElementById('download-btn');
    const cameraModal = document.getElementById('camera-modal');
    const cameraFeed = document.getElementById('camera-feed');
    const captureBtn = document.getElementById('capture-btn');
    const captureCanvas = document.getElementById('capture-canvas');
    const closeModal = document.querySelector('.close-modal');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Advanced parameters elements
    const toggleAdvancedBtn = document.getElementById('toggle-advanced');
    const advancedParamsContainer = document.getElementById('advanced-params');
    const seedInput = document.getElementById('seed');
    const randomizeSeedCheckbox = document.getElementById('randomize-seed');
    const modelTypeSelect = document.getElementById('model-type');
    const swapTypeSelect = document.getElementById('swap-type');
    const styleTypeSelect = document.getElementById('style-type');
    const imageFormatSelect = document.getElementById('image-format');
    const imageQualityInput = document.getElementById('image-quality');
    const qualityValueSpan = document.getElementById('quality-value');

    // Variables to store image data
    let sourceImage = null;
    let targetImage = null;
    let resultImage = null;
    let stream = null;

    // Check for saved API key
    const savedApiKey = localStorage.getItem('segmindApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // Save API key
    saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('segmindApiKey', apiKey);
            alert('API key saved successfully!');
        } else {
            alert('Please enter a valid API key');
        }
    });

    // Handle source image upload
    sourceUpload.addEventListener('change', (e) => {
        handleImageUpload(e, sourcePreview, 'source');
    });

    // Handle target image upload
    targetUpload.addEventListener('change', (e) => {
        handleImageUpload(e, targetPreview, 'target');
    });

    // Handle image upload
    function handleImageUpload(event, previewElement, type) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.onload = () => {
                // Clear preview
                previewElement.innerHTML = '';
                previewElement.appendChild(img);

                // Store image data
                if (type === 'source') {
                    sourceImage = e.target.result;
                } else if (type === 'target') {
                    targetImage = e.target.result;
                }

                // Enable swap button if both images are selected
                updateSwapButtonState();
            };
        };
        reader.readAsDataURL(file);
    }

    // Update swap button state
    function updateSwapButtonState() {
        swapButton.disabled = !(sourceImage && targetImage && apiKeyInput.value.trim());
    }

    // Listen for API key input changes
    apiKeyInput.addEventListener('input', updateSwapButtonState);
    
    // Toggle advanced parameters section
    toggleAdvancedBtn.addEventListener('click', () => {
        const isVisible = advancedParamsContainer.style.display !== 'none';
        advancedParamsContainer.style.display = isVisible ? 'none' : 'grid';
        toggleAdvancedBtn.textContent = isVisible ? 'Show' : 'Hide';
    });
    
    // Update quality value display
    imageQualityInput.addEventListener('input', () => {
        qualityValueSpan.textContent = imageQualityInput.value;
    });
    
    // Handle randomize seed checkbox
    randomizeSeedCheckbox.addEventListener('change', () => {
        seedInput.disabled = randomizeSeedCheckbox.checked;
        if (randomizeSeedCheckbox.checked) {
            seedInput.value = Math.floor(Math.random() * 1000000);
        }
    });
    
    // Initialize seed input state
    seedInput.disabled = randomizeSeedCheckbox.checked;

    // Camera functionality
    sourceCameraBtn.addEventListener('click', openCamera);

    function openCamera() {
        cameraModal.style.display = 'block';
        
        // Access the camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((mediaStream) => {
                stream = mediaStream;
                cameraFeed.srcObject = mediaStream;
            })
            .catch((error) => {
                console.error('Error accessing camera:', error);
                alert('Unable to access camera. Please make sure you have granted camera permissions.');
                cameraModal.style.display = 'none';
            });
    }

    // Close camera modal
    closeModal.addEventListener('click', closeCamera);

    function closeCamera() {
        cameraModal.style.display = 'none';
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    // Capture photo
    captureBtn.addEventListener('click', capturePhoto);

    function capturePhoto() {
        const context = captureCanvas.getContext('2d');
        captureCanvas.width = cameraFeed.videoWidth;
        captureCanvas.height = cameraFeed.videoHeight;
        context.drawImage(cameraFeed, 0, 0, captureCanvas.width, captureCanvas.height);
        
        // Convert canvas to data URL
        const imageDataUrl = captureCanvas.toDataURL('image/png');
        
        // Display in preview
        const img = document.createElement('img');
        img.src = imageDataUrl;
        sourcePreview.innerHTML = '';
        sourcePreview.appendChild(img);
        
        // Store image data
        sourceImage = imageDataUrl;
        
        // Close camera
        closeCamera();
        
        // Update swap button state
        updateSwapButtonState();
    }

    // Swap face
    swapButton.addEventListener('click', swapFace);

    async function swapFace() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Please enter your API key');
            return;
        }

        if (!sourceImage || !targetImage) {
            alert('Please select both source and target images');
            return;
        }

        // Show loading overlay
        loadingOverlay.style.display = 'flex';

        try {
            // Convert base64 data URLs to Blob objects
            const sourceBlob = dataURLtoBlob(sourceImage);
            const targetBlob = dataURLtoBlob(targetImage);

            // Get advanced parameters
            const seed = randomizeSeedCheckbox.checked
                ? Math.floor(Math.random() * 1000000)
                : parseInt(seedInput.value);
            const modelType = modelTypeSelect.value;
            const swapType = swapTypeSelect.value;
            const styleType = styleTypeSelect.value;
            const imageFormat = imageFormatSelect.value;
            const imageQuality = parseInt(imageQualityInput.value);
            
            // Create FormData
            const formData = new FormData();
            formData.append('source_image', sourceBlob, 'source.png');
            formData.append('target_image', targetBlob, 'target.png');
            formData.append('seed', seed);
            formData.append('model_type', modelType);
            formData.append('swap_type', swapType);
            formData.append('style_type', styleType);
            formData.append('image_format', imageFormat);
            formData.append('image_quality', imageQuality);
            
            console.log('Using advanced parameters:', {
                seed,
                model_type: modelType,
                swap_type: swapType,
                style_type: styleType,
                image_format: imageFormat,
                image_quality: imageQuality
            });

            // Use our local server API proxy
            const apiUrl = '/api/faceswap';

            // Make API request
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
            }

            // Handle response
            const data = await response.json();
            
            // This is an assumption about the API response format
            // Adjust based on actual API documentation
            if (data.output) {
                displayResult(data.output);
            } else if (data.image) {
                displayResult(data.image);
            } else if (data.result) {
                displayResult(data.result);
            } else {
                // If the response is just a base64 string
                displayResult(data);
            }
        } catch (error) {
            console.error('Error during face swap:', error);
            alert(`Error during face swap: ${error.message}`);
        } finally {
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
        }
    }

    // Display result
    function displayResult(imageData) {
        // Check if imageData is a base64 string or URL
        let imgSrc = imageData;
        
        // If it's not a data URL or http URL, assume it's a base64 string without the prefix
        if (!imageData.startsWith('data:') && !imageData.startsWith('http')) {
            imgSrc = `data:image/png;base64,${imageData}`;
        }
        
        const img = document.createElement('img');
        img.src = imgSrc;
        img.onload = () => {
            resultPreview.innerHTML = '';
            resultPreview.appendChild(img);
            resultImage = imgSrc;
            downloadBtn.disabled = false;
        };
    }

    // Download result
    downloadBtn.addEventListener('click', () => {
        if (!resultImage) return;
        
        const a = document.createElement('a');
        a.href = resultImage;
        a.download = 'faceswap_result.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Utility function to convert data URL to Blob
    function dataURLtoBlob(dataURL) {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    }

    // Alternative API implementation
    // This function can be used if the API requires a different format
    async function alternativeApiRequest() {
        const apiKey = apiKeyInput.value.trim();
        
        // Convert images to base64 strings without the prefix
        const sourceBase64 = sourceImage.split(',')[1];
        const targetBase64 = targetImage.split(',')[1];
        
        // Use our local server API proxy
        const apiUrl = '/api/faceswap-json';
        
        // Request payload
        const payload = {
            source_image: sourceBase64,
            target_image: targetBase64,
            // Add any additional parameters required by the API
        };
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error during API request:', error);
            throw error;
        }
    }
});