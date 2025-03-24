function createList(htmlArray, slideOutline) {
  if (/[\r\n]/.test(slideOutline.content)) {
    slideOutline.content = '\n' + slideOutline.content;
  }
  const slideNumberOrTitle = slideOutline.slide_number ? `Slide Number: ${slideOutline.slide_number}` : `Slide: ${slideOutline.title}`
  htmlArray.push(`<li><b>${slideNumberOrTitle}</b>
    <ul class="sub-list">
      <li>Title: ${slideOutline.title}</li>
      <li>Content: ${slideOutline.content}</li>
      <li>Suggested Visuals:  ${slideOutline.visual_suggestion}</li>
      <li>Other Notes:  ${slideOutline.other_notes}</li>
    </ul>
  </li>`);
}

function showResultsScreen(presentation, height) {
  const slidesArray = presentation.aiResultJson.presentation_outline;
  const htmlArray = [];
  htmlArray.push(`<h1>${presentation.aiResultName}</h1>`);
  htmlArray.push(`<p>Type: ${presentation.groupType}</p>
      <p>Created: ${presentation.formattedDateTime}</p>
      <p>${presentation.creatorName}</p>
      ${presentation.groupType === 'channel' ? `<p>Workspace: ${presentation.workspaceName}</p>` : ''}
    `);

  htmlArray.push('<b>Presentation Outline</b>: <ul class="main-list">');
  slidesArray.forEach(slideOutline => {
    createList(htmlArray, slideOutline);
  });
  htmlArray.push('</ul>');

  const suggestionsSlidesArray = presentation.aiResultJson.additional_suggestions;

  if (suggestionsSlidesArray) {
    if (suggestionsSlidesArray.length > 0) {
      htmlArray.push('<b>Additional Suggestions</b>: <ul class="main-list">');
    }
    suggestionsSlidesArray.forEach(el => {
      if (el.suggestion_details) {
        el = el.suggestion_details;
      }
      createList(htmlArray, el);
    });
  }
  htmlArray.push('</ul>');

  const modalDialogHeigh = height || 300;
  const template = HtmlService.createTemplateFromFile('73 Modal Dialog Results');
  template.html = htmlArray.join('');
  template.slidesArray = JSON.stringify(slidesArray);
  template.suggestionsSlidesArray = JSON.stringify(suggestionsSlidesArray);
  const htmlOutput = template.evaluate()
    .setWidth(500)
    .setHeight(modalDialogHeigh);
  SlidesApp.getUi().showModalDialog(htmlOutput, 'Results');
  return { status: 'ok', hasAccess: true, message: 'Results retrieved successfully.' };
}