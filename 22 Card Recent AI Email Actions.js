function recentAiEmailActionsCard(professionalEmails) {
  const card = CardService.newCardBuilder();

  const headerButtonSet = getHeaderButtonSet('recentAiEmailActionsCard');
  card.addSection(CardService.newCardSection()
    .addWidget(headerButtonSet));

  const fixedFooter = getFixedFooter();
  card.setFixedFooter(fixedFooter);

  professionalEmails.forEach(el => {
    const multilineDecoratedText = CardService.newDecoratedText()
      .setOnClickAction(CardService.newAction()
        .setFunctionName('applyUpdateSubjectAction')
        .setParameters({ subject: el.subject, content: el.content, toRecipients: el.mailTo, toCcRecipients: el.withCopyTo }))
      .setText(el.subject)
      .setTopLabel(el.createdAt)
      .setWrapText(true)
      .setBottomLabel(el.summary)
      .setStartIcon(CardService.newIconImage().setIconUrl(el.imageUrl).setImageCropType(CardService.ImageCropType.SQUARE));

    card.addSection(CardService.newCardSection()
      .addWidget(multilineDecoratedText)
    );
  });
  return card.build();
}


function applyUpdateSubjectAction(e) {
  const subject = e.parameters.subject;
  const content = e.parameters.content;
  const toRecipients = JSON.parse(e.parameters.toRecipients);
  const toCcRecipients = JSON.parse(e.parameters.toCcRecipients);
  const response = CardService.newUpdateDraftActionResponseBuilder()
    .setUpdateDraftSubjectAction(CardService.newUpdateDraftSubjectAction().addUpdateSubject(subject));
  if (toRecipients.length > 0) {
    response.setUpdateDraftToRecipientsAction(CardService.newUpdateDraftToRecipientsAction().addUpdateToRecipients(toRecipients));
  }
  if (toCcRecipients.length > 0) {
    response.setUpdateDraftCcRecipientsAction(CardService.newUpdateDraftCcRecipientsAction().addUpdateCcRecipients(toCcRecipients));
  }
  response.setUpdateDraftBodyAction(CardService.newUpdateDraftBodyAction()
    .addUpdateContent(
      content,
      CardService.ContentType.MUTABLE_HTML)
    .setUpdateType(
      CardService.UpdateDraftBodyType.IN_PLACE_INSERT))
    ;

  return response.build();
}