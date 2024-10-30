function getListOfWorkspaces() {
  const result = makeCarbonVoiceRequest('GET', '/simplified/workspaces/basic-info', null, null);
  return result;
}

function getListOfConversations() {
  const result = makeCarbonVoiceRequest('GET', '/simplified/conversations/all', null, null);
  return result;
}

function threeDaysBeforeISO() {
  const today = new Date();
  const threeDaysBefore = new Date(today);
  threeDaysBefore.setDate(today.getDate() - 3);
  return threeDaysBefore.toISOString();
}

function exportConversations(selectedConversation, selectedLabel, startDate, endDate) {
  const queryParams = {
    page: 1,
    size: 5,
    conversation_id: selectedConversation,
    sort_direction: 'ASC'
  };

  if (startDate) {
    queryParams.start_date = startDate + 'T00:00:00.000Z';
  }
  if (endDate) {
    queryParams.end_date = endDate + 'T23:59:59.999Z';
  }

  if (!startDate && !endDate) {
    queryParams.start_date = threeDaysBeforeISO();
  }

  let hasNextPage = true;
  let totalMessages = 0;
  let sheet;
  let headerNumCols;
  const creatorsObj = {};
  const allCellsLinksArray = [];
  const attachmentCellsLinksArray = [];
  const br = `
`;

  while (hasNextPage) {
    const messagesArray = [];
    const result = makeCarbonVoiceRequest('GET', '/simplified/messages', null, queryParams);
    if (result.status === 'error') {
      return result;
    }

    if (!result || !result.json || !result.json.results) {
      throw new Error('Invalid response from makeCarbonVoiceRequest');
    }

    const messages = result.json.results;
    totalMessages += messages.length;

    messages.forEach(el => {
      const { firstName, lastName } = getCreatorName(creatorsObj, el.creator_id);

      const { attachmentLinks, attachmentTexts } = collectAttachmentLinks(el.attachments);
      attachmentCellsLinksArray.push(attachmentLinks);

      messagesArray.push([el.id, el.created_at, firstName, lastName, el.creator_id, el.duration_ms, el.audio_url, el.ai_summary, el.parent_message_id, el.transcript, attachmentTexts.join(br), el.link]);
      const linksArray = extractLinks(el.transcript);
      allCellsLinksArray.push(linksArray);
    });
    hasNextPage = result.json.has_next_page;
    if (hasNextPage) {
      queryParams.page++;
    }
    if (messagesArray.length > 0) {
      if (sheet == null) {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        sheet = ss.insertSheet(selectedLabel + ' ' + new Date().toISOString());
        const headerArray = [['id', 'created_at', 'first_name', 'last_name', 'creator_id', 'duration_ms', 'audio_url', 'ai_summary', 'parent_message_id', 'transcript', 'attachments', 'link']];
        headerNumCols = headerArray[0].length;
        sheet.getRange(1, 1, 1, headerNumCols).setValues(headerArray).setFontWeight('bold').setBackground('#DBD2FF');
      }
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, messagesArray.length, headerNumCols).setValues(messagesArray);
    } else if (messagesArray.length === 0 && !hasNextPage) {
      const noMessagesText = !startDate && !endDate ? 'Message count: 0 (last 3 days)' : 'Message count: 0';
      return { status: 'error', hasAccess: true, message: noMessagesText };
    }
  }

  insertLinks(sheet, allCellsLinksArray, 10);

  for (let i = 0; i < attachmentCellsLinksArray.length; i++) {
    if (attachmentCellsLinksArray[i].length === 0) {
      continue;
    }
    insertLink(sheet, attachmentCellsLinksArray[i], i + 2, 11)
  }

  let totalMessagesText = 'Message count: ' + totalMessages;
  if (!startDate && !endDate) {
    totalMessagesText += ' (last 3 days)';
  }

  return { status: 'ok', totalMessagesText: totalMessagesText };
}

function getCreatorName(creatorsObj, id) {
  if (!creatorsObj[id]) {
    const result = makeCarbonVoiceRequest('GET', '/simplified/users/' + id, null, null);
    creatorsObj[id] = { firstName: result.json.first_name, lastName: result.json.last_name };
    return creatorsObj[id];
  } else {
    return creatorsObj[id];
  }
}

function deleteEmptyRowsCols(sheet, allowedEmptyRowCount, allowedEmptyColCount) {
  const lastRow = sheet.getLastRow() + allowedEmptyRowCount;
  const lastCol = sheet.getLastColumn() + allowedEmptyColCount;
  const maxCols = sheet.getMaxColumns();
  const maxRows = sheet.getMaxRows();

  const colsToDelete = maxCols - lastCol;
  if (colsToDelete > 0) {
    sheet.deleteColumns(lastCol, colsToDelete);
  }

  const rowsToDetele = maxRows - lastRow;
  if (rowsToDetele > 0) {
    sheet.deleteRows(lastRow, rowsToDetele);
  }

}

function extractLinks(text) {
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    links.push({
      linkUrl: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  return links;
}

function collectAttachmentLinks(attachmentsArray) {
  const links = [];
  const texts = [];

  if (attachmentsArray) {
    let start = 0;
    let end = 0;

    for (let i = 0; i < attachmentsArray.length; i++) {
      end = start + attachmentsArray[i].link.length;
      links.push({
        linkUrl: attachmentsArray[i].link,
        start: start,
        end: end
      });
      start = end + 1;
      texts.push(attachmentsArray[i].link);
    }
  }
  return { attachmentLinks: links, attachmentTexts: texts };
}

function insertLink(sheet, links, rowNumber, colNumber) {
  const cell = sheet.getRange(rowNumber, colNumber);
  const text = cell.getValue();
  const richTextValue = SpreadsheetApp.newRichTextValue().setText(text);
  for (let i = 0; i < links.length; i++) {
    richTextValue.setLinkUrl(links[i].start, links[i].end, links[i].linkUrl);
  }
  const builtRichTextValue = richTextValue.build();
  cell.setRichTextValue(builtRichTextValue);
}
