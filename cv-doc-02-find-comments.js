// Keep track of elements we've already processed
const processedElements = new Set();

function insertFlightButton() {
    // console.log('Running insertFlightButton function');

    // Target both main comment fields and reply fields
    const inputSelectors = [
        // Main comment fields
        'input[placeholder*="Comment"]',
        'input[placeholder*="add others"]',
        '[placeholder*="Comment or add others"]',
        // Reply fields
        '[placeholder*="Reply"]',
        '[placeholder*="Reply or add others"]',
        '.docos-input-textarea',
        '[aria-label="Reply"]',
        '[aria-placeholder*="Reply"]'
    ];

    // Join all selectors
    const combinedSelector = inputSelectors.join(', ');
    const inputElements = document.querySelectorAll(combinedSelector);

    // console.log('Found potential comment/reply inputs:', inputElements.length);

    inputElements.forEach((input, index) => {
        // Generate a unique identifier for this element
        const elementId = getElementUniqueId(input);

        // Skip if we already processed this element
        if (processedElements.has(elementId)) {
            // Update position for existing button
            updateExistingButtonPosition(elementId, input);
            return;
        }

        // console.log(`Processing input element ${index}:`, input);

        // Skip elements that are likely buttons
        if (isLikelyButton(input)) {
            // console.log('Skipping likely button element:', input);
            return;
        }

        try {
            // Add this element to our processed set
            processedElements.add(elementId);

            // Create button container
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'flight-button-container';
            buttonContainer.setAttribute('data-for-element', elementId);

            // Create the flight button
            const flightButton = document.createElement('button');
            flightButton.className = 'flight-button';
            flightButton.setAttribute('title', 'CV');

            // Create the flight icon image
            const flightIcon = document.createElement('img');
            // flightIcon.src = 'https://www.gstatic.com/images/icons/material/system/1x/flight_grey600_48dp.png';
            flightIcon.src = chrome.runtime.getURL('content-icons/cv-universal-logo-button.png');
            flightIcon.alt = 'Carbon Voice';

            // Add the icon to the button
            flightButton.appendChild(flightIcon);

            // Add event listener
            flightButton.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                // console.log('Flight button clicked!');

                // Focus the input element first to ensure it's active
                input.focus();

                // For contenteditable, we need to set up the selection if it's not already set
                if (input.getAttribute('contenteditable') === 'true') {
                    const selection = window.getSelection();
                    if (!selection.rangeCount) {
                        const range = document.createRange();
                        range.selectNodeContents(input);
                        range.collapse(false); // Collapse to end
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }

                // Create and dispatch a custom event to notify flightAction.js
                const clickEvent = new CustomEvent('flightButtonClicked', {
                    detail: {
                        inputElement: input
                    },
                    bubbles: true
                });
                document.dispatchEvent(clickEvent);
            });

            // Add the button to the container
            buttonContainer.appendChild(flightButton);

            // Find the best parent container for the button
            const parentContainer = findBestParentContainer(input);
            parentContainer.appendChild(buttonContainer);

            // Position the button container
            positionButtonInInput(buttonContainer, input, parentContainer);

            // console.log('Button added successfully to input element');
        }
        catch (error) {
            errorModals(error);
        }
    });
}

function updateExistingButtonPosition(elementId, inputElement) {
    const existingButton = document.querySelector(`.flight-button-container[data-for-element="${elementId}"]`);
    if (existingButton) {
        const parentContainer = existingButton.parentElement || findBestParentContainer(inputElement);
        positionButtonInInput(existingButton, inputElement, parentContainer);
    }
}

function getElementUniqueId(element) {
    // Create a unique identifier based on element properties
    const tag = element.tagName || 'unknown';
    const id = element.id || '';
    const classes = element.className || '';
    const placeholder = element.getAttribute('placeholder') || '';
    const ariaLabel = element.getAttribute('aria-label') || '';
    const ariaPlaceholder = element.getAttribute('aria-placeholder') || '';

    return `${tag}-${id}-${classes}-${placeholder}-${ariaLabel}-${ariaPlaceholder}`;
}

function isLikelyButton(element) {
    // Check if this element is likely a button rather than an input field

    // If it has role=button, it's definitely a button
    if (element.getAttribute('role') === 'button') return true;

    // If it's an actual button element
    if (element.tagName === 'BUTTON') return true;

    // Check for common button text
    const text = element.textContent ? element.textContent.trim().toLowerCase() : '';
    if (text === 'comment' || text === 'cancel' || text === 'submit' || text === 'reply') return true;

    // Check if it's a small element (buttons are usually smaller than input fields)
    const rect = element.getBoundingClientRect();
    if (rect.height < 30 && rect.width < 100) {
        // Small elements are more likely to be buttons than input fields
        return true;
    }

    // Check if it has button-like styling
    const style = getComputedStyle(element);
    if (style.borderRadius === '16px' || style.borderRadius === '20px') {
        // Button-like rounded corners often indicate a button
        return true;
    }

    // Check for button-like classes
    const className = element.className ? element.className.toLowerCase() : '';
    if (className.includes('btn') || className.includes('button')) return true;

    return false;
}

function findBestParentContainer(inputElement) {
    // Try to find the comment panel or a good container for the button
    let element = inputElement;

    // First, try to find the immediate container that has the input
    while (element && element !== document.body) {
        const computedStyle = window.getComputedStyle(element);

        // Look for comment panel containers
        if (element.classList && (
            element.classList.contains('docos-replyview') ||
            element.classList.contains('docos-anchoredreplyview') ||
            element.classList.contains('kix-commentoverlay') ||
            element.classList.contains('docos-input-container') ||
            element.hasAttribute('data-comments-panel')
        )) {
            // console.log('Found comment panel container:', element);
            return element;
        }

        // Look for containers with relative/absolute positioning
        if (computedStyle.position === 'relative' || computedStyle.position === 'absolute') {
            // This could be a good container
            const hasReasonableSize = element.offsetWidth > 200 && element.offsetHeight > 50;
            if (hasReasonableSize) {
                // console.log('Found positioned container:', element);
                return element;
            }
        }

        element = element.parentElement;
    }

    // Fallback: try to find the input's direct parent that has positioning
    let parent = inputElement.parentElement;
    while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        if (style.position !== 'static') {
            // console.log('Found positioned parent:', parent);
            return parent;
        }
        parent = parent.parentElement;
    }

    // Last resort: use the input's immediate parent and make it relative
    const immediateParent = inputElement.parentElement;
    if (immediateParent && immediateParent !== document.body) {
        const parentStyle = window.getComputedStyle(immediateParent);
        if (parentStyle.position === 'static') {
            immediateParent.style.position = 'relative';
        }
        // console.log('Using immediate parent:', immediateParent);
        return immediateParent;
    }

    // Ultimate fallback
    // console.log('Using document body as fallback');
    return document.body;
}

function positionButtonInInput(buttonContainer, inputElement, parentContainer) {
    // Position the button inside the input element at the right side

    // Check if input element is still in DOM
    if (!document.contains(inputElement)) {
        buttonContainer.remove();
        return;
    }

    // Get the input element's dimensions and position
    const inputRect = inputElement.getBoundingClientRect();

    // Check if element is visible
    if (inputRect.width === 0 || inputRect.height === 0) {
        buttonContainer.style.display = 'none';
        return;
    } else {
        buttonContainer.style.display = 'block';
    }

    // Different positioning strategy based on parent container
    const buttonContainerSize = 32; // From your CSS
    const paddingFromEdge = 6; // Distance from right edge of input

    if (parentContainer === document.body) {
        // Use fixed positioning relative to viewport
        buttonContainer.style.position = 'fixed';
        buttonContainer.style.left = (inputRect.right - buttonContainerSize - paddingFromEdge) + 'px';
        buttonContainer.style.top = (inputRect.top + (inputRect.height / 2) - (buttonContainerSize / 2)) + 'px';
    } else {
        // Use absolute positioning relative to parent container
        buttonContainer.style.position = 'absolute';

        const parentRect = parentContainer.getBoundingClientRect();
        const relativeLeft = inputRect.right - parentRect.left - buttonContainerSize - paddingFromEdge;
        const relativeTop = inputRect.top - parentRect.top + (inputRect.height / 2) - (buttonContainerSize / 2);

        buttonContainer.style.left = relativeLeft + 'px';
        buttonContainer.style.top = relativeTop + 'px';
    }

    buttonContainer.style.pointerEvents = 'auto';
    buttonContainer.style.zIndex = '1000';

    // Clear any other positioning properties
    buttonContainer.style.bottom = 'auto';
    buttonContainer.style.right = 'auto';
    buttonContainer.style.transform = 'none';
}

// Clean up any existing buttons before adding new ones
function cleanup() {
    const existingButtons = document.querySelectorAll('.flight-button-container');
    existingButtons.forEach(button => {
        button.remove();
    });
    processedElements.clear();
}

// Clean up buttons for elements that no longer exist
function cleanupOrphanedButtons() {
    const existingButtons = document.querySelectorAll('.flight-button-container');
    existingButtons.forEach(button => {
        const elementId = button.getAttribute('data-for-element');
        if (elementId) {
            // Find the corresponding input element
            const inputExists = Array.from(document.querySelectorAll('input, [contenteditable], textarea')).some(input => {
                return getElementUniqueId(input) === elementId && document.contains(input);
            });

            if (!inputExists) {
                button.remove();
                processedElements.delete(elementId);
            }
        }
    });
}

// Update positions when window is resized or scrolled
function updateAllButtonPositions() {
    const existingButtons = document.querySelectorAll('.flight-button-container');
    existingButtons.forEach(button => {
        const elementId = button.getAttribute('data-for-element');
        if (elementId) {
            // Find the corresponding input element
            const inputElement = Array.from(document.querySelectorAll('input, [contenteditable], textarea')).find(input => {
                return getElementUniqueId(input) === elementId;
            });

            if (inputElement && document.contains(inputElement)) {
                const parentContainer = button.parentElement || findBestParentContainer(inputElement);
                positionButtonInInput(button, inputElement, parentContainer);
            } else {
                button.remove();
                processedElements.delete(elementId);
            }
        }
    });
}

// Initial run with cleanup
function initialRun() {
    try {
        cleanup();
        insertFlightButton();
    }
    catch (error) {
        errorModals(error);
    }
}

// Run on initial load - use a modest delay to ensure DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(initialRun, 300); // Reduced from 1000ms to 300ms
    });
} else {
    initialRun(); // No need for timeout if DOM is already ready
}

// Update button positions on scroll and resize
window.addEventListener('scroll', updateAllButtonPositions);
window.addEventListener('resize', updateAllButtonPositions);

// Periodic cleanup and position update (fallback)
setInterval(() => {
    cleanupOrphanedButtons();
    updateAllButtonPositions();
}, 2000); // Every 2 seconds