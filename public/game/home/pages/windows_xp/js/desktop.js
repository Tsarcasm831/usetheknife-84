import { getItemByPath, fileSystem, recycleBin, copyToClipboard, pasteFromClipboard, systemClipboard } from "./system.js";
import { getIcon, getFileExtension } from "./icons.js";
import { openItem } from "./openItem.js";
import { hideContextMenu } from "./contextMenu.js";

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

function getItemByPathLocal(path) {
  if (typeof path !== "string") {
    console.error("getItemByPath: Provided path is not a string", path);
    return null;
  }
  const cleanPath = path.replace(/^[A-Za-z]:[\\/]/, '');
  const parts = cleanPath.split(/[\\/]/).filter(Boolean);
  let current = window.fileSystem['C:'];
  for (let part of parts) {
    if (current && current.children && current.children.hasOwnProperty(part)) {
      current = current.children[part];
    } else {
      return null;
    }
  }
  return current;
}

// Helper function to move an item to the recycle bin.
function moveToRecycleBin(itemKey, itemData, parentPath) {
  const timestamp = Date.now();
  const newKey = itemKey + "_" + timestamp;
  recycleBin.children[newKey] = {
    originalPath: parentPath + itemKey,
    originalName: itemKey,
    item: itemData
  };
}

export function updateDesktopIcons() {
  const desktopFolder = fileSystem['C:'].children['Desktop'];
  const desktopIconsContainer = document.querySelector('.icons');
  desktopIconsContainer.innerHTML = "";

  if (desktopFolder && desktopFolder.children) {
    Object.keys(desktopFolder.children).forEach(appName => {
      addNewAppToDesktop(appName, null, `C:/Desktop/${appName}`, desktopFolder.children[appName].type, desktopFolder.children[appName].target || null);
    });
  }

  repositionDesktopIconsInitial();
}

export function repositionDesktopIconsInitial() {
  const desktop = document.querySelector('.desktop');
  const iconsContainer = document.querySelector('.icons');
  const icons = Array.from(iconsContainer.querySelectorAll('.icon'));
  const marginLeft = 20;
  const marginTop = 20;
  const iconWidth = 75;
  const iconHeight = 75;
  const spacingX = 20;
  const spacingY = 20;
  const desktopHeight = desktop.clientHeight;
  const maxIconsPerColumn = Math.floor((desktopHeight - marginTop) / (iconHeight + spacingY)) || 1;
  icons.forEach((icon, index) => {
    const col = Math.floor(index / maxIconsPerColumn);
    const row = index % maxIconsPerColumn;
    icon.style.left = `${marginLeft + col * (iconWidth + spacingX)}px`;
    icon.style.top = `${marginTop + row * (iconHeight + spacingY)}px`;
  });
}

export function findNextAvailablePosition() {
  const desktop = document.querySelector('.desktop');
  const icons = Array.from(document.querySelectorAll('.icon'));
  const marginLeft = 20;
  const marginTop = 20;
  const iconWidth = 75;
  const iconHeight = 75;
  const spacingX = 20;
  const spacingY = 20;
  const desktopWidth = desktop.clientWidth;
  const desktopHeight = desktop.clientHeight;
  const gridCellWidth = iconWidth + spacingX;
  const gridCellHeight = iconHeight + spacingY;
  const numCols = Math.floor((desktopWidth - marginLeft) / gridCellWidth) || 1;
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < Math.floor((desktopHeight - marginTop) / gridCellHeight); row++) {
      const posX = marginLeft + col * gridCellWidth;
      const posY = marginTop + row * gridCellHeight;
      const occupied = icons.some(icon => {
        const iconX = parseInt(icon.style.left, 10) || 0;
        const iconY = parseInt(icon.style.top, 10) || 0;
        return Math.abs(iconX - posX) < 5 && Math.abs(iconY - posY) < 5;
      });
      if (!occupied) {
        return { left: posX, top: posY };
      }
    }
  }
  return { left: marginLeft, top: marginTop };
}

export function makeDraggable(element) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  element.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    offsetX = e.clientX - element.getBoundingClientRect().left;
    offsetY = e.clientY - element.getBoundingClientRect().top;
    element.style.zIndex = ++window.zIndex;
    e.preventDefault();
  });

  element.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    isDragging = true;
    offsetX = touch.clientX - element.getBoundingClientRect().left;
    offsetY = touch.clientY - element.getBoundingClientRect().top;
    element.style.zIndex = ++window.zIndex;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      element.style.left = (e.clientX - offsetX) + 'px';
      element.style.top = (e.clientY - offsetY) + 'px';
    }
  });

  document.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      element.style.left = (touch.clientX - offsetX) + 'px';
      element.style.top = (touch.clientY - offsetY) + 'px';
      e.preventDefault();
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      const marginLeft = 20;
      const marginTop = 20;
      const iconWidth = 75;
      const iconHeight = 75;
      const spacingX = 20;
      const spacingY = 20;
      let currentX = parseInt(element.style.left, 10) || 0;
      let currentY = parseInt(element.style.top, 10) || 0;
      let col = Math.round((currentX - marginLeft) / (iconWidth + spacingX));
      let row = Math.round((currentY - marginTop) / (iconHeight + spacingY));
      let snappedX = marginLeft + col * (iconWidth + spacingX);
      let snappedY = marginTop + row * (iconHeight + spacingY);
      const allIcons = Array.from(document.querySelectorAll('.icon')).filter(icon => icon !== element);
      let overlaps = allIcons.some(icon => {
        const iconX = parseInt(icon.style.left, 10);
        const iconY = parseInt(icon.style.top, 10);
        return Math.abs(iconX - snappedX) < 5 && Math.abs(iconY - snappedY) < 5;
      });
      if (overlaps) {
        const occupiedPositions = allIcons.map(icon => ({
          x: parseInt(icon.style.left, 10),
          y: parseInt(icon.style.top, 10)
        }));
        const desktop = document.querySelector('.desktop');
        const maxColumns = Math.floor((desktop.clientWidth - marginLeft) / (iconWidth + spacingX));
        const maxRows = Math.floor((desktop.clientHeight - marginTop) / (iconHeight + spacingY));
        let minDistance = Infinity;
        let bestPosition = null;
        for (let testRow = 0; testRow < maxRows; testRow++) {
          for (let testCol = 0; testCol < maxColumns; testCol++) {
            const testX = marginLeft + testCol * (iconWidth + spacingX);
            const testY = marginTop + testRow * (iconHeight + spacingY);
            const isOccupied = occupiedPositions.some(pos =>
              Math.abs(pos.x - testX) < 5 && Math.abs(pos.y - testY) < 5
            );
            if (!isOccupied) {
              const distance = Math.sqrt(
                Math.pow(testX - currentX, 2) +
                Math.pow(testY - currentY, 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                bestPosition = { x: testX, y: testY };
              }
            }
          }
        }
        if (bestPosition) {
          snappedX = bestPosition.x;
          snappedY = bestPosition.y;
        }
      }
      element.style.left = snappedX + 'px';
      element.style.top = snappedY + 'px';
    }
    isDragging = false;
  });

  document.addEventListener('touchend', () => {
    if (isDragging) {
      const marginLeft = 20;
      const marginTop = 20;
      const iconWidth = 75;
      const iconHeight = 75;
      const spacingX = 20;
      const spacingY = 20;
      let currentX = parseInt(element.style.left, 10) || 0;
      let currentY = parseInt(element.style.top, 10) || 0;
      let col = Math.round((currentX - marginLeft) / (iconWidth + spacingX));
      let row = Math.round((currentY - marginTop) / (iconHeight + spacingY));
      let snappedX = marginLeft + col * (iconWidth + spacingX);
      let snappedY = marginTop + row * (iconHeight + spacingY);
      const allIcons = Array.from(document.querySelectorAll('.icon')).filter(icon => icon !== element);
      let overlaps = allIcons.some(icon => {
        const iconX = parseInt(icon.style.left, 10);
        const iconY = parseInt(icon.style.top, 10);
        return Math.abs(iconX - snappedX) < 5 && Math.abs(iconY - snappedY) < 5;
      });
      if (overlaps) {
        const occupiedPositions = allIcons.map(icon => ({
          x: parseInt(icon.style.left, 10),
          y: parseInt(icon.style.top, 10)
        }));
        const desktop = document.querySelector('.desktop');
        const maxColumns = Math.floor((desktop.clientWidth - marginLeft) / (iconWidth + spacingX));
        const maxRows = Math.floor((desktop.clientHeight - marginTop) / (iconHeight + spacingY));
        let minDistance = Infinity;
        let bestPosition = null;
        for (let testRow = 0; testRow < maxRows; testRow++) {
          for (let testCol = 0; testCol < maxColumns; testCol++) {
            const testX = marginLeft + testCol * (iconWidth + spacingX);
            const testY = marginTop + testRow * (iconHeight + spacingY);
            const isOccupied = occupiedPositions.some(pos =>
              Math.abs(pos.x - testX) < 5 && Math.abs(pos.y - testY) < 5
            );
            if (!isOccupied) {
              const distance = Math.sqrt(
                Math.pow(testX - currentX, 2) +
                Math.pow(testY - currentY, 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                bestPosition = { x: testX, y: testY };
              }
            }
          }
        }
        if (bestPosition) {
          snappedX = bestPosition.x;
          snappedY = bestPosition.y;
        }
      }
      element.style.left = snappedX + 'px';
      element.style.top = snappedY + 'px';
    }
    isDragging = false;
  });

  document.addEventListener('touchcancel', () => {
    isDragging = false;
  });
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
        // Extract MIME type from data URL if possible
        const match = itemData.content.match(/^data:(.*?);/);
        if (match) {
          mimeType = match[1];
        }
      } else if (itemData.content.startsWith('http') || itemData.content.startsWith('/')) { // URL (e.g., Music)
        // Fetch the content from the URL
         try {
            const response = await fetch(itemData.content);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            blob = await response.blob();
             // Get MIME type from response headers if available
            const contentTypeHeader = response.headers.get('content-type');
            if (contentTypeHeader) {
                mimeType = contentTypeHeader.split(';')[0]; // Get base MIME type
            }
         } catch (fetchError) {
             console.error("Error fetching file content for export:", fetchError);
             window.showNotification(`Error fetching content for '${fileName}'.`);
             return; // Stop export if fetch fails
         }
      } else { // Plain text (e.g., from Notepad)
        blob = new Blob([itemData.content], { type: mimeType });
      }
    } else {
      // Handle other potential content types if necessary
      window.showNotification(`Error: Cannot export '${fileName}'. Unsupported content format.`);
      return;
    }

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a); // Append link to body
    a.click();
    document.body.removeChild(a); // Clean up link
    URL.revokeObjectURL(url); // Release object URL

    window.showNotification(`Exported '${fileName}'.`);

  } catch (error) {
    console.error("Error exporting file:", error);
    window.showNotification(`Error exporting '${fileName}': ${error.message}`);
  }
}

export function addNewAppToDesktop(appName, appCode, fullPath = null, itemType = "app", linkTarget = null) {
  const desktopIcons = document.querySelector('.icons');
  // Check if an icon with this name already exists
  const existingIcon = Array.from(desktopIcons.querySelectorAll('.icon')).find(icon => icon.querySelector('span').textContent === appName);
  if (existingIcon) {
    console.log(`Icon for "${appName}" already exists on desktop. Skipping.`);
    return; // Don't add duplicates visually
  }

  const newIcon = document.createElement('div');
  newIcon.className = 'icon';
  if (fullPath) {
    newIcon.setAttribute('data-path', fullPath);
  }
  if (itemType === "file") {
    newIcon.setAttribute('data-window', "Notepad"); // Default guess
    newIcon.setAttribute('data-filePath', fullPath);
  } else if (itemType === "folder") {
    // Set attribute to open File Explorer
    newIcon.setAttribute('data-window', "File Explorer");
    newIcon.setAttribute('data-folder', 'true'); // Indicate it's a folder
  } else {
    newIcon.setAttribute('data-window', appName);
  }

  // Use getIcon to determine the correct icon source
  let iconSrc = getIcon(appName);

  let shortcutOverlay = "";
  if (itemType === "shortcut") {
    shortcutOverlay = `<img src="shortcuticon.png" alt="Shortcut" style="position: absolute; bottom: 18px; left: 10px; width:12px; height:12px;">`;
  }

  newIcon.innerHTML = `
    <img src="${iconSrc}" alt="${appName} icon" width="48" height="48">
    <span>${appName}</span>
    ${shortcutOverlay}
  `;
  desktopIcons.appendChild(newIcon);

  const pos = findNextAvailablePosition();
  newIcon.style.position = "absolute";
  newIcon.style.left = pos.left + "px";
  newIcon.style.top = pos.top + "px";

  makeDraggable(newIcon);

  newIcon.addEventListener('dblclick', (e) => {
    e.preventDefault();
    const path = newIcon.getAttribute('data-path');
    if (path) openItem(path);
  });

  let lastTap = 0;
  newIcon.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
      e.preventDefault();
      const path = newIcon.getAttribute('data-path');
      if (path) openItem(path);
    }
    lastTap = currentTime;
  });

  newIcon.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent desktop context menu from showing
    let options = [];
    const currentItemPath = newIcon.getAttribute('data-path');
    const currentItemData = getItemByPath(currentItemPath);

    if (appName.toLowerCase() === "recycle bin") {
      options.push({
        label: 'Open',
        action: () => {
          const path = newIcon.getAttribute('data-path');
          if (path) openItem(path);
          window.hideContextMenu();
        }
      });

      options.push({
        label: 'Empty Recycle Bin',
        action: () => {
          if (Object.keys(recycleBin.children).length === 0) {
            window.showNotification('The Recycle Bin is already empty');
          } else if (confirm('Are you sure you want to permanently delete all items in the Recycle Bin?')) {
            recycleBin.children = {};
            window.showNotification('The Recycle Bin has been emptied');
            const recycleBinWindow = Array.from(document.querySelectorAll('.window')).find(win =>
              win.querySelector('.title-bar-text')?.textContent === 'Recycle Bin'
            );
            if (recycleBinWindow) {
              window.updateFileExplorer(recycleBinWindow, "C:/Desktop/Recycle Bin/");
            }
          }
          window.hideContextMenu();
        }
      });

      options.push({
        label: 'Properties',
        action: () => { window.openProperties(newIcon); window.hideContextMenu(); }
      });
    } else {
      options.push({
        label: 'Open',
        action: () => {
          const path = newIcon.getAttribute('data-path');
          if (path) openItem(path);
          window.hideContextMenu();
        }
      });

      options.push({
        label: 'Copy',
        action: () => {
          const path = newIcon.getAttribute('data-path');
          if (path) {
            copyToClipboard(path);
          }
          window.hideContextMenu();
        }
      });

      if (itemType === "file") {
        options.push({
          label: 'Open With...',
          action: () => {
            const filePath = newIcon.getAttribute('data-path');
            if (filePath) {
              const openWithWin = window.createWindow("Open With");
              import("./openWith.js").then(module => {
                module.initOpenWith(openWithWin, filePath, window.showNotification);
              });
            }
            window.hideContextMenu();
          }
        });

        options.push({
          label: 'Export...',
          action: () => {
            const filePath = newIcon.getAttribute('data-path');
            const itemData = getItemByPath(filePath); 
            if (itemData) {
              exportFile(appName, itemData);
            } else {
              window.showNotification(`Error: Could not find file data for '${appName}' to export.`);
            }
            window.hideContextMenu();
          }
        });
      }

      options.push({
        label: 'Rename',
        action: () => {
          const oldName = newIcon.querySelector('span').textContent;
          const newName = prompt('Enter new name:', oldName);
          if (newName && newName !== oldName) {
            newIcon.querySelector('span').textContent = newName;
            const desktopFolder = fileSystem['C:'].children['Desktop'];
            if (desktopFolder && desktopFolder.children.hasOwnProperty(oldName)) {
              const itemData = desktopFolder.children[oldName]; 
              desktopFolder.children[newName] = itemData; 
              delete desktopFolder.children[oldName]; 
            }
            let newPath = `C:/Desktop/${newName}`;
            if (itemType === "folder") {
              newPath += "/";
            }
            newIcon.setAttribute('data-path', newPath);
          }
          window.hideContextMenu();
        }
      });

      options.push({
        label: 'Delete',
        action: () => {
          if (confirm('Are you sure you want to delete this item?')) {
            const desktopFolder = fileSystem['C:'].children['Desktop'];
            const iconName = newIcon.querySelector('span').textContent;
            if (desktopFolder && desktopFolder.children.hasOwnProperty(iconName)) {
              moveToRecycleBin(iconName, desktopFolder.children[iconName], "C:/Desktop/");
              delete desktopFolder.children[iconName];
            }
            newIcon.remove();
            repositionDesktopIconsInitial();
          }
          window.hideContextMenu();
        }
      });

      options.push({
        label: 'Properties',
        action: () => { window.openProperties(newIcon.getAttribute('data-path') || newIcon); window.hideContextMenu(); }
      });
    }

    window.showContextMenu(e.pageX, e.pageY, options);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const desktop = document.querySelector('.desktop');
  desktop.addEventListener('contextmenu', (e) => {
    if (e.target === desktop || e.target.classList.contains('icons')) {
      e.preventDefault();
      let options = [
        {
          label: 'New Folder',
          action: () => {
            const desktopFolder = fileSystem['C:'].children['Desktop'];
            let newFolderName = "New Folder";
            let counter = 1;
            while (desktopFolder.children.hasOwnProperty(newFolderName)) {
              newFolderName = `New Folder (${counter++})`;
            }
            desktopFolder.children[newFolderName] = {
              type: "folder",
              children: {}
            };
            addNewAppToDesktop(newFolderName, null, `C:/Desktop/${newFolderName}/`, "folder");
            window.hideContextMenu();
          }
        },
        {
          label: 'Import File',
          action: () => {
            importFile("C:/Desktop/");
            window.hideContextMenu();
          }
        },
        {
          label: 'Refresh',
          action: () => {
            updateDesktopIcons();
            window.hideContextMenu();
          }
        }
      ];

      if (systemClipboard) {
        options.push({
          label: 'Paste',
          action: () => {
            if (pasteFromClipboard("C:/Desktop/")) {
              updateDesktopIcons();
            }
            window.hideContextMenu();
          }
        });
      }

      window.showContextMenu(e.pageX, e.pageY, options);
    }
  });
});

function importFile(targetPath) {
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
          const fileType = getFileType(file.name);
          let fileContent = url;

          if (file.type === 'text/plain') {
            fileContent = await file.text();
          } else if (file.type.startsWith('audio/')) {
            const audioExtension = file.name.split('.').pop().toLowerCase();
            if (audioExtension === 'mp3' || audioExtension === 'wav' || audioExtension === 'ogg') { 
              fileContent = url;
            }
          }

          folder.children[file.name] = {
            type: "file",
            content: fileContent
          };

          if (folderPath === "C:/Desktop/") {
            updateDesktopIcons(); 
          }

          if (window.currentFileExplorer) {
            const explorerPathInput = window.currentFileExplorer.querySelector('input[type="text"]');
            if (explorerPathInput && explorerPathInput.value === folderPath) {
              window.updateFileExplorer(window.currentFileExplorer, folderPath); 
            }
          }

          window.showNotification(`Imported file: ${file.name}`);
        } else {
          window.showNotification("Error: Target folder not found.");
        }
      } catch (error) {
        console.error('Error importing file:', error);
        window.showNotification("Error importing file: " + error.message);
      }
    }

    document.body.removeChild(fileInput);
  });

  fileInput.click();
}

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