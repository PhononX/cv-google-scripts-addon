function confirmAsyncMeetingCard(channelUrl, channelName, emails, draftNotification) {
  const card = CardService.newCardBuilder();

  const buttonRecordMessage = CardService.newTextButton()
    .setText('<font color=#5E4CCE><b>Record Message</b></font>')
    .setBackgroundColor('#DBD2FF')
    .setIconUrl(recordMemoCV400IconUrl)
    .setOpenLink(CardService.newOpenLink().setOpenAs(CardService.OpenAs.OVERLAY).setOnClose(CardService.OnClose.NOTHING).setUrl(channelUrl))

  const text = CardService.newTextParagraph().setText('Async meeting <a href=' + channelUrl + '>' + channelName + '</a> succesfully created.');

  const emailsString = draftNotification ? emails : emails.join();

  const action = CardService.newAction().setFunctionName('composeEmailCallback').setParameters({ channelUrl: channelUrl, channelName: channelName, emails: emailsString });

  const buttonCreateDraft = CardService.newTextButton()
    .setText('<font color=#5E4CCE><b>Create Draft with the Link</b></font>')
    .setComposeAction(action, CardService.ComposedEmailType.REPLY_AS_DRAFT);

  const section = CardService.newCardSection()
    .addWidget(text)
    .addWidget(buttonRecordMessage)
    .addWidget(buttonCreateDraft);

  if (draftNotification) {
    section.addWidget(CardService.newTextParagraph().setText('Copy \n\n' + channelUrl + '\n\npaste in your draft.'));
  }

  card.addSection(section);
  return card.build();
}

function composeEmailCallback(e) {
  const emails = e.parameters.emails;
  const channelUrl = e.parameters.channelUrl;
  const channelName = e.parameters.channelName;
  const accessToken = e.messageMetadata.accessToken;
  const messageId = e.messageMetadata.messageId;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  const message = GmailApp.getMessageById(messageId);
  const thread = message.getThread();
  const threadMessages = thread.getMessages();
  const lastMDraft = threadMessages[threadMessages.length - 1].isDraft();

  if (lastMDraft === true) {
    const card = confirmAsyncMeetingCard(channelUrl, channelName, emails, true);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText('The thread already contains draft! Copy paste the link 👆'))
      .setNavigation(
        CardService.newNavigation().updateCard(card)
      )
      .setStateChanged(true)
      .build();
  } else {
    const htmlBody = { htmlBody: "I've just created Carbon Voice Async Meeting <strong>" + channelName + "</strong>! <a href=" + channelUrl + ">" + channelUrl + "</a>" };
    const draft = message.createDraftReplyAll("I've just created Carbon Voice Async Meeting! " + channelUrl, htmlBody).update(emails, '', "I've just created Carbon Voice Async Meeting! " + channelUrl, htmlBody);
    return CardService.newComposeActionResponseBuilder()
      .setGmailDraft(draft)
      .build();
  }
}
