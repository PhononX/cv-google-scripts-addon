function getListOfPresentationsSidebar() {
  const result = getListOfPresentations();
  return JSON.stringify(result);
}

// https://api.carbonvoice.app/responses/prompt/669e61798d82b4c6baac633e/latest-ten
function getListOfPresentations(keepMeSigned) {
  const result = makeCarbonVoiceRequest('GET', '/responses/prompt/669e61798d82b4c6baac633e/latest-ten', null, null);
  if (!result.hasAccess) {
    return result;
  }

  if (typeof keepMeSigned === 'boolean') {
    //Logger.log('Change keepMeSigned');
    changeKeepMeSignedSetting(keepMeSigned);
  }
  // else{
  //   //Logger.log('Don\'t change keepMeSigned');
  // }

  const presentations = [];
  result.json.results.forEach(el => {
    let messageName;
    let durationMs = 0;
    // Logger.log('el.ai_response.id = ' + el.ai_response.id);
    // Logger.log(el.messages);
    // Logger.log('el.messages.length = ' + el.messages.length);
    // Logger.log('el.ai_response.responses.length = ' + el.ai_response.responses.length);
    // Logger.log(el.ai_response.responses[0].json.presentation_outline);
    // Logger.log(el.ai_response.responses[0].json.presentation_outline[0].title);
    // Logger.log('el.messages[0].message.name = ' + el.messages[0].message.name);
    //result.json[0].responses[0].json.presentation_outline;

    if (el.messages.length === 1) {
      if (el.messages[0].message.name) {
        messageName = el.messages[0].message.name
      } else if (el.messages[0].message.ai_summary) {
        messageName = el.messages[0].message.ai_summary;
      } else {
        // messageName = '2m 37s on 8/19/24'
        messageName = '-'
      }
    } else {
      messageName = el.ai_response.responses[0].json.presentation_outline[0].title + ' (' + el.messages.length + ')';
    }

    el.messages.forEach(el => {
      // Logger.log(message);
      durationMs += el.message.duration_ms;
    });

    //const presoTitle = el.ai_response.responses[0].json.presentation_outline[0].title;
    presentations.push({ aiResponseId: el.ai_response.id, name: messageName, message_id: el.messages[0].message.id, type: el.messages[0].message.type, createdAt: el.messages[0].message.created_at, creatorName: el.messages[0].creator.full_name, durationMs: durationMs });
    const lastElNum = presentations.length - 1;
    if (presentations[lastElNum].type === 'channel') {
      presentations[lastElNum].workspaceName = el.messages[0].conversation.workspace_name;
      presentations[lastElNum].workspaceImageUrl = el.messages[0].conversation.workspace_image_url;
      presentations[lastElNum].convType = el.messages[0].conversation.type;
    }
  });
  // Logger.log(JSON.stringify(presentations));
  // if (presentations.length === 0){
  //   return { hasAccess: true, presentations: presentations };
  // }
  return { hasAccess: true, presentations: presentations };
}

function createSlides(messageId, aiResponseId) {
  Logger.log(messageId);
  // Logger.log(selectedLabel);
  const presentation = SlidesApp.getActivePresentation();

  // Not empty presentation?
  const slides = presentation.getSlides();
  const numSlides = slides.length;
  if (numSlides > 1) {
    const ui = SlidesApp.getUi();
    const response = ui.alert('Confirmation', 'The presentation contains slides. Do you want to proceed?', ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
      // Action for Yes
    } else {
      return { status: 'error', hasAccess: true, message: 'You stopped execution.' };
    }
  }
  // End. Not empty presentation?

  const queryParams = {
    message_id: messageId,
    prompt_id: '669e61798d82b4c6baac633e'
  };

  const result = makeCarbonVoiceRequest('GET', '/responses', null, queryParams);
  if (!result.hasAccess) {
    return result;
  }

  // Remove once /response will allow search by id (ai response id)
  const jsonNum = getCorrectAiResponseNumber(result, aiResponseId);

  const slidesArray = result.json[jsonNum].responses[0].json.presentation_outline;

  const suggestionsSlidesArray = result.json[jsonNum].responses[0].json.additional_suggestions;

  return generateSlides(presentation, numSlides, slides, slidesArray, suggestionsSlidesArray);

}

function generateSlides(presentation, numSlides, slides, slidesArray, suggestionsSlidesArray) {

  // Logger.log(suggestionsSlidesArray);
  if (suggestionsSlidesArray) {
    if (suggestionsSlidesArray.length > 0) {
      slidesArray.push({ title: 'Additional Slide Suggestions', slide_number: 'Additional' });
    }
    suggestionsSlidesArray.forEach(el => {
      if (el.suggestion_details) {
        el = el.suggestion_details;
      }
      let title, visual_suggestion, content, other_notes;
      if (el.title) title = el.title;
      if (el.content) content = el.content;
      if (el.visual_suggestion) visual_suggestion = el.visual_suggestion;
      if (el.notes) other_notes = el.other_notes;
      //if (el.description) other_notes += el.description;
      slidesArray.push({ title: title, visual_suggestion: visual_suggestion, content: content, other_notes: other_notes });
    });
  }

  let nonEmptyFirstSlideFlag = false;
  if (numSlides === 1) {
    const pageElements = slides[0].getPageElements();
    for (let i = 0; i < pageElements.length; i++) {
      if (pageElements[i].getPageElementType() === SlidesApp.PageElementType.SHAPE) {
        if (pageElements[i].asShape().getText().asRenderedString().trim() !== '') {
          // Logger.log('No');
          nonEmptyFirstSlideFlag = true;
          break;
        }
      } else {
        nonEmptyFirstSlideFlag = true;
        break;
      }
    }
    if (nonEmptyFirstSlideFlag === false) {
      const title = slidesArray[0].title || '';
      const visualSuggestion = slidesArray[0].visual_suggestion || '';
      const content = slidesArray[0].content || '';
      const notes = slidesArray[0].other_notes || '';
      titleSlide(slides[0], title, visualSuggestion, content, notes, true);
      slidesArray.shift();
    }
  }

  slidesArray.forEach(slideOutline => {
    appendSlide(presentation, slideOutline);
  });
  // Logger.log(slidesArray);
  return { status: 'ok', hasAccess: true, message: 'Export completed successfully.\n' + slidesArray.length + ' slides.' };
}

// function appendSlide(slideNumber, presentation, title, visualSuggestion, content, notes) {
function appendSlide(presentation, slideOutline) {
  let slidePredefinedLayout;
  // const slidePredefinedLayout = slideOutline.slide_number == 'Title' ? SlidesApp.PredefinedLayout.TITLE : SlidesApp.PredefinedLayout.TITLE_AND_BODY;
  if (slideOutline.slide_number === 'Title') {
    slidePredefinedLayout = SlidesApp.PredefinedLayout.TITLE;
  } else if (slideOutline.slide_number === 'Additional') {
    // slidePredefinedLayout = SlidesApp.PredefinedLayout.TITLE_ONLY;
    slidePredefinedLayout = SlidesApp.PredefinedLayout.SECTION_HEADER;
  } else {
    slidePredefinedLayout = SlidesApp.PredefinedLayout.TITLE_AND_BODY;
    // slidePredefinedLayout = SlidesApp.PredefinedLayout.TITLE_ONLY;
  }

  const slide = presentation.appendSlide(slidePredefinedLayout);

  const title = slideOutline.title || '';
  const visualSuggestion = slideOutline.visual_suggestion || '';
  const content = slideOutline.content || '';
  let notes = slideOutline.other_notes || '';

  if (slideOutline.slide_number === 'Title') {
    titleSlide(slide, title, visualSuggestion, content, notes, true);
  } else {
    const titleShape = slide.getPlaceholder(SlidesApp.PlaceholderType.TITLE);
    const bodyShape = slide.getPlaceholder(SlidesApp.PlaceholderType.BODY);

    if (!titleShape || !bodyShape) {
      unknownSlide(slide, title, visualSuggestion, content, notes);
    } else {
      titleShape.asShape().getText().setText(title);

      if (slideOutline.slide_number === 'Additional') {
        // titleShape.asShape().alignOnPage(SlidesApp.AlignmentPosition.VERTICAL_CENTER);
        // titleShape.asShape().getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
        // bodyShape.remove();
      } else {
        bodyShape.asShape().getText().appendParagraph(content);
      }
      if (visualSuggestion) {
        bodyShape.asShape().getText().appendParagraph('Suggested Visuals').getRange().getTextStyle().setBold(true);
        bodyShape.asShape().getText().appendParagraph(visualSuggestion);
      }
      if (notes) {
        bodyShape.asShape().getText().appendParagraph('Other Notes').getRange().getTextStyle().setBold(true);
        bodyShape.asShape().getText().appendParagraph(notes);
      }
    }
  }
}

function titleSlide(slide, title, visualSuggestion, content, notes, typeIsTitle) {

  const titleShape = slide.getPlaceholder(SlidesApp.PlaceholderType.CENTERED_TITLE);
  const subtitleShape = slide.getPlaceholder(SlidesApp.PlaceholderType.SUBTITLE);

  if (!titleShape || !subtitleShape) {
    unknownSlide(slide, title, visualSuggestion, content, notes);
  }

  titleShape.asShape().getText().setText(title)
  subtitleShape.asShape().getText().setText(content);

  notes = visualSuggestion + '\n' + notes;
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(notes);
}

function unknownSlide(slide, title, visualSuggestion, content, notes) {
  const placeholders = slide.getPlaceholders();
  const placeholdersShapes = placeholders.filter(placeholder => {
    return placeholder.getPageElementType() === SlidesApp.PageElementType.SHAPE;
  });
  if (placeholdersShapes.length === 0) {
    notes = title + '\n' + visualSuggestion + '\n' + content + '\n' + notes;
  } else if (placeholdersShapes.length === 1) {
    placeholdersShapes[0].asShape().getText().setText(title);
    notes = visualSuggestion + '\n' + content + '\n' + notes;
  } else if (placeholdersShapes.length === 2) {
    let titleIndex = 0;
    let textIndex = 1;
    placeholdersShapes[titleIndex].asShape().getText().setText(title);
    placeholdersShapes[textIndex].asShape().getText().setText(content);
    notes = visualSuggestion + '\n' + notes;
  }
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(notes);
}