function runAiMagicApiTest() {
  // runAiMagicApi('66859b7f6928970bb4f1c24a', ["321f6b20-a519-11ef-8cbf-83c474531c66", "5a5ca080-a519-11ef-8cbf-83c474531c66"]);
  runAiMagicApi('66859b7f6928970bb4f1c24a', ["321f6b20-a519-11ef-8cbf-83c474531c66"]);
}

function runAiMagicApi(promptId, messageIds) {
  let aiResultHtml, aiResultText;
  // Logger.log(promptId + ' ' + messageIds);
  const queryParams = {
    message_id: messageIds[0],
    prompt_id: promptId
  };
  const existingResult = makeCarbonVoiceRequest('GET', '/responses', null, queryParams);
  // Logger.log(existingResult);
  if (!existingResult.hasAccess) {
    return existingResult;
  }

  const existingAiResults = existingResult.json;
  for (let i in existingAiResults) {
    if (existingAiResults[i].message_ids.length === messageIds.length) {
      let flag = true;
      for (let j in messageIds) {
        if (existingAiResults[i].message_ids.includes(messageIds[j]) === false) {
          // Logger.log('false');
          flag = false;
          break;
        }
      }
      if (flag) {
        // Logger.log(existingAiResults[i].responses[0].html);
        aiResultHtml = existingAiResults[i].responses[0].html;
        aiResultText = existingAiResults[i].responses[0].text;
        break;
      }
    }
  }

  if (aiResultHtml && aiResultText) {
    // Logger.log('Exists!')
    return { status: 'ok', hasAccess: true, aiResultHtml, aiResultText }
  }else{
    // Logger.log('New!')
  }

  const payload = {
    // message_ids: [messageId],
    message_ids: messageIds,
    prompt_id: promptId
  };
  const result = makeCarbonVoiceRequest('POST', '/responses', payload, null);
  if (result.hasAccess === false) {
    return result;
  }

  // Logger.log(result);

  aiResultHtml = result.json.responses[0].html;
  aiResultText = result.json.responses[0].text;

  return { status: 'ok', hasAccess: true, aiResultHtml, aiResultText }
}
