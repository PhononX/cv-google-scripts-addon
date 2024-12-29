function getVoiceMemos() {
  const queryParams = {
    direction: 'older'
  };
  const result = makeCarbonVoiceRequest('GET', '/v3/messages/voicememo', null, queryParams);
  if (!result.hasAccess) {
    return result;
  }

  const messages = result.json;
  const voiceMemos = [];
  let totalMessages = 0;

  const filteredMessages = messages;
  filteredMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  totalMessages += filteredMessages.length;

  const userTimeZone = getTimeZoneValue();

  filteredMessages.forEach(el => {
    // Logger.log(el);
    let allT = [];
    if (el.text_models.length > 0) {
      if (el.text_models[0].timecodes.length > 0) {
        allT = el.text_models[0].timecodes.map(el => { return el.t.trim() });
      }
    }

    const voiceMemoText = allT.join(' ');
    let voiceMemoName = el.text_models?.[1]?.value;
    if (voiceMemoName == null) {
      voiceMemoName = voiceMemoText;
    }
    voiceMemos.push({ createdAt: formatDateTime(userTimeZone, el.created_at), duration: msToMinSec(el.duration_ms), url: el.audio_models[0].url, voiceMemoText: voiceMemoText, name: voiceMemoName, messageId: el.message_id, userTimeZone: userTimeZone });
  });

  // Logger.log(voiceMemos);
  // Logger.log(voiceMemos.length);
  return { hasAccess: true, voiceMemos: voiceMemos };
}
