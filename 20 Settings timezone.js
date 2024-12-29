function handleTimeZoneChange(e) {
  const formInputs = e.commonEventObject.formInputs;
  const timeZone = formInputs.timeZone.stringInputs.value[0];
  saveTimeZoneValue(timeZone);
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
      .setText('Success! Your timezone is ' + timeZone))
    .build();
}

function getTimeZoneValue() {
  let timeZone;
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('carbonVoiceSettings');
  if (str == null) {
    // Logger.log('1')
    timeZone = 'UTC';
  } else {
    // Logger.log('2')
    const json = JSON.parse(str);
    timeZone = json.timeZone;
    // if (typeof json.keepMeSigned === "boolean") {
    //   // Logger.log('3')
    //   keepMeSigned = json.keepMeSigned;
    // } else {
    //   // Logger.log('4')
    //   keepMeSigned = false;
    // }
  }
  if (timeZone == null) timeZone = 'UTC';
  Logger.log(timeZone)
  return timeZone;
}

function saveTimeZoneValue(timeZone) {
  let json;
  const userProperty = PropertiesService.getUserProperties();
  const str = userProperty.getProperty('carbonVoiceSettings');
  if (str == null) {
    json = {};
  } else {
    json = JSON.parse(str);
  }
  json.timeZone = timeZone;
  userProperty.setProperty('carbonVoiceSettings', JSON.stringify(json));
}