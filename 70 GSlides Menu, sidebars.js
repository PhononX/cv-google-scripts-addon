function onOpen() {
  const ui = getUi();
  ui.createMenu('Carbone Voice')
    .addItem('Presentation Outline', 'exportSidebar')
    .addItem('Settings', 'menuItemSettings')
    .addToUi();
}

function getUi() {
  return SlidesApp.getUi();
}

function exportSidebar() {
  // openUniversalSidebar('40 Html GSheets sidebar', 'Carbon Voice Conversation Export');
  openUniversalSidebar('70 Html GSlides sidebar', 'Presentation Outline');
}



//////

// function onOpen() {
//   const googleSheet = SlidesApp.getUi();
//   googleSheet.createMenu('Carbone Voice')
//     .addItem('Presentation Outline', 'exportSidebar')
//     .addItem('Settings', 'menuItemSettings')
//     .addToUi();
// }

// function exportSidebar() {
//   openUniversalSidebar('04 Sidebar Outlines', 'Presentation Outline');
// }

// function openUniversalSidebar(htmlFile, title) {
//   const htmlTemplate = HtmlService.createTemplateFromFile(htmlFile);
//   const htmlOutput = htmlTemplate.evaluate();
//   SlidesApp.getUi().showSidebar(htmlOutput.setTitle(title));
// }

// function include(filename) {
//   return HtmlService.createHtmlOutputFromFile(filename).getContent();
// }