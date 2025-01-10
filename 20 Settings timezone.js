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
    timeZone = 'UTC';
  } else {
    const json = JSON.parse(str);
    timeZone = json.timeZone;
  }
  if (timeZone == null) timeZone = 'UTC';
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