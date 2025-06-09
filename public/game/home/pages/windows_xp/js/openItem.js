import { startVirus } from "./virus.js";
import { getItemByPath } from "./system.js";
import { initBonziBuddy } from "./bonziBuddy.js";

// Added currentWindow parameter to allow updating existing File Explorer
export function openItem(filePath, currentWindow = null) {
  filePath = filePath.trim().replace(/\\/g, '/');
  if (filePath !== "C:/" && filePath.endsWith("/")) {
    filePath = filePath.slice(0, -1);
  }
  const lowerFilePath = filePath.toLowerCase();

  // Special handling for Recycle Bin - always navigate to the canonical path
  if (lowerFilePath === "c:/desktop/recycle bin" || lowerFilePath === "c:/recycle bin") {
    // Check if we are already in a File Explorer window using the data-type attribute
    if (currentWindow && currentWindow.dataset.type === 'file-explorer') {
      window.updateFileExplorer(currentWindow, "C:/Recycle Bin/");
    } else {
      const win = window.createWindow("File Explorer");
      window.updateFileExplorer(win, "C:/Recycle Bin/");
    }
    return;
  }

  const item = getItemByPath(filePath);
  if (!item) {
    window.openErrorWindow(`Windows cannot find '${filePath}'. Check the spelling and try again.`);
    return;
  }

  const segments = filePath.split('/').filter(Boolean);
  const itemName = segments[segments.length - 1].toLowerCase();
  const originalItemName = segments[segments.length - 1]; // Preserve case for display

  if (itemName === "my computer") {
    // Check if we are already in a File Explorer window using the data-type attribute
    if (currentWindow && currentWindow.dataset.type === 'file-explorer') {
       window.updateFileExplorer(currentWindow, "C:/");
    } else {
       const win = window.createWindow("File Explorer");
       window.updateFileExplorer(win, "C:/");
    }
    return;
  }

  if (itemName === "control panel") {
    // Control Panel always opens a new window
    const win = window.createWindow("Control Panel");
    import("./controlPanel.js").then(module => {
      module.initControlPanel(win, window.showNotification);
    });
    return;
  }

  if (itemName === "task manager") {
    // Task Manager always opens a new window
    const win = window.createWindow("Task Manager");
    // Note: initTaskManager will be called by the windowManager
    return;
  }

  if (item.type === "app" && item.virus) {
    startVirus();
    return;
  }

  if (item.type === "shortcut") {
    if (item.target) {
      const targetItem = getItemByPath(item.target);
      // Handle shortcuts to folders specifically
      if (targetItem && targetItem.type === "folder") {
         // If called from File Explorer, update it; otherwise open potentially new explorer
         if (currentWindow && currentWindow.dataset.type === 'file-explorer') {
             window.updateFileExplorer(currentWindow, item.target + "/");
         } else {
             // Pass null for currentWindow to force a new window if needed
             openItem(item.target, null);
         }
      } else {
         // For non-folder shortcuts, pass the currentWindow context if available
         openItem(item.target, currentWindow);
      }
      return;
    } else {
      // Handle shortcuts without a valid target, maybe open properties or show error?
      // Pass currentWindow context
      openItemBasedOnName(originalItemName, filePath, currentWindow);
      return;
    }
  }


  if (item.type === "file") {
    // Opening files always creates a new window (unless handled by Open With)
    if (itemName.endsWith('.txt')) {
      const win = window.createWindow("Notepad", null);
      win.dataset.filePath = filePath;
      win.dataset.filecontent = item.content || ""; // Pass content directly
      // initNotepad will be called by windowManager
    } else if (itemName.endsWith('.bmp') || itemName.endsWith('.png') || itemName.endsWith('.jpg') || itemName.endsWith('.jpeg') || itemName.endsWith('.gif') || itemName.endsWith('.webp')) {
      const win = window.createWindow("Paint", null);
      win.dataset.filePath = filePath;
      win.dataset.filecontent = item.content;
      // initPaint will be called by windowManager, which now handles loading
    } else if (itemName.endsWith('.mp3') || itemName.endsWith('.ogg') || itemName.endsWith('.wav')) {
      const win = window.createWindow("Windows Media Player");
      win.dataset.filePath = filePath;
      win.dataset.filecontent = item.content;
      // Do not call initMusicPlayer here since windowManager automatically
      // initializes the Windows Media Player instance.
    } else {
      // Unknown file type - open the "Open With..." dialog
      const openWithWin = window.createWindow("Open With");
      import("./openWith.js").then(module => {
        module.initOpenWith(openWithWin, filePath, window.showNotification);
      });
    }
    return;
  }

  if (item.type === "folder") {
    // Check if called from an existing File Explorer window
    if (currentWindow && currentWindow.dataset.type === 'file-explorer') {
      // Update the existing window
      window.updateFileExplorer(currentWindow, filePath + "/");
    } else {
      // Open a new window
      const win = window.createWindow("File Explorer");
      window.updateFileExplorer(win, filePath + "/");
    }
    return;
  }

  if (item.type === "app") {
    // Apps generally open new windows, pass currentWindow context if needed
    openItemBasedOnName(originalItemName, filePath, currentWindow);
    return;
  }

  // Fallback for other types? Maybe just try to open a window with the name
  // Pass currentWindow context
  openItemBasedOnName(originalItemName, filePath, currentWindow);
}

// Helper function to open based on name (used for apps and fallbacks)
// Pass currentWindow context
function openItemBasedOnName(appName, filePath, currentWindow = null) {
  if (appName === "BonziBuddy") {
    initBonziBuddy(window.showNotification);
    return;
  }

  // Check if a window with this title already exists AND if it's the current window
  // This prevents opening duplicate windows from within itself (less relevant now)
  if (currentWindow && currentWindow.dataset.type === appName) {
    // Potentially bring window to front or do nothing
    currentWindow.style.zIndex = window.getNextZIndex ? window.getNextZIndex() : 100;
    return;
  }

  // Create a new window if not Bonzi or if not trying to re-open self
  const win = window.createWindow(appName);

  // Special handling for Command Prompt app by name
  if (appName === "Command Prompt" && window.initCommandPrompt) {
    window.initCommandPrompt(win, window.showNotification);
  }
  // Other app initializations might go here if needed when opened by name/fallback
}