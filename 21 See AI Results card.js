function seeAiResultsCard(e) {
  const html = e.parameters.html;
  const text = e.parameters.text;
  const card = CardService.newCardBuilder();

  const footer = CardService.newFixedFooter()
    .setPrimaryButton(
      CardService.newTextButton()
        .setText('<font color=#5E4CCE><b>Paste</b></font>')
        .setBackgroundColor('#DBD2FF')
        .setIconUrl(pasteAiIconUrlCV400)
        .setOnClickAction(CardService.newAction()
          .setFunctionName('pasteText')
          .setParameters({ text: html })
        )
    );

  card.setFixedFooter(footer);

  const section = CardService.newCardSection();
  section.addWidget(CardService.newTextParagraph().setText(text)
  );

  card.addSection(section);
  return card.build();
}

function seeAiProfessionalEmailResultsCard(e) {
  // const html = e.parameters.html;
  const emailObj = JSON.parse(e.parameters.emailObj);
  const text = e.parameters.text;
  const card = CardService.newCardBuilder();

  const footer = CardService.newFixedFooter()
    .setPrimaryButton(
      CardService.newTextButton()
        .setText('<font color=#5E4CCE><b>Paste</b></font>')
        .setBackgroundColor('#DBD2FF')
        .setIconUrl(shareLinkIconUrlCV400)
        .setOnClickAction(CardService.newAction()
          .setFunctionName('applyUpdateSubjectAction')
          .setParameters({ subject: emailObj.subject, content: emailObj.content, toRecipients: emailObj.mailTo, toCcRecipients: emailObj.withCopyTo }))
    );

  card.setFixedFooter(footer);

  const section = CardService.newCardSection();
  section.addWidget(CardService.newTextParagraph().setText(text)
  );

  card.addSection(section);
  return card.build();
}
