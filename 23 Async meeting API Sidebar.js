function createAsyncMeeting(messageId, emailsArray, conversationTitle, isoDateTime) {
  const payload = {
    "workspace_guid": "personal",
    "users": [],
    "type": "asyncMeeting",
    "name": conversationTitle,
    "visibility": "private",
    "end": isoDateTime,
    "message_id": messageId
  };

  emailsArray.forEach(email => {
    payload.users.push({
      "unique_value": email,
      "role": "admin",
      "value_type": "emailAddress"
    });
  });

  const result = makeCarbonVoiceRequest('POST', '/channels/meeting', payload, null);
  return result;
}

function createStoredMessage(text) {
  const payload = {
    "transcript": text,
    "is_text_message": true,
    "is_streaming": false,
  };
  const result = makeCarbonVoiceRequest('POST', '/v3/messages/stored/start', payload, null);
  return result;
}