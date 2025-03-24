function getListOfPresentationsSidebar() {
  const result = getListOfPresentations();
  return JSON.stringify(result);
}

// https://api.carbonvoice.app/responses/prompt/669e61798d82b4c6baac633e/latest-ten
function getListOfPresentations(keepMeSigned) {

  if (typeof keepMeSigned === 'boolean') {
    changeKeepMeSignedSetting(keepMeSigned);
  }

  const result = makeCarbonVoiceRequest('GET', '/responses/prompt/669e61798d82b4c6baac633e/latest-ten', null, null);
  if (!result.hasAccess) {
    return result;
  }

  const aiResultTextAndSourceMessages = [];
  let currentUserId;
  const uniqueMessageIds = new Set();

  result.json.results.forEach(el => {
    // for (let key in el.ai_response) {
    //   Logger.log(key);
    // }
    try {
      const messages = [];
      const creatorsObject = {};
      const uniqueCreators = new Set();
      let aiResultName, conversationType, conversationName, conversationImageUrl, workspaceName, workspaceImageUrl, groupType;
      let durationMs = 0;

      let aiResultJson = el?.ai_response?.responses?.[0]?.json;

      if (aiResultJson) {
        // let aiResultText = el.ai_response.responses[0].json[key].join('\n');
        // Logger.log('el.ai_response.message_ids = ' + el.ai_response.message_ids);
        // Logger.log('el.ai_response.workspace_id = ' + el.ai_response.workspace_id);
        // Logger.log('el.ai_response.channel_id = ' + el.ai_response.channel_id);
        // Logger.log('el.ai_response.id = ' + el.ai_response.id);
        // Logger.log('el.ai_response = ' + JSON.stringify(el.ai_response));
        // Logger.log(aiResultText);
        // Logger.log('el.messages.length = ' + el.messages.length);
        // Logger.log('el.ai_response.responses.length = ' + el.ai_response.responses.length);
        // Logger.log(el.ai_response.responses[0].json.presentation_outline);
        // Logger.log(el.ai_response.responses[0].json.presentation_outline[0].title);
        // Logger.log('el.messages[0].message.name = ' + el.messages[0].message.name);
        //result.json[0].responses[0].json.presentation_outline;

        // if (el.messages[0].message.name) {
        //   messageName = el.messages[0].message.name
        // } else if (el.messages[0].message.ai_summary) {
        //   messageName = el.messages[0].message.ai_summary;
        // } else {
        //   // messageName = '2m 37s on 8/19/24'
        //   messageName = '-'
        // }

        aiResultName = el.ai_response.responses[0].json.presentation_outline[0].title;

        if (el.messages.length > 1) {
          aiResultName += ' (' + el.messages.length + ')';
        }

        el.messages.sort((a, b) => new Date(a.message.created_at) - new Date(b.message.created_at));

        el.messages.forEach(message => {
          let isPrivate, messageType;
          messageType = message.message.type;
          groupType = messageType;
          if (messageType === 'channel') {
            const creatorId = message.creator.id;
            const creatorImageUrl = message.creator.image_url ? message.creator.image_url : 'https://pxassets.s3.us-east-2.amazonaws.com/images/personal.png';
            conversationType = message.conversation.type;
            conversationName = message.conversation.name;
            conversationImageUrl = message.conversation.image_url;
            if (conversationImageUrl == null) {
              conversationImageUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/blank.png';
            }
            workspaceName = message.conversation.workspace_name;
            workspaceImageUrl = message.conversation.workspace_image_url;
            isPrivate = message.conversation.is_private;

            if (conversationType === 'directMessage') {
              if (currentUserId == null) {
                const result = makeCarbonVoiceRequest('GET', '/whoami', null, null);
                if (!result.hasAccess) {
                  return result;
                }
                currentUserId = result.json.user.user_guid;
              }
              if (creatorId != currentUserId) {
                if (creatorsObject.hasOwnProperty(creatorId)) {
                  creatorsObject[creatorId].n++;
                } else {
                  creatorsObject[creatorId] = { n: 1, creatorImageUrl }
                }
              }
            }

          } else {
            uniqueMessageIds.add(message.message.id);
          }

          uniqueCreators.add(message.creator.full_name);
          durationMs += message.message.duration_ms;
          messages.push({ messageName: message.message.name, messageId: message.message.id, creator: message.creator.full_name, imageUrl: message.creator.image_url, createdAt: message.message.created_at, durationMs: message.message.duration_ms, messageType, isPrivate });
        });

        if (conversationType === 'directMessage') {
          let maxN = 0;
          for (let id in creatorsObject) {
            if (creatorsObject[id].n > maxN) {
              conversationImageUrl = creatorsObject[id].creatorImageUrl;
              maxN = creatorsObject[id].n;
            }
          }
        }

        const uniqueCreatorsArray = Array.from(uniqueCreators);
        const creatorName = uniqueCreatorsArray.length === 1 ? 'Creator: ' + uniqueCreatorsArray[0] : 'Creators: ' + uniqueCreatorsArray.join(', ');

        // if (aiResultName === 'Inspiring Interest in Marcel Proust (3)') {
        //   throw new Error('test error');
        // }
        aiResultTextAndSourceMessages.push({ success: true, aiResultName, aiResultJson, messages, createdAt: el.ai_response.created_at, durationMs, conversationType, conversationName, conversationImageUrl, workspaceName, workspaceImageUrl, groupType, creatorName });
      }

    }
    catch (error) {
      aiResultTextAndSourceMessages.push({ success: false, errorMessage: String(error) + '; aiResponseId: ' + el?.ai_response?.id });
    }
  });

  let publicSharedVoiceMemos = [];
  const uniqueMessageIdsArray = Array.from(uniqueMessageIds);
  if (uniqueMessageIdsArray.length > 0) {
    const payload = {
      "message_ids": uniqueMessageIdsArray
    };
    const resultShareableLinksByMessageId = makeCarbonVoiceRequest('POST', '/message-sharelinks/by-message-ids', payload, null);
    if (!resultShareableLinksByMessageId.hasAccess) {
      return resultShareableLinksByMessageId;
    }

    publicSharedVoiceMemos = resultShareableLinksByMessageId.json
      .filter(message => message.is_public_shared)
      .map(message => message.message_id);
  }

  return { hasAccess: true, aiResultTextAndSourceMessages, publicSharedVoiceMemos };
}

function createSlides(outlinesJson, additionalSuggestionsJson) {
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

  const slidesArray = outlinesJson;

  const suggestionsSlidesArray = additionalSuggestionsJson;

  return generateSlides(presentation, numSlides, slides, slidesArray, suggestionsSlidesArray);

}

function generateSlides(presentation, numSlides, slides, slidesArray, suggestionsSlidesArray) {
  // throw new Error('test error');
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