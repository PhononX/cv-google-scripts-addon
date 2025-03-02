function onOpen() {
    const ui = getUi();
    ui.createMenu('Carbon Voice')
        .addItem('Conversation Export', 'exportSidebar')
        .addItem('Settings', 'menuItemSettings')
        .addToUi();
}

function getUi(){
    return SpreadsheetApp.getUi();
}

function exportSidebar() {
    openUniversalSidebar('40 Html GSheets sidebar', 'Carbon Voice Conversation Export');
}