function getPauseImage() {
    return chrome.runtime.getURL('content-icons/cv-doc-pause.png');
}

function sendAudioToBackground(audioChunks) {

    disableAllInteractions();
    addProcessingAnimation();

    // Convert audio chunks to a Blob
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

    // Convert Blob to base64 for transfer
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    reader.onloadend = function () {
        const base64Audio = reader.result;

        // Send to background script
        chrome.runtime.sendMessage({
            action: "sendAudioToAPI",
            audioData: base64Audio,
            folderType: "carbonvoice_docs_folder"
        }, function (response) {
            if (response && response.success) {
                // console.log('API request successful:', response.data);
                const shareableVoiceMemoLink = 'Play and respond in Carbon Voice https://carbonvoice.app/s/' + response.data._id;
                enableButton(activeInputElement);
                insertTestLink(activeInputElement, shareableVoiceMemoLink);
                sendComment();
                hideControlPanel();
            } else {
                if (response.tokenRefreshed === true) {
                    // console.error('Refreshed token. Try again. ', response.error);
                    sendAudioToBackground(audioChunks);
                } else {
                    if (response.needsLogin === true) {
                        chrome.storage.local.remove(['carbonvoice_token', 'carbonvoice_token_expiry', 'carbonvoice_refresh_token'], function () {
                            // Show re-authentication modal with preserved audio
                            showReAuthModal(audioChunks);
                        });
                    } else {
                        enableButton(activeInputElement);
                        showErrorModal(response.error);
                        enableAllInteractions();
                        removeProcessingAnimation();
                    }
                }
            }
        });
    };
}