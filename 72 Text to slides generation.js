function getGoogleSlidesFolderId() {
  const queryParams = {
    type: 'voicememo',
    include_all_tree: false,
    sort_direction: 'ASC',
    workspace_id: 'personal'
  };
  const result = makeCarbonVoiceRequest('GET', '/folders', null, queryParams);
  if (!result.hasAccess) {
    return result;
  }

  let folderId;
  const gSlidesFolders = result.json.results.filter(el => el.name === 'Google Slides');
  // Logger.log(gSlidesFolders);
  if (gSlidesFolders.length === 0) {
    const payload = {
      "name": "Google Slides",
      "type": "voicememo",
      "workspace_id": "personal",
      // "parent_folder_id": "string"
    };
    const resultNewFolder = makeCarbonVoiceRequest('POST', '/folders', payload, null);
    // Logger.log(resultNewFolder);
    if (!resultNewFolder.hasAccess) {
      return resultNewFolder;
    }
    folderId = resultNewFolder.json.id;
  } else {
    folderId = gSlidesFolders[0].id;
  }
  // Logger.log(folderId);
  return { status: 'ok', hasAccess: true, folderId: folderId };
}


function createVoiceMemoRunAiMagic(text = 'Presentation about New Year 2025') {
  const result = getGoogleSlidesFolderId();
  if (!result.hasAccess) {
    return result;
  }
  const folderId = result.folderId;

  const resultVoiceMemo = createVoiceMemo(text, folderId);
  if (!resultVoiceMemo.hasAccess) {
    return resultVoiceMemo;
  }

  // Logger.log(resultVoiceMemo);
  // Logger.log(resultVoiceMemo.json.message_id);

  const messageId = resultVoiceMemo.json.message_id;

  const resultAiMagic = aiMagic(messageId, '669e61798d82b4c6baac633e');
  if (!resultAiMagic.hasAccess) {
    return resultAiMagic;
  }
  // Logger.log(resultAiMagic);

  const presentation = SlidesApp.getActivePresentation();

  // Not empty presentation?
  const slides = presentation.getSlides();
  const numSlides = slides.length;
  if (numSlides > 1) {
    const ui = SlidesApp.getUi();
    const response = ui.alert('Confirmation', 'The presentation contains slides. Do you want to proceed?\n\nIf you reply “No”, you can switch to Carbon Voice tab on the sidebar and click “Refresh” to see the newly created Presentation Outline.', ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
      // Action for Yes
    } else {
      return { status: 'error', hasAccess: true, message: 'You stopped execution.' };
    }
  }
  // End. Not empty presentation?

  const slidesArray = resultAiMagic.json.responses[0].json.presentation_outline;

  const suggestionsSlidesArray = resultAiMagic.json.responses[0].json.additional_suggestions;

  return generateSlides(presentation, numSlides, slides, slidesArray, suggestionsSlidesArray);
}

function aiMagic(messageId, promptId) {
  const payload = {
    message_ids: [messageId],
    prompt_id: promptId
  };
  const result = makeCarbonVoiceRequest('POST', '/responses', payload, null);
  return result;
}

function createVoiceMemo(text = 'test text2', folderId = '674342f3b5711ab3a06d757b') {
  const payload = {
    "transcript": text,
    "is_text_message": true,
    "is_streaming": false,
    "folder_id": folderId,
  };
  const result = makeCarbonVoiceRequest('POST', '/v3/messages/voicememo/start', payload, null);
  return result;
}