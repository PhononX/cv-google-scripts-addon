//  Send comment part

// Function to find the currently active input element
function findActiveInputElement() {
  // Try multiple selectors to find active input
  const selectors = [
    '.docos-input-textarea[contenteditable="true"]:focus',
    '.docos-input-textarea.editable:focus',
    '.docos-input-textarea[contenteditable="true"]',
    '.docos-input-textarea.editable',
    '[contenteditable="true"][role="textbox"]',
    '[contenteditable="true"][role="combobox"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element;
    }
  }
  
  return null;
}


// Function to programmatically send comment or reply in Google Docs
function sendComment(activeInputElement = null, commentText = null) {
  try {
    // If no input element provided, try to find it automatically
    if (!activeInputElement) {
      activeInputElement = findActiveInputElement();
    }
    
    // Validate that we have an input element
    if (!activeInputElement) {
      // console.error('No active input element found. Make sure you have clicked in a comment/reply field.');
      return false;
    }
    
    // Additional validation
    if (typeof activeInputElement.closest !== 'function') {
      // console.error('Invalid input element provided');
      return false;
    }
    
    // Find the parent container
    const parentContainer = activeInputElement.closest('.docos-input');
    
    if (!parentContainer) {
      // console.error('Parent container not found');
      return false;
    }
    
    // If commentText is provided, set it in the input field
    if (commentText !== null) {
      // Clear existing content
      activeInputElement.innerHTML = '';
      
      // Set the new text content
      activeInputElement.textContent = commentText;
      
      // Trigger input events to notify Google Docs of the change
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      activeInputElement.dispatchEvent(inputEvent);
      
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      activeInputElement.dispatchEvent(changeEvent);
      
      // Small delay to ensure Google Docs processes the input
      setTimeout(() => {
        triggerSubmit();
      }, 100);
    } else {
      triggerSubmit();
    }
    
    function triggerSubmit() {
      // Find the submit button (Reply or Comment)
      const buttonContainer = parentContainer.querySelector('.docos-input-buttons');
      
      if (!buttonContainer) {
        // console.error('Button container not found');
        return false;
      }
      
      const submitButton = buttonContainer.querySelector('.docos-input-post');
      
      if (!submitButton) {
        // console.error('Submit button not found');
        return false;
      }
      
      // Method 1: Try simulating mouse events
      const mouseEvents = ['mousedown', 'mouseup', 'click'];
      mouseEvents.forEach(eventType => {
        const event = new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 0,
          buttons: 1,
          clientX: 0,
          clientY: 0
        });
        submitButton.dispatchEvent(event);
      });
      
      // Method 2: Try keyboard event (Enter key)
      const keyboardEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13
      });
      submitButton.dispatchEvent(keyboardEvent);
      
      // Method 3: Try focus and click
      if (submitButton.focus) {
        submitButton.focus();
      }
      
      // Method 4: Try triggering Google's internal handlers
      // Look for Google's event handlers on the button
      const gEvents = submitButton._events || submitButton.__events;
      if (gEvents && gEvents.click) {
        try {
          gEvents.click.forEach(handler => {
            if (typeof handler === 'function') {
              handler.call(submitButton, { preventDefault: () => {}, stopPropagation: () => {} });
            }
          });
        } catch (e) {
          // console.log('Error calling internal handlers:', e);
        }
      }
      
      // Method 5: Try simulating user activation
      if (window.chrome && window.chrome.runtime) {
        // For Chrome extensions, we might need user activation
        setTimeout(() => {
          submitButton.click();
        }, 50);
      }
      
      // console.log('Attempted to send comment/reply programmatically');
    }
    
    return true;
    
  } catch (error) {
    // console.error('Error sending comment:', error);
    return false;
  }
}