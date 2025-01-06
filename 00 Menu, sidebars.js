function onOpen() {
  const googleSheet = SlidesApp.getUi();
  googleSheet.createMenu('Carbone Voice')
    .addItem('Presentation Outline', 'exportSidebar')
    .addItem('Settings', 'menuItemSettings')
    .addToUi();
}

function exportSidebar() {
  openUniversalSidebar('04 Sidebar Outlines', 'Presentation Outline');
}

function menuItemSettings() {
  loadSettingSidebar('Carbon Voice GSlides Add-on Settings');
}

function openUniversalSidebar(htmlFile, title) {
  const htmlTemplate = HtmlService.createTemplateFromFile(htmlFile);
  const htmlOutput = htmlTemplate.evaluate();
  SlidesApp.getUi().showSidebar(htmlOutput.setTitle(title));
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}