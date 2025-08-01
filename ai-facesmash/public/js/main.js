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
    console.log("Sending request to: ", `/.netlify/functions/${endpoint}`);
    
    // Show temporary analyzing message with a more accurate time estimate
    if (responseElement) {
      responseElement.innerHTML = `<p>Processing your image...<br>This may take up to 60 seconds.<br><small>Please be patient as AI image analysis can take time.</small></p>`;
    }
    
    // Implement client-side timeout for fetch request with an increased timeout
    // since we're using background functions that can take longer
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 1.5 minute timeout
    
    const response = await fetch(`/.netlify/functions/${endpoint}`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);

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
    
    // Special handling for timeout errors
    if (error.name === 'AbortError') {
      showError('The request timed out. The server might be busy. Please try again later.');
    } else if (error.message.includes('timed out')) {
      showError('The AI service is taking too long to respond. Please try with a smaller image or try again later.');
    } else {
      showError(error.message);
    }
    
    throw error;
  }
}