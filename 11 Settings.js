function getKeepMeSignedValue() {
  let keepMeSigned;
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('carbonVoiceSettings');
  if (str == null) {
    keepMeSigned = false;
  } else {
    const json = JSON.parse(str);
    if (typeof json.keepMeSigned === "boolean") {
      keepMeSigned = json.keepMeSigned;
    } else {
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
  const keepMeSigned = getKeepMeSignedValue();
  const checkedOrNot = keepMeSigned === true ? 'checked' : '';
  const template = HtmlService.createTemplateFromFile('11 Sidebar Settings');
  template.checkedOrNot = checkedOrNot;
  const htmlOutput = template.evaluate();
  getUi().showSidebar(htmlOutput.setTitle(sidebarTitle));
}

function checkedOrNotMainSidebar() {
  const keepMeSigned = getKeepMeSignedValue();
  const checkedOrNot = keepMeSigned === true ? 'checked' : '';
  return checkedOrNot;
}

function changeKeepMeSignedSetting(keepMeSigned) {
  let json;
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('carbonVoiceSettings');
  if (str == null) {
    json = { keepMeSigned: false };
  } else {
    json = JSON.parse(str);
  }
  if (json.keepMeSigned === keepMeSigned) {
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
      ScriptApp.newTrigger('updateRefreshToken')
        .timeBased()
        .everyDays(5)
        .create();
    }
  } else {
    if (triggerUpdateRefreshToken) {
      ScriptApp.deleteTrigger(triggerUpdateRefreshToken);
    }
  }

  json.keepMeSigned = keepMeSigned;
  userProperty.setProperty('carbonVoiceSettings', JSON.stringify(json));
}

function updateRefreshToken() {
  setPastExpiresAtDate();
  makeCarbonVoiceRequest('GET', '/responses/prompt/669e61798d82b4c6baac633e/latest-ten', null, null);
}


function setPastExpiresAtDate() {
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('oauth2.carbonVoice');
  const json = JSON.parse(str);
  json.expiresAt = 1730476404;
  userProperty.setProperty('oauth2.carbonVoice', JSON.stringify(json));
}