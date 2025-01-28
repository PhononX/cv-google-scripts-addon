function pasteTranscription(voiceMemoText) {
  // Logger.log('voiceMemoText' + voiceMemoText);
  const doc = DocumentApp.getActiveDocument();
  const cursor = doc.getCursor();
  if (cursor) {
    // Get the element containing the cursor
    const element = cursor.getElement();
    // Get the offset within the element where the cursor is located
    const offset = cursor.getOffset();

    // Insert the text at the cursor position
    element.insertText(offset, voiceMemoText);
  } else {
    // If there is no cursor, show an alert
    const errorText = 'Please place your cursor in the document first.';
    DocumentApp.getUi().alert(errorText);
    return { status: 'error', hasAccess: true, message: errorText };
  }
  return { status: 'ok', hasAccess: true, message: 'Export completed successfully.' };
}
