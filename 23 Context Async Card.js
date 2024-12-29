function extractUniqueEmails(inputString) {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  // Use the regex to find all matches in the input string
  const matches = inputString.match(emailRegex);
  // Use a Set to store unique email addresses
  const uniqueEmails = new Set(matches);
  // Convert the Set back to an array
  return Array.from(uniqueEmails);
}

function asyncMeetingCardContextSidebar(e) {
  const message = getCurrentMessage(e);

  const thread = message.getThread();
  const threadMessages = thread.getMessages();
  const subject = threadMessages[0].getSubject();
  const startDateThread = threadMessages[0].getDate();
  const userTimeZone = getTimeZoneValue();
  const formattedStartDateThread = Utilities.formatDate(startDateThread, userTimeZone, "MMMM d, yyyy, 'at' hh:mm a");

  let fromToString = '';
  for (let i in threadMessages) {
    const sender = threadMessages[i].getFrom();
    const recepient = threadMessages[i].getTo();
    fromToString += sender + ' ';
    fromToString += recepient + ' ';
  }

  const emails = extractUniqueEmails(fromToString);
  const selectedEmails = [...emails];


  let whenToTalk = e.parameters?.whenToTalk;
  // const dateTime = e.formInput.dateTime.msSinceEpoch;

  const conversationTitleValue = subject;
  const conversationFirstMessageValue = "We started to discuss this in Gmail on " + formattedStartDateThread + " (" + userTimeZone + "). Let's proceed with this async Carbon Voice conversation.";

  return asyncMeetingCard(conversationTitleValue, conversationFirstMessageValue, emails, selectedEmails, whenToTalk);
}

function asyncMeetingCard(conversationTitleValue, conversationFirstMessageValue, emails, selectedEmails, whenToTalk, dateTimeValue) {

  const selected = { urgent: false, morning: false, fewDays: false, endDate: false };
  if (whenToTalk == null) {
    whenToTalk = 'urgent';
  }
  const previousWhenToTalk = whenToTalk;
  selected[whenToTalk] = true;

  const card = CardService.newCardBuilder();

  const emailsArrayLength = emails.length.toString();
  const fixedFooter = getFixedFooterCreateAsyncMeeting(emailsArrayLength);
  card.setFixedFooter(fixedFooter);


  const conversationTitle = CardService.newTextInput()
    .setFieldName('conversationTitle')
    .setValue(conversationTitleValue)
    .setTitle('What’s the conversation title?');

  const section = CardService.newCardSection()
    .addWidget(conversationTitle);

  const firstMessage = CardService.newTextInput()
    .setFieldName('conversationFirstMessage')
    .setMultiline(true)
    .setValue(conversationFirstMessageValue)
    .setHint("The text will be the very first message of the newly created conversation.")
    .setTitle('First Message');

  section.addWidget(firstMessage);

  section.addWidget(CardService.newDivider());

  section.addWidget(CardService.newTextParagraph().setText('Add people:'));

  for (let i = 0; i < emails.length; i++) {
    const selected = selectedEmails.includes(emails[i]);
    const sw = createSwitch(i, emails[i], selected);
    section.addWidget(sw);
  }
  section.addWidget(CardService.newDivider());

  // selected = { urgent: true, morning: false, fewDays: false, endDate: false };
  const radioGroup =
    CardService.newSelectionInput()

      .setType(CardService.SelectionInputType.RADIO_BUTTON)
      .setTitle('When do you want to talk?')
      .setFieldName('whenToTalk')
      .addItem('Urgent: By 11:50 PM', 'urgent', selected.urgent)
      .addItem('Tomorrow Morning: By 10 AM', 'morning', selected.morning)
      .addItem('In a Few Days: By Friday at 8 PM', 'fewDays', selected.fewDays)
      .addItem('Specify End Date: Set own time', 'endDate', selected.endDate)

      .setOnChangeAction(CardService.newAction()
        .setFunctionName('getAsyncMeetingFormValues')
        .setParameters({ emails: JSON.stringify(emails), emailsArrayLength: emailsArrayLength, previousWhenToTalk: previousWhenToTalk }));

  section.addWidget(radioGroup);

  if (whenToTalk === 'endDate') {

    if (dateTimeValue == null) {
      dateTimeValue = new Date().getTime() + 60 * 60 * 24 * 1000
    }

    const timeZoneOffsetInMins = getTimezoneOffset();
    const dateTimePicker =
      CardService.newDateTimePicker()
        .setFieldName('dateTime')
        .setValueInMsSinceEpoch(dateTimeValue)
        .setTimeZoneOffsetInMins(timeZoneOffsetInMins)
    section.addWidget(dateTimePicker);
  }

  card.addSection(section);
  return card.build();
}

function createSwitch(i, email, selected) {
  return CardService.newDecoratedText()
    .setText(email)
    .setWrapText(true)
    .setSwitchControl(
      CardService.newSwitch().setSelected(selected)
        .setFieldName('switchKey' + i)
        .setValue(email)
    );
}

function getAsyncMeetingFormValues(e) {

  const previousWhenToTalk = e.parameters.previousWhenToTalk;
  const whenToTalk = e.formInput.whenToTalk;

  // Logger.log(previousWhenToTalk + ' -> ' + whenToTalk)

  if (whenToTalk === 'endDate' || previousWhenToTalk === 'endDate') {

    const emailsArrayLength = e.parameters.emailsArrayLength;
    const emails = JSON.parse(e.parameters.emails);

    const selectedEmails = [];

    for (let i = 0; i < emailsArrayLength; i++) {
      const switchKey = e.formInput['switchKey' + i];
      if (switchKey) {
        selectedEmails.push(switchKey);
      }
    }

    const conversationTitleValue = e.formInput.conversationTitle;
    const conversationFirstMessageValue = e.formInput.conversationFirstMessage;
    const dateTimeValue = e.formInput.dateTime;
    const card = asyncMeetingCard(conversationTitleValue, conversationFirstMessageValue, emails, selectedEmails, whenToTalk, dateTimeValue);
    return CardService.newActionResponseBuilder()
      .setNavigation(
        CardService.newNavigation().updateCard(card)
      )
      .setStateChanged(true)
      .build();
  }
}
