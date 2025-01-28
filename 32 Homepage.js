// CG300
const voiceMemoIconUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/voicememo.png';

function onHomepage(e) {
  // const hostApp = e?.commonEventObject?.hostApp;
  const card = CardService.newCardBuilder()
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText(`
        <b>How to insert Smart chips</b>

1. Copy and paste Carbon Voice Shareable Link (URL)

2. When you see the smart chip suggestion message, use ‘Tab’ key to convert link to a smart chip`))
      // .addWidget(CardService.newTextButton().setOnClickAction(CardService.newAction().setFunctionName('test55').setParameters({ text: "text55" })).setText('Run'))
      // .addWidget(CardService.newTextButton().setOnClickAction(CardService.newAction().setFunctionName('exportSidebar').setParameters({ text: "text55" })).setText('Run2'))
    );

  let text;
  // if (hostApp === 'DOCS') {
  text = '● If you want to work with voice memos, run Extensions -> Carbon Voice -> Voice Memos';
  // } else if (hostApp === 'SLIDES') {
  //   text = '● If you want to work with presentation outlines, run Extensions -> Carbon Voice -> Presentation Outline\n\n● If you don\'t see Carbon Voice in "Extensions" menu, install it, then reload current tab.';
  // } else if (hostApp === 'SHEETS') {
  //   text = '● If you want to export conversations or voice memos, run Extensions -> Carbon Voice -> Conversation Export\n\n● If you don\'t see Carbon Voice in "Extensions" menu, install it, then reload current tab.';
  // }

  if (text) {
    card.addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText(text)));
  }

  return card.build();
}

function createInfoCard(text) {
  const card = CardService.newCardBuilder();
  const section = CardService.newCardSection();
  section.addWidget(CardService.newTextParagraph()
    // Carbon Red
    .setText('<font color=\'#B01F42\'>' + text + '</font>'));
  card.addSection(section);
  return card.build();
}

function createLinkInfoCard(text) {
  const card = CardService.newCardBuilder();
  // Carbon Red
  card.setHeader(CardService.newCardHeader()
    .setTitle('<font color=\'#B01F42\'>' + text + '</font>'))
  return card.build();
}