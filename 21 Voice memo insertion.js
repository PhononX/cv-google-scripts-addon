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
  let url;
  const duration = e.parameters.duration;
  const messageId = e.parameters.messageId;
  const name = e.parameters.name;
  const createdAt = e.parameters.createdAt;

  const resultGetLinks = getVoiceMemoSharableLink(messageId);
  if (resultGetLinks.hasAccess === false) {
    return buildAuthorizationCard(resultGetLinks.authUrl);
  }

  url = resultGetLinks.sharedLinkUrl;
  if (url == null) {
    const result = createVoiceMemoSharableLink(messageId);
    if (result.hasAccess === false) {
      return buildAuthorizationCard(result.authUrl);
    }
    url = result.sharedLinkUrl;
  }

  const content = `<br><br>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff;">
        <tr>
            <td style="padding: 5px; align: left;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #EDEDF3; border-radius: 8px; background-color: #ffffff;">
                    <tr>
                        <td style="padding: 10px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <!-- Left Icon Cell - Fixed Width -->
                                    <td width="24" style="width: 24px; vertical-align: middle;">
                                        <a href="${url}"><img src="https://drive.google.com/uc?export=view&id=11O_g-smZ42_a-NwGT8dUr5PdCziQo8tY" alt="Voice Memo Icon" style="width: 24px; height: 24px; display: block;"></a>
                                    </td>
                                    
                                    <!-- Spacing Cell -->
                                    <td width="15" style="width: 15px;"></td>
                                    
                                    <!-- Center Content Cell -->
                                    <td style="vertical-align: middle;">
                                        <a href="${url}" style="display: block; color: #261073; font-size: 14px; font-weight: 400; text-decoration: none; margin-bottom: 2px;">
                                            ${name}
                                        </a>
                                        <a href="${url}" style="display: block; color: #A1A2AB; font-size: 12px; text-decoration: none;">
                                            ${createdAt} · Duration: ${duration}
                                        </a>
                                    </td>
                                    
                                    <!-- Spacing Cell -->
                                    <td width="15" style="width: 15px;"></td>
                                    
                                    <!-- Right Play Icon Cell - Fixed Width -->
                                    <td width="32" style="width: 32px; vertical-align: middle;">
                                        <a href="${url}"><img src="https://drive.google.com/uc?export=view&id=1fTVpuKC2oB2gvQrDUfO0v1WIhK0MotBM" alt="Play Icon" style="width: 32px; height: 32px; display: block; cursor: pointer;"></a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Fallback Text Outside Tables -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;">
        <tr>
            <td style="padding: 0 20px;">
                <div style="color: #A1A2AB; font-size: 12px; margin-top: 15px;">
                    If tapping link doesn't play message, copy &amp; paste this link to your browser: ${url}
                </div>
            </td>
        </tr>
    </table>

    `;

  const response = CardService.newUpdateDraftActionResponseBuilder()
  response.setUpdateDraftBodyAction(CardService.newUpdateDraftBodyAction()
    .addUpdateContent(
      content,
      CardService.ContentType.MUTABLE_HTML)
    .setUpdateType(
      CardService.UpdateDraftBodyType.IN_PLACE_INSERT));
  return response.build();
}



function getVoiceMemoSharableLink(messageId = '677d6839883a5f0669860300') {
  let sharedLinkUrl;
  const queryParams = {
    "direction": "newer"
  };
  const result = makeCarbonVoiceRequest('GET', '/message-sharelinks/shared-links/' + messageId, null, queryParams);
  if (!result.hasAccess) {
    return result;
  }

  // Logger.log(result.json.results);
  const allLinks = result.json.results;
  for (let i in allLinks) {
    if (allLinks[i].share_type === 'link' && allLinks[i].access_type === 'public') {
      sharedLinkUrl = 'https://carbonvoice.app/s/' + allLinks[i]._id;
      break;
    }
  }
  // Logger.log(sharedLinkUrl);
  return { hasAccess: true, sharedLinkUrl: sharedLinkUrl };
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
