function getCarbonVoiceService() {
  return OAuth2.createService('carbonVoice')
    .setAuthorizationBaseUrl('https://api.carbonvoice.app/oauth/authorize')
    .setTokenUrl('https://api.carbonvoice.app/oauth/token')
    .setClientId(YOUR_CLIENT_ID)
    .setClientSecret(YOUR_CLIENT_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setParam('access_type', 'offline')
    // .setParam('prompt', 'consent');
}

function authCallback(request) {
  const gitHubService = getCarbonVoiceService();
  const isAuthorized = gitHubService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutputFromFile('00 Html You can close');
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
      options.headers['Content-Type'] = 'application/json';
    }

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    if (responseCode != 200 && responseCode != 201) {
      throw new Error(response);
    }
    return { status: 'ok', hasAccess: true, json: JSON.parse(response.getContentText()) };
  } else {
    const authorizationUrl = service.getAuthorizationUrl();
    return { status: 'error', hasAccess: false, authUrl: authorizationUrl, message: '' };
  }
}

function makeMultipleCarbonVoiceRequest(requests) {
  let url = 'https://api.carbonvoice.app';
  const service = getCarbonVoiceService();
  if (service.hasAccess()) {

    const fetchAllArray = [];
    requests.forEach(request => {

      const { method, endpoint, payload, queryParams } = request;

      url = 'https://api.carbonvoice.app' + endpoint;

      const options = {
        url: url,
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
        options.headers['Content-Type'] = 'application/json';
      }
      fetchAllArray.push(options);
    });
    const responses = UrlFetchApp.fetchAll(fetchAllArray);
    const json = responses.map(el => JSON.parse(el));
    return { status: 'ok', hasAccess: true, json: json };
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
  const service = getCarbonVoiceService();
  const authorizationUrl = service.getAuthorizationUrl();
  // Logger.log(authorizationUrl);
  return authorizationUrl;
}