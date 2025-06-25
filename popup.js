
// Function to clear all OAuth tokens from both storage and Chrome's cache
function clearAllTokens() {
  // 1. Get all tokens from storage
  chrome.storage.local.get(['carbonvoice_token', 'carbonvoice_refresh_token'], function (result) {
    // 2. Remove the main token from Chrome's cache if it exists
    if (result.carbonvoice_token) {
      chrome.identity.removeCachedAuthToken(
        { token: result.carbonvoice_token },
        function () {
          console.log("Main token removed from Chrome's cache");
        }
      );
    }

    // 3. Remove the refresh token from Chrome's cache if it exists
    if (result.carbonvoice_refresh_token) {
      chrome.identity.removeCachedAuthToken(
        { token: result.carbonvoice_refresh_token },
        function () {
          console.log("Refresh token removed from Chrome's cache");
        }
      );
    }

    // 4. Finally, clear all tokens from storage
    chrome.storage.local.remove(['carbonvoice_token', 'carbonvoice_token_expiry', 'carbonvoice_refresh_token'], function () {
      console.log("All tokens cleared from local storage");
    });

    // Update the UI to reflect logged out state
    // Now open chrome://settings/clearBrowserData
    document.getElementById('output').innerHTML = 'Successfully logged out.';

    document.getElementById('logout').style.display = 'none';
    document.getElementById('copyButton').style.display = 'none';
  });
}

// Then add an event listener for the logout button:
document.getElementById('logout').addEventListener('click', function () {
  // logout();
  clearAllTokens();
});


// Add this to initialize the UI based on login status
document.addEventListener('DOMContentLoaded', function () {
  const redirectUri = chrome.identity.getRedirectURL();
  console.log('Redirect URI:', redirectUri);
  document.getElementById('output').textContent = redirectUri;

  // Set up copy button functionality
  const copyButton = document.getElementById('copyButton');
  copyButton.addEventListener('click', copyToClipboard);
});

// Function to copy URL to clipboard
function copyToClipboard() {
  const urlText = chrome.identity.getRedirectURL();

  // Use the Clipboard API (modern approach)
  navigator.clipboard.writeText(urlText).then(function () {
    // Show the "Copied!" notification
    showNotification();
  }).catch(function (err) {
    // Fallback for browsers that don't support the Clipboard API
    fallbackCopyToClipboard(urlText);
  });
}

// Fallback copy method for browsers that don't support Clipboard API
function fallbackCopyToClipboard(text) {
  // Create a temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = text;

  // Make the textarea invisible
  textarea.style.position = 'fixed';
  textarea.style.opacity = 0;

  // Add to document, select text, and execute copy command
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showNotification();
    } else {
      console.error('Failed to copy text');
    }
  } catch (err) {
    console.error('Error during copy operation:', err);
  }

  // Clean up
  document.body.removeChild(textarea);
}

// Function to show and then hide the notification
function showNotification() {
  const notification = document.getElementById('notification');
  notification.style.opacity = '1';

  // Hide notification after 2 seconds
  setTimeout(function () {
    notification.style.opacity = '0';
  }, 2000);
}
