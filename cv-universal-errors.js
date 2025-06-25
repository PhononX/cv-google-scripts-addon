function questionBeforeStopRecording() {
    try {
        if (audioRecorder && isRecording) {
            if (!isPaused) {
                pauseRecording();
            }
            showQuestionModal();
        }
    }
    catch (error) {
        errorModals(error);
    }
}

class ModalDialog {
    constructor(options = {}) {
        this.title = options.title || 'Default Title';
        this.description = options.description || 'Default description';
        this.primaryButtonText = options.primaryButtonText || 'Yes, delete';
        this.secondaryButtonText = options.secondaryButtonText || 'Continue recording';
        this.primaryButtonClass = options.primaryButtonClass || 'btn-delete';
        this.secondaryButtonClass = options.secondaryButtonClass || 'btn-continue';
        this.onPrimaryAction = options.onPrimaryAction || (() => { });
        this.onSecondaryAction = options.onSecondaryAction || (() => { });
        this.overlayClass = options.overlayClass || 'error-modal-overlay';

        this.overlay = null;
    }

    show() {
        // Remove any existing modal
        this.removeExistingModal();

        // Create modal elements
        this.createModalElements();
        this.assembleModal();
        this.addEventListeners();

        // Add to DOM
        document.body.appendChild(this.overlay);
        document.body.classList.add('modal-open');
    }

    removeExistingModal() {
        const existingModal = document.querySelector(`.${this.overlayClass}`);
        if (existingModal) {
            existingModal.remove();
            document.body.classList.remove('modal-open');
        }
    }

    createModalElements() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = this.overlayClass;

        // Create container
        this.container = document.createElement('div');
        this.container.className = 'dialog-container';

        // Create button container
        this.btnContainer = document.createElement('div');
        this.btnContainer.className = 'button-container';

        // Create primary button
        this.primaryButton = document.createElement('button');
        this.primaryButton.className = `confirmation-button ${this.primaryButtonClass}`;
        this.primaryButton.innerHTML = this.primaryButtonText;

        // Create secondary button
        this.secondaryButton = document.createElement('button');
        this.secondaryButton.className = `confirmation-button ${this.secondaryButtonClass}`;
        this.secondaryButton.innerHTML = this.secondaryButtonText;

        // Create title
        this.titleElement = document.createElement('h1');
        this.titleElement.className = 'dialog-title';
        this.titleElement.textContent = this.title;

        // Create description
        this.descriptionElement = document.createElement('p');
        this.descriptionElement.className = 'dialog-description';
        this.descriptionElement.textContent = this.description;
    }

    assembleModal() {
        this.container.appendChild(this.titleElement);
        this.container.appendChild(this.descriptionElement);
        this.btnContainer.appendChild(this.primaryButton);
        this.btnContainer.appendChild(this.secondaryButton);
        this.container.appendChild(this.btnContainer);
        this.overlay.appendChild(this.container);
    }

    addEventListeners() {
        // Primary button click
        this.primaryButton.addEventListener('click', (e) => {
            this.onPrimaryAction();
            this.close();
        });

        // Secondary button click
        this.secondaryButton.addEventListener('click', (e) => {
            this.onSecondaryAction();
            this.close();
        });

        // Overlay click (close on backdrop click)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    }

    close() {
        if (this.overlay) {
            this.overlay.remove();
            document.body.classList.remove('modal-open');
            this.overlay = null;
        }
    }
}

// Usage examples:

// Original modal (recording deletion)
function showQuestionModal() {
    const modal = new ModalDialog({
        title: 'Do you want to delete your recording?',
        description: 'You were recording a reply and you\'re about to close this view which means that your recording will be deleted permanently.',
        primaryButtonText: 'Yes, delete',
        secondaryButtonText: 'Continue recording',
        primaryButtonClass: 'btn-delete',
        secondaryButtonClass: 'btn-continue',
        onPrimaryAction: () => {
            stopRecording();
        },
        onSecondaryAction: () => {
            // Continue recording (no action needed)
        }
    });
    modal.show();
}

function showReloadModal() {
    const modal = new ModalDialog({
        title: 'Carbon Voice Extension was updated',
        description: 'Please reload the page to continue using it.',
        primaryButtonText: 'Yes, reload',
        secondaryButtonText: 'Cancel',
        primaryButtonClass: 'btn-delete',
        secondaryButtonClass: 'btn-continue',
        onPrimaryAction: () => {
            window.location.reload();
        }
    });
    modal.show();
}

/**
 * Creates and displays a modal dialog with error message
 * Removes any existing error modal before showing new one
 * @param {string} errorText - The error message to display in the modal
 */
function showErrorModal(errorText) {
  // Remove any existing error modal
  const existingModal = document.querySelector('.error-modal-overlay');
  if (existingModal) {
    existingModal.remove();
    document.body.classList.remove('modal-open');
  }

  // Create modal elements
  const overlay = document.createElement('div');
  overlay.className = 'error-modal-overlay';

  const container = document.createElement('div');
  container.className = 'dialog-container';

  const closeButton = document.createElement('button');
  closeButton.className = 'error-modal-close';
  closeButton.innerHTML = '✕';

  const text = document.createElement('p');
  text.className = 'error-modal-text';
  text.innerHTML = errorText ? errorText : 'Failed. Unknown error.';

  // Assemble modal
  container.appendChild(closeButton);
  container.appendChild(text);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // Add modal-open class to body
  document.body.classList.add('modal-open');

  // Add event listeners
  const closeModal = () => {
    overlay.remove();
    document.body.classList.remove('modal-open');
  };

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });
}

function showReAuthModal(audioChunks) {
    const modal = new ModalDialog({
        title: 'Sign in required',
        description: 'Your session has expired. Sign in to send your voice memo. If you click "Cancel", you will lose the recording.',
        primaryButtonText: 'Sign in with Carbon Voice',
        secondaryButtonText: 'Cancel',
        primaryButtonClass: 'btn-login',
        secondaryButtonClass: 'btn-delete',
        onPrimaryAction: () => {
            initiateLoginWithAudio(audioChunks);
        },
        onSecondaryAction: () => {
            // Audio will be lost, just hide the control panel
            hideControlPanel();
        }
    });
    modal.show();
}

function initiateLoginWithAudio(audioChunks) {

    chrome.runtime.sendMessage({ action: 'authenticate' }, function (response) {
        if (chrome.runtime.lastError) {
            showErrorModal('Authentication error: ' + chrome.runtime.lastError.message);
            return;
        }
        if (response && response.success) {
            setTimeout(() => {
                sendAudioToBackground(audioChunks);
            }, 1000);
        } else {
            const errorMessage = response && response.error
                ? 'Authentication error: ' + response.error
                : 'Authentication failed';
            showErrorModal(errorMessage);
        }
    });
}