function showSettingsCard() {
  const card = CardService.newCardBuilder();
  const selectedCheckbox = getKeepMeSignedValue();
  const checkbox = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setFieldName('keepMeSigned')
    .addItem('Keep me signed in', 'true', selectedCheckbox)
    .setOnChangeAction(CardService.newAction()
      .setFunctionName('handleCheckboxChange'));

  const currentTimeZone = getTimeZoneValue();

  const selectionInput = CardService.newSelectionInput()
    .setOnChangeAction(CardService.newAction()
      .setFunctionName('handleTimeZoneChange'))
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle("Time zone")
    .setFieldName("timeZone");

  const timeZones = ["America/Los_Angeles", "UTC", "Asia/Tbilisi"];
  for (let i in timeZones) {
    const itIsDefault = timeZones[i] === currentTimeZone ? true : false;
    selectionInput.addItem(timeZones[i], timeZones[i], itIsDefault)
  }

  const section = CardService.newCardSection()
    .addWidget(selectionInput)
    .addWidget(checkbox)
    .addWidget(CardService.newTextParagraph().setText('If you choose not to enable the "Keep me signed in" option, you will be required to sign in again if you do not use the add-on for 7 or more days.'));

  card.addSection(section);

  return CardService.newNavigation().pushCard(card.build());
}


function handleCheckboxChange(e) {
  const formInputs = e.commonEventObject.formInputs;
  const keepMeSigned = formInputs && formInputs.keepMeSigned ? true : false;

  changeKeepMeSignedSetting(keepMeSigned);

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
      .setText('Success!'))
    .build();
}