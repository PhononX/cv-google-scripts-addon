function initialDataSidebar() {
  const result = initialData();
  return JSON.stringify(result);
}

function initialData(keepMeSigned) {
  const result = getPrompts();
  if (!result.hasAccess) {
    return result;
  }
  const allPrompts = result.allPrompts;
  const promptId = allPrompts[0].id;

  const resultAi = getListOfAiResults(promptId);
  if (!resultAi.hasAccess) {
    return resultAi;
  }
  const aiResultTextAndSourceMessages = resultAi.aiResultTextAndSourceMessages;

  const resultVoiceMemosAndFolders = getVoiceMemosAndFolders(null, null, null, keepMeSigned);
  if (!resultVoiceMemosAndFolders.hasAccess) {
    return resultVoiceMemosAndFolders;
  }

  const { voiceMemos, showNext, showPrevious, workspaceId, folderName, folderId, workspaceName, folders, pageNumber, path } = resultVoiceMemosAndFolders;
  return { hasAccess: true, promptId, allPrompts, aiResultTextAndSourceMessages, voiceMemos, showNext, showPrevious, workspaceId, folderName, folderId, workspaceName, folders, pageNumber, path };
}



function getListOfAiResultsSidebar(promptId) {
  const result = getListOfAiResults('66859b7f6928970bb4f1c24a');
  // Logger.log(result);
  return JSON.stringify(result);
}


// https://api.carbonvoice.app/responses/prompt/669e61798d82b4c6baac633e/latest-ten
function getListOfAiResults(promptId) {
  // function getListOfAiResults(promptId = '66859b7f6928970bb4f1c24a') {
  // promptId = '674486df7984dec585d028f2'
  const result = makeCarbonVoiceRequest('GET', '/responses/prompt/' + promptId + '/latest-ten', null, null);
  if (!result.hasAccess) {
    return result;
  }

  // Logger.log(result);

  // const aiResponseKeys = {
  //   '66859b7f6928970bb4f1c24a': 'bulleted_summary',
  //   '669e61798d82b4c6baac633e': 'presentation_outline'
  // };
  // const key = aiResponseKeys[promptId];
  // Logger.log(key)
  const presentations = [];
  const aiResultTextAndSourceMessages = [];
  result.json.results.forEach(el => {
    const messages = [];

    let messageName;
    let durationMs = 0;
    // Logger.log(el);
    let aiResultText = el?.ai_response?.responses?.[0]?.text;
    let aiResultHtml = el?.ai_response?.responses?.[0]?.html;
    if (aiResultText) {
      // let aiResultText = el.ai_response.responses[0].json[key].join('\n');
      // Logger.log('el.ai_response.id = ' + el.ai_response.id);
      // Logger.log('el.ai_response = ' + JSON.stringify(el.ai_response));
      // Logger.log(aiResultText);
      // Logger.log('el.messages.length = ' + el.messages.length);
      // Logger.log('el.ai_response.responses.length = ' + el.ai_response.responses.length);
      // Logger.log(el.ai_response.responses[0].json.presentation_outline);
      // Logger.log(el.ai_response.responses[0].json.presentation_outline[0].title);
      // Logger.log('el.messages[0].message.name = ' + el.messages[0].message.name);
      //result.json[0].responses[0].json.presentation_outline;

      if (el.messages[0].message.name) {
        messageName = el.messages[0].message.name
      } else if (el.messages[0].message.ai_summary) {
        messageName = el.messages[0].message.ai_summary;
      } else {
        // messageName = '2m 37s on 8/19/24'
        messageName = '-'
      }

      if (el.messages.length > 1) {
        messageName += ' (' + el.messages.length + ')';
      }

      el.messages.forEach(message => {
        // Logger.log(JSON.stringify(message));
        let channelUrl;
        if (message.message.type === 'channel') {
          // Logger.log('channnel!!!');
          // Logger.log(message.conversation.image_url);
          channelUrl = message.conversation.image_url;
        }
        messages.push({ creator: message.creator.full_name, imageUrl: message.creator.image_url, createdAt: message.message.created_at, durationMs: message.message.duration_ms, type: message.message.type, channelUrl});
      });

      aiResultTextAndSourceMessages.push({ aiResultName: messageName, aiResultHtml, aiResultText, messages });

    }
  });
  return { hasAccess: true, promptId, aiResultTextAndSourceMessages };
}