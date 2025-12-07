chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'authenticate') {
        // IMPORTANT: We need to explicitly return true to indicate we'll respond asynchronously
        (async () => {
            try {
                const result = await initiateLogin();
                // Send the response back to the content script
                sendResponse({ success: true });
            } catch (error) {
                sendResponse({ success: false, error: error.message || "Authentication failed" });
            }
        })();

        // This return statement is CRITICAL - it keeps the message port open
        return true;
    }

    if (request.action === "sendAudioToAPI") {
        (async () => {
            try {
                // Get valid token
                const tokenData = await getValidToken();

                if (!tokenData.valid) {
                    if (tokenData.needsLogin) {
                        sendResponse({
                            success: false,
                            error: 'Token expired. Please log in again.',
                            needsLogin: true
                        });
                        return;
                    }
                }

                const token = tokenData.token;

                // Convert base64 back to Blob for sending
                const base64Data = request.audioData.split(',')[1];
                const byteCharacters = atob(base64Data);
                const byteArrays = [];

                for (let i = 0; i < byteCharacters.length; i += 512) {
                    const slice = byteCharacters.slice(i, i + 512);
                    const byteNumbers = new Array(slice.length);

                    for (let j = 0; j < slice.length; j++) {
                        byteNumbers[j] = slice.charCodeAt(j);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }

                const audioBlob = new Blob(byteArrays, { type: 'audio/webm' });
                // End. Convert base64 back to Blob for sending


                // folderType: carbonvoice_gmail_folder, carbonvoice_docs_folder
                const folderIdResponse = await getCarbonVoiceFolder(request.folderType, token);
                if (folderIdResponse.success === false) {
                    throw new Error('Failed to get folder id. ' + folderIdResponse.error);
                }
                let folderId = folderIdResponse.folderId;

                // Start the voice memo
                async function startMessage(folderId, token) {
                    return await fetch('https://api.carbonvoice.app/v3/messages/voicememo/start', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({
                            is_text_message: false,
                            is_streaming: false,
                            folder_id: folderId
                        })
                    });
                }
                // End. Start the voice memo

                let startResponse = await startMessage(folderId, token);

                if (!startResponse.ok) {
                    // Handle 401 Unauthorized - attempt to refresh token
                    if (startResponse.status === 401) {
                        throw new Error('Token unauthorized');
                    } else {
                        // chrome.storage.local contains wrong folder id
                        const createSaveFolderResponse = await createSaveFolder(request.folderType, token);
                        if (createSaveFolderResponse.success === true) {
                            folderId = createSaveFolderResponse.folderId;
                            startResponse = await startMessage(folderId, token);
                            if (!startResponse.ok) {
                                if (startResponse.status === 401) {
                                    throw new Error('Token unauthorized');
                                } else {
                                    throw new Error('Failed to create folder and start message - 2nd attempt.');
                                }
                            }

                        } else {
                            throw new Error('Failed to find or create the folder. ' + createSaveFolderResponse.error);
                        }
                        // End. chrome.storage.local contains wrong folder id
                    }
                }

                const startData = await startResponse.json();
                const messageId = startData.message_id; // Extract the message_id from the response

                // Prepare form data for audio upload
                const formData = new FormData();
                formData.append('completeMessage', JSON.stringify({
                    message_id: messageId, // Use the messageId from the previous response
                    attachments: []
                }));
                formData.append('audio_file', audioBlob, 'recording.webm');

                // Send the audio file to the API
                const completeResponse = await fetch('https://api.carbonvoice.app/messages/complete', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData
                });

                if (!completeResponse.ok) {
                    // Handle 401 Unauthorized - attempt to refresh token
                    if (completeResponse.status === 401) {
                        throw new Error('Token unauthorized');
                    }
                    throw new Error('Failed to complete message.');
                }

                const completeData = await completeResponse.json();
                const finalMessageId = completeData.message_id; // Extract the message_id from the response

                // Create share link
                const shareResponse = await fetch('https://api.carbonvoice.app/message-sharelinks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        "shared_message_id": finalMessageId,
                        "share_type": "link",
                        "access_type": "public"
                    })
                });

                if (!shareResponse.ok) {
                    // Handle 401 Unauthorized - attempt to refresh token
                    if (shareResponse.status === 401) {
                        throw new Error('Token unauthorized');
                    }
                    throw new Error('Failed to share message.');
                }

                const shareData = await shareResponse.json();
                sendResponse({ success: true, data: shareData });

            } catch (error) {
                // If we get a token unauthorized error, try refreshing the token
                if (error.message === 'Token unauthorized') {
                    try {
                        const refreshResult = await refreshToken();
                        if (refreshResult.success) {
                            // Inform the content script to retry with new token
                            sendResponse({
                                success: false,
                                tokenRefreshed: true,
                                error: 'Token refreshed, please retry operation'
                            });
                        } else {
                            // Token refresh failed, need to login again
                            sendResponse({
                                success: false,
                                needsLogin: true,
                                error: 'Session expired. Please log in again.'
                            });
                        }
                    } catch (refreshError) {
                        sendResponse({
                            success: false,
                            needsLogin: true,
                            error: 'Session expired. Please log in again.'
                        });
                    }
                } else {
                    sendResponse({ success: false, error: error.message });
                }
            }
        })();

        // Return true to indicate you'll respond asynchronously
        return true;
    }

    // Add a new message type to check token validity
    if (request.action === "checkTokenValidity") {
        (async () => {
            try {
                const tokenData = await getValidToken();
                sendResponse({ needsLogin: tokenData.needsLogin });
            } catch (error) {
                sendResponse({ valid: false, needsLogin: true, error: error.message });
            }
        })();

        // Return true to indicate you'll respond asynchronously
        return true;
    }
});

// Function to handle OAuth login flow
async function initiateLogin() {
    const clientId = 'M23PXQYP00S04wOoY0X27nrWm5CjW5EkP7mLY';
    const redirectUri = chrome.identity.getRedirectURL();

    const authUrl = 'https://api.carbonvoice.app/oauth/authorize' +
        '?client_id=' + clientId +
        '&redirect_uri=' + encodeURIComponent(redirectUri) +
        '&response_type=code' +
        '&access_type=offline';

    return new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
        }, function (redirectUrl) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            if (!redirectUrl) {
                reject(new Error('Authentication failed - no redirect URL received'));
                return;
            }

            // Extract the authorization code from the redirect URL
            const url = new URL(redirectUrl);
            const code = url.searchParams.get('code');

            if (code) {
                // Exchange code for token
                exchangeCodeForToken(code, redirectUri)
                    .then(resolve)
                    .catch(reject);
            } else {
                reject(new Error('No authorization code found in redirect URL'));
            }
        });
    });
}

// Exchange authorization code for token
async function exchangeCodeForToken(code, redirectUri) {
    const backendUrl = 'https://api.carbonvoice.app/oauth/token';

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
        });

        const data = await response.json();

        if (data.access_token) {
            // Store tokens in chrome.storage
            const expiresIn = data.expires_in || 3600;
            const expiryTime = Date.now() + (expiresIn * 1000);

            await new Promise(resolve => {
                chrome.storage.local.set({
                    'carbonvoice_token': data.access_token,
                    'carbonvoice_token_expiry': expiryTime
                }, resolve);
            });

            // Store refresh token if provided
            if (data.refresh_token) {
                await new Promise(resolve => {
                    chrome.storage.local.set({
                        'carbonvoice_refresh_token': data.refresh_token
                    }, resolve);
                });
            }

            return { success: true };
        } else {
            throw new Error(data.errmsg || 'Failed to obtain access token');
        }
    } catch (error) {
        throw error;
    }
}

// Function to refresh the access token when it's expired but refresh token exists
async function refreshToken() {
    try {
        // Get the refresh token from chrome.storage
        const result = await new Promise(resolve => {
            chrome.storage.local.get(['carbonvoice_refresh_token'], resolve);
        });

        const refreshToken = result.carbonvoice_refresh_token;

        if (!refreshToken) {
            return { success: false, error: 'No refresh token available. User needs to login again.' };
        }

        const redirectUri = chrome.identity.getRedirectURL();
        const backendUrl = 'https://api.carbonvoice.app/oauth/token';

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                redirect_uri: redirectUri
            })
        });

        const data = await response.json();
        if (data.access_token) {
            // Store the new access token
            const expiresIn = data.expires_in || 3600;
            const expiryTime = Date.now() + (expiresIn * 1000);

            await new Promise(resolve => {
                chrome.storage.local.set({
                    'carbonvoice_token': data.access_token,
                    'carbonvoice_token_expiry': expiryTime
                }, resolve);
            });

            // Update the refresh token if a new one is provided
            if (data.refresh_token) {
                await new Promise(resolve => {
                    chrome.storage.local.set({
                        'carbonvoice_refresh_token': data.refresh_token
                    }, resolve);
                });
            }

            return { success: true, token: data.access_token };
        } else {
            return { success: false, error: data.errmsg || 'Failed to refresh token' };
        }
    } catch (error) {
        return { success: false, error: error.message || 'Error refreshing token' };
    }
}

// Check if token is expired and needs refreshing
async function getValidToken() {
    try {
        const result = await new Promise(resolve => {
            chrome.storage.local.get(['carbonvoice_token', 'carbonvoice_token_expiry', 'carbonvoice_refresh_token'], resolve);
        });

        const token = result.carbonvoice_token;
        const tokenExpiry = result.carbonvoice_token_expiry;
        const hasRefreshToken = !!result.carbonvoice_refresh_token;

        // If no token exists, need to login
        if (!token) {
            return { valid: false, needsLogin: true };
        }

        // If token exists but is expired and we have a refresh token
        if (tokenExpiry && Date.now() > parseInt(tokenExpiry) && hasRefreshToken) {
            const refreshResult = await refreshToken();
            if (refreshResult.success) {
                return { valid: true, needsLogin: false, token: refreshResult.token };
            } else {
                return { valid: false, needsLogin: true, error: refreshResult.error };
            }
        }

        // Token exists and is valid
        if (!tokenExpiry || Date.now() <= parseInt(tokenExpiry)) {
            return { valid: true, needsLogin: false, token };
        }

        // Token expired and no refresh token
        return { valid: false, needsLogin: true };
    } catch (error) {
        return { valid: false, needsLogin: true, error: error.message };
    }
}

const folderNames = {
    carbonvoice_gmail_folder: 'Gmail Messages',
    carbonvoice_docs_folder: 'Docs Messages'
}

// folderType: carbonvoice_gmail_folder, carbonvoice_docs_folder
async function getCarbonVoiceFolder(folderType, token) {
    try {

        // Get folder id from chrome.storage
        const result = await new Promise(resolve => {
            chrome.storage.local.get([folderType], resolve);
        });

        const carbonVoiceFolderId = result[folderType];

        if (carbonVoiceFolderId) {
            return { success: true, folderId: carbonVoiceFolderId };
        }

        const folderIdResponse = await createSaveFolder(folderType, token);
        if (folderIdResponse.success === false) {
            throw new Error(folderIdResponse.error);
        } else {
            return { success: true, folderId: folderIdResponse.folderId };
        }
    } catch (error) {
        return { success: false, error: error.message || 'Error getting folder' };
    }
}

async function createSaveFolder(folderType, token) {
    try {
        const backendUrl = 'https://api.carbonvoice.app/folders?type=voicememo&include_all_tree=false&sort_direction=ASC&workspace_id=personal';

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const data = await response.json();

        const filteredFolders = data.results.filter(el => el.name === folderNames[folderType]);


        let folderId;
        if (filteredFolders.length === 0) {

            const responseFolderCreation = await fetch('https://api.carbonvoice.app/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    "name": folderNames[folderType],
                    "type": "voicememo",
                    "workspace_id": "personal",
                })
            });

            const dataNewFolder = await responseFolderCreation.json();
            folderId = dataNewFolder.id;
            // console.log('Newly created folder', folderId);
        } else {
            folderId = filteredFolders[0].id;
            // console.log('Existing folder', folderId);
        }

        const folderIdObj = new Object();
        folderIdObj[folderType] = folderId;
        await new Promise(resolve => {
            chrome.storage.local.set(folderIdObj, resolve);
        });

        return { success: true, folderId };
    } catch (error) {
        return { success: false, error: error.message || 'Error folder creation.' };
    }
}