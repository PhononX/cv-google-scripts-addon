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



function getVoiceMemosOutsideFolders(workspaceId = 'personal') {
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

// function getFolder(workspaceId, folderId = '677cdf16ff7eabbbb8564782') {
// function getFolder(workspaceId, folderId = '6796321fc3d74bc430699aa8') {
function getFolder(workspaceId, folderId = '679631cd6a93274032f776fa') {
  const queryParams = {
    // type: 'voicememo',
    include_first_level_tree: true,
    direction: 'newer',
    workspace_id: workspaceId
  };
  const result = makeCarbonVoiceRequest('GET', '/folders/' + folderId, null, queryParams);
  // Logger.log(result);
  // Logger.log(result.json.name);
  // Logger.log(result.json.path);
  // Logger.log(JSON.stringify(result.json.messages[0]));
  // Logger.log(JSON.stringify(result.json.subfolders));
  if (!result.hasAccess) {
    return result;
  }

  const path = [];
  if (result.json.path) {
    if (result.json.path.length > 0) {
      const allFoldersResult = allFolders(workspaceId);
      if (!allFoldersResult.hasAccess) {
        return allFoldersResult;
      }

      result.json.path.forEach(breadcrumbId => {
        for (let i in allFoldersResult.folders) {
          if (allFoldersResult.folders[i].id === breadcrumbId) {
            // Logger.log(allFoldersResult.folders[i]);
            path.unshift({ folderId: breadcrumbId, folderName: allFoldersResult.folders[i].name });
            break;
          }
        }
      });
    }
  }

// Logger.log(path);

  const subfolders = [];
  if (result.json.subfolders) {
    result.json.subfolders.forEach(el => {
      subfolders.push({ folderName: el.name, folderId: el.id, nestedMessagesCount: el.total_nested_messages_count, nestedFoldersCount: el.total_nested_folders_count })
    });
  }
  // Logger.log(subfolders)

  const messageIds = result.json.message_ids;
  return { hasAccess: true, messageIds, folders: subfolders, folderName: result.json.name, path}
}


function detectVisibleItems(folderId, pageNumber, maxItemsPerCard, folders, messageIds) {
  const startIndex = pageNumber * maxItemsPerCard;
  const totalItems = folders.length + messageIds.length;
  let visibleFolders = [];
  let visibleMessageIds = [];

  // If we're still within folders range
  if (startIndex < folders.length) {
    const remainingFolders = folders.length - startIndex;
    const foldersToShow = Math.min(remainingFolders, maxItemsPerCard);
    visibleFolders = folders.slice(startIndex, startIndex + foldersToShow);
  }

  // Calculate how many message slots we have available
  const remainingSlots = maxItemsPerCard - visibleFolders.length;

  // If we have remaining slots and we've shown enough folders
  if (remainingSlots > 0) {
    const messageStartIndex = Math.max(0, startIndex - folders.length);
    visibleMessageIds = messageIds.slice(messageStartIndex, messageStartIndex + remainingSlots);
  }

  // Calculate pagination controls
  const showPrevious = startIndex > 0;

  // Calculate if there are more items ahead
  const currentEndIndex = startIndex + maxItemsPerCard;
  const showNext = currentEndIndex < totalItems;

  return {
    visibleFolders,
    visibleMessageIds,
    showPrevious,
    showNext
  };
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
