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

function getCorrectAiResponseNumber(result, aiResponseId) {
  let jsonNum;
  if (result.json.length > 1) {
    for (let i = 0; i < result.json.length; i++) {
      if (result.json[i].id === aiResponseId) {
        jsonNum = i;
        break;
      }
    }
  } else {
    jsonNum = 0;
  }
  return jsonNum;
}

function showResultsScreen(presentation, height) {
  Logger.log(presentation);
  const queryParams = {
    message_id: presentation.message_id,
    prompt_id: '669e61798d82b4c6baac633e'
  };
  const result = makeCarbonVoiceRequest('GET', '/responses', null, queryParams);
  // Logger.log(result);
  if (!result.hasAccess) {
    return result;
  }

  Logger.log('result.json.length=' + result.json.length);

  const jsonNum = getCorrectAiResponseNumber(result, presentation.aiResponseId);
  // if (result.json.length > 1) {
  //   for (let i = 0; i < result.json.length; i++) {
  //     if (result.json[i].id === presentation.aiResponseId) {
  //       jsonNum = i;
  //       break;
  //     }
  //   }
  // } else {
  //   jsonNum = 0;
  // }


  const slidesArray = result.json[jsonNum].responses[0].json.presentation_outline;


  const htmlArray = [];
  htmlArray.push(`<h1>${presentation.name}</h1>`);
  //<p>Created: ${new Date(presentation.createdAt).toLocaleString()}</p>
  htmlArray.push(`<p>Type: ${presentation.type}</p>
      <p>Created: ${presentation.formattedDateTime}</p>
      <p>Creator: ${presentation.creatorName}</p>
      ${presentation.type === 'channel' ? `<p>Workspace: ${presentation.workspaceName}</p>` : ''}
    `);

  htmlArray.push('<b>Presentation Outline</b>: <ul class="main-list">');
  slidesArray.forEach(slideOutline => {
    createList(htmlArray, slideOutline);
    //   if (/[\r\n]/.test(slideOutline.content)) {
    //     slideOutline.content = '\n' + slideOutline.content;
    //   }
    //   html += `<li><b>Slide Number: ${slideOutline.slide_number}</b>
    //   <ul class="sub-list">
    //     <li>Title: ${slideOutline.title}</li>
    //     <li>Content: ${slideOutline.content}</li>
    //     <li>Suggested Visuals:  ${slideOutline.visual_suggestion}</li>
    //     <li>Other Notes:  ${slideOutline.other_notes}</li>
    //   </ul>
    // </li>`;
  });
  htmlArray.push('</ul>');

  const suggestionsSlidesArray = result.json[0].responses[0].json.additional_suggestions;
  // Logger.log(suggestionsSlidesArray);
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
  const template = HtmlService.createTemplateFromFile('02 Modal Dialog Results');
  template.html = htmlArray.join('');
  template.messageId = presentation.message_id;
  template.aiResponseId = presentation.aiResponseId;
  const htmlOutput = template.evaluate()
    .setWidth(500)
    .setHeight(modalDialogHeigh);
  SlidesApp.getUi().showModalDialog(htmlOutput, 'Results');
  return { status: 'ok', hasAccess: true, message: 'Results retrieved successfully.' };
}