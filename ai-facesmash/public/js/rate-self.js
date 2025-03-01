/**
 * JavaScript for the Rate Self page
 */
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const imageUpload = document.getElementById('imageUpload');
    const responseContainer = document.getElementById('responseContainer');
    const responseContent = document.getElementById('responseContent');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const ratingButtons = document.querySelectorAll('.rating-btn');
    const genderButtons = document.querySelectorAll('.gender-btn');
    
    // Track selected gender
    let selectedGender = 'male';
    
    // Handle gender button clicks
    genderButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all gender buttons
            genderButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update selected gender
            selectedGender = this.getAttribute('data-gender');
        });
    });
    
    // Handle click on upload area
    uploadArea.addEventListener('click', function() {
        imageUpload.click();
    });
    
    // Handle file selection
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        
        // Preview the image
        const reader = new FileReader();
        reader.onload = function(event) {
            imagePreview.src = event.target.result;
            showElement(imagePreview);
            hideElement(uploadPlaceholder);
        };
        reader.readAsDataURL(file);
    });
    
    // Handle rating button clicks
    ratingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const ratingType = this.getAttribute('data-type');
            sendImageForRating(ratingType);
        });
    });
    
    // Function to handle image upload and rating request
    async function sendImageForRating(ratingType) {
        // Check if an image is uploaded
        if (imageUpload.files.length === 0 || !imageUpload.files[0]) {
            alert('Please upload an image first.');
            return;
        }
        
        // Show loading indicator
        hideElement(responseContainer);
        showElement(loadingIndicator);
        
        // Create form data
        const formData = new FormData();
        formData.append('image', imageUpload.files[0]);
        formData.append('ratingType', ratingType);
        formData.append('gender', selectedGender);
        
        try {
            // Send request to server
            const response = await submitFormData('rate-self', formData, responseContent);
            
            // Process streaming response
            hideElement(loadingIndicator);
            showElement(responseContainer);
            
            // Handle the streaming response
            await handleStreamingResponse(response, responseContent);
        } catch (error) {
            hideElement(loadingIndicator);
            console.error('Error:', error);
            // Don't clear the image preview on error
        }
    }

    // Add share button elements
    const responseHeader = document.createElement('div');
    responseHeader.className = 'response-header';
    
    const title = document.createElement('h3');
    title.textContent = 'AI Response';
    
    const shareButton = document.createElement('button');
    shareButton.className = 'share-button';
    shareButton.innerHTML = '<i class="fas fa-share-alt"></i>Share Response';
    
    responseHeader.appendChild(title);
    responseHeader.appendChild(shareButton);
    
    // Insert the header at the start of response container
    responseContainer.insertBefore(responseHeader, responseContainer.firstChild);

    // Create share modal
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.innerHTML = `
        <div class="share-modal-content">
            <div class="share-modal-header">
                <h3 class="share-modal-title">Share Your Result</h3>
                <button class="share-modal-close">&times;</button>
            </div>
            <div class="share-preview" id="sharePreview"></div>
            <div class="share-options">
                <div class="share-option" id="shareInstagram">
                    <div class="share-option-icon instagram-icon">
                        <i class="fab fa-instagram"></i>
                    </div>
                    <div class="share-option-text">
                        <h4>Share to Instagram Stories</h4>
                        <p>Share this result to your Instagram story</p>
                    </div>
                </div>
                <div class="share-option" id="shareCopyLink">
                    <div class="share-option-icon copy-link-icon">
                        <i class="fas fa-link"></i>
                    </div>
                    <div class="share-option-text">
                        <h4>Copy Link</h4>
                        <p>Copy a link to share anywhere</p>
                    </div>
                </div>
            </div>
            <div class="share-success" id="shareSuccess">
                <p>Link copied to clipboard!</p>
                <p class="validity-notice">Note: This shared link is valid for 24 hours</p>
            </div>
        </div>
    `;
    document.body.appendChild(shareModal);

    // Share functionality variables
    const sharePreview = document.getElementById('sharePreview');
    const shareModalClose = shareModal.querySelector('.share-modal-close');
    const shareInstagram = document.getElementById('shareInstagram');
    const shareCopyLink = document.getElementById('shareCopyLink');
    const shareSuccess = document.getElementById('shareSuccess');
    let currentImageDataUrl = null;
    let currentShareId = null;

    // Function to convert response to image
    async function convertResponseToImage(element) {
        try {
            // Store original height and scroll position
            const originalHeight = element.style.maxHeight;
            const originalOverflow = element.style.overflow;
            const originalPosition = element.scrollTop;
            
            // Temporarily remove scroll constraints
            element.style.maxHeight = 'none';
            element.style.overflow = 'visible';
            
            // Create canvas with full content
            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                scrollY: -window.scrollY,
                height: element.scrollHeight,
                windowHeight: element.scrollHeight
            });
            
            // Restore original styling
            element.style.maxHeight = originalHeight;
            element.style.overflow = originalOverflow;
            element.scrollTop = originalPosition;
            
            // Add watermark
            const ctx = canvas.getContext('2d');
            ctx.font = '14px Arial';
            ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
            ctx.fillText('AI Facesmash · facesmash.app', 10, canvas.height - 10);
            
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error('Error converting to image:', error);
            return null;
        }
    }

    // Function to share response
    async function shareResponse(responseContent) {
        try {
            const response = await fetch('/api/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: responseContent
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create share link');
            }
            
            const data = await response.json();
            return data.shareId;
        } catch (error) {
            console.error('Error sharing:', error);
            return null;
        }
    }

    // Function to open share modal
    async function openShareModal(content) {
        // Store current content
        const currentResponseContent = content || responseContent.innerHTML;
        
        // Show loading in preview
        sharePreview.innerHTML = '<div class="loading-indicator"><span class="loader"></span><p>Generating preview...</p></div>';
        
        // Display modal
        shareModal.classList.add('active');
        
        try {
            // Generate image preview
            currentImageDataUrl = await convertResponseToImage(responseContent);
            
            if (currentImageDataUrl) {
                // Show image preview
                sharePreview.innerHTML = `<img src="${currentImageDataUrl}" style="max-width: 100%;" alt="Preview">`;
                
                // Generate share ID if not already generated
                if (!currentShareId) {
                    currentShareId = await shareResponse(currentResponseContent);
                }
            } else {
                sharePreview.innerHTML = '<p class="error-message">Failed to generate preview</p>';
            }
        } catch (error) {
            console.error('Error in share modal:', error);
            sharePreview.innerHTML = '<p class="error-message">Error generating preview</p>';
        }
    }

    // Helper function to convert data URL to Blob
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

    // Share to Instagram function
    function shareToInstagram(imageDataUrl) {
        const blob = dataURLtoBlob(imageDataUrl);
        const file = new File([blob], 'facesmash-rating.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: 'My AI Facesmash Rating',
                text: 'Check out my AI rating from Facesmash!'
            })
            .then(() => console.log('Shared successfully'))
            .catch(error => {
                console.error('Error sharing:', error);
                fallbackShare();
            });
        } else {
            fallbackShare();
        }
    }

    // Fallback sharing for devices that don't support Web Share API
    function fallbackShare() {
        const instagramUrl = 'instagram://story-camera';
        window.open(instagramUrl, '_blank');
        
        alert('To share to Instagram Stories:\n1. Save the image (long press and save)\n2. Open Instagram\n3. Create a new story and upload the saved image');
        
        const link = document.createElement('a');
        link.href = currentImageDataUrl;
        link.download = 'facesmash-rating.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Event Listeners for share functionality
    shareButton.addEventListener('click', () => openShareModal());
    
    shareModalClose.addEventListener('click', () => {
        shareModal.classList.remove('active');
        shareSuccess.classList.remove('active');
    });
    
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.classList.remove('active');
            shareSuccess.classList.remove('active');
        }
    });
    
    shareInstagram.addEventListener('click', () => {
        if (currentImageDataUrl) {
            shareToInstagram(currentImageDataUrl);
        } else {
            alert('Error: Failed to generate image for sharing');
        }
    });
    
    shareCopyLink.addEventListener('click', async () => {
        if (currentShareId) {
            const shareUrl = `${window.location.origin}/shared-response.html?id=${currentShareId}`;
            
            try {
                await navigator.clipboard.writeText(shareUrl);
                shareSuccess.classList.add('active');
                setTimeout(() => {
                    shareSuccess.classList.remove('active');
                }, 3000);
            } catch (error) {
                console.error('Failed to copy:', error);
                alert('Failed to copy link. Please try again.');
            }
        } else {
            alert('Error: Failed to generate share link');
        }
    });
});