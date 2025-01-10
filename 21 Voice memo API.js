function getVoiceMemos(navigationTypeNext, isoDate, previousArrayString) {
  const maxVoiceMemosPerScreen = 50;
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
  filteredMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  totalMessages += filteredMessages.length;

  const userTimeZone = getTimeZoneValue();

  filteredMessages.forEach(el => {
    let voiceMemoName;
    let voiceMemoText;
    try {
      // Logger.log(el);
      let allT = [];
      if (el.text_models.length > 0) {
        if (el.text_models[0].timecodes.length > 0) {
          allT = el.text_models[0].timecodes.map(el => { return el.t.trim() });
          voiceMemoText = allT.join(' ');
        } else {
          voiceMemoText = el.text_models[0].value;
        }

      } else {
        if (el.text_models[0].value) {
          voiceMemoText = 'error';
        }
      }

      // const voiceMemoText = allT.join(' ');
      voiceMemoName = el.text_models?.[1]?.value;
      if (voiceMemoName == null) {
        voiceMemoName = voiceMemoText;
      }
    }
    catch (e) {
      // Logger.log(e);
      voiceMemoName = 'Error while retrieving the voice memo details';
      voiceMemoText = 'Message id: ' + el.message_id + ' \nError:' + e + ' <b>Please tell us about the error https://cv.chat/contactus</b>';
    }
    if (counter < maxVoiceMemosPerScreen) {
      voiceMemos.push({ createdAt: formatDateTime(userTimeZone, el.created_at), duration: msToMinSec(el.duration_ms), voiceMemoText: voiceMemoText, name: voiceMemoName, messageId: el.message_id });
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
  return { hasAccess: true, voiceMemos: voiceMemos, lastCreatedAt: lastCreatedAt, previousArrayString: previousArrayString, userTimeZone: userTimeZone, showNext: showNext, showPrevious: showPrevious };
}
