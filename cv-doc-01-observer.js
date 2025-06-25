// Create and start your observer
function startObserver() {
    observer = new MutationObserver(function (mutations) {
        let shouldRun = false;
        let shouldUpdatePositions = false;

        mutations.forEach(mutation => {
            // Check for new elements that could be comment fields
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Look for contenteditable, inputs, textareas or specific classes
                        if (node.hasAttribute && (
                            node.hasAttribute('contenteditable') ||
                            node.tagName === 'INPUT' ||
                            node.tagName === 'TEXTAREA' ||
                            (node.classList && (
                                node.classList.contains('docos-input') ||
                                node.classList.contains('comment')
                            ))
                        )) {
                            shouldRun = true;
                            break;
                        }

                        // Check children of the added node
                        if (node.querySelectorAll) {
                            const relevantChildren = node.querySelectorAll(
                                '[contenteditable="true"], input, textarea, .docos-input-textarea'
                            );
                            if (relevantChildren.length > 0) {
                                shouldRun = true;
                                break;
                            }
                        }
                    }
                }
            }

            // Check for removed nodes (cleanup orphaned buttons)
            if (mutation.removedNodes && mutation.removedNodes.length > 0) {
                shouldUpdatePositions = true;
            }

            // Check for attribute changes on potential comment fields
            if (mutation.type === 'attributes' &&
                (mutation.target.hasAttribute('contenteditable') ||
                    mutation.target.hasAttribute('aria-label') ||
                    mutation.target.classList.contains('docos'))) {
                shouldRun = true;
            }

            // Check for style changes that might affect layout
            if (mutation.type === 'attributes' &&
                (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                shouldUpdatePositions = true;
            }
        });

        if (shouldRun) {
            insertFlightButton();
        }

        if (shouldUpdatePositions) {
            // Small delay to allow layout changes to complete
            setTimeout(() => {
                cleanupOrphanedButtons();
                updateAllButtonPositions();
            }, 100);
        }
    });

    // Start observing with a focus on potential comment elements
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['contenteditable', 'aria-label', 'class', 'style']
    });
}

// Initialize when DOM is ready
if (document.body) {
    startObserver();
} else {
    document.addEventListener('DOMContentLoaded', startObserver);
}