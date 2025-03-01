document.addEventListener('DOMContentLoaded', function() {
    const sharedResponseContent = document.getElementById('sharedResponseContent');
    const sharedLoadingIndicator = document.getElementById('sharedLoadingIndicator');
    
    async function loadSharedResponse() {
        const urlParams = new URLSearchParams(window.location.search);
        const shareId = urlParams.get('id');
        
        if (!shareId) {
            sharedResponseContent.innerHTML = '<p class="error-message">Invalid share link. No share ID provided.</p>';
            hideElement(sharedLoadingIndicator);
            return;
        }
        
        try {
            const response = await fetch(`/api/shared/${shareId}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to load shared content');
            }
            
            const data = await response.json();
            hideElement(sharedLoadingIndicator);
            renderMarkdown(data.content, sharedResponseContent);
        } catch (error) {
            hideElement(sharedLoadingIndicator);
            sharedResponseContent.innerHTML = `<p class="error-message">Error loading shared content: ${error.message}</p>`;
        }
    }

    function hideElement(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    function renderMarkdown(content, element) {
        if (window.marked) {
            element.innerHTML = window.marked.parse(content);
        } else {
            element.innerHTML = content;
        }
    }
    
    loadSharedResponse();
});