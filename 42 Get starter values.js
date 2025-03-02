function getListOfWorkspaces() {
  const result = makeCarbonVoiceRequest('GET', '/simplified/workspaces/basic-info', null, null);
  return result;
}

function getListOfConversations() {
  const result = makeCarbonVoiceRequest('GET', '/simplified/conversations/all', null, null);
  return result;
}

function getListOfWorkspacesConversationsSidebar() {
  const result = getWorkspacesAndConversationsGW();
  return JSON.stringify(result);
}

function getWorkspacesAndConversationsGW(keepMeSigned) {
  if (typeof keepMeSigned === 'boolean') {
    changeKeepMeSignedSetting(keepMeSigned);
  }

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

// Find the index of the workspace with ID "personal"
const personalIndex = workspaces.json.findIndex(workspace => workspace.id === "personal");
// If found, remove it and add it to the beginning
if (personalIndex !== -1) {
  // Remove the workspace from its current position
  const personalWorkspace = workspaces.json.splice(personalIndex, 1)[0];
  personalWorkspace.special = true;
  // Add it to the beginning of the array
  workspaces.json.unshift(personalWorkspace);
}

  // Gets all conversations
  const conversations = getListOfConversations();

  // Gets images for workspaces and conversations
  const requests = [];
  workspaces.json.forEach(workspace => {
    requests.push({ method: 'GET', endpoint: '/channels/' + workspace.id, payload: null, queryParams: null })
  });

  const results = makeMultipleCarbonVoiceRequest(requests);

  const convImages = {};
  const workspaceImages = {};

  results.json.forEach(el => {
    if (el.success === false) {
      // Logger.log('no');
    } else {
      const name = el?.[0]?.workspace_name;
      let imageUrl = el?.[0]?.workspace_image_url;
      helperGetChannelImage(el, convImages);
      const workspaceId = el?.[0]?.workspace_guid;
      workspaceImages[workspaceId] = imageUrl;
    }
  });
  // End. Gets images for workspaces and conversations

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

  // Gets names of guest workspaces, images of guest workspaces and channels 
  for (let i in guestWorkspaceIds) {
    const result = makeCarbonVoiceRequest('GET', '/channels/' + guestWorkspaceIds[i], null, null);
    if (!result.hasAccess) {
      return result;
    }
    helperGetChannelImage(result.json, convImages);
    workspaceImages[guestWorkspaceIds[i]] = result.json[0].workspace_image_url;
    guestWorkspaces.push({ id: guestWorkspaceIds[i], name: result.json[0].workspace_name, img: result.json[0].workspace_image_url });
  }
  // End. Gets names of guest workspaces, images of guest workspaces and channels 

  guestWorkspaces.sort((a, b) => a.name.localeCompare(b.name));

  const businessLinkWorkspaces = [];
  for (let workspaceId in workspacesConv) {
    // Excludes workspaces without conversations
    if (workspacesConv[workspaceId].length === 0) {
      for (let j = 0; j < workspaces.json.length; j++) {
        if (workspaces.json[j].id === workspaceId) {
          workspaces.json.splice(j, 1);
          break;
        }
      }
      delete workspacesConv[workspaceId];
    } else {
      // Determines business link workspaces
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

  // Joins workspaces in correct order: regular, guest, business link
  workspaces.json[workspaces.json.length - 1].special = true;
  workspaces.json.push(...guestWorkspaces);
  workspaces.json[workspaces.json.length - 1].special = true;
  workspaces.json.push(...businessLinkWorkspaces);
  // End. Joins workspaces in correct order

  // Adds images to workspaces, changes keys
  const updatedWorkspaces = workspaces.json.map(workspace => ({
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    special: workspace.special,
    img: workspaceImages[workspace.id]
  }));
  // End. Adds images to workspaces, changes keys

  // Adds images to conversations
  for (let w in workspacesConv) {
    for (let i in workspacesConv[w]) {
      workspacesConv[w][i].img = convImages[workspacesConv[w][i].id];
    }
  }
  // End. Adds images to conversations

  return { hasAccess: true, workspaces: updatedWorkspaces, items: workspacesConv };
}

function helperGetChannelImage(channels, convImages) {
  channels.forEach(channel => {
    let imageUrl;

    if (channel.image_url) {
      imageUrl = channel.image_url;
    } else {
      if (channel.type === 'directMessage') {
        const numRows = channel?.avatars?.numRows;
        const numColumns = channel?.avatars?.numColumns;
        if (numRows === 1 && numColumns === 1) {
          imageUrl = channel.avatars.avatars[0].image_url;
        }
      }
    }
    if (imageUrl == null) {
      imageUrl = 'https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/blank.png';
    }
    convImages[channel.channel_guid] = imageUrl;
  });
}
