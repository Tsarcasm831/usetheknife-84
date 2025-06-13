import { showConversationModal } from '../conversationModal.js';

/**
 * Launch a dedicated conversation modal for the Woman Wastelander NPC.
 * @param {Function} onClose - Callback when modal closes.
 */
export function showWastelanderConversation(onClose) {
  showConversationModal({
    npcName: 'Wastelander',
    npcImg: '/assets/woman_wastelander/portrait.png',
    playerImg: 'https://file.garden/Zy7B0LkdIVpGyzA1/Big/home/assets/player/portrait.png',
    onSend: (msg, log, appendToLog) => {
      // Default canned response after delay
      setTimeout(() => appendToLog('Wastelander', '…'), 700);
    },
    onClose: onClose
  });
}
