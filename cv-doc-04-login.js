
// Function to initiate OAuth login flow through the background script
function initiateLogin(inputElement, originalEvent) {
  addDotsToSignInButton();

  // Send message to background script to handle authentication
  chrome.runtime.sendMessage({ action: 'authenticate' }, function (response) {
    // Check for runtime errors first
    if (chrome.runtime.lastError) {
      // console.error('Error sending message:', chrome.runtime.lastError);
      showErrorModal('Authentication error: ' + chrome.runtime.lastError.message)
      return;
    }

    // Process the response
    if (response && response.success) {

      // Reload the popup to show recording UI after a brief delay
      // to ensure storage is updated
      setTimeout(() => {
        // Make sure we have the original event to re-trigger the popup
        if (originalEvent) {
          showFlightPanel(inputElement, originalEvent);
        }
      }, 1000);
    } else {
      removeDotsFromSignInButton();
      const errorMessage = response && response.error
        ? 'Authentication error: ' + response.error
        : 'Authentication failed';
      showErrorModal(errorMessage)
    }
  });
}