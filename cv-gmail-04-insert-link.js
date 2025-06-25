
function msToMinSec(ms) {
    // Check if input is valid
    if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
        return '0:00';
    }

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatMillisecondsLocalTimezone(milliseconds) {
    const date = new Date(milliseconds);

    // Format the date part
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    // Format the time part
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Get timezone abbreviation
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Put it all together
    return `${day} ${month} ${year} · ${hours}:${minutes} ${ampm} (${timezone})`;
}

function isComposeWindowStillActive(composeWindowElement) {
    // Check if the element is still in the DOM
    return document.contains(composeWindowElement);
}

function insertLink(url, createdAtMs, durationMs) {
    const name = 'Voice Memo';
    const duration = msToMinSec(durationMs);
    const createdAt = formatMillisecondsLocalTimezone(createdAtMs);

    const activeComposeWindowFlag = isComposeWindowStillActive(activeComposeWindow);
    if (activeComposeWindowFlag) {
        const messageField = activeComposeWindow.querySelector('[role="textbox"]');
        if (messageField) {
            const content = `<br><br>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff;">
        <tr>
            <td style="padding: 5px; align: left;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #EDEDF3; border-radius: 8px; background-color: #ffffff;">
                    <tr>
                        <td style="padding: 10px;">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <!-- Left Icon Cell - Fixed Width -->
                                    <td width="24" style="width: 24px; vertical-align: middle;">
                                        <a href="${url}"><img src="https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/voicememo.png" alt="Voice Memo Icon" style="width: 24px; height: 24px; display: block;"></a>
                                    </td>
                                    
                                    <!-- Spacing Cell -->
                                    <td width="15" style="width: 15px;"></td>
                                    
                                    <!-- Center Content Cell -->
                                    <td style="vertical-align: middle;">
                                        <a href="${url}" style="display: block; color: #261073; font-size: 14px; font-weight: 400; text-decoration: none; margin-bottom: 2px;">
                                            ${name}
                                        </a>
                                        <a href="${url}" style="display: block; color: #A1A2AB; font-size: 12px; text-decoration: none;">
                                            ${createdAt} · Duration: ${duration}
                                        </a>
                                    </td>
                                    
                                    <!-- Spacing Cell -->
                                    <td width="15" style="width: 15px;"></td>
                                    
                                    <!-- Right Play Icon Cell - Fixed Width -->
                                    <td width="32" style="width: 32px; vertical-align: middle;">
                                        <a href="${url}"><img src="https://pxassets.s3.us-east-2.amazonaws.com/images/google-addons/Play+icon+purple.png" alt="Play Icon" style="width: 32px; height: 32px; display: block; cursor: pointer;"></a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Fallback Text Outside Tables -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px;">
        <tr>
            <td style="padding: 0 20px;">
                <div style="color: #A1A2AB; font-size: 12px; margin-top: 15px;">
                    If tapping link doesn't play message, copy &amp; paste this link to your browser: ${url}
                </div>
            </td>
        </tr>
    </table>

    `;
            messageField.innerHTML += content;
        }
    } else {
        showErrorModal('The compose window where you recorded the voice memo is now closed, but you can insert the link into any other email.<br><br><a href="' + url + '">' + url + '</a>');
    }
    hideControlPanel();
}