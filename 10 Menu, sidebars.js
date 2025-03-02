function menuItemSettings() {
  loadSettingSidebar('Carbon Voice Add-on Settings');
}

function openUniversalSidebar(htmlFile, title) {
  const htmlTemplate = HtmlService.createTemplateFromFile(htmlFile);
  const htmlOutput = htmlTemplate.evaluate();
  getUi().showSidebar(htmlOutput.setTitle(title));
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}