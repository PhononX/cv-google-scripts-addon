
function enableAllInteractions() {
  document.querySelectorAll('.action-button, #timer-display, .red-dot').forEach(el => {
    el.style.pointerEvents = 'auto';
    el.style.opacity = '1';
    el.disabled = false;
  });
}

function disableAllInteractions() {
  document.querySelectorAll('.action-button, #timer-display, .red-dot').forEach(el => {
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.6';
    el.disabled = true;
  });
}

/**
 * Adds a "Processing" text with animated dots after the timer display
 */
function addProcessingAnimation() {
  const timerDisplay = document.getElementById('timer-display');

  // Only add if not already present
  if (!document.getElementById('processing-text')) {
    // Create processing text element
    const processingText = document.createElement('span');
    processingText.id = 'processing-text';
    processingText.textContent = ' Processing';
    processingText.style.marginLeft = '5px';

    // Create dots container
    const dotsContainer = document.createElement('span');
    dotsContainer.className = 'dots';

    // Create three animated dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.textContent = '.';
      dotsContainer.appendChild(dot);
    }

    // Insert elements after timer
    timerDisplay.insertAdjacentElement('afterend', processingText);
    processingText.insertAdjacentElement('afterend', dotsContainer);
  }
}

/**
 * Removes the "Processing" text and animated dots
 */
function removeProcessingAnimation() {
  const processingText = document.getElementById('processing-text');
  const dotsContainer = document.querySelector('.dots');

  // Remove elements if they exist
  if (processingText) {
    processingText.remove();
  }

  if (dotsContainer) {
    dotsContainer.remove();
  }
}

/**
 * Adds animated dots in the login button
 */
function addDotsToSignInButton() {
  const loginButton = document.querySelector('.login-button');

  // Only add if not already present
  if (!document.getElementById('testapp-dots')) {
    // Store the original text for later restoration
    const originalText = loginButton.textContent;
    loginButton.setAttribute('data-original-text', originalText);

    const baseText = originalText;

    // Create a span for "TestApp"
    const testAppSpan = document.createElement('span');
    testAppSpan.textContent = '';

    // Create dots container
    const dotsContainer = document.createElement('span');
    dotsContainer.id = 'testapp-dots';
    dotsContainer.className = 'dots';

    // Create three animated dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.textContent = '.';
      dotsContainer.appendChild(dot);
    }

    // Clear the button and rebuild its content
    loginButton.textContent = baseText;
    loginButton.appendChild(testAppSpan);
    loginButton.appendChild(dotsContainer);

    loginButton.disabled = true;
    loginButton.style.opacity = '0.7';
    loginButton.style.cursor = 'not-allowed';
  }
}

/**
 * Removes the animated dots in the login button
 */
function removeDotsFromSignInButton() {
  const loginButton = document.querySelector('.login-button');
  const dotsContainer = document.getElementById('testapp-dots');

  // If dots exist and we stored the original text
  if (dotsContainer && loginButton.hasAttribute('data-original-text')) {
    // Restore original button text
    const originalText = loginButton.getAttribute('data-original-text');
    loginButton.textContent = originalText;
    loginButton.removeAttribute('data-original-text');

    loginButton.disabled = false;
    loginButton.style.opacity = '1';
    loginButton.style.cursor = 'pointer';
  }
}