function getListOfProfessionalEmails() {
  const result = makeCarbonVoiceRequest('GET', '/responses/prompt/66859b7f6928970bb4f1c249/latest-ten', null, null);
  if (!result.hasAccess) {
    return result;
  }

  const userTimeZone = getTimeZoneValue();
  const conversationObj = {};
  const professionalEmails = [];
  result.json.results.forEach(el => {
    let messageType;
    el.messages.forEach(el => {
      messageType = el.message.type;
    });

    let imageUrl;
    if (messageType === 'channel') {
      const { channelImageUrl } = getConversationDetails(conversationObj, el.ai_response.channel_id);
      imageUrl = channelImageUrl;
    } else {
      // Voice memos 
      imageUrl = voiceMemoIconUrl;
    }

    if (el.ai_response.responses) {
      if (el.ai_response.responses[0]) {
        const json = el.ai_response.responses[0].json;
        const html = el.ai_response.responses[0].html;
        // <h3>Content:</h3>
        // <h3>Signature:</h3
        const content = processText(html, json.content);

        //{subject=Plan for Next Week, withCopyTo=N/A, summary=Request for details on the plan for next week., content=Could you please provide the details or agenda for the plan for next week? I would like to ensure that I am prepared and aligned with the upcoming tasks or meetings., signature=Best Regards, [Your Name], mailTo=N/A}
        professionalEmails.push({ subject: json.subject, mailTo: convertEmailsToArray(json.mailTo), withCopyTo: convertEmailsToArray(json.withCopyTo), summary: json.summary, content: content, signature: json.signature, createdAt: formatDateTime(userTimeZone, el.ai_response.created_at), imageUrl: imageUrl });
      }
    }
  });
  return { hasAccess: true, professionalEmails: professionalEmails };
}


function processText(html, text) {
  // Check if text contains "<h3>Content:</h3>"
  if (!html.includes("<h3>Content:</h3>")) {
    return text; // Return original text if pattern not found
  }

  // Get everything after "<h3>Content:</h3>"
  let processedText = html.split("<h3>Content:</h3>")[1];

  // Replace "<h3>Signature:</h3>" with "<br>"
  processedText = processedText.replace("<h3>Signature:</h3>", "");

  return processedText;
}

function convertEmailsToArray(emailString) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return JSON.stringify(emailString.match(emailRegex) || []);
}

function getConversationDetails(conversationObj, id) {
  let channelImageUrl = blankChannelImageUrl;
  if (!conversationObj[id]) {
    try {
      const result = makeCarbonVoiceRequest('GET', '/v2/channel/' + id, null, null);
      channelImageUrl = result.json.image_url;
      if (channelImageUrl == null) {
        if (result.json.workspace_image_url) {
          channelImageUrl = result.json.workspace_image_url;
        } else {
          channelImageUrl = blankChannelImageUrl;
        }
      }
    }
    catch (e) {
      channelImageUrl = blankChannelImageUrl;
    }
    conversationObj[id] = { channelImageUrl: channelImageUrl };
    return conversationObj[id];
  } else {
    return conversationObj[id];
  }
}
