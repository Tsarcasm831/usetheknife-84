import SocialSpaceCore from './core/SocialSpaceCore.js';
import applyMultiplayer from './multiplayer/SocialSpaceMultiplayer.js';
import applyInput from './input/SocialSpaceInput.js';
import applyRendering from './rendering/SocialSpaceRenderer.js';
import applyChat from './chat/SocialSpaceChat.js';
import WebsimSocket from '../utils/WebsimSocket.js';

/**
 * Composite SocialSpace class applying mixins onto core functionality.
 */
export default class SocialSpace extends SocialSpaceCore {
    constructor(options) {
        super(options);
        // Setup multiplayer and messaging
        applyMultiplayer(this);
        if (typeof this.initializeMultiplayer === 'function') this.initializeMultiplayer();
        // Input handling
        applyInput(this);
        if (typeof this.setupInputHandlers === 'function') this.setupInputHandlers();
        // Rendering setup
        applyRendering(this);
        if (typeof this.addLighting === 'function') this.addLighting();
        if (typeof this.createCasinoLevel === 'function') this.createCasinoLevel();
        
        // Chat system
        applyChat(this);
        if (typeof this.setupChatSystem === 'function') this.setupChatSystem();
    }
}
