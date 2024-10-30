function getListOfConvSidebar() {
  const result = getListOfConversations();
  //Logger.log(result);
  return JSON.stringify(result);
}

function getListOfWorkspacesSidebar() {
  const result = getListOfWorkspaces();
  //Logger.log(result);
  return JSON.stringify(result);
}

function getListOfWorkspacesConversationsSidebar(){
  const result = getWorkspacesAndConversationsGW();
  //Logger.log(result);
  return JSON.stringify(result);  
}