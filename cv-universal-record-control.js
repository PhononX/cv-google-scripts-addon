let audioRecorder = null;
let audioChunks = [];
let timerInterval = null;
let seconds = 0;
let minutes = 0;
let isRecording = false;
let isPaused = false;

function createButton(id, title, imgSrc, className) {
    const button = document.createElement('button');
    button.className = className || 'action-button';
    button.id = id;
    button.title = title;

    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = title;

    button.appendChild(img);
    return button;
}

function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showErrorModal('Your browser does not support audio recording');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            audioRecorder = new MediaRecorder(stream);
            audioChunks = [];

            audioRecorder.addEventListener('dataavailable', event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            });

            audioRecorder.start();
            isRecording = true;
            isPaused = false;
            startTimer();

            // Make the recording indicator blink
            document.getElementById('recording-indicator').classList.add('blink');

            enableAllInteractions();
        })
        .catch(error => {
            showErrorModal('Could not access the microphone. Please check permissions.');
            hideControlPanel();
        });
}

function stopRecording() {
    try {
        if (audioRecorder && isRecording) {
            audioRecorder.stop();
            stopTimer();
            isRecording = false;

            // Stop all tracks in the stream
            if (audioRecorder.stream) {
                audioRecorder.stream.getTracks().forEach(track => track.stop());
            }

            // Clear recorded audio
            audioChunks = [];
        }

        // Close popup
        hideControlPanel();
    }
    catch (error) {
        errorModals(error);
    }
}

function togglePauseRecording() {
    try {
        if (!audioRecorder || !isRecording) return;

        if (!isPaused) {
            // Pause recording
            pauseRecording();
        } else {
            // Resume recording
            resumeRecording();
        }
    }
    catch (error) {
        errorModals(error);
    }
}

function pauseRecording() {
    audioRecorder.pause();
    isPaused = true;
    pauseTimer();

    // Update UI
    document.getElementById('recording-indicator').classList.remove('blink');

    // Change button to "Proceed record"
    const pauseButton = document.getElementById('pause-button');
    pauseButton.title = 'Proceed record';
    const img = pauseButton.querySelector('img');
    img.src = chrome.runtime.getURL('content-icons/cv-universal-record-after-pause.png');
    img.alt = 'Proceed record';
}

function resumeRecording() {
    audioRecorder.resume();
    isPaused = false;
    resumeTimer();

    // Update UI
    document.getElementById('recording-indicator').classList.add('blink');

    // Change button back to "Pause record"
    const pauseButton = document.getElementById('pause-button');
    pauseButton.title = 'Pause record';
    const img = pauseButton.querySelector('img');
    img.src = getPauseImage();
    img.alt = 'Pause record';
}

function sendRecord() {
    try {
        if (audioRecorder && isRecording) {
            audioRecorder.stop();
            stopTimer();
            isRecording = false;

            document.getElementById('recording-indicator').classList.remove('blink');

            // Stop all tracks in the stream
            if (audioRecorder.stream) {
                audioRecorder.stream.getTracks().forEach(track => track.stop());
            }

            audioRecorder.addEventListener('stop', () => {
                sendAudioToBackground(audioChunks);
            }, { once: true });
        }
    }
    catch (error) {
        errorModals(error);
    }
}

function startTimer() {
    seconds = 0;
    minutes = 0;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
}

function resumeTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    minutes = 0;
}

function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    if (display) {
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');
        display.textContent = `${formattedMinutes}:${formattedSeconds}`;
    }
}