function testGetKeepMeSignedValue() {
  Logger.log(getKeepMeSignedValue());
}

function testSaveKeepMeSignedValue() {
  saveKeepMeSignedValue(false);
}

function testDelSettingsProperty() {
  PropertiesService.getUserProperties().deleteProperty('carbonVoiceSettings');
}

function testLogSettingsProperty() {
  Logger.log(PropertiesService.getUserProperties().getProperty('carbonVoiceSettings'));
}

function getKeepMeSignedValue() {
  let keepMeSigned;
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('carbonVoiceSettings');
  if (str == null) {
    // Logger.log('1')
    keepMeSigned = false;
  } else {
    // Logger.log('2')
    const json = JSON.parse(str);
    if (typeof json.keepMeSigned === "boolean") {
      // Logger.log('3')
      keepMeSigned = json.keepMeSigned;
    } else {
      // Logger.log('4')
      keepMeSigned = false;
    }
  }
  return keepMeSigned;
}

function saveKeepMeSignedValue(keepMeSigned) {
  let json;
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('carbonVoiceSettings');
  if (str == null) {
    json = {};
  } else {
    json = JSON.parse(str);
  }
  json.keepMeSigned = keepMeSigned;
  userProperty.setProperty('carbonVoiceSettings', JSON.stringify(json));
}

function loadSettingSidebar(sidebarTitle) {
  //checkedOrNot
  const keepMeSigned = getKeepMeSignedValue();
  const checkedOrNot = keepMeSigned === true ? 'checked' : '';
  const template = HtmlService.createTemplateFromFile('03 Sidebar Settings');
  template.checkedOrNot = checkedOrNot;
  // template.messageId = presentation.message_id;
  const htmlOutput = template.evaluate();
  SlidesApp.getUi().showSidebar(htmlOutput.setTitle(sidebarTitle));
}

function checkedOrNotMainSidebar() {
  const keepMeSigned = getKeepMeSignedValue();
  const checkedOrNot = keepMeSigned === true ? 'checked' : '';
  return checkedOrNot;
}

function changeKeepMeSignedSetting(keepMeSigned) {
  // Logger.log('changeKeepMeSignedSetting');
  let json;
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('carbonVoiceSettings');
  if (str == null) {
    json = { keepMeSigned: false };
  } else {
    json = JSON.parse(str);
  }
  if (json.keepMeSigned === keepMeSigned) {
    // Logger.log('changeKeepMeSignedSetting - the same');
    return 0;
  }

  // Get all project triggers
  const triggers = ScriptApp.getProjectTriggers();

  // Find trigger for updateRefreshToken
  const triggerUpdateRefreshToken = triggers.find(
    trigger => trigger.getHandlerFunction() === 'updateRefreshToken'
  );

  if (keepMeSigned === true) {
    if (triggerUpdateRefreshToken == null) {
      // Logger.log('changeKeepMeSignedSetting - create trigger');
      ScriptApp.newTrigger('updateRefreshToken')
        .timeBased()
        .everyDays(5)
        .create();
    }
  } else {
    if (triggerUpdateRefreshToken) {
      // Logger.log('changeKeepMeSignedSetting - remove trigger');
      ScriptApp.deleteTrigger(triggerUpdateRefreshToken);
    }
  }

  json.keepMeSigned = keepMeSigned;
  userProperty.setProperty('carbonVoiceSettings', JSON.stringify(json));
}

function updateRefreshToken() {
  setPastExpiresAtDate();
  getListOfPresentations();
}

function testShowTokens() {
  Logger.log(PropertiesService.getUserProperties().getProperties());
}

function testChangeTokensExpiration() {
  PropertiesService.getUserProperties().setProperty('oauth2.carbonVoice', '{"token_type":"Bearer","access_token":"fe8fad8531e7c6386dc3aa36b715cb9a5ab54a5c3fb12b99071cd5388e553037","refresh_token":"u6f53b44f1cd6ddee7776b46dc613f21881dd7940576c2aeb81313540c2eb19f6","expires_in":86399,"refresh_token_exp":604799,"expiresAt":1730476404}')
  // Logger.log(PropertiesService.getUserProperties().getProperties());
}

function setPastExpiresAtDate() {
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('oauth2.carbonVoice');
  const json = JSON.parse(str);
  // Logger.log(json);
  json.expiresAt = 1730476404;
  // Logger.log(json);
  userProperty.setProperty('oauth2.carbonVoice', JSON.stringify(json));
}

function setFutureExpiresAtDate() {
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('oauth2.carbonVoice');
  const json = JSON.parse(str);
  Logger.log(json);
  json.expiresAt = 1750000000;
  Logger.log(json);
  userProperty.setProperty('oauth2.carbonVoice', JSON.stringify(json));
}
