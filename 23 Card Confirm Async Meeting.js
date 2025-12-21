function confirmAsyncMeetingCard(channelUrl, channelName, emails, draftNotification, hostApp, calendarId, eventId, existingAsyncMeeting, meetingEndIsoDateTime, userTimeZone) {
  
  const meetingEndStatus = getMeetingEndStatus(userTimeZone, meetingEndIsoDateTime);

  const card = CardService.newCardBuilder();

  const buttonRecordMessage = CardService.newTextButton()
    .setText('<font color=#5E4CCE><b>Record Message</b></font>')
    .setBackgroundColor('#DBD2FF')
    .setIconUrl(recordMemoCV400IconUrl)
    .setOpenLink(CardService.newOpenLink().setOpenAs(CardService.OpenAs.OVERLAY).setOnClose(CardService.OnClose.NOTHING).setUrl(channelUrl));

  const successfullyCreatedText = existingAsyncMeeting ? '' : ' succesfully created';
  const text = CardService.newTextParagraph().setText('Async meeting <a href=' + channelUrl + '>' + channelName + '</a>' + successfullyCreatedText + '.<br>' + meetingEndStatus);

  const section = CardService.newCardSection()
    .addWidget(text)
    .addWidget(buttonRecordMessage);

  if (hostApp === 'GMAIL') {
    let emailsString = draftNotification ? emails : emails.join();
    if (emailsString == null) {
      emailsString = '';
    }

    const action = CardService.newAction().setFunctionName('composeEmailCallback').setParameters({ channelUrl: channelUrl, channelName: channelName, emails: emailsString, existingAsyncMeeting: existingAsyncMeeting.toString() });

    const buttonCreateDraft = CardService.newTextButton()
      .setText('<font color=#5E4CCE><b>Create Draft with the Link</b></font>')
      .setComposeAction(action, CardService.ComposedEmailType.REPLY_AS_DRAFT);
    section.addWidget(buttonCreateDraft);
  } else {
    // We don't update calendar event if confirmAsyncMeetingCard is called for existing async meeting
    if (calendarId && eventId) {
      updateCalendarEvent(channelUrl, calendarId, eventId);
    }
  }

  if (draftNotification) {
    section.addWidget(CardService.newTextParagraph().setText('Copy \n\n' + channelUrl + '\n\npaste in your draft.'));
  }

  card.addSection(section);
  return card.build();
}

function composeEmailCallback(e) {
  const hostApp = e?.commonEventObject?.hostApp;
  const emails = e.parameters.emails;
  const channelUrl = e.parameters.channelUrl;
  const channelName = e.parameters.channelName;

  const existingAsyncMeeting = e.parameters.existingAsyncMeeting === 'false' ? false : true;

  const accessToken = e.messageMetadata.accessToken;
  const messageId = e.messageMetadata.messageId;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  const message = GmailApp.getMessageById(messageId);
  const thread = message.getThread();
  const threadMessages = thread.getMessages();
  const lastMDraft = threadMessages[threadMessages.length - 1].isDraft();

  if (lastMDraft === true) {
    const card = confirmAsyncMeetingCard(channelUrl, channelName, emails, true, hostApp, null, null, existingAsyncMeeting);
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification()
        .setText('The thread already contains draft! Copy paste the link 👆'))
      .setNavigation(
        CardService.newNavigation().updateCard(card)
      )
      .setStateChanged(true)
      .build();
  } else {
    const emailTextStarter = existingAsyncMeeting ? 'Carbon Voice Async Meeting: ' : "I've just created Carbon Voice Async Meeting! ";
    const htmlBody = { htmlBody: emailTextStarter + "<strong>" + channelName + "</strong> <a href=" + channelUrl + ">" + channelUrl + "</a>" };
    const draft = message.createDraftReplyAll(emailTextStarter + channelUrl, htmlBody).update(emails, '', emailTextStarter + channelUrl, htmlBody);
    return CardService.newComposeActionResponseBuilder()
      .setGmailDraft(draft)
      .build();
  }
}

function getMeetingEndStatus(userTimeZone, end) {

  const validation = isValidDateTime(end);
  if (validation.status === false) {
    return validation.message;
  }

  const endDate = new Date(end);
  const now = new Date();
  const diffMs = endDate - now;

  const formattedEndDate = formatDateTime(userTimeZone, endDate);

  // Check if the meeting has ended (past date)
  if (diffMs < 0) {
    return `Meeting ended ${formattedEndDate}`;
  }

  // Meeting is in the future - calculate time remaining
  const diffSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSeconds / (24 * 60 * 60));
  const hours = Math.floor((diffSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diffSeconds % (60 * 60)) / 60);

  // Build the time remaining string
  let timeRemaining = [];
  if (days > 0) timeRemaining.push(`${days} d`);
  if (hours > 0) timeRemaining.push(`${hours} h`);
  if (minutes > 0) timeRemaining.push(`${minutes} min`);

  // Handle edge case where meeting ends in less than a minute
  if (timeRemaining.length === 0) {
    timeRemaining.push('less than 1 min');
  }

  return `Meeting is about to end in<br>${timeRemaining.join(' ')}, ${formattedEndDate}`;
}