// 'I\'m a Workspace Guest' version
function getWorkspacesAndConversations() {
  console.time('0');
  const workspaces = getListOfWorkspaces();
  if (!workspaces.hasAccess) {
    return workspaces;
  }
  workspaces.json.sort((a, b) => a.name.localeCompare(b.name));

  // Logger.log(workspaces);

  // const workspacesConv = { 'direct': [] };
  const workspacesConv = {};
  const guestWorkspaces = [];
  const usualWorkspaces = [];
  const usualWorkspacesConv = [];

  // Adds workspace 'Personal' with id = 'personal'
  // /simplified/workspaces/basic-info returns Personal workspace as {id=n3hXmlnRBpAUz9WN, name=E G}
  // /simplified/workspaces/basic-info doesn't return workspaces where I'm guest
  // In /channels/{workspaceguid} responses, workspace 'Personal' has id = 'personal'
  // /channels/{workspaceguid} doesn't know n3hXmlnRBpAUz9WN
  workspaces.json.unshift({ name: 'Personal', id: 'personal', special: true });


  // Gets all conversations
  const conversations = getListOfConversations();

  // Gets conversations of every workspace
  workspaces.json.forEach(workspace => {
    // workspacesConv[workspace.id] = [];

    workspacesConv[workspace.id] = conversations.json.results.filter(el => el.workspace_id === workspace.id);
    const notGuestConv = workspacesConv[workspace.id].map(el => { return el.id });
    usualWorkspacesConv.push(...notGuestConv);

    /*    const result = makeCarbonVoiceRequest('GET', '/channels/' + workspace.id, null, null);
        if (!result.hasAccess) {
          return result;
        }
        if (!result.hasAccess) return result;
        // Logger.log(result.json);
        if (result.json.length === 0) {
          guestWorkspaces.push(workspace);
        } else {
          usualWorkspaces.push(workspace);
        }
        result.json.forEach(el => {
    
          workspacesConv[workspace.id].push({ channel_name: el.channel_name, channel_guid: el.channel_guid, total_messages: el.total_messages, type: el.type });
          usualWorkspacesConv.push(el.channel_guid);
        }); */
  });
  // End. Gets conversations of every workspace

  // Logger.log(workspacesConv);

  // if (workspacesConv['direct']) {
  //   workspaces.json.push({ name: 'Direct', id: 'direct', special: true });
  // }

  // Logger.log('usualWorkspacesConv ' + JSON.stringify(usualWorkspacesConv));


  // Determines which of the conversations belong to guest workspaces
  conversations.json.results.forEach(el => {
    if (!usualWorkspacesConv.includes(el.id)) {
      if (!workspacesConv['GUEST_WORKSPACE']) {
        workspacesConv['GUEST_WORKSPACE'] = [];
        workspaces.json.push({ name: 'I\'m a Workspace Guest', id: 'GUEST_WORKSPACE', special: true });
      }
      // workspacesConv['GUEST_WORKSPACE'].push({ channel_name: el.name, channel_guid: el.id, total_messages: '?' });
      workspacesConv['GUEST_WORKSPACE'].push({ name: el.name, id: el.id, type: el.type });
    }
  });
  // End. Determines which of the conversations belong to guest workspaces



  // Logger.log(conversations);

  // Logger.log(workspacesConv);
  // Logger.log(guestWorkspaces);
  // Logger.log(usualWorkspaces);

  for (let workspaceId in workspacesConv) {
    // if (workspacesConv[workspaceId].length === 0 && workspaceId != 'personal') {
    if (workspacesConv[workspaceId].length === 0) {
      for (let j = 0; j < workspaces.json.length; j++) {
        if (workspaces.json[j].id === workspaceId) {
          workspaces.json.splice(j, 1);
          break;
        }
      }
      delete workspacesConv[workspaceId];
    } else if (workspaceId != 'GUEST_WORKSPACE'){
      // workspacesConv[workspace.id] = conversations.json.results.filter(el => el.workspace_id === workspace.id);
      const customerConvArray = workspacesConv[workspaceId].filter(el => el.type === 'customerConversation');
      // Logger.log(customerConvArray);
      // if (workspacesConv[workspaceId][0].type === 'customerConversation') {
      if (customerConvArray.length > 0) {
        for (let j = 0; j < workspaces.json.length; j++) {
          if (workspaces.json[j].id === workspaceId) {
            const element = workspaces.json.splice(j, 1)[0];
            workspaces.json.push(element);
            break;
          }
        }
      }
    }
  }
  // Logger.log(workspacesConv);
  // Logger.log(workspaces.json);
  const updatedWorkspaces = workspaces.json.map(workspace => ({
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    special: workspace.special
  }));

  // Logger.log(JSON.stringify(updatedWorkspaces));
  // Logger.log(JSON.stringify(workspacesConv));

  // console.time('1');
  // const sortedWorkspaces = sortWorkspaces(updatedWorkspaces);
  // console.timeEnd('1');

  console.timeEnd('0');
  return { hasAccess: true, workspaces: updatedWorkspaces, items: workspacesConv };
}


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
