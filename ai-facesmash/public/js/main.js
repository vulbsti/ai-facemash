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
    console.log("Sending request to: ", `/.netlify/functions/api/${endpoint}`);
    
    const response = await fetch(`/.netlify/functions/api/${endpoint}`, {
      method: 'POST',
      body: formData
    });

    console.log("Response status:", response.status);
    
    // Debug response headers
    for (let [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = await response.text();
        }
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(errorMessage);
    }

    try {
      // With Netlify functions, we get a JSON response instead of a stream
      const responseData = await response.json();
      console.log("Response data received:", responseData);
      
      // Create a mock response with the result text
      const mockResponse = new Response(responseData.result);
      return mockResponse;
    } catch (e) {
      console.error("Error parsing JSON response:", e);
      throw new Error("Failed to parse response from server");
    }
  } catch (error) {
    console.error("Request error:", error);
    showError(error.message);
    throw error;
  }
}