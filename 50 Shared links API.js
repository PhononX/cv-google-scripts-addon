function getSharedMessage(shareLinkId, timeZone) {
  // Logger.log(shareLinkId);
  try {
    const result = makeCarbonVoiceRequest('GET', '/message-sharelinks/' + shareLinkId, null, null);
    if (!result.hasAccess) {
      return result;
    }
    // access_type=specified/public
    const accessType = result.json.access_type;

    const audioUrl = accessType === 'public' ? getVoiceMemoAudioUrl(result.json.shared_message).audioUrl : null;

    const { voiceMemoName, voiceMemoText } = getVoiceMemoNameAndText(result.json.shared_message);

    return { status: true, hasAccess: true, voiceMemoName, voiceMemoText, createdAt: formatDateTime(timeZone, result.json.shared_message.created_at), duration: msToMinSec(result.json.shared_message.duration_ms), audioUrl };
  }
  catch (e) {
    const errorString = e.toString();
    if (errorString.includes('User has no access to Share Link')) {
      return { status: false, hasAccess: true, message: 'You don\'t have access to the Voice Memo', header: 'You need access' };
    }
    else if (errorString.includes('ShareLink Not found')) {
      return { status: false, hasAccess: true, message: 'Voice Memo not found.' };
    } else {
      return { status: false, hasAccess: true, message: errorString };
    }
  }
}

function getVoiceMemoAudioUrl(el) {
  let audioUrl;
  try {
    if (el.audio_models.length > 0) {
      audioUrl = el.audio_models[0].url;
    }
  }
  catch (e) {
  }
  return { audioUrl };
}

// function getChannel(channelguid = '67869968d97bf86b26ede7de') {
function getChannel(channelguid, timeZone) {
  // Logger.log(channelguid);

  try {
    const result = makeCarbonVoiceRequest('GET', '/v2/channel/' + channelguid, null, null);
    if (!result.hasAccess) {
      return result;
    }

    const channelName = result.json.channel_name;
    const workspaceName = result.json.workspace_name;
    const createdAt = formatDateTime(timeZone, result.json.created_ts);
    const duration = msToMinSec(result.json.total_duration_milliseconds);
    const lastPosted = result.json.last_posted_ts ? formatDateTime(timeZone, result.json.last_posted_ts) : '—';
    const totalMessages = result.json.total_messages;

    return { status: true, hasAccess: true, channelName, workspaceName, createdAt, duration, lastPosted, totalMessages };
  }
  catch (e) {
    const errorString = e.toString();
    if (errorString.includes('User is not allowed to view this channel')) {
      return { status: false, hasAccess: true, message: 'You are not allowed to view this Carbon Voice Conversation.' };
    }
    else if (errorString.includes('Channel was not found')) {
      return { status: false, hasAccess: true, message: 'Carbon Voice Conversation was not found.' };
    } else {
      return { status: false, hasAccess: true, message: errorString };
    }
  }
}
