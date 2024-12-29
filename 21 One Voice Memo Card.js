function openOneVoiceMemoCard(e) {
  const name = e.parameters.name;
  const duration = e.parameters.duration;
  const messageId = e.parameters.messageId;
  const createdAt = e.parameters.createdAt;
  const voiceMemoText = e.parameters.voiceMemoText;
  const userTimeZone = e.parameters.userTimeZone;

  // All prompts
  const result = getPrompts();
  if (result.hasAccess === false) {
    return buildAuthorizationCard(result.authUrl);
  }
  const allPrompts = result.allPrompts;

  let aiButtonSet;
  let professionalEmailFlag = false;
  const allAiCategoriesArray = [];
  const allPromptNames = {};
  let currentCatNum = 0;
  for (let i = 0; i < allPrompts.length; i++) {
    allPromptNames[allPrompts[i].id] = allPrompts[i].name;
    //{orderInCategory=1.0, id=66859b7f6928970bb4f1c24a, name=Bulleted Summary, categoryNumber=1.0}
    if (currentCatNum != allPrompts[i].categoryNumber) {
      if (i > 0) {
        if (professionalEmailFlag === true) {
          allAiCategoriesArray.unshift(aiButtonSet);
          professionalEmailFlag = false;
        } else {
          allAiCategoriesArray.push(aiButtonSet);
        }
      }
      aiButtonSet = CardService.newButtonSet();
      currentCatNum = allPrompts[i].categoryNumber;
    } else {
      if (allPrompts[i].name.includes('Email')) {
        professionalEmailFlag = true;
      }
      aiButtonSet.addButton(CardService.newTextButton().setText('<font color=#5E4CCE>' + allPrompts[i].name + '</font>')
        .setBackgroundColor('#F2EFFF')
        .setIconUrl(aiIconUrl)
        .setOnClickAction(CardService.newAction()
          .setFunctionName('runAiMagic')
          .setParameters({ promptId: allPrompts[i].id, messageId: messageId, name: name, duration: duration, createdAt: createdAt, voiceMemoText: voiceMemoText, userTimeZone: userTimeZone }))
      );
    }
  }
  // End. All prompts


  // Previously used AI Actions
  const queryParams = {
    message_id: messageId
  };
  const resultAiResponses = makeCarbonVoiceRequest('GET', '/responses', null, queryParams);
  if (!resultAiResponses.hasAccess) {
    return buildAuthorizationCard(resultAiResponses.authUrl);
  }

  const aiResponses = resultAiResponses.json;
  let columns;

  if (aiResponses.length > 0) {
    const columnAiNames = CardService.newColumn().setHorizontalSizeStyle(CardService.HorizontalSizeStyle.FILL_AVAILABLE_SPACE).setHorizontalAlignment(CardService.HorizontalAlignment.START).setVerticalAlignment(CardService.VerticalAlignment.CENTER);
    const columnShowInsertButtons = CardService.newColumn().setHorizontalSizeStyle(CardService.HorizontalSizeStyle.FILL_AVAILABLE_SPACE).setHorizontalAlignment(CardService.HorizontalAlignment.END).setVerticalAlignment(CardService.VerticalAlignment.CENTER)
    aiResponses.forEach(el => {
      const json = el.responses[0].json;
      const html = el.responses[0].html;
      const text = el.responses[0].text;

      let buttonsSeePasteAiResults;

      if (el.prompt_id === '66859b7f6928970bb4f1c249') {
        const content = processText(html, json.content);
        const emailObj = { subject: json.subject, mailTo: convertEmailsToArray(json.mailTo), withCopyTo: convertEmailsToArray(json.withCopyTo), summary: json.summary, content: content };
        buttonsSeePasteAiResults = aiProfessionalEmailTwoButtonSet(emailObj, text);
      } else {
        buttonsSeePasteAiResults = aiTwoButtonSet(html, text);
      }

      const createdAt = formatDateTime(userTimeZone, el.created_at);
      columnAiNames.addWidget(aiNameDecoratedText(allPromptNames[el.prompt_id], createdAt));
      columnShowInsertButtons.addWidget(buttonsSeePasteAiResults);
    });
    columns = CardService.newColumns().addColumn(columnAiNames).addColumn(columnShowInsertButtons).setWrapStyle(CardService.WrapStyle.WRAP);
  }
  // End. Previously used AI Actions


  const card = CardService.newCardBuilder()
  const fixedFooter = getOneVoiceMemoFixedFooter(voiceMemoText, messageId, duration);
  card.setFixedFooter(fixedFooter);

  const multilineDecoratedText = CardService.newDecoratedText().setOnClickAction(CardService.newAction().setFunctionName("showNewVoiceMemoCard"))
    .setStartIcon(CardService.newIconImage().setIconUrl(voiceMemoIconUrl))
    .setText(name)
    .setWrapText(true)
    .setBottomLabel(createdAt + ' · Duration: ' + duration);

  const paragraph = CardService.newTextParagraph().setText(voiceMemoText);

  // Create a section 
  const section2 = CardService.newCardSection().setCollapsible(false).setNumUncollapsibleWidgets(1)
    .addWidget(paragraph)

  const section = CardService.newCardSection().setCollapsible(true).setNumUncollapsibleWidgets(2)
    .addWidget(multilineDecoratedText)
  allAiCategoriesArray.forEach(buttonSet => {
    section.addWidget(buttonSet);
    section.addWidget(CardService.newDivider());
  });

  const multilineDecoratedTextPreviouslyUsedAiActions = CardService.newDecoratedText()
    .setStartIcon(CardService.newIconImage().setIconUrl(aiIconUrl))
    .setText('<font color=#261073>Previously used AI Actions</font>')
    .setWrapText(true);

  const sectionPreviouslyUsedAiActions = CardService.newCardSection().setCollapsible(false)
    .addWidget(multilineDecoratedTextPreviouslyUsedAiActions)

  if (columns) {
    sectionPreviouslyUsedAiActions.addWidget(columns);
  }

  card.addSection(section)
    .addSection(section2)
    .addSection(sectionPreviouslyUsedAiActions)

  return card.build();
}

function aiNameDecoratedText(name, createdAt) {
  return CardService.newDecoratedText()
    .setText('<font color=#261073>' + name + '</font>')
    .setWrapText(true)
    .setBottomLabel(createdAt);
}

function aiTwoButtonSet(html, text) {
  const buttonPaste = CardService.newImageButton()
    .setIconUrl(pasteAiIconUrlCV400).setAltText('Paste')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('pasteText')
      .setParameters({ text: html })
    )

  const buttonSeeResults = CardService.newImageButton()
    .setIconUrl(seeAiResultsIconUrlCV400).setAltText('See Results')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('seeAiResultsCard')
      .setParameters({ html: html, text: text })
    )

  return CardService.newButtonSet().addButton(buttonPaste).addButton(buttonSeeResults);
}

function aiProfessionalEmailTwoButtonSet(emailObj, text) {
  const buttonPaste = CardService.newImageButton()
    .setIconUrl(pasteAiIconUrlCV400).setAltText('Paste')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('applyUpdateSubjectAction')
      .setParameters({ subject: emailObj.subject, content: emailObj.content, toRecipients: emailObj.mailTo, toCcRecipients: emailObj.withCopyTo }))

  const buttonSeeResults = CardService.newImageButton()
    .setIconUrl(seeAiResultsIconUrlCV400).setAltText('See Results')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('seeAiProfessionalEmailResultsCard')
      .setParameters({ emailObj: JSON.stringify(emailObj), text: text })
    )

  return CardService.newButtonSet().addButton(buttonPaste).addButton(buttonSeeResults);
}

function getOneVoiceMemoFixedFooter(voiceMemoText, messageId, duration) {
  return CardService.newFixedFooter()
    .setSecondaryButton(
      CardService.newTextButton()
        .setText('<font color=#5E4CCE><b>Paste Transcription</b></font>')
        .setIconUrl(pasteAiIconUrlCV400)
        .setOnClickAction(CardService.newAction()
          .setFunctionName('pasteText')
          .setParameters({ text: voiceMemoText })
        )
    )
    .setPrimaryButton(
      CardService.newTextButton()
        .setText('<font color=#5E4CCE><b>Share Link</b></font>')
        .setBackgroundColor('#DBD2FF')
        .setIconUrl(shareLinkIconUrlCV400)
        .setOnClickAction(CardService.newAction()
          .setFunctionName('insertVoiceMemo')
          .setParameters({ messageId: messageId, duration: duration })
        )
    );
}
