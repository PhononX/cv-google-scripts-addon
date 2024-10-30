function getVoiceMemos(startDateStr, endDateStr) {
  let startDate;
  if (!startDateStr && !endDateStr) {
    const today = new Date();
    const threeDaysBefore = new Date(today);
    startDate = new Date(threeDaysBefore.setDate(today.getDate() - 3));
  } else {
    startDate = !startDateStr ? null : new Date(startDateStr + 'T00:00:00.000Z');
  }
  const endDate = !endDateStr ? new Date() : new Date(endDateStr + 'T23:59:59.999Z');

  const queryParams = {
    direction: 'older'
  };

  // Logger.log('startDate %s, endDate %s, startDateStr %s, endDateStr %s', startDate, endDate, startDateStr, endDateStr);

  const result = makeCarbonVoiceRequest('GET', '/v3/messages/voicememo', null, queryParams);
  if (!result.hasAccess) {
    return result;
  }
  // Logger.log(result.json.length);
  // Logger.log(result.json);

  const messages = result.json;
  const messagesArray = [];
  let totalMessages = 0;
  let sheet;
  let headerNumCols;
  const creatorsObj = {};
  const allCellsLinksArray = [];
  const attachmentCellsLinksArray = [];
  const br = `
`;

  const filteredMessages = messages.filter(message => {
    const messageDate = new Date(message.created_at);
    if (startDate == null) {
      return messageDate <= endDate;
    } else {
      return messageDate >= startDate && messageDate <= endDate;
    }
  });

  // Logger.log(filteredMessages);
  totalMessages += filteredMessages.length;

  filteredMessages.forEach(el => {
    // Logger.log(el);
    let allT = [];
    if (el.text_models.length > 0) {
      if (el.text_models[0].timecodes.length > 0) {
        allT = el.text_models[0].timecodes.map(el => { return el.t.trim() });
      }
    }

    const { firstName, lastName } = getCreatorName(creatorsObj, el.creator_id);

    const { attachmentLinks, attachmentTexts } = collectAttachmentLinks(el.attachments);
    attachmentCellsLinksArray.push(attachmentLinks);

    messagesArray.push([el.message_id, el.created_at, firstName, lastName, el.creator_id, el.duration_ms, el.audio_models[0].url, el.text_models?.[1]?.value, allT.join(' '), attachmentTexts.join(br)]);
    // const linksArray = extractLinks(el.transcript);
    // allCellsLinksArray.push(linksArray);
    // Logger.log(linksArray);
  });

  if (filteredMessages.length > 0) {
    if (sheet == null) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      sheet = ss.insertSheet('Voice Memos' + ' ' + new Date().toISOString());
      const headerArray = [['message_id', 'created_at', 'first_name', 'last_name', 'creator_id', 'duration_ms', 'audio_url', 'ai_summary', 'transcript', 'attachments']];
      headerNumCols = headerArray[0].length;
      sheet.getRange(1, 1, 1, headerNumCols).setValues(headerArray).setFontWeight('bold').setBackground('#DBD2FF');
    }
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, messagesArray.length, headerNumCols).setValues(messagesArray);
  } else if (filteredMessages.length === 0) {
    const noMessagesText = !startDateStr && !endDateStr ? 'Voice memos count: 0 (last 3 days)' : 'Voice memos count: 0';
    return { status: 'error', hasAccess: true, message: noMessagesText };
  }

  insertLinks(sheet, allCellsLinksArray, 9);

  for (let i = 0; i < attachmentCellsLinksArray.length; i++) {
    if (attachmentCellsLinksArray[i].length === 0) {
      continue;
    }
    insertLink(sheet, attachmentCellsLinksArray[i], i + 2, 10)
  }

  sheet.getRange(2, 1, filteredMessages.length, headerNumCols).sort({ column: 2, ascending: true })

  let totalMessagesText = 'Voice memos count: ' + totalMessages;
  if (!startDateStr && !endDateStr) {
    totalMessagesText += ' (last 3 days)';
  }
  return { status: 'ok', totalMessagesText: totalMessagesText, sheet: sheet };
}

function insertLinks(sheet, allCellsLinksArray, linkColNumber) {
  for (let i = 0; i < allCellsLinksArray.length; i++) {
    if (allCellsLinksArray[i].length === 0) {
      continue;
    }
    insertLink(sheet, allCellsLinksArray[i], i + 2, linkColNumber)
  }

  deleteEmptyRowsCols(sheet, 10, 2);
  //sheet.setColumnWidth(1, 175);

  sheet.getRange('A:L').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
}
