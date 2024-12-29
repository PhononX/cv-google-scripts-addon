const blankChannelImageUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/blank.png';

const instructionGifUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/instruction.gif';

// CG300
const voiceMemoIconUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/voicememo.png';

const voiceMemoCWIconUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/Voice+Memos+CW.png';

const voiceMemoCV400IconUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/Voice+Memo+CV400.png';

const recentAIActionsCV400IconUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/Recent+AI+Actions+CV400.png';

const recentAIActionsCWhiteIconUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/Recent+AI+Actions+White.png';

const newAsyncMeetingCV400IconUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/New+Async+Meeting+CV400.png';

const recordMemoCV400IconUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/Record+Memo+CV400.png';

const aiIconUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/cv-gmail-AI.png';

const pasteAiIconUrlCV400 = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/cv-gmail-paste+CV400.png';

const seeAiResultsIconUrlCV400 = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/cv-gmail-seeresults+CV400.png';

const shareLinkIconUrlCV400 = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/cv-gmail-link+CV400.png';


function createInfoCard(text) {
  const card = CardService.newCardBuilder();

  const section = CardService.newCardSection();
  section.addWidget(CardService.newTextParagraph()
    // Carbon Red
    .setText('<font color=\'#B01F42\'>' + text + '</font>'));

  card.addSection(section);

  return card.build();
}

function notification(notificationText) {
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
      .setText(notificationText))
    .build();
}