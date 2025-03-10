function getVoiceMemosAndFoldersSidebar() {
  const result = getVoiceMemosAndFolders();
  return JSON.stringify(result);
}

function t1() {
  const messages = [
    { message_id: 'eaddc9a0-cc23-11ef-be70-9', is_public_shared: true },
    { message_id: 'eaddc9a0-cc23-11ef-be70-13' },
    { message_id: 'eaddc9a0-cc23-11ef-be70-78', is_public_shared: true },
    { message_id: 'eaddc9a0-cc23-11ef-be70-45', is_public_shared: true }
  ];

  // Create a Set with only the message_ids where is_public_shared is true
  const publicSharedSet = new Set(
    messages
      .filter(message => message.is_public_shared)  // Step 1: Filter
      .map(message => message.message_id)           // Step 2: Map
  );

  // Convert the Set to an Array before stringifying
  const publicSharedArray = Array.from(publicSharedSet);

  // Log the array to view the message_ids
  // Logger.log(JSON.stringify(publicSharedArray));

  // Alternatively, using the spread operator:
  // Logger.log(JSON.stringify([...publicSharedSet]));
}

function testShareableLinksByIds() {
  const visibleMessageIds = ["44ba90d0-e3e8-11ef-bf23-d1baf71e5099", "b7b0b920-e145-11ef-973b-7fd8845178b1", "39e58240-d57f-11ef-94a7-99cad8a748fa", "8a399a60-d4fd-11ef-9d74-e7b96116c678", "85e0a2c0-d1d7-11ef-ace5-19d7e9339393", "8b73bc90-d1d2-11ef-ace5-19d7e9339393", "41d542c0-cc50-11ef-992c-cf556f0fd592", "0b384580-cc4d-11ef-929c-dd6f325b5155", "eaddc9a0-cc23-11ef-be70-454487045629", "332ade20-cc1d-11ef-8712-0b5c4997e5b2", "eb281f90-c832-11ef-94c2-77fe6d8186d5", "f354d2b0-c48d-11ef-bae1-83f6675924eb", "44941220-befe-11ef-bce9-5f6d0adcb383", "04489420-beb8-11ef-9367-d5acae14f031", "fe775af0-be2f-11ef-8c2c-152bad06c179", "20de5d00-b674-11ef-b3f3-1ddcbc8285d6", "f2ca8910-b660-11ef-af46-4d202931c64d", "7ae4fb70-b65f-11ef-af04-b79573e5d7ec", "de7631a0-a286-11ef-952c-33e16df7ea98", "de5953e0-9d2d-11ef-a229-7956d6b4841c", "52739f40-b405-11ef-bbf0-cfed7df00d82", "b5fd7b70-b401-11ef-b0b3-e5f82ac93fab", "6e82fd60-b401-11ef-b3e5-41de035d227f", "321f6b20-a519-11ef-8cbf-83c474531c66", "5a5ca080-a519-11ef-8cbf-83c474531c66", "4e739da0-a519-11ef-8cbf-83c474531c66", "b167dea0-a517-11ef-8cbf-83c474531c66", "89625b10-a517-11ef-8cbf-83c474531c66", "7e025e50-a517-11ef-8cbf-83c474531c66", "7b78eff0-a288-11ef-bafd-3bdf91b0de23", "3cfc09a0-945b-11ef-9a5d-8d92f2be7f46", "6500bff0-8f23-11ef-a9fc-33c211263fd0", "bede2db0-8f1d-11ef-a9fc-33c211263fd0", "2b14b010-849e-11ef-8b6e-77c848125740", "275f6c80-842b-11ef-b472-71ccf61dbca3", "f6df5770-823e-11ef-bbb7-c1f72ad45b42", "3ea67410-822d-11ef-b627-01d93deea382"];
  const payload = {
    "message_ids": visibleMessageIds
  };
  const resultMessagesById = makeCarbonVoiceRequest('POST', '/message-sharelinks/by-message-ids', payload, null);
  if (!resultMessagesById.hasAccess) {
    return resultMessagesById;
  }
  // Logger.log(resultMessagesById)

  resultMessagesById.json.forEach(el => {
    // Logger.log(el)
  });
}

function getVoiceMemosAndFolders(workspaceId, folderId, pageNumber, keepMeSigned) {

  if (typeof keepMeSigned === 'boolean') {
    //Logger.log('Change keepMeSigned');
    changeKeepMeSignedSetting(keepMeSigned);
  }

  // console.log(workspaceId, folderId, pageNumber)
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
  let path = [];
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
    // path = resultFolder.path.reverse();
    path = resultFolder.path;
  }

  // Logger.log(JSON.stringify(folders))
  // Logger.log(JSON.stringify(messageIds));

  let { visibleFolders, visibleMessageIds, showNext, showPrevious } = detectVisibleItems(folderId, pageNumber, maxItemsPerCard, folders, messageIds);

  // Logger.log(visibleFolders);
  // Logger.log(JSON.stringify(visibleMessageIds));

  // const userTimeZone = getTimeZoneValue();
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

    const resultShareableLinksByMessageId = makeCarbonVoiceRequest('POST', '/message-sharelinks/by-message-ids', payload, null);
    if (!resultShareableLinksByMessageId.hasAccess) {
      return resultShareableLinksByMessageId;
    }

    const publicSharedSet = new Set(
      resultShareableLinksByMessageId.json
        .filter(message => message.is_public_shared)
        .map(message => message.message_id)
    );


    // const publicSharedArray = Array.from(publicSharedSet);
    // Logger.log('publicSharedSet');
    // Logger.log(publicSharedArray);

    filteredMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    filteredMessages.forEach(el => {
      let { voiceMemoName, voiceMemoText, summary } = getVoiceMemoNameAndText(el);
      // Without createdAt: formatDateTime(userTimeZone, el.created_at),
      // duration: msToMinSec(el.duration_ms),
      // const public = publicSharedArray.includes(el.message_id);
      const public = publicSharedSet.has(el.message_id);
      voiceMemos.push({ createdAt: el.created_at, durationMs: el.duration_ms, voiceMemoText: voiceMemoText, name: voiceMemoName, messageId: el.message_id, summary, public });
    });
  }

  const resultWorkspaces = getWorkspacesWithNames();
  if (!resultWorkspaces.hasAccess) {
    return resultWorkspaces;
  }
  const workspaceNames = resultWorkspaces.workspaceNames;
  const workspaceName = workspaceNames[workspaceId];

  // Logger.log(voiceMemos)
  // Logger.log(path)

  // Without userTimeZone: userTimeZone, 
  return { hasAccess: true, voiceMemos: voiceMemos, showNext: showNext, showPrevious: showPrevious, workspaceId, folderName, folderId, workspaceName, folders: visibleFolders, pageNumber, path };
}

function getWorkspacesWithVoiceMemos() {
  const queryParams = {
    type: 'voicememo'
  };
  const result = makeCarbonVoiceRequest('GET', '/folders/count-by-workspace', null, queryParams);
  if (!result.hasAccess) {
    return result;
  }
  // Logger.log(result)
  const workspaceIds = [];
  const allWorkspaces = [];
  result.json.forEach(el => {
    workspaceIds.push(el.workspace_id);
    allWorkspaces.push({ workspaceId: el.workspace_id, nestedFoldersCount: el.total_folders, nestedMessagesCount: el.total_messages });
  });
  // Logger.log(workspaceIds)

  const payload = {
    "workspace_ids": workspaceIds
  };

  const resultWorkspaces = makeCarbonVoiceRequest('POST', '/public/workspaces', payload, null);
  if (!resultWorkspaces.hasAccess) {
    return resultWorkspaces;
  }
  // Logger.log(resultWorkspaces)

  /* 
  [{workspaceImageUrl=https://pxassets.s3.us-east-2.amazonaws.com/images/personal.png, nestedFoldersCount=5.0, nestedMessagesCount=254.0, workspaceId=personal, workspaceName=Personal}, {workspaceImageUrl=https://pxassets.s3.us-east-2.amazonaws.com/images/unknown-workspace.png, nestedFoldersCount=1.0, nestedMessagesCount=1.0, workspaceId=Ls3sXPbCF2IKwVpJ, workspaceName=Test workspace 2}]
  */

  const publicWorkspaces = resultWorkspaces.json.workspaces;
  allWorkspaces.forEach(workspace => {
    for (let i in publicWorkspaces) {
      // Logger.log(publicWorkspaces[i]);
      if (publicWorkspaces[i]._id === workspace.workspaceId) {
        workspace['workspaceName'] = publicWorkspaces[i].name;
        workspace['workspaceImageUrl'] = publicWorkspaces[i].image_urL;
        break;
      }
    }
  });

  // Logger.log(allWorkspaces)
  return { hasAccess: true, allWorkspaces }
}
