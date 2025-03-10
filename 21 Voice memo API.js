function getVoiceMemosUpTo500(e, workspaceId, folderId, pageNumber) {
  console.log(workspaceId, folderId, pageNumber)
  const maxItemsPerCard = 50;

  if (workspaceId == null) {
    workspaceId = 'personal';
  }
  if (folderId == null) {
    folderId = 'root';
  }
  if (pageNumber == null) {
    pageNumber = 0;
  } else if (typeof pageNumber === 'string') {
    pageNumber = +pageNumber;
  }


  let folders = [];
  let messageIds = [];
  let folderName;
  if (folderId === 'root') {
    const resultRootFoldersAndMessages = getVoiceMemosOutsideFolders(workspaceId);
    if (!resultRootFoldersAndMessages.hasAccess) {
      return resultRootFoldersAndMessages;
    }
    folders = resultRootFoldersAndMessages.folders;
    messageIds = resultRootFoldersAndMessages.messageIdsWithoutFolder;
  } else {
    const resultFolder = getFolder(workspaceId, folderId);
    if (!resultFolder.hasAccess) {
      return resultFolder;
    }
    folders = resultFolder.folders;
    messageIds = resultFolder.messageIds.reverse();
    folderName = resultFolder.folderName;
  }

  // Logger.log(JSON.stringify(folders))
  // Logger.log(JSON.stringify(messageIds));

  let { visibleFolders, visibleMessageIds, showNext, showPrevious } = detectVisibleItems(folderId, pageNumber, maxItemsPerCard, folders, messageIds);

  // Logger.log(visibleFolders);
  // Logger.log(visibleMessageIds);

  const userTimeZone = getTimeZoneValue(e);
  const voiceMemos = [];
  if (visibleMessageIds.length > 0) {
    //
    const payload = {
      "message_ids": visibleMessageIds
    };
    const resultMessagesById = makeCarbonVoiceRequest('POST', '/v3/messages/by-id', payload, null);
    if (!resultMessagesById.hasAccess) {
      return resultMessagesById;
    }
    // Logger.log(resultMessagesById)

    let filteredMessages = resultMessagesById.json;
    //

    filteredMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    filteredMessages.forEach(el => {
      let { voiceMemoName, voiceMemoText } = getVoiceMemoNameAndText(el);
      voiceMemos.push({ createdAt: formatDateTime(userTimeZone, el.created_at), duration: msToMinSec(el.duration_ms), voiceMemoText: voiceMemoText, name: voiceMemoName, messageId: el.message_id });
    });
  }

  const resultWorkspaces = getWorkspacesWithNames();
  if (!resultWorkspaces.hasAccess) {
    return resultWorkspaces;
  }
  const workspaceNames = resultWorkspaces.workspaceNames;
  const workspaceName = workspaceNames[workspaceId];

  return { hasAccess: true, voiceMemos: voiceMemos, userTimeZone: userTimeZone, showNext: showNext, showPrevious: showPrevious, workspaceId, folderName, folderId, workspaceName, folders: visibleFolders, pageNumber };
}

function getVoiceMemoNameAndText(el) {
  let voiceMemoName;
  let voiceMemoText;
  let languageId;
  try {
    // Logger.log(el);
    let allT = [];
    voiceMemoName = el.name;
    // Logger.log('el.name=' + el.name);
    if (el.text_models.length > 0) {
      languageId = el.text_models[0].language_id;
      // Logger.log(languageId);
      if (el.text_models[0].timecodes.length > 0) {
        allT = el.text_models[0].timecodes.map(el => { return el.t.trim() });
        voiceMemoText = allT.join(' ');
      } else {
        voiceMemoText = el.text_models[0].value;
      }
    } else {
      if (el.text_models[0].value) {
        voiceMemoText = 'error';
      }
    }

    if (voiceMemoName == null) {
      for (let i = 1; i < el.text_models.length; i++) {
        if (el.text_models[i].language_id === languageId) {
          voiceMemoName = el.text_models[i].value;
          break;
        }
      }
      if (voiceMemoName == null) {
        voiceMemoName = voiceMemoText;
      }
    }
  }
  catch (e) {
    voiceMemoName = 'Error while retrieving the voice memo details';
    voiceMemoText = 'Message id: ' + el.message_id + ' \nError:' + e + ' <b>Please tell us about the error https://cv.chat/contactus</b>';
  }
  return { voiceMemoName: voiceMemoName, voiceMemoText: voiceMemoText };
}
