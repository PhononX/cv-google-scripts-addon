
function showVoiceMemosCard() {
  try {
    const result = getVoiceMemos();
    if (result.hasAccess === false) {
      return buildAuthorizationCard(result.authUrl);
    }
    return voiceMemosCard(result.voiceMemos, result.lastCreatedAt, result.previousArrayString, result.userTimeZone, result.showNext, result.showPrevious);
  }
  catch (e) {
    return createInfoCard(e);
  }
}

function voiceMemosCard(voiceMemos, lastCreatedAt, previousArrayString, userTimeZone, showNext, showPrevious) {

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
          .setFunctionName('openOneVoiceMemoCard')
          .setParameters({ createdAt: el.createdAt, name: el.name, duration: el.duration, messageId: el.messageId, voiceMemoText: el.voiceMemoText, userTimeZone: userTimeZone }))
        .setText(el.name)
        .setWrapText(false)
        .setBottomLabel(el.createdAt + ' · Duration: ' + el.duration)
        .setStartIcon(CardService.newIconImage().setIconUrl(voiceMemoIconUrl).setImageCropType(CardService.ImageCropType.SQUARE));

      card.addSection(CardService.newCardSection()
        .addWidget(multilineDecoratedText)
      );
    });
    if (showNext || showPrevious) {
      const previousNextButtonSet = CardService.newButtonSet();
      if (showPrevious) {
        const previousButton = CardService.newTextButton()
          .setText('<font color=#5E4CCE><b>Previous</b></font>')
          .setBackgroundColor('#DBD2FF')
          // .setIconUrl(pasteAiIconUrlCV400)
          .setOnClickAction(CardService.newAction()
            .setFunctionName('updateVoiceMemosCard')
            .setParameters({ lastCreatedAt: lastCreatedAt, previousArrayString: previousArrayString, navigationTypeNext: 'false' })
          );
        previousNextButtonSet.addButton(previousButton);
      }
      if (showNext) {
        const nextButton = CardService.newTextButton()
          .setText('<font color=#5E4CCE><b>Next</b></font>')
          .setBackgroundColor('#DBD2FF')
          // .setIconUrl(pasteAiIconUrlCV400)
          .setOnClickAction(CardService.newAction()
            .setFunctionName('updateVoiceMemosCard')
            .setParameters({ lastCreatedAt: lastCreatedAt, previousArrayString: previousArrayString, navigationTypeNext: 'true' })
          );
        previousNextButtonSet.addButton(nextButton);
      }
      card.addSection(CardService.newCardSection()
        .addWidget(previousNextButtonSet)
      );
    }
  } else {
    card.addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText('No voice memos!'))
    );
  }
  return card.build();
}

function updateVoiceMemosCard(e) {
  const lastCreatedAt = e.parameters.lastCreatedAt;
  const navigationTypeNext = e.parameters.navigationTypeNext;
  const previousArrayString = e.parameters.previousArrayString;
  try {
    const result = getVoiceMemos(navigationTypeNext, lastCreatedAt, previousArrayString);
    if (result.hasAccess === false) {
      return buildAuthorizationCard(result.authUrl);
    }
    const card = voiceMemosCard(result.voiceMemos, result.lastCreatedAt, result.previousArrayString, result.userTimeZone, result.showNext, result.showPrevious);
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

