import { showConversationModal } from '../conversationModal.js';

/**
 * Launch a dedicated conversation modal for the Woman Wastelander NPC.
 * @param {Function} onClose - Callback when modal closes.
 */
export function showWastelanderConversation(onClose) {
  showConversationModal({
    npcName: 'Wastelander',
    npcImg: '/assets/woman_wastelander/portrait.png',
    playerImg: '/assets/player/portrait.png',
    onSend: (msg, log, appendToLog) => {
      // Default canned response after delay
      setTimeout(() => appendToLog('Wastelander', '…'), 700);
    },
    onClose: onClose
  });
}
