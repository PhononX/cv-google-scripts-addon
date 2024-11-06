function getListOfConvTest() {
  const result = getListOfConversations();
  Logger.log(result);
}

function getListOfWorkspacesTest() {
  const result = getListOfWorkspaces();
  Logger.log(result);
}

function workspaceNameTest() {
  // const result = makeCarbonVoiceRequest('GET', '/v3/workspaces/' + 'phononx', null, null);
  const result = makeCarbonVoiceRequest('GET', '/v3/workspaces/' + 'KYbE5xyjBt39', null, null);
  Logger.log(result);
}

function channelsTest() {
  const result = makeCarbonVoiceRequest('GET', '/channels/' + 'ka1LBbiRgKDd1XIq', null, null);

  result.json.forEach(el => {
    Logger.log(el);
    Logger.log('el.channel_name %s, el.channel_guid %s, el.total_messages %s, el.type %s', el.channel_name, el.channel_guid, el.total_messages, el.type);
    // const workspaceId = (el.type === 'directMessage' && workspace.id === 'personal') ? 'direct' : workspace.id;
    // if (workspaceId === 'direct' && workspacesConv['direct'] == null) {
    //   workspacesConv['direct'] = [];
    // }
    // workspacesConv[workspaceId].push({ channel_name: el.channel_name, channel_guid: el.channel_guid, total_messages: el.total_messages, channel_type: el.type });
    // usualWorkspacesConv.push(el.channel_guid);
    // usualWorkspacesConv.push(el.channel_name);
  });
}

function logRedirectUri() {
  const service = getCarbonVoiceService();
  const url = service.getRedirectUri();
  Logger.log(url);
}

// https://api.carbonvoice.app/responses/prompt/669e61798d82b4c6baac633e/latest-ten
function getListOfPresentations() {
  const result = makeCarbonVoiceRequest('GET', '/responses/prompt/669e61798d82b4c6baac633e/latest-ten', null, null);
  // if (result.hasAccess) {
  //   result.data = result.json.results;
  // }
  Logger.log(result);
  return result;
}

function testShowTokens(){
  Logger.log(PropertiesService.getUserProperties().getProperties());
}

function setPastExpiresAtDate(){
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('oauth2.carbonVoice');
  const json = JSON.parse(str);
  Logger.log(json);
  json.expiresAt = 1730476404;
    Logger.log(json);
    userProperty.setProperty('oauth2.carbonVoice', JSON.stringify(json));
}