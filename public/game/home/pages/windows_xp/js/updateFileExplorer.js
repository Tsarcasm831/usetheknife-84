import { getIcon, getFileExtension } from "./icons.js";
import { openItem } from "./openItem.js";
import { hideContextMenu } from "./contextMenu.js";
import { recycleBin, getItemByPath, copyToClipboard, pasteFromClipboard, systemClipboard } from "./system.js";

// Helper function: Given a folderPath, item key, and itemData, returns the full path.
// Only folders get an ending slash.
function getFullPath(folderPath, key, itemData) {
  if (!folderPath.endsWith("/")) folderPath += "/";
  let fullPath = folderPath + key;
  if (itemData.type === "folder") {
    fullPath += "/";
  }
  return fullPath;
}

// Helper function to move an item to the recycle bin.
function moveToRecycleBin(itemKey, itemData, parentPath) {
  const timestamp = Date.now();
  const newKey = itemKey + "_" + timestamp; // Use timestamp for unique key
  recycleBin.children[newKey] = {
    originalPath: parentPath + itemKey,
    originalName: itemKey,
    item: itemData
  };
  console.log("Moved to recycle bin:", newKey, recycleBin.children[newKey]);
}

// Helper function to get item locally without triggering errors
function getItemByPathLocal(path) {
  if (typeof path !== "string") {
    console.error("getItemByPathLocal: Provided path is not a string", path);
    return null;
  }
  const cleanPath = path.replace(/^[A-Za-z]:[\\/]/, '');
  const parts = cleanPath.split(/[\\/]/).filter(Boolean);
  let current = window.fileSystem['C:'];
  for (let part of parts) {
    if (current && current.children && current.children.hasOwnProperty(part)) {
      current = current.children[part];
    } else {
      // Handle case-insensitive matching for folders during navigation
      const matchingKey = current && current.children && Object.keys(current.children).find(
         key => key.toLowerCase() === part.toLowerCase() && current.children[key].type === 'folder'
      );
      if (matchingKey) {
          current = current.children[matchingKey];
      } else {
          return null; // Truly not found
      }
    }
  }
  return current;
}


// Helper function to export file content
async function exportFile(fileName, itemData) {
  if (!itemData || itemData.type !== 'file' || itemData.content === undefined) {
    window.showNotification(`Error: Cannot export '${fileName}'. No content found.`);
    return;
  }

  let blob;
  let mimeType = 'application/octet-stream'; // Default MIME type
  const fileExtension = getFileExtension(fileName);

  // Determine MIME type based on extension
  if (fileExtension === '.txt') {
    mimeType = 'text/plain';
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(fileExtension)) {
    mimeType = `image/${fileExtension.substring(1)}`;
  } else if (['.mp3', '.wav', '.ogg'].includes(fileExtension)) {
    mimeType = `audio/${fileExtension.substring(1)}`;
  }

  try {
    // Handle different content types
    if (typeof itemData.content === 'string') {
      if (itemData.content.startsWith('data:')) { // Data URL (e.g., from Paint)
        const response = await fetch(itemData.content);
        blob = await response.blob();
        const match = itemData.content.match(/^data:(.*?);/);
        if (match) {
          mimeType = match[1];
        }
      } else if (itemData.content.startsWith('http') || itemData.content.startsWith('/')) { // URL (e.g., Music)
         try {
            const response = await fetch(itemData.content);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            blob = await response.blob();
            const contentTypeHeader = response.headers.get('content-type');
            if (contentTypeHeader) {
                mimeType = contentTypeHeader.split(';')[0];
            }
         } catch (fetchError) {
             console.error("Error fetching file content for export:", fetchError);
             window.showNotification(`Error fetching content for '${fileName}'.`);
             return;
         }
      } else { // Plain text (e.g., from Notepad)
        blob = new Blob([itemData.content], { type: mimeType });
      }
    } else {
      window.showNotification(`Error: Cannot export '${fileName}'. Unsupported content format.`);
      return;
    }

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    window.showNotification(`Exported '${fileName}'.`);

  } catch (error) {
    console.error("Error exporting file:", error);
    window.showNotification(`Error exporting '${fileName}': ${error.message}`);
  }
}

export function updateFileExplorer(win, folderPath) {
  // Mark this window as a file explorer instance
  win.dataset.type = 'file-explorer';
  // Store reference to this window instance
  window.currentFileExplorer = win;

  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = ""; // Clear previous content
  // Use flexbox for layout: header fixed, grid scrolls
  contentArea.style.display = 'flex';
  contentArea.style.flexDirection = 'column';
  contentArea.style.height = '100%';
  contentArea.style.padding = '0'; // Remove padding from outer container

  let newFolder;
  let isRecycleBin = false;

  // Canonical path for Recycle Bin
  const recycleBinPath = "C:/Recycle Bin/";

  // Special case: If trying to open Recycle Bin, use the recycleBin object instead
  if (folderPath.toLowerCase().startsWith("c:/recycle bin")) {
    newFolder = recycleBin;
    folderPath = recycleBinPath; // Use the canonical path
    isRecycleBin = true;
  } else {
    // Try fetching from the regular file system
    newFolder = getItemByPathLocal(folderPath); // Use local version that handles case-insensitivity for navigation
  }

  // Check if newFolder is valid
  if (!newFolder || !("children" in newFolder)) {
    window.openErrorWindow(`Windows cannot find '${folderPath}'. Check the spelling and try again.`);
    setTimeout(() => {
      const pathInput = win.querySelector('input[type="text"]');
      if (pathInput) {
        pathInput.focus();
        pathInput.select();
      }
    }, 100);
    return;
  }

  const titleBarText = win.querySelector('.title-bar-text');
  const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
  let titleBarSpan = null;
  if (taskbarBtn) {
      titleBarSpan = taskbarBtn.querySelector('span');
  }

  // Update window and taskbar title
  let windowTitle = "File Explorer";
  if (isRecycleBin) {
      windowTitle = "Recycle Bin";
  } else if (folderPath === "C:/" || folderPath === "C:") {
      windowTitle = "Local Disk (C:)";
  } else {
      let parts = folderPath.split("/").filter(part => part !== '');
      windowTitle = parts[parts.length - 1] || folderPath; // Use last part or full path
  }

  if (titleBarText) {
    titleBarText.innerText = windowTitle;
  }
  if (titleBarSpan) {
      titleBarSpan.innerText = windowTitle;
  }
  win.dataset.title = windowTitle; // Update the window's dataset title


  // --- Header (Back button, Path input, Go button) ---
  const headerContainer = document.createElement('div');
  headerContainer.style.padding = "5px";
  headerContainer.style.display = "flex";
  headerContainer.style.flexDirection = "column";
  headerContainer.style.flexShrink = "0"; // Prevent header from shrinking

  const backButton = document.createElement('button');
  backButton.textContent = "Back";
  backButton.style.alignSelf = "flex-start";
  backButton.style.marginBottom = "5px";
  headerContainer.appendChild(backButton);

  const pathRow = document.createElement('div');
  pathRow.style.display = "flex";
  pathRow.style.alignItems = "center";
  const pathInput = document.createElement('input');
  pathInput.type = "text";
  // Display "Recycle Bin" in the path bar if it's the recycle bin
  pathInput.value = isRecycleBin ? "Recycle Bin" : folderPath;
  pathInput.style.flexGrow = "1";
  pathInput.style.fontWeight = "bold";
  const goButton = document.createElement('button');
  goButton.textContent = "Go";
  goButton.style.marginLeft = "5px";
  pathRow.appendChild(pathInput);
  pathRow.appendChild(goButton);
  headerContainer.appendChild(pathRow);
  contentArea.appendChild(headerContainer);

  pathInput.addEventListener('keypress', (e) => {
      if (e.key === "Enter") {
          // Translate "Recycle Bin" back to its path if user typed it
          const targetPath = pathInput.value.trim().toLowerCase() === "recycle bin" ? recycleBinPath : pathInput.value.trim();
          updateFileExplorer(win, targetPath);
      }
  });
  goButton.addEventListener('click', () => {
      const targetPath = pathInput.value.trim().toLowerCase() === "recycle bin" ? recycleBinPath : pathInput.value.trim();
      updateFileExplorer(win, targetPath);
  });
  backButton.addEventListener('click', () => {
      let currentPath = folderPath; // Use the actual folderPath passed in

      if (isRecycleBin) {
        // Go back to Desktop from Recycle Bin
        updateFileExplorer(win, "C:/Desktop/");
      } else if (currentPath === "C:/") {
         return; // Can't go back from root
      } else {
        if (currentPath.endsWith("/")) {
            currentPath = currentPath.slice(0, -1);
        }
        const parts = currentPath.split("/");
        if (parts.length > 1) {
            parts.pop();
            let newPath = parts.join("/") + "/";
            // Special case: if going back leads to "C:", use "C:/"
            if (parts.length === 1 && parts[0] === 'C:') {
                newPath = "C:/";
            }
            updateFileExplorer(win, newPath);
        }
      }
  });

  // --- Grid Container ---
  const gridContainer = document.createElement('div');
  gridContainer.style.background = "white";
  gridContainer.style.overflowY = "auto"; // Make grid scrollable
  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(100px, 1fr))";
  gridContainer.style.gap = "5px";
  gridContainer.style.padding = "10px"; // Add padding inside the scrollable area
  gridContainer.style.flexGrow = "1"; // Make it fill remaining space
  gridContainer.style.alignContent = "start";
  gridContainer.style.minHeight = "0"; // Important for flexbox scrolling
  contentArea.appendChild(gridContainer);

  // Variable to keep track of the currently selected item DOM element
  let selectedItemElement = null;

  // Context Menu for empty space in the explorer
  gridContainer.addEventListener('contextmenu', (e) => {
    if (e.target === gridContainer) {
      e.preventDefault();
      e.stopPropagation();
      const options = [];

      // Options available only if *not* in Recycle Bin
      if (!isRecycleBin) {
        options.push({
          label: 'New Folder',
          action: () => {
            const currentFolderPath = folderPath; // Use the actual folderPath
            const parentFolder = getItemByPathLocal(currentFolderPath);
            if (parentFolder && parentFolder.children) {
                let newFolderName = "New Folder";
                let counter = 1;
                while (Object.keys(parentFolder.children).some(key => key.toLowerCase() === newFolderName.toLowerCase())) {
                    newFolderName = `New Folder (${counter++})`;
                }
                parentFolder.children[newFolderName] = {
                    type: "folder",
                    children: {}
                };
                updateFileExplorer(win, currentFolderPath);
                // If creating on desktop, update desktop icons
                if (currentFolderPath === "C:/Desktop/") {
                    if (window.updateDesktopIcons) window.updateDesktopIcons();
                }
            } else {
                window.showNotification("Cannot create folder here.");
            }
            window.hideContextMenu();
          }
        });
        options.push({
          label: 'Import File',
          action: () => {
            importFile(folderPath, win);
            window.hideContextMenu();
          }
        });
        if (systemClipboard) {
          options.push({
             label: 'Paste',
             action: () => {
                 if (pasteFromClipboard(folderPath)) {
                     updateFileExplorer(win, folderPath);
                     if (folderPath === "C:/Desktop/") {
                        if (window.updateDesktopIcons) window.updateDesktopIcons();
                     }
                 }
                 window.hideContextMenu();
             }
          });
        }
      } else {
        // Options for Recycle Bin background
         options.push({
            label: 'Empty Recycle Bin',
            action: () => {
              if (Object.keys(recycleBin.children).length === 0) {
                window.showNotification('The Recycle Bin is already empty');
              } else if (confirm('Are you sure you want to permanently delete all items in the Recycle Bin?')) {
                recycleBin.children = {};
                window.showNotification('The Recycle Bin has been emptied');
                updateFileExplorer(win, folderPath); // Refresh the view
                 // If desktop icon exists, potentially update its state (though visual change might not be needed)
              }
              window.hideContextMenu();
            }
          });
      }

      options.push({
        label: 'Refresh',
        action: () => {
          updateFileExplorer(win, folderPath);
          window.hideContextMenu();
        }
      });

      window.showContextMenu(e.pageX, e.pageY, options);
    }
  });

  // Populate the grid with items
  Object.keys(newFolder.children).forEach(key => {
    const itemData = newFolder.children[key];
    const item = document.createElement('div');
    item.classList.add('file-explorer-item'); // Add class for styling
    item.style.padding = "5px";
    item.style.cursor = "pointer";
    item.style.textAlign = "center";
    item.style.height = "80px";
    item.style.position = "relative";
    item.style.borderRadius = "3px"; // Slight rounding

    let displayName = key;
    let iconSrc = "";
    let shortcutOverlay = false;
    let itemFullPath = ""; // Store the full path for non-recycle bin items

    if (isRecycleBin) {
        displayName = itemData.originalName || key; // Fallback to key if originalName is missing
        iconSrc = getIcon(displayName); // Get icon based on original name
        item.dataset.recycleKey = key; // Store the unique key within the recycle bin
    } else {
        displayName = key;
        iconSrc = getIcon(key);
        if (itemData.type === 'shortcut') {
            shortcutOverlay = true;
        }
        itemFullPath = getFullPath(folderPath, key, itemData);
        item.setAttribute('data-path', itemFullPath);
    }

    item.innerHTML = `
      <div style="position: relative; display: inline-block;">
        <img src="${iconSrc}" alt="${displayName} icon" style="width:40px; height:40px; margin-bottom:5px; display: block; margin-left: auto; margin-right: auto;">
        ${shortcutOverlay ? `<img src="shortcuticon.png" alt="Shortcut" style="position: absolute; bottom: 5px; left: 5px; width:12px; height:12px;">` : ''}
      </div>
      <div style="font-size: 12px; word-wrap: break-word; max-height: 3em; overflow: hidden;">${displayName}</div>
    `;


    // Modified handleOpen to pass the current window 'win'
    function handleOpen() {
      if (isRecycleBin) {
        window.openProperties(item); // Show properties for recycled items
      } else {
        const path = item.getAttribute('data-path');
        // Pass the current window 'win' to openItem
        if (path) openItem(path, win);
      }
    }

    // Single click selection
    item.addEventListener('click', () => {
      // Deselect previously selected item (if any)
      if (selectedItemElement && selectedItemElement !== item) {
        selectedItemElement.classList.remove('selected');
      }
      // Select the current item
      item.classList.add('selected');
      selectedItemElement = item;
    });

    item.addEventListener('dblclick', handleOpen); // Keep double click for opening

    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      let options = [];
      let currentItemPath = isRecycleBin ? (itemData.originalPath || "") : itemFullPath;
      let currentItemData = isRecycleBin ? itemData.item : itemData;
      let currentItemKey = isRecycleBin ? (itemData.originalName || key) : key;

      if (isRecycleBin) {
        // Recycle Bin item options
        options.push({
          label: 'Restore',
          action: () => {
            const recycleKey = item.dataset.recycleKey;
            const recycleEntry = recycleBin.children[recycleKey];
            if (recycleEntry && recycleEntry.originalPath) {
              const parts = recycleEntry.originalPath.split('/');
              const filename = parts.pop();
              const parentPath = parts.join('/') + "/";
              const parentFolder = getItemByPathLocal(parentPath);
              if (parentFolder && parentFolder.children) {
                let restoreName = filename;
                let counter = 1;
                while (Object.keys(parentFolder.children).some(k => k.toLowerCase() === restoreName.toLowerCase())) {
                   restoreName = `${filename.substring(0, filename.lastIndexOf('.'))}(${counter++})${filename.substring(filename.lastIndexOf('.'))}`; // Basic rename logic
                   if (counter > 100) {
                      window.showNotification("Restore failed: Could not find a unique name in original location.");
                      hideContextMenu();
                      return;
                   }
                }

                parentFolder.children[restoreName] = recycleEntry.item;
                delete recycleBin.children[recycleKey];
                updateFileExplorer(win, folderPath); // Refresh Recycle Bin view
                // If restoring to desktop, update desktop icons
                if (parentPath === "C:/Desktop/" && window.updateDesktopIcons) {
                  window.updateDesktopIcons();
                }
                window.showNotification(`Restored "${recycleEntry.originalName}" as "${restoreName}" to ${parentPath}`);
              } else {
                window.showNotification("Restore failed: original location not found or invalid.");
              }
            } else {
              window.showNotification("Restore failed: invalid recycle bin entry.");
            }
            hideContextMenu();
          }
        });
        options.push({
          label: 'Delete Permanently',
          action: () => {
            if (confirm(`Are you sure you want to permanently delete "${displayName}"?`)) {
                const recycleKey = item.dataset.recycleKey;
                delete recycleBin.children[recycleKey];
                updateFileExplorer(win, folderPath);
                window.showNotification(`Permanently deleted "${displayName}".`);
            }
            hideContextMenu();
          }
        });
        options.push({
          label: 'Properties',
          action: () => { window.openProperties(item); hideContextMenu(); }
        });
      } else {
        // Regular file/folder options
        options.push({
          label: 'Open',
          action: () => { handleOpen(); hideContextMenu(); }
        });

        options.push({
          label: 'Copy',
          action: () => {
             if (currentItemPath) {
                copyToClipboard(currentItemPath);
             }
             hideContextMenu();
          }
        });

        if (currentItemData && currentItemData.type === "file") {
           options.push({
            label: 'Open With...',
            action: () => {
              if (currentItemPath) {
                const openWithWin = window.createWindow("Open With");
                import("./openWith.js").then(module => {
                  module.initOpenWith(openWithWin, currentItemPath, window.showNotification);
                });
              }
              window.hideContextMenu();
            }
          });
           options.push({
               label: 'Export...',
               action: () => {
                   if (currentItemData) {
                       exportFile(currentItemKey, currentItemData);
                   } else {
                       window.showNotification("Error: Could not find file data to export.");
                   }
                   hideContextMenu();
               }
           });
        }

        options.push({
            label: 'Rename',
            action: () => {
              const oldName = currentItemKey;
              const newName = prompt('Enter new name:', oldName);
              if (newName && newName !== oldName && !newName.includes('/')) {
                const nameExists = Object.keys(newFolder.children).some(k => k.toLowerCase() === newName.toLowerCase() && k !== oldName);
                if (nameExists) {
                   window.showNotification(`An item named "${newName}" already exists in this folder.`);
                } else {
                    if (newFolder.children.hasOwnProperty(oldName)) {
                        const itemDataToRename = newFolder.children[oldName];
                        newFolder.children[newName] = itemDataToRename;
                        delete newFolder.children[oldName];
                        updateFileExplorer(win, folderPath);
                        // If renaming on desktop, update desktop icons
                        if (folderPath === "C:/Desktop/" && window.updateDesktopIcons) {
                            window.updateDesktopIcons();
                        }
                    } else {
                       window.showNotification("Error: Original item not found for renaming.");
                    }
                 }
              } else if (newName && newName.includes('/')) {
                 window.showNotification("Invalid character '/' in name.");
              }
              hideContextMenu();
            }
          });

        options.push({
            label: 'Delete',
            action: () => {
                if (confirm('Are you sure you want to delete "' + currentItemKey + '"?')) {
                  if (newFolder.children.hasOwnProperty(currentItemKey)) {
                    moveToRecycleBin(currentItemKey, newFolder.children[currentItemKey], folderPath);
                    delete newFolder.children[currentItemKey];
                    updateFileExplorer(win, folderPath);
                    // If deleting from desktop, update desktop icons
                    if (folderPath === "C:/Desktop/" && window.updateDesktopIcons) {
                        window.updateDesktopIcons();
                    }
                  } else {
                      window.showNotification("Error: Could not find item to delete.");
                  }
                }
                hideContextMenu();
            }
        });

        options.push({
          label: 'Properties',
          action: () => { window.openProperties(currentItemPath || item); hideContextMenu(); }
        });
      }
      window.showContextMenu(e.pageX, e.pageY, options);
    });

    gridContainer.appendChild(item);
  });
}

// Import function for file explorer (same as in desktop.js, potentially deduplicate later)
function importFile(targetPath, currentWindow) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  fileInput.addEventListener('change', async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      try {
        const url = await window.websim.upload(file);

        const folderPath = targetPath.endsWith('/') ? targetPath : targetPath + '/';
        const folder = getItemByPathLocal(folderPath);

        if (folder && folder.children) {
          // Handle potential name collisions during import
          let importName = file.name;
          let counter = 1;
          while (Object.keys(folder.children).some(key => key.toLowerCase() === importName.toLowerCase())) {
              const nameParts = file.name.split('.');
              const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '';
              const baseName = nameParts.join('.');
              importName = `${baseName} (${counter++})${extension}`;
              if (counter > 100) { 
                throw new Error("Could not find a unique name for the imported file.");
              }
          }


          let fileContent = url; 

          // Attempt to read text content for text files
          if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
            try {
                fileContent = await file.text();
            } catch (readError) {
                console.warn("Could not read text content for imported file:", readError);
                // Keep fileContent as URL if reading fails
            }
          }
          // Note: For images/audio, we'll just store the URL from websim.upload

          folder.children[importName] = {
            type: "file",
            content: fileContent 
          };

          // Refresh the current file explorer, window if it's showing the target folder
          if (currentWindow) {
              const pathInput = currentWindow.querySelector('input[type="text"]');
              // Handle case where pathInput shows "Recycle Bin"
              const currentDisplayPath = pathInput.value.trim().toLowerCase() === "recycle bin" ? "C:/Recycle Bin/" : pathInput.value.trim();
              if (currentDisplayPath === folderPath) {
                  updateFileExplorer(currentWindow, folderPath);
              }
          }
          // Refresh desktop if importing to desktop
          if (folderPath === "C:/Desktop/" && window.updateDesktopIcons) {
             window.updateDesktopIcons();
          }

          window.showNotification(`Imported file: ${importName}`);
        } else {
          window.showNotification("Error: Target folder not found.");
        }
      } catch (error) {
        console.error('Error importing file:', error);
        window.showNotification("Error importing file: " + error.message);
      }
    }

    document.body.removeChild(fileInput); // Clean up input element
  });

  fileInput.click(); // Trigger file selection dialog
}

// Determine file type based on extension (same as desktop.js)
function getFileType(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  if (['txt', 'text'].includes(extension)) {
    return 'text';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return 'image';
  } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
    return 'audio';
  }
  return 'unknown';
}
