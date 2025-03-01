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
});