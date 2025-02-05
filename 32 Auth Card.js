// Without 'Keep me signed in' checkbox because of
// disallowed elements for link preview: [CHECK_BOX]
function buildAuthorizationCardLinksPreview(authorizationUrl) {

  const action = CardService.newAuthorizationAction()
    .setAuthorizationUrl(authorizationUrl);

  const authButton = CardService.newTextButton().setBackgroundColor('#5E4CCE')
    .setText('Sign in with Carbon Voice').setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setAuthorizationAction(action);

  const card = CardService.newCardBuilder()
    .addSection(CardService.newCardSection()
      .addWidget(authButton)
    );
  return card.build();
}