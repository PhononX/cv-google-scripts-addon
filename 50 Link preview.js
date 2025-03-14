function onHomepageLinksPreview(e) {
  const hostApp = e?.commonEventObject?.hostApp;
  const card = CardService.newCardBuilder();

let instructionText;
if (hostApp === 'SLIDES') {
instructionText = `
        <b>Carbon Voice Links Preview</b>

To preview a Carbon Voice link, click on it.`;
}else{
instructionText = `
        <b>How to Insert Smart Chips</b>

1. Copy and paste Carbon Voice Shareable Link (URL)

2. When you see the smart chip suggestion message, use ‘Tab’ key to convert link to a smart chip`;
}

  card.addSection(CardService.newCardSection()
    .addWidget(CardService.newTextParagraph()
      .setText(instructionText))
  );

  let text;
  if (hostApp === 'DOCS') {
    text = '● If you want to work with voice memos, run Extensions -> Carbon Voice -> Voice Memos\n\n● If you don\'t see Carbon Voice in "Extensions" menu, <a href="https://workspace.google.com/marketplace/app/carbon_voice_for_editors/393337891493">install it</a> from Google Workspace Marketplace, then reload current tab.';
  } else if (hostApp === 'SLIDES') {
    text = '● If you want to work with presentation outlines, run Extensions -> Carbon Voice -> Presentation Outline\n\n● If you don\'t see Carbon Voice in "Extensions" menu, <a href="https://workspace.google.com/marketplace/app/carbon_voice_for_editors/393337891493">install it</a> from Google Workspace Marketplace, then reload current tab.';
  } else if (hostApp === 'SHEETS') {
    text = '● If you want to export conversations or voice memos, run Extensions -> Carbon Voice -> Conversation Export\n\n● If you don\'t see Carbon Voice in "Extensions" menu, <a href="https://workspace.google.com/marketplace/app/carbon_voice_for_editors/393337891493">install it</a> from Google Workspace Marketplace, then reload current tab.';
  }

  if (text) {
    card.addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText(text)));
  }

  return card.build();
}

function createLinkInfoCard(text) {
  const card = CardService.newCardBuilder();
  // Carbon Red
  card.setHeader(CardService.newCardHeader()
    .setTitle('<font color=\'#B01F42\'>' + text + '</font>'))
  return card.build();
}

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