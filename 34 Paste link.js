function getOrCreateVoiceMemoSharableLink(messageId) {
  let url;

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

  return { status: 'ok', hasAccess: true, url };
}

function pasteLink(messageId) {

  const result = getOrCreateVoiceMemoSharableLink(messageId);
  if (!result.hasAccess) {
    return result;
  }

  const linkUrl = result.url;

  const doc = DocumentApp.getActiveDocument();
  const cursor = doc.getCursor();
  if (cursor) {
    // Get the element containing the cursor
    const element = cursor.getElement();
    // Get the offset within the element where the cursor is located
    const offset = cursor.getOffset();

    // Logger.log(offset);
    // Logger.log(element.asText().getText());
    // Logger.log(element.asText().getText().length);

    const textLength = element.asText().getText().length;

    let start, end;
    if (offset === 0) {
      start = 0;
      end = offset + linkUrl.length - 1;
    } else if (offset === 1) {
      start = 0;
      end = linkUrl.length - 1;
    } else {
      start = offset;
      end = offset + linkUrl.length - 1;
    }

    // Insert the text at the cursor position
    element.insertText(offset, linkUrl).setLinkUrl(start, end, linkUrl);

  } else {
    // If there is no cursor, show an alert
    const errorText = 'Please place your cursor in the document first.';
    DocumentApp.getUi().alert(errorText);
    return { status: 'error', hasAccess: true, message: errorText };
  }

  return { status: 'ok', hasAccess: true, message: 'Pasted successfully.' };
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
    "access_type": "public"
  };
  const result = makeCarbonVoiceRequest('POST', '/message-sharelinks', payload, null);
  if (!result.hasAccess) {
    return result;
  }
  return { hasAccess: true, sharedLinkUrl: 'https://carbonvoice.app/s/' + result.json._id };
}

