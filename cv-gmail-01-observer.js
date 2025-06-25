// Create and start your observer
function startObserver() {
    observer = new MutationObserver((mutations) => {
        if (!checkExtensionContext()) {
            handleExtensionError();
            return;
        }

        // Mutation handling logic
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                // Find all compose windows that don't have a custom button yet
                const composeWindows = document.querySelectorAll('.M9[jslog*="33560"]'); // Compose window containers

                composeWindows.forEach((composeWindow) => {
                    const sendButtonContainer = composeWindow.querySelector('.gU.Up');
                    const formatOptionsContainer = composeWindow.querySelector('.oc.gU');

                    // Check if this specific compose window already has a custom button
                    const existingButton = composeWindow.querySelector('.custom-button');

                    if (sendButtonContainer && formatOptionsContainer && !existingButton) {
                        createCustomButton(composeWindow);
                    }
                });
            }
        });
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Modified function to accept compose window as parameter
function createCustomButton(composeWindow) {
    const sendButtonContainer = composeWindow.querySelector('.gU.Up');
    const formatOptionsContainer = composeWindow.querySelector('.oc.gU');

    if (!sendButtonContainer || !formatOptionsContainer) {
        return;
    }

    // Create the new TD element
    const newTd = document.createElement('td');
    newTd.className = 'gU custom-button-container';

    // Create the button
    const button = document.createElement('button');
    button.className = 'custom-button';
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '1');
    button.setAttribute('data-tooltip', 'Carbon Voice');
    button.setAttribute('aria-label', 'Carbon Voice');
    button.style.userSelect = 'none';

    // Create and add the image
    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('content-icons/cv-universal-logo-button.png');
    button.appendChild(img);

    // Add click handler
    button.addEventListener('click', (event) => {
        try {
            showPopupLayer(event, composeWindow);
        }
        catch (error) {
            errorModals(error);
        }
    });

    // Assemble the elements
    newTd.appendChild(button);

    // Insert the new TD after the Send button container and before Format options
    sendButtonContainer.parentNode.insertBefore(newTd, formatOptionsContainer);
}

// Initialize when DOM is ready
if (document.body) {
    startObserver();
} else {
    document.addEventListener('DOMContentLoaded', startObserver);
}