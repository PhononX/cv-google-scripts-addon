function pasteText(e) {
  const content = e.parameters.text;
  const response = CardService.newUpdateDraftActionResponseBuilder()
  response.setUpdateDraftBodyAction(CardService.newUpdateDraftBodyAction()
    .addUpdateContent(
      content,
      CardService.ContentType.MUTABLE_HTML)
    .setUpdateType(
      CardService.UpdateDraftBodyType.IN_PLACE_INSERT));
  return response.build();
}

function insertVoiceMemo(e) {
  const duration = e.parameters.duration;
  const messageId = e.parameters.messageId;
  const result = createVoiceMemoSharableLink(messageId);
  if (result.hasAccess === false) {
    return buildAuthorizationCard(result.authUrl);
  }
  const url = result.sharedLinkUrl;
  const content = `<br>I shared some thoughts here:<br><table border="0" align="left"
    width="300"
    cellpadding="4"
    cellspacing="0"
    align="center"
    bgcolor="#f2efff"><tr><td><a href="${url}"><img src="${voiceMemoIconUrl}"></a></td><td><a href="${url}" style="text-decoration: none; color: #5E4CCE;">Carbon Voice Memo<br>Duration: ${duration}</a></td><td><a href="${url}"><img width=40 height=40 src="https://drive.google.com/uc?export=view&id=1G-c2z-kwMoAyzhukT-wkkblmZw-2J781"></a></td></tr></table><br>`;

  const response = CardService.newUpdateDraftActionResponseBuilder()
  response.setUpdateDraftBodyAction(CardService.newUpdateDraftBodyAction()
    .addUpdateContent(
      content,
      CardService.ContentType.MUTABLE_HTML)
    .setUpdateType(
      CardService.UpdateDraftBodyType.IN_PLACE_INSERT));
  return response.build();
}

function createVoiceMemoSharableLink(messageId) {
  const payload = {
    "shared_message_id": messageId,
    "share_type": "link",
    "access_type": "public",
    // "end_access_at": "2024-12-10T09:38:14.928Z"
  };
  const result = makeCarbonVoiceRequest('POST', '/message-sharelinks', payload, null);
  if (!result.hasAccess) {
    return result;
  }
  return { hasAccess: true, sharedLinkUrl: 'https://carbonvoice.app/s/' + result.json._id };
}
