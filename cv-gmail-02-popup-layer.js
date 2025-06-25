let activeComposeWindow;

function showPopupLayer(event, composeWindow) {

    if (audioRecorder && isRecording) {
        showErrorModal('Recording is already in progress!')
        return;
    }

    activeComposeWindow = composeWindow;

    // Create popup regardless of token status - we'll update content based on auth state
    const existingPopup = document.querySelector('.popup-layer');
    if (existingPopup) existingPopup.remove();

    const popup = document.createElement('div');
    popup.className = 'popup-layer';

    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '×';

    popup.appendChild(closeButton);

    const outputContainer = document.createElement('div');
    outputContainer.className = 'output-container';
    outputContainer.id = 'output';

    // Position the popup near the button that triggered it
    const buttonRect = event.target.closest('.custom-button').getBoundingClientRect();
    popup.style.left = `${buttonRect.left}px`;
    popup.style.top = `${buttonRect.bottom + 5}px`;

    document.body.appendChild(popup);

    // Adjust position after appending to ensure we have the correct height
    requestAnimationFrame(() => {
        popup.style.top = `${buttonRect.top - popup.offsetHeight - 5}px`;
    });

    chrome.runtime.sendMessage({
        action: "checkTokenValidity",
    }, function (response) {
        if (response && response.needsLogin) {
            // Token doesn't exist or expired

            closeButton.onclick = function () {
                popup.remove();
            };
            outputContainer.textContent = 'Please sign in to record a new voice memo.';

            popup.className = 'popup-layer login-container';

            const loginButton = document.createElement('button');
            loginButton.textContent = 'Sign in with Carbon Voice';
            loginButton.className = 'login-button';

            loginButton.onclick = function () {
                initiateLogin(event);
            };

            popup.appendChild(loginButton);
            popup.appendChild(outputContainer);

            // End. Token doesn't exist or expired
        } else {
            // Token exists and is valid, show recording UI

            closeButton.onclick = questionBeforeStopRecording;

            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'buttons-container';

            // Create Stop Record button
            const stopButton = createButton('stop-button', 'Stop record', chrome.runtime.getURL('content-icons/cv-gmail-delete.png'));
            stopButton.onclick = questionBeforeStopRecording;

            // Create Send Record button
            const sendButton = createButton('send-button', 'Send record', chrome.runtime.getURL('content-icons/cv-gmail-done.png'), 'action-button big');
            sendButton.onclick = sendRecord;
            sendButton.disabled = true;

            // Create Pause Record button
            const pauseButton = createButton('pause-button', 'Pause record', chrome.runtime.getURL('content-icons/cv-gmail-pause.png'));
            pauseButton.onclick = togglePauseRecording;
            pauseButton.disabled = true;

            // Add buttons to container
            buttonsContainer.appendChild(stopButton);
            buttonsContainer.appendChild(sendButton);
            buttonsContainer.appendChild(pauseButton);

            // Create timer container
            const timerContainer = document.createElement('div');
            timerContainer.className = 'timer-container';

            // Create red dot
            const redDot = document.createElement('span');
            // Initially the red dot doesn't blink
            redDot.className = 'red-dot';
            redDot.id = 'recording-indicator';
            redDot.style.opacity = '0.6';

            // Create timer display
            const timerDisplay = document.createElement('span');
            timerDisplay.id = 'timer-display';
            timerDisplay.textContent = '00:00';
            timerDisplay.style.opacity = '0.6';

            // Add elements to timer container
            timerContainer.appendChild(redDot);
            timerContainer.appendChild(timerDisplay);

            // Add all elements to popup
            popup.appendChild(timerContainer);
            popup.appendChild(buttonsContainer);
            popup.appendChild(outputContainer);

            // Start recording
            startRecording();

            // End. Token exists and is valid, show recording UI
        }
    });
}

function hideControlPanel() {
    const popup = document.querySelector('.popup-layer');
    if (popup) popup.remove();
}


// Function to initiate OAuth login flow through the background script
function initiateLogin(originalEvent) {
  addDotsToSignInButton();
  const outputElement = document.getElementById('output');
  if (outputElement) {
    outputElement.textContent = 'Initiating login...';
  }

  // Send message to background script to handle authentication
  chrome.runtime.sendMessage({ action: 'authenticate' }, function (response) {
    // Check for runtime errors first
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError);
      if (outputElement) {
        outputElement.textContent = 'Authentication error: ' + chrome.runtime.lastError.message;
      }
      return;
    }

    // Process the response
    if (response && response.success) {
      if (outputElement) {
        outputElement.textContent = 'Authentication successful!';
      }

      // Reload the popup to show recording UI after a brief delay
      // to ensure storage is updated
      setTimeout(() => {
        const existingPopup = document.querySelector('.popup-layer');
        if (existingPopup) {
          existingPopup.remove();
        }

        // Make sure we have the original event to re-trigger the popup
        if (originalEvent) {
          showPopupLayer(originalEvent, activeComposeWindow);
        }
      }, 1000);
    } else {
      if (outputElement) {
        removeDotsFromSignInButton();
        outputElement.textContent = response && response.error
          ? 'Authentication error: ' + response.error
          : 'Authentication failed';
      }
    }
  });
}