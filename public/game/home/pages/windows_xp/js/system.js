// Global system state: file system and utility functions.
export const fileSystem = {
  'C:': {
    type: "folder",
    children: {
      'Desktop': {
        type: "folder",
        children: {
          'My Computer': { type: "app" },
          'Recycle Bin': { type: "app" },  
          'Internet Explorer': { type: "shortcut", target: "C:/Apps/Internet Explorer/" },
          'Notepad': { type: "shortcut", target: "C:/Apps/Notepad/" },
          'Paint': { type: "shortcut", target: "C:/Apps/Paint/" },
          'Calculator': { type: "shortcut", target: "C:/Apps/Calculator/" },
          'Calendar': { type: "shortcut", target: "C:/Apps/Calendar/" },
          'Windows Media Player': { type: "shortcut", target: "C:/Apps/Windows Media Player/" },
          'Snake': { type: "shortcut", target: "C:/Games/Snake/" },
          'Minesweeper': { type: "shortcut", target: "C:/Games/Minesweeper/" },
          'Plants vs Zombies': { type: "shortcut", target: "C:/Games/Plants vs Zombies/" },
          'Minecraft': { type: "shortcut", target: "C:/Games/Minecraft/" },
          'Roblox': { type: "shortcut", target: "C:/Games/Roblox/" },
          'Mario': { type: "shortcut", target: "C:/Games/Mario/" },
          'AOL Instant Messenger': { type: "shortcut", target: "C:/Apps/AOL Instant Messenger/" },
          'Command Prompt': { type: "shortcut", target: "C:/Apps/Command Prompt/" },
          'BonziBuddy': { type: "shortcut", target: "C:/Apps/BonziBuddy/" },
          'VirtualBox': { type: "shortcut", target: "C:/Apps/VirtualBox/" },
          'README.txt': { 
            type: "file", 
            content: "I hope you enjoy this Windows XP recreation made by me, BookwormKevin. Be careful with the programs located in the Danger folder, because some of them have flashing lights and loud sounds. Some of the icons come from this HD icon pack: https://www.deviantart.com/marchmountain/art/Windows-XP-High-Resolution-Icon-Pack-916042853. I am planning to add apps to this over time, so please comment what you want to see me add!"
          },
          'DANGER!!!': {
            type: "folder",
            children: {
              'Hydra App': { type: "shortcut", target: "C:/Apps/Hydra App/" },
              'Error Takeover': { type: "shortcut", target: "C:/Apps/Error Takeover/" },
              'You Are An Idiot': { type: "shortcut", target: "C:/Apps/You Are An Idiot/" },
              'totally not a virus': { type: "app", virus: true }
            }
          }
        }
      },
      'Games': {
        type: "folder",
        children: {
          'Snake': { type: "app" },
          'Minesweeper': { type: "app" },
          'Hydra App': { type: "app" },
          'Plants vs Zombies': { type: "app" },
          'Minecraft': { type: "app" },
          'Roblox': { type: "app" },
          'Mario': { type: "app" }
        }
      },
      'Apps': {
        type: "folder",
        children: {
          'Internet Explorer': { type: "app" },
          'Notepad': { type: "app" },
          'Paint': { type: "app" },
          'Calculator': { type: "app" },
          'Calendar': { type: "app" },
          'Windows Media Player': { type: "app" },
          'Error Takeover': { type: "app" },
          'Hydra App': { type: "app" },
          'You Are An Idiot': { type: "app" },
          'AOL Instant Messenger': { type: "app" },
          'Command Prompt': { type: "app" },
          'BonziBuddy': { type: "app" },
          'VirtualBox': { type: "app" },
          'Control Panel': { type: "app" },
          'Task Manager': { type: "app" }
        }
      },
      'Program Files': {
        type: "folder",
        children: {
          'Paint': { type: "app" }
        }
      },
      'Users': {
        type: "folder",
        children: {
          'User': {
            type: "folder",
            children: {
              'Documents': {
                type: "folder",
                children: {
                  'readme.txt': { type: "file", content: "This is a sample text file in My Documents." },
                  'notepad.txt': { type: "file", content: "Some text content for Notepad" }
                }
              },
              'Pictures': { type: "folder", children: {} },
              'Music': { 
                type: "folder", 
                children: {
                  'Jetpack Joyride Theme.mp3': { type: "file", content: "music_JetpackJoyride.mp3" },
                  'Super Mario 64 - Dire Dire Docks.mp3': { type: "file", content: "music_DireDireDocks.mp3" },
                  'Relaxed Scene.mp3': { type: "file", content: "music_RelaxedScene.mp3" },
                  'Kevin MacLeod - New Friendly.mp3': { type: "file", content: "music_NewFriendly.mp3" },
                  'Green Hill Zone - Act 1.mp3': { type: "file", content: "music_GreenHillZone.mp3" },
                  'Nintendo Wii - Mii Channel Theme.mp3': { type: "file", content: "music_MiiChannel.mp3" },
                  'Geometry Dash - Stereo Madness.mp3': { type: "file", content: "music_StereoMadness.mp3" },
                  'Minecraft - Sweden.mp3': { type: "file", content: "music_MinecraftSweeden.mp3" },
                  'Wii U - Mii Maker Theme.mp3': { type: "file", content: "music_MiiMakerWiiU.mp3" },
                  'Wii Sports Theme.mp3': { type: "file", content: "music_WiiSports.mp3" },
                  'Plants vs Zombies - Day Stage.mp3': { type: "file", content: "music_PvZDay.mp3" },
                  'Windows XP installation music [HD].mp3': { type: "file", content: "music_WindowsXP.mp3" },
                  'Tomodachi Collection - Making a Friend.mp3': { type: "file", content: "music_MakingAFriend.mp3" },
                  'DKC2 - Stickerbush Symphony.mp3': { type: "file", content: "music_StickerbushSymphony.mp3" },
                  'Wii Party - Main Menu.mp3': { type: "file", content: "music_WiiParty.mp3" }
                }
              }
            }
          }
        }
      }
    }
  }
};

// Clipboard state
export let systemClipboard = null; // Stores { name: string, data: object }

// Internal counter for window z-index management.
let internalZIndex = 1;
export function getNextZIndex() {
  return internalZIndex++;
}

let windowCounter = 0; 
export function getNextWindowId() {
  return windowCounter++;
}

// Simple deep copy function for plain objects and primitives
export function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj; // Return primitives directly
  }

  if (Array.isArray(obj)) {
    return obj.map(deepCopy); // Recursively copy array elements
  }

  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = deepCopy(obj[key]); // Recursively copy object properties
    }
  }
  return newObj;
}

export function copyToClipboard(sourcePath) {
  const item = getItemByPath(sourcePath);
  if (item) {
    const parts = sourcePath.replace(/\/$/, '').split('/'); // Remove trailing slash if exists before split
    const name = parts[parts.length - 1];
    // Store a deep copy of the data, not a reference
    systemClipboard = { name: name, data: deepCopy(item) };
    if (window.showNotification) {
        window.showNotification(`Copied "${name}" to clipboard.`);
    }
    console.log("Copied to clipboard:", systemClipboard);
  } else {
    systemClipboard = null; // Clear clipboard if source not found
    if (window.showNotification) {
        window.showNotification(`Error: Could not find item to copy at ${sourcePath}.`);
    }
    console.error("Copy failed: Item not found at", sourcePath);
  }
}

export function pasteFromClipboard(targetFolderPath) {
  if (!systemClipboard || !systemClipboard.data) {
    if (window.showNotification) {
        window.showNotification("Clipboard is empty.");
    }
    return false; // Nothing to paste
  }

  // Ensure target path ends with a slash
  if (!targetFolderPath.endsWith('/')) {
    targetFolderPath += '/';
  }

  const targetFolder = getItemByPath(targetFolderPath);
  if (!targetFolder || targetFolder.type !== 'folder' || !targetFolder.children) {
     if (window.showNotification) {
        window.showNotification(`Error: Cannot paste into "${targetFolderPath}". Invalid location.`);
     }
    console.error("Paste failed: Target folder not found or invalid", targetFolderPath);
    return false; // Invalid target
  }

  let newName = systemClipboard.name;
  let counter = 1;
  const baseName = newName.replace(/ \(\d+\)$/, '').replace(/^Copy of /, ''); // Base name without "Copy of" or "(n)"

  // Handle initial "Copy of" prefix if pasting in the same folder (check is simplified here, assumes different folder paste always needs a check)
  // A more robust check would compare source and target paths.
  const nameExists = (name) => Object.keys(targetFolder.children).some(key => key.toLowerCase() === name.toLowerCase());

  if (nameExists(newName)) {
      newName = `Copy of ${baseName}`;
  }

  // Handle further collisions with "(n)" suffix
  while (nameExists(newName)) {
    counter++;
    newName = `Copy of ${baseName} (${counter})`;
    // Safety break for extreme cases
    if (counter > 100) {
        if (window.showNotification) {
            window.showNotification("Error: Could not find a unique name to paste.");
        }
        console.error("Paste failed: Could not generate unique name after 100 attempts");
        return false;
    }
  }

  // Add the deep copied data to the target folder
  targetFolder.children[newName] = deepCopy(systemClipboard.data);
   if (window.showNotification) {
        window.showNotification(`Pasted "${newName}" into ${targetFolderPath}.`);
   }
  console.log("Pasted item:", newName, "into", targetFolderPath);
  return true; // Success
}

export function getItemByPath(path) {
  const cleanPath = path.replace(/^[A-Za-z]:[\\/]/, '');
  const parts = cleanPath.split(/[\\/]/).filter(Boolean);
  let current = fileSystem['C:'];
  for (let part of parts) {
    if (current && current.children && current.children.hasOwnProperty(part)) {
      current = current.children[part];
    } else {
      return null;
    }
  }
  return current;
}

// New helper: splits a full file path into its parent folder and filename.
export function getFolderAndFilename(path) {
  if (!path.startsWith("C:/")) return { folder: null, filename: null };
  const withoutRoot = path.slice(3); // Remove "C:/"
  const parts = withoutRoot.split('/').filter(Boolean);
  if (parts.length === 0) return { folder: fileSystem['C:'], filename: "" };
  const filename = parts.pop();
  let current = fileSystem['C:'];
  parts.forEach(part => {
    if (current && current.children && current.children[part]) {
      current = current.children[part];
    } else {
      current = null;
    }
  });
  return { folder: current, filename: filename };
}

// Added recycleBin as a special, separate folder.
export const recycleBin = {
  type: "recyclebin",
  children: {}
};