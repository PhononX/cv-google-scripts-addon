function getFixedFooterCreateAsyncMeeting(emailsArrayLength) {

  const newAction = CardService.newAction()
    .setFunctionName('createAsyncMeetingButtonAction');

  newAction.setParameters({ emailsArrayLength: emailsArrayLength.toString() });

  return CardService.newFixedFooter()
    .setPrimaryButton(
      CardService.newTextButton()
        .setText('<font color=#5E4CCE><b>Create Async Meeting</b></font>')
        .setBackgroundColor('#DBD2FF')
        .setIconUrl(newAsyncMeetingCV400IconUrl)
        .setOnClickAction(newAction)

    );
}

function createAsyncMeetingButtonAction(e) {
  try {
    const emailsArrayLength = e.parameters.emailsArrayLength;

    const emailsArray = [];

    for (let i = 0; i < emailsArrayLength; i++) {
      const switchKey = e.formInput['switchKey' + i];
      if (switchKey) {
        emailsArray.push(switchKey);
      }
    }
    if (emailsArray.length === 0) {
      return notification('Add at least one person!')
    }

    const whenToTalk = e.formInput.whenToTalk;

    let isoDateTime;
    if (whenToTalk === 'endDate') {
      const dateTime = e.formInput.dateTime.msSinceEpoch;
      isoDateTime = new Date(dateTime).toISOString();
    } else {
      if (whenToTalk === 'urgent') {
        isoDateTime = getToday2350();
      } else if (whenToTalk === 'morning') {
        isoDateTime = getTomorrow1000();
      } else {
        isoDateTime = getFriday2000();
      }
    }

    const conversationTitle = e.formInput.conversationTitle;
    if (conversationTitle == null) {
      return notification('Fill out conversation title!')
    }

    const conversationFirstMessage = e.formInput.conversationFirstMessage;
    if (conversationFirstMessage == null) {
      return notification('Fill out conversation first message!')
    }

    const resultFirstMessage = createStoredMessage(conversationFirstMessage);
    if (resultFirstMessage.hasAccess === false) {
      return buildAuthorizationCard(resultFirstMessage.authUrl);
    }

    const messageId = resultFirstMessage.json.message_id;

    const resultNewAsyncMeeting = createAsyncMeeting(messageId, emailsArray, conversationTitle, isoDateTime);
    if (resultNewAsyncMeeting.hasAccess === false) {
      return buildAuthorizationCard(resultNewAsyncMeeting.authUrl);
    }

    const userEmail = Session.getActiveUser().getEmail();
    const index = emailsArray.indexOf(userEmail);
    if (index > -1) {
      emailsArray.splice(index, 1);
    }
    const card = confirmAsyncMeetingCard('https://carbonvoice.app/c/' + resultNewAsyncMeeting.json.channel_guid, resultNewAsyncMeeting.json.channel_name, emailsArray);
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
