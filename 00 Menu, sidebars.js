function onOpen() {
  const googleSheet = DocumentApp.getUi();
  googleSheet.createMenu('Carbone Voice')
    .addItem('Voice Memos', 'exportSidebar')
    .addItem('Settings', 'menuItemSettings')
    // .addItem('reset', 'reset')
    .addToUi();
}

function exportSidebar() {
  openUniversalSidebar('30 Voice Memos Sidebar', 'Carbon Voice Memos');
}

function menuItemSettings() {
  loadSettingSidebar('Carbon Voice GSlides Add-on Settings');
}

function openUniversalSidebar(htmlFile, title) {
  const htmlTemplate = HtmlService.createTemplateFromFile(htmlFile);
  const htmlOutput = htmlTemplate.evaluate();
  DocumentApp.getUi().showSidebar(htmlOutput.setTitle(title));
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}