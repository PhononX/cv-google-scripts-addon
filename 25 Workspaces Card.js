
function showWorkspacesCard() {
  // try {
    const result = getVoiceMemosAllWorkspaces();
    if (result.hasAccess === false) {
      return buildAuthorizationCard(result.authUrl);
    }
    const card = allWorkspacesCard(result.allWorkspaces);
    return CardService.newActionResponseBuilder()
      .setNavigation(
        CardService.newNavigation().updateCard(card)
      )
      .setStateChanged(true)
      .build();
  // }
  // catch (e) {
  //   return createInfoCard(e);
  // }
}

function allWorkspacesCard(allWorkspaces){
  const card = CardService.newCardBuilder();

  const headerButtonSet = getHeaderButtonSet('voiceMemosCard');
  card.addSection(CardService.newCardSection()
    .addWidget(headerButtonSet));

  const fixedFooter = getFixedFooter();
  card.setFixedFooter(fixedFooter);

/*
{ workspaceName: workspaceNames[el.workspace_id], workspaceId: el.workspace_id, nestedFoldersCount: el.total_folders, nestedMessagesCount: el.total_messages }
*/

  allWorkspaces.forEach(el => {
    const multilineDecoratedText = CardService.newDecoratedText()
      .setOnClickAction(CardService.newAction()
        .setFunctionName('updateVoiceMemosCard')
        .setParameters({ workspaceId: el.workspaceId, cardNavigationType: 'update' }))
      .setText(el.workspaceName)
      // .setTopLabel(el.workspaceName)
      .setWrapText(true)
        .setBottomLabel('Folders: ' + el.nestedFoldersCount + ' · Messages: ' + el.nestedMessagesCount)
        .setStartIcon(CardService.newIconImage().setIconUrl(el.workspaceImageUrl).setImageCropType(CardService.ImageCropType.SQUARE));

    card.addSection(CardService.newCardSection()
      .addWidget(multilineDecoratedText)
    );
  });
  return card.build();

}