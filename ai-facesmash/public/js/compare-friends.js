/**
 * JavaScript for the Compare Friends page
 */
document.addEventListener('DOMContentLoaded', function() {
    const uploadAreas = document.querySelectorAll('.upload-area');
    const responseContainer = document.getElementById('responseContainer');
    const responseContent = document.getElementById('responseContent');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const ratingButtons = document.querySelectorAll('.rating-btn');
    
    // Set up each upload area
    uploadAreas.forEach(area => {
        const placeholder = area.querySelector('.upload-placeholder');
        const preview = area.querySelector('.image-preview');
        const input = area.querySelector('.image-upload');
        
        // Handle click on upload area
        area.addEventListener('click', function() {
            input.click();
        });
        
        // Handle file selection
        input.addEventListener('change', function(e) {
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
                preview.src = event.target.result;
                showElement(preview);
                hideElement(placeholder);
            };
            reader.readAsDataURL(file);
        });
    });
    
    // Handle rating button clicks
    ratingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const ratingType = this.getAttribute('data-type');
            sendImagesForComparison(ratingType);
        });
    });
    
    // Function to handle multiple image uploads and comparison request
    async function sendImagesForComparison(ratingType) {
        // Check if at least two images are uploaded
        const uploadedInputs = document.querySelectorAll('.image-upload');
        let uploadCount = 0;
        
        for (const input of uploadedInputs) {
            if (input.files.length > 0) {
                uploadCount++;
            }
        }
        
        if (uploadCount < 2) {
            alert('Please upload at least two images for comparison.');
            return;
        }
        
        // Show loading indicator
        hideElement(responseContainer);
        showElement(loadingIndicator);
        
        // Create form data
        const formData = new FormData();
        
        // Add each uploaded image to form data
        uploadedInputs.forEach((input, index) => {
            if (input.files.length > 0) {
                formData.append(`image${index + 1}`, input.files[0]);
            }
        });
        
        // Add rating type
        formData.append('ratingType', ratingType);
        
        try {
            // Send request to server
            const response = await submitFormData('compare-friends', formData, responseContent);
            
            // Process streaming response
            hideElement(loadingIndicator);
            showElement(responseContainer);
            
            // Handle the streaming response
            await handleStreamingResponse(response, responseContent);
        } catch (error) {
            hideElement(loadingIndicator);
            console.error('Error:', error);
        }
    }
});