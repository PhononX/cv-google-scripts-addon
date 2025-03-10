
function showVoiceMemosCard(e) {
  // Logger.log(e)
  // try {
  // const result = getVoiceMemos();
  const result = getVoiceMemosUpTo500(e);
  if (result.hasAccess === false) {
    return buildAuthorizationCard(result.authUrl);
  }
  // return voiceMemosCard(result.voiceMemos, result.lastCreatedAt, result.previousArrayString, result.userTimeZone, result.showNext, result.showPrevious, result.workspaceId, result.folderId);
  return voiceMemosCard(result);
  // }
  // catch (e) {
  //   return createInfoCard(e);
  // }
}

// function voiceMemosCard(voiceMemos, lastCreatedAt, previousArrayString, userTimeZone, showNext, showPrevious, workspaceId, folderId) {
function voiceMemosCard(cardData) {
  const { folders, voiceMemos, userTimeZone, showNext, showPrevious, workspaceId, workspaceName, folderId, folderName, pageNumber } = cardData;

  // if (pageNumber == null) pageNumber = 'null';
  // Logger.log(typeof pageNumberStr)
  // const pageNumberStr = !pageNumber ? 0 : pageNumber;
  // Logger.log(String(pageNumber - 1));
  const nextPageNumber = String(Number(pageNumber) + 1);
  const previousPageNumber = String(Number(pageNumber) - 1);

  const card = CardService.newCardBuilder();
  Logger.log(folders)
  const headerButtonSet = getHeaderButtonSet('voiceMemosCard');
  card.addSection(CardService.newCardSection()
    .addWidget(headerButtonSet));

  const fixedFooter = getFixedFooter();
  card.setFixedFooter(fixedFooter);

  if (folderId === 'root' || folderId == null) {
    const multilineDecoratedText = CardService.newDecoratedText()
      .setOnClickAction(CardService.newAction()
        .setFunctionName('showWorkspacesCard')
        // .setParameters({ navigationTypeNext: 'false', workspaceId, folderId: el.folderId, cardNavigationType: 'push', pageNumber: '0' })
      )
      .setText(workspaceName)
      .setWrapText(false)
      .setBottomLabel('Voice Memos')
      .setStartIcon(CardService.newIconImage().setIconUrl(folderNavigationIcon).setImageCropType(CardService.ImageCropType.SQUARE));

    card.addSection(CardService.newCardSection()
      .addWidget(multilineDecoratedText)
    );
  } else {
    const multilineDecoratedText = CardService.newDecoratedText()
      .setOnClickAction(CardService.newAction()
        .setFunctionName('stepBackNavigation')
        // .setParameters({ navigationTypeNext: 'false', workspaceId, folderId: el.folderId, cardNavigationType: 'push', pageNumber: '0' })
      )
      .setText(folderName)
      .setWrapText(false)
      .setBottomLabel('Voice Memos')
      .setStartIcon(CardService.newIconImage().setIconUrl(folderNavigationIcon).setImageCropType(CardService.ImageCropType.SQUARE));

    card.addSection(CardService.newCardSection()
      .addWidget(multilineDecoratedText)
    );
  }

  if (folders.length > 0) {
    folders.forEach(el => {
      const multilineDecoratedText = CardService.newDecoratedText()
        .setOnClickAction(CardService.newAction()
          .setFunctionName('updateVoiceMemosCard')
          .setParameters({ navigationTypeNext: 'false', workspaceId, folderId: el.folderId, cardNavigationType: 'push', pageNumber: '0' }))
        .setText(el.folderName)
        .setWrapText(false)
        .setBottomLabel('Folders: ' + el.nestedFoldersCount + ' · Messages: ' + el.nestedMessagesCount)
        .setStartIcon(CardService.newIconImage().setIconUrl(folderIconDark).setImageCropType(CardService.ImageCropType.SQUARE));

      card.addSection(CardService.newCardSection()
        .addWidget(multilineDecoratedText)
      );
    });
  }

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

  } else {
    if (folders.length === 0) {
      card.addSection(CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText('No voice memos!'))
      );
    }
  }
  if (showNext || showPrevious) {
    const previousNextButtonSet = CardService.newButtonSet();
    if (showPrevious) {
      const previousButton = CardService.newTextButton()
        .setText('<font color=#5E4CCE><b>Previous</b></font>')
        .setBackgroundColor('#DBD2FF')
        // .setIconUrl(pasteAiIconUrlCV400)
        .setOnClickAction(CardService.newAction()
          .setFunctionName('updateVoiceMemosCard')
          .setParameters({ workspaceId, folderId, cardNavigationType: 'update', pageNumber: previousPageNumber })
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
          .setParameters({ workspaceId, folderId, cardNavigationType: 'update', pageNumber: nextPageNumber })
        );
      previousNextButtonSet.addButton(nextButton);
    }
    card.addSection(CardService.newCardSection()
      .addWidget(previousNextButtonSet)
    );
  }
  return card.build();
}


function updateVoiceMemosCardHeaderButton() {
  return updateVoiceMemosCard({ parameters: { cardNavigationType: 'update' } });
}

function updateVoiceMemosCard(e) {
  const workspaceId = e.parameters.workspaceId;
  const folderId = e.parameters.folderId;
  const cardNavigationType = e.parameters.cardNavigationType;
  const pageNumber = e.parameters.pageNumber;

  // Logger.log('updateVoiceMemosCard(e) pageNumberStr ' + pageNumberStr)

  // try {
  // const result = getVoiceMemos(navigationTypeNext, lastCreatedAt, previousArrayString);
  const result = getVoiceMemosUpTo500(e, workspaceId, folderId, pageNumber);
  if (result.hasAccess === false) {
    return buildAuthorizationCard(result.authUrl);
  }
  const card = voiceMemosCard(result);

  if (cardNavigationType === 'update') {
    return CardService.newActionResponseBuilder()
      .setNavigation(
        CardService.newNavigation().updateCard(card)
      )
      .setStateChanged(true)
      .build();
  } else {
    return CardService.newActionResponseBuilder()
      .setNavigation(
        CardService.newNavigation().pushCard(card)
      )
      .setStateChanged(true)
      .build();
  }

  // }
  // catch (e) {
  //   return createInfoCard(e);
  // }
}


function stepBackNavigation() {
  return CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation().popCard()
    )
    .setStateChanged(false)
    .build();
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

