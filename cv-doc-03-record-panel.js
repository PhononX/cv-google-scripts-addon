// Variable to store the currently active input element
let activeInputElement = null;
let flightPanel = null;

// Initialize the flight panel
function initFlightPanel(inputElement, event) {

    // Create a new panel for this specific input
    flightPanel = document.createElement('div');
    flightPanel.className = 'flight-panel';
    flightPanel.style.display = 'none';

    // Create the panel content
    const panelContent = document.createElement('div');
    panelContent.className = 'flight-panel-content';

    // Create Close button
    const closeButton = createButton('close-red-dot', 'Stop record', chrome.runtime.getURL('content-icons/cv-doc-close.png'), 'action-button small');

    chrome.runtime.sendMessage({
        action: "checkTokenValidity",
    }, function (response) {
        if (response && response.needsLogin) {
            // Token doesn't exist or expired

            // Close button closes 'Sign in with Carbon Voice' panel
            closeButton.onclick = hideControlPanel;

            // Change title 'Stop record' to 'Close'
            closeButton.title = 'Close';

            const loginButton = document.createElement('button');
            loginButton.textContent = 'Sign in with Carbon Voice';
            loginButton.className = 'login-button';

            loginButton.onclick = function () {
                initiateLogin(inputElement, event);
            };

            panelContent.appendChild(closeButton);
            panelContent.appendChild(loginButton);

            // End. Token doesn't exist or expired
        } else {
            // Token exists and is valid, show recording UI

            // Close button triggers a confirmation dialog before discarding the record
            closeButton.onclick = questionBeforeStopRecording;

            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'buttons-container';

            // Create Send Record button
            const sendButton = createButton('send-button', 'Send record', chrome.runtime.getURL('content-icons/cv-doc-done.png'), 'action-button big');
            sendButton.onclick = sendRecord;
            sendButton.disabled = true;

            // Create Pause Record button
            const pauseButton = createButton('pause-button', 'Pause record', chrome.runtime.getURL('content-icons/cv-doc-pause.png'), 'action-button big');
            pauseButton.onclick = togglePauseRecording;
            pauseButton.disabled = true;

            buttonsContainer.appendChild(pauseButton);
            buttonsContainer.appendChild(sendButton);

            // Create timer container
            const timerContainer = document.createElement('div');
            timerContainer.className = 'timer-container';


            // Create red dot
            const redDot = document.createElement('span');
            redDot.className = 'red-dot';  // Initially it doesn't blink (class 'blink')
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
            panelContent.appendChild(closeButton);
            panelContent.appendChild(timerContainer);
            panelContent.appendChild(buttonsContainer);

            // Start record text prevents the comments panel from closing if it loses focus.
            insertStartRecordText(activeInputElement, 'Recording is started');

            // Cancel, Comment, Reply, etc. buttons are disabled
            disableButton(activeInputElement);

            // Start recording
            startRecording();

            // End. Token exists and is valid, show recording UI
        }
    });

    flightPanel.appendChild(panelContent);

    // Append the panel to the parent container of the input
    // This ensures it scrolls with the input element
    const parent = inputElement.parentElement;
    if (parent) {
        parent.appendChild(flightPanel);
    } else {
        // Fallback to document.body if no parent is found
        document.body.appendChild(flightPanel);
    }

    return flightPanel;
}

// Updated function to show the flight panel
function showFlightPanel(inputElement, event) {
    try {
        if (audioRecorder && isRecording) {
            showErrorModal('Recording is already in progress!')
            return;
        }

        activeInputElement = inputElement;

        // Always create a new panel at the current location
        if (flightPanel) {
            flightPanel.remove();
        }

        // console.log('token showFlightPanel ' + token);

        flightPanel = initFlightPanel(inputElement, event);

        // Get the exact dimensions of the input element
        const inputRect = inputElement.getBoundingClientRect();
        const parentRect = inputElement.parentElement.getBoundingClientRect();

        // Calculate position relative to parent (this is key for scrolling behavior)
        const relativeTop = inputRect.top - parentRect.top;
        const relativeLeft = inputRect.left - parentRect.left;

        // Position the flight panel at the exact same place as the input
        flightPanel.style.position = 'absolute';
        flightPanel.style.top = relativeTop + 'px';
        flightPanel.style.left = relativeLeft + 'px';
        flightPanel.style.width = inputRect.width + 'px';
        flightPanel.style.height = inputRect.height + 'px';
        flightPanel.style.display = 'block';

        // Hide the flight button associated with this input
        const buttonContainer = inputElement.parentElement.querySelector('.flight-button-container');
        if (buttonContainer) {
            buttonContainer.style.visibility = 'hidden';
        }

    }
    catch (error) {
        errorModals(error);
    }
}

// Updated function to hide the flight panel
function hideControlPanel() {
    if (flightPanel) {
        // Show all flight buttons again
        const buttonContainers = document.querySelectorAll('.flight-button-container');
        buttonContainers.forEach(container => {
            container.style.visibility = 'visible';
        });

        if (activeInputElement) {
            clearRecordingStartedText(activeInputElement);
            enableButton(activeInputElement);
        }

        // Remove the panel from DOM
        flightPanel.remove();
        flightPanel = null;
        activeInputElement = null;
    }
}

// Listen for messages from content.js
document.addEventListener('flightButtonClicked', function (e) {
    // Get the input element from the event detail
    const inputElement = e.detail.inputElement;

    if (inputElement) {
        showFlightPanel(inputElement, e);
    }
});


function insertStartRecordText(activeInputElement, textToInsert = null) {
    // Get existing content (strip HTML tags and get plain text)
    const existingContent = getExistingContent(activeInputElement);

    if (existingContent.trim()) {
        return;
    }

    insertTextIntoContenteditable(activeInputElement, textToInsert)
}


function insertTextIntoContenteditable(activeInputElement, textToInsert = null) {
    // Check if element exists and is contenteditable
    if (!activeInputElement || !activeInputElement.isContentEditable) {
        // console.error('Element is not contenteditable or does not exist');
        return false;
    }

    // Focus the element first
    activeInputElement.focus();

    // For contenteditable elements
    const selection = window.getSelection();

    // If no selection exists, create one at the end of the content
    if (!selection.rangeCount) {
        // console.log('Creating new selection at end of content');
        const range = document.createRange();
        range.selectNodeContents(activeInputElement);
        range.collapse(false); // Collapse to end
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        // console.log('Using existing selection');
    }

    const range = selection.getRangeAt(0);

    // Create text node
    const textNode = document.createTextNode(textToInsert);
    range.deleteContents();
    range.insertNode(textNode);

    // Move cursor to end of inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger input event to notify the app of changes
    const inputEvent = new Event('input', { bubbles: true });
    activeInputElement.dispatchEvent(inputEvent);

    // Also trigger change event
    const changeEvent = new Event('change', { bubbles: true });
    activeInputElement.dispatchEvent(changeEvent);

    return true;
}

function getExistingContent(element) {
    if (!element) return '';

    // Try different methods to get content
    // Method 1: textContent (gets plain text, no HTML)
    let content = element.textContent || '';

    // Method 2: If textContent is empty, try innerText
    if (!content.trim()) {
        content = element.innerText || '';
    }

    // Method 3: If still empty, try innerHTML and strip tags
    if (!content.trim()) {
        const htmlContent = element.innerHTML || '';
        // Simple regex to strip HTML tags
        content = htmlContent.replace(/<[^>]*>/g, '');
    }

    return content;
}

function clearRecordingStartedText(activeInputElement) {

    // Check if element exists and is contenteditable
    if (!activeInputElement || !activeInputElement.isContentEditable) {
        // console.error('Element is not contenteditable or does not exist');
        return false;
    }

    // Get existing content
    const existingContent = getExistingContent(activeInputElement);
    // console.log('Existing content:', existingContent);

    if (existingContent.trim() === "Recording is started") {
        // Clear all content first
        clearContentEditableContent(activeInputElement);
    }

}



function insertTestLink(activeInputElement, textToInsert) {
    try {
        // Check if element exists and is contenteditable
        if (!activeInputElement || !activeInputElement.isContentEditable) {
            // console.error('Element is not contenteditable or does not exist');
            return false;
        }

        // Get existing content
        const existingContent = getExistingContent(activeInputElement);
        // console.log('Existing content:', existingContent);


        if (existingContent.trim() === "Recording is started") {
            // Clear all content first
            clearContentEditableContent(activeInputElement);
        } else {
            // If there's existing content, we'll position cursor at the end
            if (existingContent) {
                positionCursorAtEnd(activeInputElement);
            }

            textToInsert = ' ' + textToInsert;
        }

        // Insert the text
        const success = insertTextIntoContenteditable(activeInputElement, textToInsert);
        return success;

    } catch (error) {
        // console.error('Error inserting test link:', error);
        return false;
    }
}

function clearContentEditableContent(element) {
    if (!element || !element.isContentEditable) return false;

    // Focus the element
    element.focus();

    // Select all content
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);

    // Delete all content
    range.deleteContents();

    // Trigger events
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);

    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);

    return true;
}

function positionCursorAtEnd(element) {
    if (!element || !element.isContentEditable) return false;

    element.focus();

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false); // Collapse to end
    selection.removeAllRanges();
    selection.addRange(range);

    return true;
}