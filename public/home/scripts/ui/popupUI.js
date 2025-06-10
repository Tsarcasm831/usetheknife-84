/* popupUI.js – minimalist UI module for dialogues, inventories & generic pop-ups
   -----------------------------------------------------------------------------
   Usage
   -----
   1.  import { initPopupUI, showDialogue, showInventory, showPopup } from './popupUI.js';
   2.  Call `initPopupUI(containerElement)` **once** after your renderer canvas is in the DOM.
       – If you omit the argument it falls back to `document.body`.
   3.  When the player presses **F** inside `interactWithHumanoid()` decide what to open:
         •   NPC  →  `showDialogue(name, [line1, line2, ...])`
         •   Chest→  `showInventory('Chest', itemsArray)`
         •   Anything else →  `await showPopup({title, html, buttons})`
   -----------------------------------------------------------------------------*/

/* --------------------------------------------------------------------------- */
/*  PUBLIC API                                                                 */
/* --------------------------------------------------------------------------- */
export function initPopupUI(parent = document.body) {
  if (document.getElementById('ui-overlay')) return;          // already created

  // Root overlay keeps all UI above WebGL canvas
  const overlay = document.createElement('div');
  overlay.id = 'ui-overlay';
  Object.assign(overlay.style, {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: 50
  });
  parent.appendChild(overlay);

  // Inject component skeletons ------------------------------------------------
  overlay.insertAdjacentHTML('beforeend', `
    <div id="dialogueBox" class="popup hidden">
      <div class="dlg-header"><span id="dialogue-npc-name"></span></div>
      <div class="dlg-content" id="dialogue-content"></div>
      <div class="dlg-footer"><button id="dialogue-next-btn">Next</button></div>
    </div>

    <div id="inventoryWindow" class="popup hidden">
      <div class="inv-header"><span id="inventory-title"></span><button id="inventory-close">×</button></div>
      <div class="inv-grid" id="inventory-grid"></div>
    </div>`);

  // Inject styles -------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    /* --- generic ---------------------------------------------------------- */
    .popup{position:absolute;background:rgba(20,20,22,.92);color:#e0e0e0;
           border:2px solid #555;border-radius:8px;font-family:'Segoe UI',sans-serif;
           box-shadow:0 0 12px rgba(0,0,0,.6);pointer-events:auto;user-select:none;}
    .hidden{display:none;}

    /* --- dialogue --------------------------------------------------------- */
    #dialogueBox{width:32%;min-width:330px;bottom:6%;left:50%;transform:translateX(-50%);}  
    .dlg-header{padding:6px 10px;font-weight:600;letter-spacing:.5px;background:#2f2f2f;
                border-bottom:1px solid #444;text-transform:uppercase;}
    .dlg-content{padding:14px 16px;line-height:1.4;max-height:38vh;overflow-y:auto;}
    .dlg-footer{display:flex;justify-content:flex-end;padding:10px 14px;}
    .dlg-footer button{padding:6px 20px;border-radius:4px;border:0;background:#555;
                       color:#eee;cursor:pointer;}
    .dlg-footer button:hover{background:#777;}

    /* --- inventory -------------------------------------------------------- */
    #inventoryWindow{width:42%;min-width:380px;top:50%;left:50%;transform:translate(-50%,-50%);}  
    .inv-header{display:flex;justify-content:space-between;align-items:center;
                padding:6px 10px;background:#2f2f2f;border-bottom:1px solid #444;}
    .inv-header button{border:0;background:none;color:#ccc;font-size:20px;cursor:pointer;}
    .inv-grid{display:grid;grid-template-columns:repeat(auto-fill,64px);gap:8px;padding:14px;}
    .inv-slot{width:64px;height:64px;background:#222;border:1px solid #555;
              display:flex;align-items:center;justify-content:center;font-size:.8rem;}
    .inv-slot img{max-width:56px;max-height:56px;pointer-events:none;}
  `;
  document.head.appendChild(style);
}

export function showDialogue(npcName, lines = [], onComplete) {
  initPopupUI();                                       // safety – create if needed
  const box = document.getElementById('dialogueBox');
  const nameEl = document.getElementById('dialogue-npc-name');
  const textEl = document.getElementById('dialogue-content');
  const nextBtn = document.getElementById('dialogue-next-btn');

  let idx = 0;
  nameEl.textContent = npcName || '';

  const advance = () => {
    if (idx < lines.length) {
      textEl.textContent = lines[idx++];
    } else {
      nextBtn.removeEventListener('click', advance);
      hide(box);
      onComplete?.();
    }
  };

  nextBtn.addEventListener('click', advance);
  show(box);
  advance();
}

export function showInventory(title, items = [], onClose) {
  initPopupUI();
  const win   = document.getElementById('inventoryWindow');
  const grid  = document.getElementById('inventory-grid');
  const close = document.getElementById('inventory-close');
  document.getElementById('inventory-title').textContent = title || 'Inventory';

  grid.innerHTML = '';
  items.forEach(it => {
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    if (it.icon) {
      const img = document.createElement('img');
      img.src = it.icon; slot.appendChild(img);
    } else {
      slot.textContent = it.label || it.id || '?';
    }
    grid.appendChild(slot);
  });

  const closeHandler = () => { hide(win); close.removeEventListener('click', closeHandler); onClose?.(); };
  close.addEventListener('click', closeHandler);
  show(win);
}

export function showPopup({ title = '', html = '', buttons = [{ label: 'OK', value: 'ok' }] } = {}) {
  return new Promise(resolve => {
    initPopupUI();
    const modal = document.createElement('div');
    modal.className = 'popup';
    Object.assign(modal.style, { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' });

    modal.innerHTML = `
      <div class="inv-header"><span>${title}</span></div>
      <div style="padding:14px;max-height:46vh;overflow-y:auto;">${html}</div>
      <div style="padding:10px 14px;display:flex;justify-content:flex-end;gap:8px;"></div>`;

    const btnRow = modal.lastElementChild;
    buttons.forEach(btnCfg => {
      const b = document.createElement('button');
      b.textContent = btnCfg.label;
      b.addEventListener('click', () => { modal.remove(); resolve(btnCfg.value); });
      btnRow.appendChild(b);
    });

    document.getElementById('ui-overlay').appendChild(modal);
  });
}

/* --------------------------------------------------------------------------- */
/*  CONVERSATION MODAL (Diablo II-style)                                       */
/* --------------------------------------------------------------------------- */

// showConversationModal moved to scripts/conversationModal.js

/* --------------------------------------------------------------------------- */
/*  INTERNAL UTILS                                                             */
/* --------------------------------------------------------------------------- */
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden');
}
