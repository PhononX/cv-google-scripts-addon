function getCurrentMessage(event) {
  var accessToken = event.messageMetadata.accessToken;
  var messageId = event.messageMetadata.messageId;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  return GmailApp.getMessageById(messageId);
}

function onHomepage(e) {
  // Logger.log(e);
  var imageWidget = CardService.newImage()
    .setImageUrl(instructionGifUrl)
    .setAltText('Compose window');

  return CardService.newCardBuilder()
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText(`
● If you want to create a new async meeting, open any email in your inbox. 

● If you want to work with voice memos, run the Carbon Voice add-on in the compose window.
`))
      .addWidget(imageWidget))
    .build();
}

function buildAuthorizationCard(authorizationUrl) {

  const selectedCheckbox = getKeepMeSignedValue();

  const action = CardService.newAuthorizationAction()
    .setAuthorizationUrl(authorizationUrl);

  const authButton = CardService.newTextButton().setBackgroundColor('#5E4CCE')
    .setText('Sign in with Carbon Voice').setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setAuthorizationAction(action);

  const checkbox = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setFieldName('keepMeSigned')
    .addItem('Keep me signed in', 'true', selectedCheckbox)
    .setOnChangeAction(CardService.newAction()
      .setFunctionName('handleCheckboxChange'));

  const card = CardService.newCardBuilder()
    .addSection(CardService.newCardSection()
      .addWidget(authButton)
      .addWidget(checkbox)
    );

  return card.build();
}
