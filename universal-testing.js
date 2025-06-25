// Function 1: Log token information with formatted expiry date
function logTokenInfo() {
  chrome.storage.local.get(['carbonvoice_token', 'carbonvoice_token_expiry', 'carbonvoice_refresh_token', 'carbonvoice_gmail_folder', 'carbonvoice_docs_folder'], function (result) {
    console.log('Token Information:');
    console.log('carbonvoice_token:', result.carbonvoice_token);

    // Format expiry date if it exists
    if (result.carbonvoice_token_expiry) {
      const expiryDate = new Date(result.carbonvoice_token_expiry);
      console.log('carbonvoice_token_expiry:', result.carbonvoice_token_expiry);
      console.log('carbonvoice_token_expiry (readable):', expiryDate.toLocaleString());
    } else {
      console.log('carbonvoice_token_expiry: Not set');
    }

    console.log('carbonvoice_refresh_token:', result.carbonvoice_refresh_token);

    //'carbonvoice_gmail_folder', 'carbonvoice_docs_folder'
    console.log('carbonvoice_gmail_folder:', result.carbonvoice_gmail_folder);
    console.log('carbonvoice_docs_folder:', result.carbonvoice_docs_folder);

    // Log any errors
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
    }
  });
}

// Function 2: Set token expiry to one month ago
function setTokenExpiryToMonthAgo() {
  // Calculate date one month ago
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneMonthAgoTimestamp = oneMonthAgo.getTime();

  chrome.storage.local.set({ 'carbonvoice_token_expiry': oneMonthAgoTimestamp }, function () {
    console.log('carbonvoice_token_expiry set to one month ago:', oneMonthAgo.toLocaleString());

    // Log any errors
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
    }
  });
}


// Function 3: Set wrong access token
function setWrongToken() {

  chrome.storage.local.set({ 'carbonvoice_token': 'aaaaaaa' }, function () {
    console.log('carbonvoice_token set to ', 'aaaaaaa');

    // Log any errors
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
    }
  });
}

// Function 4: Set wrong refresh token
function setWrongRefreshToken() {

  chrome.storage.local.set({ 'carbonvoice_refresh_token': 'bbbbbbb' }, function () {
    console.log('carbonvoice_token set to ', 'bbbbb');

    // Log any errors
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
    }
  });
}

// Function 5: Set wrong folder id
function setWrongFolderIds() {

  chrome.storage.local.set({ 'carbonvoice_gmail_folder': '12345', 'carbonvoice_docs_folder': '6789' }, function () {
    console.log('carbonvoice_gmail_folder set to ', '12345', 'carbonvoice_docs_folder', '6789');

    // Log any errors
    if (chrome.runtime.lastError) {
      console.error('Error:', chrome.runtime.lastError);
    }
  });
}

function clearAllTokens() {
  chrome.storage.local.remove(['carbonvoice_token', 'carbonvoice_token_expiry', 'carbonvoice_refresh_token', 'user_session', 'auth_state', 'carbonvoice_gmail_folder', 'carbonvoice_docs_folder'], function () { console.log('Tokens removed!'); if (chrome.runtime.lastError) console.error(chrome.runtime.lastError); });

}

function clearAllFolderIds() {
  chrome.storage.local.remove(['carbonvoice_gmail_folder', 'carbonvoice_docs_folder'], function () { console.log('Tokens removed!'); if (chrome.runtime.lastError) console.error(chrome.runtime.lastError); });

}

logTokenInfo();
// clearAllTokens()
// setTokenExpiryToMonthAgo();
// setWrongToken();
// setWrongRefreshToken();
// setWrongFolderIds()
// clearAllFolderIds()
console.log('-----------');
logTokenInfo();




