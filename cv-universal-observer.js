let hasShownError = false;
let observer = null;

function checkExtensionContext() {
    return !!(chrome.runtime && chrome.runtime.id);
}

function handleExtensionError() {
    if (hasShownError) return;
    hasShownError = true;

    // Stop the observer
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    showReloadModal();
}

function errorModals(error) {
    if (!checkExtensionContext()) {
        stopRecording();
        showReloadModal();
    } else {
        showErrorModal('Something went wrong! ' + error);
    }
}