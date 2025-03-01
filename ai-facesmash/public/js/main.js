/**
 * Main JavaScript file with shared functionality
 */

// Helper functions
function showElement(element) {
  if (typeof element === 'string') {
    element = document.getElementById(element);
  }
  if (element) {
    element.classList.remove('hidden');
  }
}

function hideElement(element) {
  if (typeof element === 'string') {
    element = document.getElementById(element);
  }
  if (element) {
    element.classList.add('hidden');
  }
}

// Rendering markdown content
function renderMarkdown(markdownText, targetElement) {
  if (typeof targetElement === 'string') {
    targetElement = document.getElementById(targetElement);
  }
  if (targetElement && window.marked) {
    targetElement.innerHTML = marked.parse(markdownText);
  }
}

// Function to handle streaming responses
async function handleStreamingResponse(response, contentElement) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let partialResponse = '';
  
  while (true) {
    const { value, done } = await reader.read();
    
    if (done) break;
    
    const text = decoder.decode(value, { stream: true });
    partialResponse += text;
    
    // Render the partial response as it comes in
    renderMarkdown(partialResponse, contentElement);
    
    // Auto-scroll to bottom
    contentElement.scrollTop = contentElement.scrollHeight;
  }
  
  return partialResponse;
}

// Function to display errors
function showError(message) {
  alert('Error: ' + message);
}

// Handle form submission with file uploads
async function submitFormData(endpoint, formData, responseElement) {
  try {
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }

    return response;
  } catch (error) {
    showError(error.message);
    throw error;
  }
}