function allFolders(workspaceId) {
  if (workspaceId == null) workspaceId = 'personal';
  const queryParams = {
    type: 'voicememo',
    include_all_tree: true,
    sort_direction: 'ASC',
    // workspace_id: workspaceId
  };
  const result = makeCarbonVoiceRequest('GET', '/folders', null, queryParams);
  // Logger.log(result);
  if (!result.hasAccess) {
    return result;
  }

  // result.json.results.forEach(el => {
  //   Logger.log(el)
  // })
  return { hasAccess: true, folders: result.json.results }
}

function getFolder(workspaceId, folderId = '677cdf16ff7eabbbb8564782') {
  const queryParams = {
    // type: 'voicememo',
    include_first_level_tree: true,
    direction: 'newer',
    workspace_id: workspaceId
  };
  const result = makeCarbonVoiceRequest('GET', '/folders/' + folderId, null, queryParams);
  // Logger.log(result);
  // Logger.log(JSON.stringify(result.json.name));
  // Logger.log(JSON.stringify(result.json.messages[0]));
  // Logger.log(JSON.stringify(result.json.subfolders));
  if (!result.hasAccess) {
    return result;
  }

  const subfolders = [];
  if (result.json.subfolders) {
    result.json.subfolders.forEach(el => {
      subfolders.push({ folderName: el.name, folderId: el.id, nestedMessagesCount: el.total_nested_messages_count, nestedFoldersCount: el.total_nested_folders_count })
    });
  }
  // Logger.log(subfolders)

  const messageIds = result.json.message_ids;
  return { hasAccess: true, messageIds, folders: subfolders, folderName: result.json.name }
}

function createFolder() {
  const payload = {
    "name": "Test Sub-Subfolder 1",
    "type": "voicememo",
    // "workspace_id": "personal",
    "workspace_id": "Ls3sXPbCF2IKwVpJ",
    // "parent_folder_id": "679631cd6a93274032f776fa"
  };
  const resultNewFolder = makeCarbonVoiceRequest('POST', '/folders', payload, null);
  // Logger.log(resultNewFolder);
  if (!resultNewFolder.hasAccess) {
    return resultNewFolder;
  }
  folderId = resultNewFolder.json.id;
}

function createVoiceMemo(text = 'Voice memo in Test workspace 2', folderId = '67967800fccde7be70de664c') {
  const payload = {
    "transcript": text,
    "is_text_message": true,
    "is_streaming": false,
    "folder_id": folderId,
  };
  const result = makeCarbonVoiceRequest('POST', '/v3/messages/voicememo/start', payload, null);
  return result;
}


function getVoiceMemosOutsideFolders(workspaceId = 'personal4') {
  const queryParams = {
    type: 'voicememo',
    workspace_id: workspaceId
  };
  const result = makeCarbonVoiceRequest('GET', '/folders/count-by-workspace', null, queryParams);
  // Logger.log(result)
  if (!result.hasAccess) {
    return result;
  }

  const rootFolders = [];
  let messageIdsWithoutFolder = [];

  if (result.json.length > 0) {
    messageIdsWithoutFolder = result.json[0].message_ids_without_folder;
    // Logger.log(JSON.stringify(messageIdsWithoutFolder))
    // Logger.log(result.json.length)
    // Logger.log(result.json[0].root_folders)

    if (result.json[0].root_folders) {
      result.json[0].root_folders.forEach(el => {
        rootFolders.push({ folderName: el.name, folderId: el.id, nestedMessagesCount: el.total_nested_messages_count, nestedFoldersCount: el.total_nested_folders_count })
      });
    }
    // Logger.log(rootFolders)
    // messages.forEach(el => {
    //   // let { voiceMemoName, voiceMemoText } = getVoiceMemoNameAndText(el);
    //   // Logger.log(voiceMemoName);
    //   // Logger.log(voiceMemoText);
    // })
  }
  return { hasAccess: true, messageIdsWithoutFolder, folders: rootFolders }
}

function getListOfWorkspaces() {
  const result = makeCarbonVoiceRequest('GET', '/simplified/workspaces/basic-info', null, null);
  // Logger.log(result)
  return result;
}

// https://pxassets.s3.us-east-2.amazonaws.com/images/unknown-workspace.png
///channels/{workspaceguid}
function getWorkspaceImage(workspaceId = 'personal') {
  const result = makeCarbonVoiceRequest('GET', '/channels/' + workspaceId, null, null);
  if (!result.hasAccess) {
    return result;
  }
  // Logger.log(result.json?.[0]?.workspace_image_url)
  return result.json?.[0]?.workspace_image_url;
}


function getWorkspacesWithNames() {
  const resultWorkspaces = makeCarbonVoiceRequest('GET', '/simplified/workspaces/basic-info', null, null);
  if (!resultWorkspaces.hasAccess) {
    return resultWorkspaces;
  }
  // Logger.log(resultWorkspaces)
  const workspaceNames = { personal: 'Personal' };
  resultWorkspaces.json.forEach(el => {
    workspaceNames[el.id] = el.name;
  });
  return { hasAccess: true, workspaceNames };
}

function getVoiceMemosAllWorkspaces() {
  // const resultWorkspaces = getWorkspacesWithNames();
  // if (!resultWorkspaces.hasAccess) {
  //   return resultWorkspaces;
  // }
  const workspaceNames = {};

  const queryParams = {
    type: 'voicememo',
    // workspace_id: workspaceId
  };
  const result = makeCarbonVoiceRequest('GET', '/folders/count-by-workspace', null, queryParams);
  if (!result.hasAccess) {
    return result;
  }

  const requests = [];
  result.json.forEach(el => {
    requests.push({ method: 'GET', endpoint: '/channels/' + el.workspace_id, payload: null, queryParams: null })
  });

  const results = makeMultipleCarbonVoiceRequest(requests);

  const allWorkspaces = [];
  results.json.forEach(el => {
    if (el.success === false) {
      // Logger.log('no');
    } else {
      const name = el?.[0]?.workspace_name;
      let imageUrl = el?.[0]?.workspace_image_url;
      if (imageUrl == null) { imageUrl = unknownWorkspaceIcon; }
      const workspaceId = el?.[0]?.workspace_guid;
      workspaceNames[workspaceId] = { name: name, imageUrl: imageUrl };
    }
    // Logger.log(json);
  });

  result.json.forEach(el => {
    allWorkspaces.push({ workspaceName: workspaceNames[el.workspace_id].name, workspaceImageUrl: workspaceNames[el.workspace_id].imageUrl, workspaceId: el.workspace_id, nestedFoldersCount: el.total_folders, nestedMessagesCount: el.total_messages });
  });

  allWorkspaces.sort((a, b) => {
    return a.workspaceName.localeCompare(b.workspaceName);
  });
  // Logger.log(allWorkspaces);
  return { hasAccess: true, allWorkspaces }
}


// function testShowTokens() {
//   Logger.log(PropertiesService.getUserProperties().getProperties());
// }