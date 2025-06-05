// Handles the generic iframe modal functionality

function openGenericIframeModal(src) {
    let iframeModal = document.getElementById('generic-iframe-modal');
    const modalsRoot = document.getElementById('modals-root') || document.body;

    if (!iframeModal) {
        iframeModal = document.createElement('div');
        iframeModal.id = 'generic-iframe-modal';
        iframeModal.classList.add('generic-iframe-modal-overlay'); // This class handles display:none initially

        iframeModal.innerHTML = `
            <div class="generic-iframe-modal-content">
                <button id="close-generic-iframe-modal" class="generic-iframe-modal-close-btn">&times;</button>
                <h3>External Content</h3>
                <iframe id="generic-iframe-content" allow="geolocation *; camera *; microphone *"></iframe>
            </div>
        `;
        modalsRoot.appendChild(iframeModal);

        const modalDialog = iframeModal.querySelector('.generic-iframe-modal-content');
        const closeBtn = iframeModal.querySelector('#close-generic-iframe-modal');
        const iframeElement = iframeModal.querySelector('#generic-iframe-content');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                iframeModal.classList.remove('active');
                if (iframeElement) {
                    iframeElement.src = 'about:blank'; // Clear src to stop content
                }
            });
        }

        // Close modal if backdrop is clicked
        iframeModal.addEventListener('click', (event) => {
            if (event.target === iframeModal) {
                iframeModal.classList.remove('active');
                if (iframeElement) {
                    iframeElement.src = 'about:blank';
                }
            }
        });
        
        // Prevent clicks inside the modal content from closing the modal
        if (modalDialog) {
            modalDialog.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }
    }

    const iframeElement = iframeModal.querySelector('#generic-iframe-content');
    if (iframeElement) {
        iframeElement.src = src;
    }
    iframeModal.classList.add('active'); // Show the modal
}

export function initGenericIframeModal() {
    // Expose the function to the window object for access from sidebar.js
    window.openIframeModal = openGenericIframeModal;
}