
function commonEventObjectTimeZone(event) {
  const timeZone = event?.commonEventObject?.timeZone?.id;
  if (timeZone == null) {
    return 'UTC';
  } else {
    return timeZone;
  }
}

function previewVoiceMemos(event) {
  // Logger.log(event);
  try {
    const url = event.docs.matchedUrl.url;
    if (url) {
      const timeZone = commonEventObjectTimeZone(event);
      let button;

      const [, shareLinkId] = url.match(/\/s\/([A-Za-z0-9]+)(?:\/|\?|$)/) || [];
      const result = getSharedMessage(shareLinkId, timeZone);
      if (result.hasAccess === false) {
        return buildAuthorizationCard(result.authUrl);
      }
      if (result.status === false) {
        return createLinkInfoCard(result.message);
      }

      const { voiceMemoName, voiceMemoText, createdAt, duration, audioUrl} = result;

      const caseHeader = CardService.newCardHeader()
        .setTitle(voiceMemoName)
        .setSubtitle(createdAt + ' · Duration: ' + duration);

      const caseDescription = CardService.newTextParagraph()
        .setText(voiceMemoText);

      if (audioUrl) {
        button = CardService.newTextButton()
          .setText('<font color=#5E4CCE><b>Play</b></font>')
          .setBackgroundColor('#DBD2FF')
          .setOpenLink(CardService.newOpenLink().setOpenAs(CardService.OpenAs.OVERLAY).setUrl(audioUrl));
      } else {
        button = CardService.newTextButton()
          .setText('<font color=#5E4CCE><b>Open</b></font>')
          .setBackgroundColor('#DBD2FF')
          .setOpenLink(CardService.newOpenLink().setOpenAs(CardService.OpenAs.OVERLAY).setUrl(url));
      }

      // Returns the card.
      // Uses the text from the card's header for the title of the smart chip.
      return CardService.newCardBuilder()
        .setHeader(caseHeader)
        .addSection(CardService.newCardSection().addWidget(caseDescription).addWidget(button))
        .build();
    }
  }
  catch (e) {
    return createInfoCard(e)
  }
}


function previewConversations(event) {
  // Logger.log(event);
  // If the event object URL matches a specified pattern for support case links.
  if (event.docs.matchedUrl.url) {
    const timeZone = commonEventObjectTimeZone(event);
    let button;

    const url = event.docs.matchedUrl.url;
    const [, convId] = url.match(/\/c\/([A-Za-z0-9]+)(?:\/|\?|$)/) || [];
    const result = getChannel(convId, timeZone);
    if (result.hasAccess === false) {
      return buildAuthorizationCard(result.authUrl);
    }
    if (result.status === false) {
      return createLinkInfoCard(result.message);
    }
    const { channelName, workspaceName, createdAt, duration, lastPosted, totalMessages } = result;

    // Builds a preview card with the case name, and description
    const caseHeader = CardService.newCardHeader()
      //.setImageUrl(voiceMemoIconUrl)
      .setTitle(channelName)
      .setSubtitle(workspaceName);
    const caseDescription = CardService.newTextParagraph()
      .setText(`Created: ${createdAt}
      Last posted: ${lastPosted}
      Total messages: ${totalMessages}
      `);

    button = CardService.newTextButton()
      .setText('<font color=#5E4CCE><b>Open</b></font>')
      .setBackgroundColor('#DBD2FF')
      // .setIconUrl(recordMemoCV400IconUrl)
      .setOpenLink(CardService.newOpenLink().setOpenAs(CardService.OpenAs.OVERLAY).setUrl(url));

    // Returns the card.
    // Uses the text from the card's header for the title of the smart chip.
    return CardService.newCardBuilder()
      .setHeader(caseHeader)
      // .addSection(CardService.newCardSection().addWidget(button))
      .addSection(CardService.newCardSection()
        .addWidget(caseDescription)
        .addWidget(button))
      .build();
  }
}