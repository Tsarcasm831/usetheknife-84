// scripts/conversationModal.js
// Modular Diablo II-style conversation modal for NPCs and player interactions
// import { askOllama } from "/ollamaClient.js";   // <- adjust path if needed

/**
 * Show a conversation modal with NPC and player portraits, chat log, input, and option buttons.
 * @param {Object} opts - Modal options
 * @param {string} opts.npcName - NPC name
 * @param {string} opts.npcImg - NPC portrait URL
 * @param {string} opts.playerImg - Player portrait URL
 * @param {function} opts.onSend - Called when player sends a message
 * @param {function} opts.onClose - Called when modal closes
 */
export function showConversationModal({
  npcName = '',
  npcImg = 'assets/woman_wastelander/portrait.png',
  playerImg = 'assets/player/portrait.png',
  onSend = null,
  onClose = null
} = {}) {
  // Remove existing modal if present
  const old = document.getElementById('conversation-modal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'conversation-modal';
  modal.className = 'conversation-modal';
  modal.innerHTML = `
    <div class="conv-content">
      <div class="conv-side conv-npc">
        <img src="${npcImg}" alt="NPC" class="conv-portrait"><div class="conv-name">${npcName}</div>
      </div>
      <div class="conv-center">
        <div class="conv-center-blank"></div>
        <div class="conv-buttons">
          <button id="btn-talk">Talk</button>
          <button id="btn-gossip">Gossip</button>
          <button disabled>Option 3</button>
          <button disabled>Option 4</button>
        </div>
      </div>
      <div class="conv-side conv-player">
        <img src="${playerImg}" alt="Player" class="conv-portrait"><div class="conv-name">You</div>
      </div>
    </div>
    <div class="conv-chatlog" id="conv-chatlog"></div>
    <div class="conv-chatbox-row">
      <input id="conv-chatbox" class="conv-chatbox" type="text" placeholder="Type your message..." autocomplete="off" maxlength="200">
      <button id="conv-send">Send</button>
      <button id="conv-close">Close</button>
    </div>
  `;
  // Style
  Object.assign(modal.style, {
    position: 'fixed',
    zIndex: 99999,
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(20,20,22,0.92)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  });

  // Prefer to append to #ui-overlay if it exists, otherwise fallback to body
  const overlay = document.getElementById('ui-overlay');
  if (overlay) {
    overlay.appendChild(modal);
  } else {
    document.body.appendChild(modal);
  }
  // CSS classes (for clarity, could move to stylesheet)
  const style = document.createElement('style');
  style.textContent = `
    .conversation-modal .conv-content { display: flex; flex-direction: row; width: 820px; height: 320px; background: #23232a; border-radius: 14px 14px 0 0; box-shadow: 0 8px 32px #0008; }
    .conv-side { width: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 18px 8px; }
    .conv-npc { border-right: 2px solid #333; }
    .conv-player { border-left: 2px solid #333; }
    .conv-portrait { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #666; margin-bottom: 12px; background: #18181c; object-fit: cover; }
    .conv-name { font-weight: bold; color: #e0e0e0; text-align: center; }
    .conv-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 14px 0; }
    .conv-center-blank { flex: 1; min-height: 120px; }
    .conv-buttons { display: flex; flex-direction: row; gap: 8px; margin-top: 18px; }
    .conv-buttons button { min-width: 90px; padding: 7px 0; border-radius: 7px; border: none; background: #444; color: #ccc; font-size: 1em; cursor: not-allowed; opacity: 0.7; }
    .conv-chatlog { width: 820px; min-height: 80px; max-height: 160px; background: #191921; color: #e0e0e0; overflow-y: auto; font-family: monospace; font-size: 1em; padding: 9px 14px; border-radius: 0 0 0 0; margin: 0; border-top: 2px solid #333; }
    .conv-chatbox-row { width: 820px; display: flex; flex-direction: row; align-items: center; background: #23232a; border-radius: 0 0 14px 14px; padding: 10px 14px; gap: 10px; }
    .conv-chatbox { flex: 1; padding: 8px; border-radius: 7px; border: 1px solid #444; background: #111; color: #e0e0e0; font-size: 1em; }
    #conv-send, #conv-close { padding: 8px 18px; border-radius: 7px; border: none; background: #444; color: #eee; font-size: 1em; margin-left: 6px; cursor: pointer; }
    #conv-send:disabled { opacity: 0.6; cursor: not-allowed; }
    #conv-close { background: #a33; }
    #conv-close:hover { background: #d44; }
  `;
  document.head.appendChild(style);

  // Chat log state
  const chatlog = modal.querySelector('#conv-chatlog');
  let log = [];
  function appendToLog(speaker, text) {
    log.push({ speaker, text });
    chatlog.innerHTML = log.map(entry => `<b>${entry.speaker}:</b> ${entry.text}`).join('<br>');
    chatlog.scrollTop = chatlog.scrollHeight;
  }

  // Conversation option buttons
  const btnTalk = modal.querySelector('#btn-talk');
  const btnGossip = modal.querySelector('#btn-gossip');
  btnTalk.onclick = () => {
    appendToLog('You', 'Talk');
    btnTalk.disabled = true;
    setTimeout(() => appendToLog(npcName, "The wastes are unforgiving, stranger. Keep your eyes open and your blade sharp."), 600);
  };
  btnGossip.onclick = () => {
    appendToLog('You', 'Gossip');
    btnGossip.disabled = true;
    setTimeout(() => appendToLog(npcName, "Rumor is, the mutants have been seen closer to the river lately."), 600);
  };

  // Send button logic
  const chatbox = modal.querySelector('#conv-chatbox');
  const sendBtn = modal.querySelector('#conv-send');
  

  sendBtn.onclick = async () => {
    const msg = chatbox.value.trim();
    if (!msg) return;
    appendToLog("You", msg);
    chatbox.value = "";
    chatbox.focus();
  
    try {
      // Use current log (including the line we just added) as context
      const reply = await askOllama(log, msg);
      appendToLog(npcName, reply || "…");
    } catch (err) {
      console.error(err);
      appendToLog(npcName, "[Ollama error – check console]");
    }
  };

  chatbox.addEventListener('keydown', e => { if (e.key === 'Enter') sendBtn.click(); });

  // Close button
  modal.querySelector('#conv-close').onclick = () => {
    modal.remove();
    if (onClose) onClose(log);
  };

  // Focus input
  setTimeout(() => chatbox.focus(), 100);
  // Initial NPC greeting
  appendToLog(npcName, "Greetings, traveler.");
}
