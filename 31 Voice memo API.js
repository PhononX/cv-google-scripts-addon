function getListOfVoiceMemosSidebar() {
  const result = getVoiceMemos();
  return JSON.stringify(result);
}

function getVoiceMemos(keepMeSigned, navigationTypeNext, isoDate, previousArrayString) {

  if (typeof keepMeSigned === 'boolean') {
    //Logger.log('Change keepMeSigned');
    changeKeepMeSignedSetting(keepMeSigned);
  }

  const maxVoiceMemosPerScreen = 10;
  let showNext = false; showPrevious = true;
  // Parameters in GWorkspace add-ons are always strings
  if (navigationTypeNext == null || navigationTypeNext === 'true') {
    navigationTypeNext = true;
  } else {
    navigationTypeNext = false;
  }
  const previousArray = previousArrayString ? JSON.parse(previousArrayString) : [];
  if (isoDate == null) {
    showPrevious = false;
    isoDate = new Date().toISOString();
  }
  if (navigationTypeNext === true) {
    if (!previousArray.includes(isoDate)) {
      previousArray.push(isoDate);
    }
  } else {
    const index = previousArray.indexOf(isoDate);
    if ((index - 2) <= 0) {
      showPrevious = false;
    }
    if (previousArray[index - 2]) {
      isoDate = previousArray[index - 2];
    } else {
      isoDate = previousArray[0];
      showPrevious = false;
    }
  }

  const queryParams = {
    direction: 'older',
    date: isoDate,
    limit: maxVoiceMemosPerScreen + 1
  };
  const result = makeCarbonVoiceRequest('GET', '/v3/messages/voicememo', null, queryParams);
  if (!result.hasAccess) {
    return result;
  }

  const messages = result.json;
  const voiceMemos = [];
  let totalMessages = 0;
  let counter = 0;
  let lastCreatedAt;

  const filteredMessages = messages;
  //filteredMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  totalMessages += filteredMessages.length;

  // const userTimeZone = getTimeZoneValue();

  filteredMessages.forEach(el => {
    let { voiceMemoName, voiceMemoText, summary} = getVoiceMemoNameAndText(el);
    if (counter < maxVoiceMemosPerScreen) {
      //     presentations.push({ aiResponseId: el.ai_response.id, name: messageName, message_id: el.messages[0].message.id, type: el.messages[0].message.type, createdAt: el.messages[0].message.created_at, creatorName: el.messages[0].creator.full_name, durationMs: durationMs });
      voiceMemos.push({ createdAt: el.created_at, durationMs: el.duration_ms, voiceMemoText: voiceMemoText, name: voiceMemoName, messageId: el.message_id, summary});
      counter++;
    }
  });

  if (counter < totalMessages) {
    lastCreatedAt = filteredMessages[counter - 1].created_at;
    showNext = true;
  } else {
    lastCreatedAt = 'last';
  }
  if (!previousArray.includes(lastCreatedAt)) {
    previousArray.push(lastCreatedAt);
  }

  previousArrayString = JSON.stringify(previousArray);

  // Logger.log(voiceMemos);
  // Logger.log(voiceMemos.length);
  return { hasAccess: true, voiceMemos: voiceMemos, lastCreatedAt: lastCreatedAt, previousArrayString: previousArrayString, showNext: showNext, showPrevious: showPrevious };
}

function getVoiceMemoNameAndText(el) {
  let voiceMemoName;
  let voiceMemoText;
  let languageId;
  let summary;
  try {
    // Logger.log(el);
    let allT = [];
    voiceMemoName = el.name;
    // Logger.log('el.name=' + el.name);
    if (el.text_models.length > 0) {
      languageId = el.text_models[0].language_id;
      // Logger.log(languageId);
      if (el.text_models[0].timecodes.length > 0) {
        allT = el.text_models[0].timecodes.map(el => { return el.t.trim() });
        voiceMemoText = allT.join(' ');
      } else {
        voiceMemoText = el.text_models[0].value;
      }

      for (let i = 1; i < el.text_models.length; i++) {
        if (el.text_models[i].language_id === languageId && el.text_models[i].type === 'summary') {
          summary = el.text_models[i].value;
          break;
        }
      }

    } else {
      if (el.text_models[0].value) {
        voiceMemoText = 'error';
      }
    }

    if (voiceMemoName == null) {
      // for (let i = 1; i < el.text_models.length; i++) {
      //   if (el.text_models[i].language_id === languageId) {
      //     voiceMemoName = el.text_models[i].value;
      //     break;
      //   }
      // }
      if (summary){
        voiceMemoName = summary;
      }else{
        voiceMemoName = voiceMemoText;
      }
    }
  }
  catch (e) {
    voiceMemoName = 'Error while retrieving the voice memo details';
    voiceMemoText = 'Message id: ' + el.message_id + ' \nError:' + e + ' <b>Please tell us about the error https://cv.chat/contactus</b>';
  }
  return { voiceMemoName: voiceMemoName, voiceMemoText: voiceMemoText, summary};
}