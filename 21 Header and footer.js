function getHeaderButtonSet(card) {
  if (card === 'voiceMemosCard') {
    return CardService.newButtonSet()
      .addButton(
        getAnotherButton('Recent AI Actions', 'showRecentAiEmailActionsCard', recentAIActionsCV400IconUrl)
      )
      .addButton(
        getActiveButton('Voice Memos', 'updateVoiceMemosCard', voiceMemoCWIconUrl)
      );
  } else if (card === 'recentAiEmailActionsCard') {
    return CardService.newButtonSet()
      .addButton(
        getActiveButton('Recent AI Actions', 'showRecentAiEmailActionsCard', recentAIActionsCWhiteIconUrl)
      )
      .addButton(
        getAnotherButton('Voice Memos', 'updateVoiceMemosCard', voiceMemoCV400IconUrl)
      );
  } else {
    throw new Error('Unknown card.');
  }
}

function getAnotherButton(text, functionName, iconUrl) {
  return CardService.newTextButton().setText('<font color=#5E4CCE><b>' + text + '</b></font>')
    .setBackgroundColor('#ffffff')
    .setTextButtonStyle(CardService.TextButtonStyle.TEXT)
    .setIconUrl(iconUrl)
    .setOnClickAction(CardService.newAction().setFunctionName(functionName));
}

function getActiveButton(text, functionName, iconUrl) {
  return CardService.newTextButton().setText('<b>' + text + '</b>')
    .setBackgroundColor('#5E4CCE')
    .setIconUrl(iconUrl)
    .setOnClickAction(CardService.newAction().setFunctionName(functionName));
}

function getFixedFooter() {
  return CardService.newFixedFooter()
    .setPrimaryButton(
      CardService.newTextButton()
        .setText('<font color=#5E4CCE><b>Record Memo</b></font>')
        .setBackgroundColor('#DBD2FF')
        .setIconUrl(recordMemoCV400IconUrl)
        .setOpenLink(CardService.newOpenLink().setOpenAs(CardService.OpenAs.OVERLAY).setOnClose(CardService.OnClose.RELOAD).setUrl('https://carbonvoice.app/a/home'))
    );
}


