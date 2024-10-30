function getWorkspacesAndConversationsGW() {
  // console.time('0');
  const workspaces = getListOfWorkspaces();
  if (!workspaces.hasAccess) {
    return workspaces;
  }
  workspaces.json.sort((a, b) => a.name.localeCompare(b.name));

  const workspacesConv = {};
  const guestWorkspaces = [];
  const usualWorkspacesConv = [];

  // /simplified/workspaces/basic-info returns Personal workspace as {id=n3hXmlnRBpAUz9WN, name=E G}
  // /simplified/workspaces/basic-info doesn't return workspaces where I'm guest
  // In /channels/{workspaceguid} responses, workspace 'Personal' has id = 'personal'
  // /channels/{workspaceguid} doesn't know n3hXmlnRBpAUz9WN

  // Adds workspace 'Personal' with id = 'personal'
  workspaces.json.unshift({ name: 'Personal', id: 'personal', special: true });

  // Gets all conversations
  const conversations = getListOfConversations();

  // Gets conversations of every workspace
  workspaces.json.forEach(workspace => {
    workspacesConv[workspace.id] = conversations.json.results.filter(el => el.workspace_id === workspace.id);
    const notGuestConv = workspacesConv[workspace.id].map(el => { return el.id });
    usualWorkspacesConv.push(...notGuestConv);
  });
  // End. Gets conversations of every workspace

  // Determines which of the conversations belong to guest workspaces
  const guestWorkspaceConversations = [];
  conversations.json.results.forEach(el => {
    if (!usualWorkspacesConv.includes(el.id)) {
      if (!workspacesConv[el.workspace_id]) {
        workspacesConv[el.workspace_id] = [];
      }
      workspacesConv[el.workspace_id].push(el);
      guestWorkspaceConversations.push(el);
    }
  });
  // End. Determines which of the conversations belong to guest workspaces

  const uniqueIds = new Set();
  guestWorkspaceConversations.forEach(item => {
    if (item.workspace_id) {
      uniqueIds.add(item.workspace_id);
    }
  });
  const guestWorkspaceIds = Array.from(uniqueIds);

  for (let i in guestWorkspaceIds) {
    const result = makeCarbonVoiceRequest('GET', '/channels/' + guestWorkspaceIds[i], null, null);
    if (!result.hasAccess) {
      return result;
    }
    guestWorkspaces.push({ id: guestWorkspaceIds[i], name: result.json[0].workspace_name });
  }
  guestWorkspaces.sort((a, b) => a.name.localeCompare(b.name));

  const businessLinkWorkspaces = [];
  for (let workspaceId in workspacesConv) {
    if (workspacesConv[workspaceId].length === 0) {
      for (let j = 0; j < workspaces.json.length; j++) {
        if (workspaces.json[j].id === workspaceId) {
          workspaces.json.splice(j, 1);
          break;
        }
      }
      delete workspacesConv[workspaceId];
    } else {
      const customerConvArray = workspacesConv[workspaceId].filter(el => el.type === 'customerConversation');
      if (customerConvArray.length > 0) {
        for (let j = 0; j < workspaces.json.length; j++) {
          if (workspaces.json[j].id === workspaceId) {
            const element = workspaces.json.splice(j, 1)[0];
            businessLinkWorkspaces.push(element);
            break;
          }
        }
      }
    }
  }

  workspaces.json[workspaces.json.length - 1].special = true;
  workspaces.json.push(...guestWorkspaces);
  workspaces.json[workspaces.json.length - 1].special = true;
  workspaces.json.push(...businessLinkWorkspaces);

  const updatedWorkspaces = workspaces.json.map(workspace => ({
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    special: workspace.special
  }));

  // console.timeEnd('0');
  return { hasAccess: true, workspaces: updatedWorkspaces, items: workspacesConv };
}