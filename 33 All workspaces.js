
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
  Logger.log(allWorkspaces);
  return { hasAccess: true, allWorkspaces }
}
