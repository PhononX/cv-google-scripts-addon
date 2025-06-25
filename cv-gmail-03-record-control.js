function getPauseImage() {
    return chrome.runtime.getURL('content-icons/cv-gmail-pause.png');
}

function sendAudioToBackground(audioChunks) {
    try {
        disableAllInteractions();
        addProcessingAnimation();

        // Convert audio chunks to a Blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

        // Convert Blob to base64 for transfer
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        reader.onloadend = function () {
            try {
                const base64Audio = reader.result;

                chrome.runtime.sendMessage({
                    action: "sendAudioToAPI",
                    audioData: base64Audio,
                    folderType: "carbonvoice_gmail_folder"
                }, function (response) {
                    if (response && response.success) {
                        // console.log('API request successful:', response.data);
                        insertLink('https://carbonvoice.app/s/' + response.data._id, response.data.created_at, response.data?.shared_message?.duration_ms);
                    } else {
                        if (response.tokenRefreshed === true) {
                            // console.error('Refreshed token. Try again. ', response.error);
                            sendAudioToBackground(audioChunks);
                        } else {
                            // console.error('API request failed:', response.error);
                            if (response.needsLogin === true) {
                                chrome.storage.local.remove(['carbonvoice_token', 'carbonvoice_token_expiry', 'carbonvoice_refresh_token'], function () {
                                    // Show re-authentication modal with preserved audio
                                    showReAuthModal(audioChunks);
                                });
                            } else {
                                showErrorModal(response.error);
                                enableAllInteractions();
                                removeProcessingAnimation();
                                hideControlPanel();
                            }
                        }
                    }
                });
            }
            catch (error) {
                errorModals(error);
            }
        };
    }
    catch (error) {
        errorModals(error);
    }
}