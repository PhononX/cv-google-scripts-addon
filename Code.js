function onOpen() {
  const googleSheet = SpreadsheetApp.getUi();
  googleSheet.createMenu('Carbon Voice')
    .addItem('Conversation Export', 'exportSidebar')
    .addToUi();
}

function exportSidebar() {
  openUniversalSidebar('Fast sidebar GW', 'Carbon Voice Conversation Export');
}

function openUniversalSidebar(htmlFile, title) {
  const htmlTemplate = HtmlService.createTemplateFromFile(htmlFile);
  const htmlOutput = htmlTemplate.evaluate();
  SpreadsheetApp.getUi().showSidebar(htmlOutput.setTitle(title));
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getCarbonVoiceService() {
  return OAuth2.createService('carbonVoice')
    .setAuthorizationBaseUrl('https://api.carbonvoice.app/oauth/authorize')
    .setTokenUrl('https://api.carbonvoice.app/oauth/token')
    .setClientId(YOUR_CLIENT_ID)
    .setClientSecret(YOUR_CLIENT_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    // Requests offline access.
    .setParam('access_type', 'offline')
    // Consent prompt is required to ensure a refresh token is always
    // returned when requesting offline access.
    .setParam('prompt', 'consent');
}

function authCallback(request) {
  const gitHubService = getCarbonVoiceService();
  const isAuthorized = gitHubService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}

function makeCarbonVoiceRequest(method, endpoint, payload = null, queryParams = null) {
  let url = 'https://api.carbonvoice.app';
  const service = getCarbonVoiceService();
  if (service.hasAccess()) {
    url = 'https://api.carbonvoice.app' + endpoint;

    const options = {
      method: method,
      headers: { Authorization: 'Bearer ' + service.getAccessToken() },
      muteHttpExceptions: true
    };

    // For GET requests, add query parameters to the URL
    if (method === 'GET' && queryParams) {
      const queryString = Object.keys(queryParams)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]))
        .join('&');
      url += '?' + queryString;
    }

    // For POST requests, add payload to options
    if (payload && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.payload = JSON.stringify(payload);
    }

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    if (responseCode != 200) {
      throw new Error(response);
    }
    return { status: 'ok', hasAccess: true, json: JSON.parse(response.getContentText()) };
  } else {
    const authorizationUrl = service.getAuthorizationUrl();
    return { status: 'error', hasAccess: false, authUrl: authorizationUrl, message: '' };
  }
}

function reset() {
  const service = getCarbonVoiceService();
  service.reset();
}

function getAuthUrl() {
  const authorizationUrl = service.getAuthorizationUrl();
  return authorizationUrl;
}