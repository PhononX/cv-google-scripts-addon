// Function to enable Google Docs comment/reply/cancel buttons
function enableButton(activeInputElement) {
  // Find the parent container that holds the input and buttons
  const parentContainer = activeInputElement.closest('.docos-input');
  
  if (!parentContainer) {
    // console.log('Parent container not found');
    return;
  }
  
  // Find all buttons within the button container
  const buttonContainer = parentContainer.querySelector('.docos-input-buttons');
  
  if (!buttonContainer) {
    // console.log('Button container not found');
    return;
  }
  
  // Find Reply/Comment/Cancel buttons
  const buttons = buttonContainer.querySelectorAll('.docos-input-post, .docos-input-cancel');
  
  buttons.forEach(button => {
    enableSingleButton(button);
    // console.log(`Enabled button: ${button.getAttribute('aria-label')}`);
  });
  
  // If this is a reply input, also enable thread-level buttons
  enableThreadButtons(activeInputElement);
}

// Helper function to enable a single button
function enableSingleButton(button) {
  // Remove disabled class
  button.classList.remove('jfk-button-disabled');
  
  // Set aria-disabled to false
  button.setAttribute('aria-disabled', 'false');
  
  // Add tabindex if it's missing (for keyboard accessibility)
  if (!button.hasAttribute('tabindex')) {
    button.setAttribute('tabindex', '0');
  }
  
  // Remove the click blocker if it exists
  if (button._clickBlocker) {
    button.removeEventListener('click', button._clickBlocker, true);
    button.removeEventListener('mousedown', button._clickBlocker, true);
    button.removeEventListener('keydown', button._clickBlocker, true);
    delete button._clickBlocker;
  }
  
  // Restore pointer events
  button.style.pointerEvents = '';
}

// Function to enable thread-level buttons (resolve and more options)
function enableThreadButtons(activeInputElement) {
  // Try multiple approaches to find the comment thread container
  let threadContainer = null;
  
  // Method 1: Try specific Google Docs thread containers
  const threadSelectors = [
    '.docos-anchoredreplyview',
    '.docos-replyview', 
    '.docos-streamview-dvs',
    '.docos-anchoreddocoview',
    '.docos-docoview',
    '[data-thread-id]',
    '.docos-anchoredreplyview-wrapper',
    '.docos-replyview-wrapper'
  ];
  
  for (const selector of threadSelectors) {
    threadContainer = activeInputElement.closest(selector);
    if (threadContainer) {
      // console.log(`Found thread container using selector: ${selector}`);
      break;
    }
  }
  
  // Method 2: Walk up the DOM tree looking for containers with thread buttons
  if (!threadContainer) {
    let current = activeInputElement.parentElement;
    let maxDepth = 10; // Prevent infinite loops
    
    while (current && maxDepth > 0) {
      // Look for resolve button or more options in current container
      const hasResolveButton = current.querySelector('.docos-replyview-resolve-button');
      const hasMoreOptions = current.querySelector('.docos-docomenu-dropdown');
      
      if (hasResolveButton || hasMoreOptions) {
        threadContainer = current;
        // console.log('Found thread container by walking up DOM tree');
        break;
      }
      
      current = current.parentElement;
      maxDepth--;
    }
  }
  
  // Method 3: Look for sibling containers that might contain thread buttons
  if (!threadContainer) {
    const inputContainer = activeInputElement.closest('.docos-input');
    if (inputContainer) {
      const parent = inputContainer.parentElement;
      if (parent) {
        // Check siblings for thread buttons
        const siblings = Array.from(parent.children);
        for (const sibling of siblings) {
          const hasResolveButton = sibling.querySelector('.docos-replyview-resolve-button');
          const hasMoreOptions = sibling.querySelector('.docos-docomenu-dropdown');
          
          if (hasResolveButton || hasMoreOptions) {
            threadContainer = parent;
            // console.log('Found thread container in sibling elements');
            break;
          }
        }
      }
    }
  }
  
  if (!threadContainer) {
    // console.log('Thread container not found - this might be a new comment rather than a reply');
    // Try to find thread buttons anywhere in the document as a last resort
    const allResolveButtons = document.querySelectorAll('.docos-replyview-resolve-button');
    const allMoreOptions = document.querySelectorAll('.docos-docomenu-dropdown');
    
    if (allResolveButtons.length > 0 || allMoreOptions.length > 0) {
      // console.log(`Found ${allResolveButtons.length} resolve buttons and ${allMoreOptions.length} more options buttons globally`);
      
      // Enable all of them if we can't determine the specific thread
      allResolveButtons.forEach(button => {
        enableSingleButton(button);
        // console.log('Enabled resolve button (global search)');
      });
      
      allMoreOptions.forEach(button => {
        enableSingleButton(button);
        // console.log('Enabled more options button (global search)');
      });
    }
    return;
  }
  
  // Enable "Mark as resolved" button (only on first comment)
  const resolveButton = threadContainer.querySelector('.docos-replyview-resolve-button');
  if (resolveButton) {
    enableSingleButton(resolveButton);
    // console.log('Enabled resolve button');
  }
  
  // Enable all "More options" buttons in the thread
  const moreOptionsButtons = threadContainer.querySelectorAll('.docos-docomenu-dropdown');
  moreOptionsButtons.forEach(button => {
    enableSingleButton(button);
    // console.log('Enabled more options button');
  });
  
  // Also check for any buttons in the button holder
  const buttonHolders = threadContainer.querySelectorAll('.docos-anchoredreplyview-buttonholder');
  buttonHolders.forEach(holder => {
    const buttons = holder.querySelectorAll('[role="button"]');
    buttons.forEach(button => {
      enableSingleButton(button);
      // console.log(`Enabled thread button: ${button.getAttribute('aria-label') || 'Unknown'}`);
    });
  });
}

// Function to disable Google Docs comment/reply/cancel buttons
function disableButton(activeInputElement) {
  // Find the parent container that holds the input and buttons
  const parentContainer = activeInputElement.closest('.docos-input');
  
  if (!parentContainer) {
    // console.log('Parent container not found');
    return;
  }
  
  // Find all buttons within the button container
  const buttonContainer = parentContainer.querySelector('.docos-input-buttons');
  
  if (!buttonContainer) {
    // console.log('Button container not found');
    return;
  }
  
  // Find Reply/Comment/Cancel buttons
  const buttons = buttonContainer.querySelectorAll('.docos-input-post, .docos-input-cancel');
  
  buttons.forEach(button => {
    disableSingleButton(button);
    // console.log(`Disabled button: ${button.getAttribute('aria-label')}`);
  });
  
  // If this is a reply input, also disable thread-level buttons
  disableThreadButtons(activeInputElement);
}

// Helper function to disable a single button
function disableSingleButton(button) {
  // Add disabled class
  button.classList.add('jfk-button-disabled');
  
  // Set aria-disabled to true
  button.setAttribute('aria-disabled', 'true');
  
  // Remove tabindex to make it non-focusable
  button.removeAttribute('tabindex');
  
  // Create a click blocker function that prevents all interactions
  if (!button._clickBlocker) {
    button._clickBlocker = function(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    };
  }
  
  // Block click, mousedown, and keydown events
  button.addEventListener('click', button._clickBlocker, true);
  button.addEventListener('mousedown', button._clickBlocker, true);
  button.addEventListener('keydown', button._clickBlocker, true);
  
  // Disable pointer events as an additional safeguard
  button.style.pointerEvents = 'none';
}

// Function to disable thread-level buttons (resolve and more options)
function disableThreadButtons(activeInputElement) {
  // Try multiple approaches to find the comment thread container
  let threadContainer = null;
  
  // Method 1: Try specific Google Docs thread containers
  const threadSelectors = [
    '.docos-anchoredreplyview',
    '.docos-replyview', 
    '.docos-streamview-dvs',
    '.docos-anchoreddocoview',
    '.docos-docoview',
    '[data-thread-id]',
    '.docos-anchoredreplyview-wrapper',
    '.docos-replyview-wrapper'
  ];
  
  for (const selector of threadSelectors) {
    threadContainer = activeInputElement.closest(selector);
    if (threadContainer) {
      // console.log(`Found thread container using selector: ${selector}`);
      break;
    }
  }
  
  // Method 2: Walk up the DOM tree looking for containers with thread buttons
  if (!threadContainer) {
    let current = activeInputElement.parentElement;
    let maxDepth = 10; // Prevent infinite loops
    
    while (current && maxDepth > 0) {
      // Look for resolve button or more options in current container
      const hasResolveButton = current.querySelector('.docos-replyview-resolve-button');
      const hasMoreOptions = current.querySelector('.docos-docomenu-dropdown');
      
      if (hasResolveButton || hasMoreOptions) {
        threadContainer = current;
        // console.log('Found thread container by walking up DOM tree');
        break;
      }
      
      current = current.parentElement;
      maxDepth--;
    }
  }
  
  // Method 3: Look for sibling containers that might contain thread buttons
  if (!threadContainer) {
    const inputContainer = activeInputElement.closest('.docos-input');
    if (inputContainer) {
      const parent = inputContainer.parentElement;
      if (parent) {
        // Check siblings for thread buttons
        const siblings = Array.from(parent.children);
        for (const sibling of siblings) {
          const hasResolveButton = sibling.querySelector('.docos-replyview-resolve-button');
          const hasMoreOptions = sibling.querySelector('.docos-docomenu-dropdown');
          
          if (hasResolveButton || hasMoreOptions) {
            threadContainer = parent;
            console.log('Found thread container in sibling elements');
            break;
          }
        }
      }
    }
  }
  
  if (!threadContainer) {
    // console.log('Thread container not found - this might be a new comment rather than a reply');
    // Try to find thread buttons anywhere in the document as a last resort
    const allResolveButtons = document.querySelectorAll('.docos-replyview-resolve-button');
    const allMoreOptions = document.querySelectorAll('.docos-docomenu-dropdown');
    
    if (allResolveButtons.length > 0 || allMoreOptions.length > 0) {
      // console.log(`Found ${allResolveButtons.length} resolve buttons and ${allMoreOptions.length} more options buttons globally`);
      
      // Disable all of them if we can't determine the specific thread
      allResolveButtons.forEach(button => {
        disableSingleButton(button);
        // console.log('Disabled resolve button (global search)');
      });
      
      allMoreOptions.forEach(button => {
        disableSingleButton(button);
        // console.log('Disabled more options button (global search)');
      });
    }
    return;
  }
  
  // Disable "Mark as resolved" button (only on first comment)
  const resolveButton = threadContainer.querySelector('.docos-replyview-resolve-button');
  if (resolveButton) {
    disableSingleButton(resolveButton);
    // console.log('Disabled resolve button');
  }
  
  // Disable all "More options" buttons in the thread
  const moreOptionsButtons = threadContainer.querySelectorAll('.docos-docomenu-dropdown');
  moreOptionsButtons.forEach(button => {
    disableSingleButton(button);
    // console.log('Disabled more options button');
  });
  
  // Also check for any buttons in the button holder
  const buttonHolders = threadContainer.querySelectorAll('.docos-anchoredreplyview-buttonholder');
  buttonHolders.forEach(holder => {
    const buttons = holder.querySelectorAll('[role="button"]');
    buttons.forEach(button => {
      disableSingleButton(button);
      // console.log(`Disabled thread button: ${button.getAttribute('aria-label') || 'Unknown'}`);
    });
  });
}


