
function showVoiceMemosCard() {
  try {
    const result = getVoiceMemos();
    if (result.hasAccess === false) {
      return buildAuthorizationCard(result.authUrl);
    }
    return voiceMemosCard(result.voiceMemos);
  }
  catch (e) {
    return createInfoCard(e);
  }
}

function voiceMemosCard(voiceMemos) {

  const card = CardService.newCardBuilder();

  const headerButtonSet = getHeaderButtonSet('voiceMemosCard');
  card.addSection(CardService.newCardSection()
    .addWidget(headerButtonSet));

  const fixedFooter = getFixedFooter();
  card.setFixedFooter(fixedFooter);

  if (voiceMemos.length > 0) {
    voiceMemos.forEach(el => {

      const multilineDecoratedText = CardService.newDecoratedText()
        .setOnClickAction(CardService.newAction()
          // .setFunctionName('insertVoiceMemo')
          .setFunctionName('openOneVoiceMemoCard')
          .setParameters({ createdAt: el.createdAt, name: el.name, url: el.url, duration: el.duration, messageId: el.messageId, voiceMemoText: el.voiceMemoText, userTimeZone: el.userTimeZone}))
        .setText(el.name)
        .setWrapText(false)
        .setBottomLabel(el.createdAt + ' · Duration: ' + el.duration)
        .setStartIcon(CardService.newIconImage().setIconUrl(voiceMemoIconUrl).setImageCropType(CardService.ImageCropType.SQUARE));

      card.addSection(CardService.newCardSection()
        .addWidget(multilineDecoratedText)
      );
    });
  } else {
    card.addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText('No voice memos!'))
    );
  }
  return card.build();
}

function updateVoiceMemosCard() {
  try {
    const result = getVoiceMemos();
    if (result.hasAccess === false) {
      return buildAuthorizationCard(result.authUrl);
    }
    const card = voiceMemosCard(result.voiceMemos);
    return CardService.newActionResponseBuilder()
      .setNavigation(
        CardService.newNavigation().updateCard(card)
      )
      .setStateChanged(true)
      .build();
  }
  catch (e) {
    return createInfoCard(e);
  }
}


function showRecentAiEmailActionsCard() {
  try {
    const result = getListOfProfessionalEmails();
    if (result.hasAccess === false) {
      return buildAuthorizationCard(result.authUrl);
    }
    const card = recentAiEmailActionsCard(result.professionalEmails);
    return CardService.newActionResponseBuilder()
      .setNavigation(
        CardService.newNavigation().updateCard(card)
      )
      .setStateChanged(true)
      .build();
  }
  catch (e) {
    return createInfoCard(e);
  }
}

