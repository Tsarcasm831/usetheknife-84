/**
 * Chat system module for SocialSpace
 * Handles all chat-related functionality including UI and messaging
 */

export default function applyChat(instance) {
    // Initialize chat properties
    instance.chatMessages = document.getElementById('chat-messages');
    instance.chatInput = document.getElementById('chat-input');
    instance.chatActive = false;
    instance.chatHideTimer = null;
    
    /**
     * Set up chat event listeners
     */
    instance.setupChatSystem = function() {
        document.addEventListener('keydown', (event) => {
            if ((event.key === 't' || event.key === 'Enter') && !this.chatActive && this.controls?.isLocked) {
                event.preventDefault();
                this.openChat();
            } else if (event.key === 'Escape' && this.chatActive) {
                this.closeChat();
            } else if (event.key === 'Enter' && this.chatActive) {
                this.sendChatMessage();
            }
        });

        this.chatInput?.addEventListener('blur', () => {
            if (this.chatActive) {
                // Delay closing chat on blur slightly to allow clicking send button etc.
                setTimeout(() => {
                    if(this.chatActive && document.activeElement !== this.chatInput) {
                        this.closeChat();
                    }
                }, 100);
            }
        });
    };

    /**
     * Open the chat interface
     */
    instance.openChat = function() {
        this.chatActive = true;
        this.controls?.unlock();
        this.chatInput.disabled = false;
        this.chatInput.focus();
        this.showChatContainer();
        // Allow pointer events on CSS3D layer for chat input
        if (this.css3dContainer) {
            this.css3dContainer.style.pointerEvents = 'auto';
        }
    };

    /**
     * Close the chat interface
     */
    instance.closeChat = function() {
        this.chatActive = false;
        if (this.chatInput) {
            this.chatInput.disabled = true;
            this.chatInput.value = '';
        }
        // Re-lock controls only if not interacting with other UI elements like slots
        if (!document.activeElement || !document.activeElement.closest?.('.slot-machine-ui')) {
            this.controls?.lock();
            // If locked, disable pointer events on CSS3D again
            if (this.css3dContainer) {
                this.css3dContainer.style.pointerEvents = 'none';
            }
        }
        // Hide chat container after a delay (handled by showChatContainer's timer)
    };

    /**
     * Send a chat message
     */
    instance.sendChatMessage = function() {
        const message = this.chatInput?.value?.trim();
        if (message && this.room) {
            const username = this.room.peers?.[this.room.clientId]?.username || 'Player';
            // Send chat message via websocket
            this.room.send({
                type: 'chat',
                message: message,
                username: username // Include username for display on other clients
            });
            // Clear input field
            this.chatInput.value = '';
            this.closeChat();
        } else {
            this.closeChat(); // Close even if message is empty
        }
    };

    /**
     * Add a message to the chat display
     * @param {string} message - The message text
     * @param {string} sender - The sender's username or 'system' for system messages
     */
    instance.addChatMessage = function(message, sender) {
        if (!this.chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        const senderUsername = this.room?.peers?.[this.room.clientId]?.username;

        if (sender === 'system') {
            messageElement.innerHTML = `<span style="color: #aaffaa;">${message}</span>`; // System messages in green
        } else if (sender === 'system-error') {
            messageElement.innerHTML = `<span style="color: #ffaaaa;">${message}</span>`; // Error messages in light red
        } else {
            const usernameSpan = document.createElement('span');
            usernameSpan.className = 'chat-username';

            // Color own messages differently
            if (sender === senderUsername) {
                usernameSpan.style.color = '#aaffaa'; // Own messages green
            } else {
                usernameSpan.style.color = '#aaaaff'; // Others' messages blueish
            }

            usernameSpan.textContent = sender; // Display sender's username

            messageElement.appendChild(usernameSpan);
            messageElement.appendChild(document.createTextNode(`: ${message}`)); // Add the message text
        }

        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight; // Scroll to bottom

        // Limit chat history
        while (this.chatMessages.children.length > 50) {
            this.chatMessages.removeChild(this.chatMessages.firstChild);
        }

        // Make chat visible briefly
        this.showChatContainer();
    };

    /**
     * Show the chat container and set up auto-hide
     */
    instance.showChatContainer = function() {
        const chatContainer = document.getElementById('chat-container');
        if (!chatContainer) return;
        
        chatContainer.style.opacity = '1'; // Make it visible

        // Clear existing timer if any
        if (this.chatHideTimer) {
            clearTimeout(this.chatHideTimer);
        }

        // Set a timer to hide the chat if not actively typing
        this.chatHideTimer = setTimeout(() => {
            if (!this.chatActive) { // Only hide if chat input is not focused
                chatContainer.style.opacity = '0';
            }
        }, 7000); // Hide after 7 seconds of inactivity
    };
}
