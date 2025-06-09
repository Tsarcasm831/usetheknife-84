// Consolidated icon mapping for all apps and folders.
const iconMapping = {
  "my computer": "My Computer.ico",
  "recycle bin": "recycle-bin-683244_960_720.webp",
  "internet explorer": "Internet Explorer 6.png", 
  "paint": "21w0apjl-removebg-preview.png",
  "notepad": "46db106a40ebe01622b1694521444a59-removebg-preview(1).png",
  "snake": "54965.jpg",
  "hydra app": "hydra.webp",
  "windows media player": "media player icon.webp",
  "calculator": "Calculator.png",  
  "calendar": "https://win98icons.alexmeub.com/icons/png/calendar-4.png",
  "plants vs zombies": "ZombieHead.png",
  "minesweeper": "Minesweeper.png",
  "my documents": "MyDocuments[1].png",
  "my pictures": "fig-05_1_-removebg-preview.png",
  "my music": "My_Music_WinXP.webp",
  "minecraft": "minecraft.png",
  "roblox": "Roblox_icon_2006.svg",
  "mario": "LUMMM_icon_512px.png",
  "aol instant messenger": "aim.webp",
  "folder": "folder.png",
  "error takeover": "error.png",
  "you are an idiot": "Idioticon.png",
  "totally not a virus": "exe-icon.png",
  "bonzibuddy": "bonzi-icon.png",
  "virtualbox": "Virtualbox_logo.png",
  ".txt": "TXT.png",
  ".bmp": "Bitmap.png", 
  ".png": "Bitmap.png", 
  ".jpg": "Bitmap.png", 
  ".jpeg": "Bitmap.png",
  ".gif": "Bitmap.png", 
  ".webp": "Bitmap.png",
  ".mp3": "Generic Audio.png",
  ".wav": "Generic Audio.png", 
  ".ogg": "Generic Audio.png", 
  "command prompt": "Command Prompt.png",
  "control panel": "Control Panel.png",
  "task manager": "Task Manager.png",
  "default": "Default.png"
};

// Helper function to extract the file extension (e.g., ".txt")
export function getFileExtension(filename) {
  if (typeof filename !== 'string') return null;
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    // No extension or file starts with a dot
    return null;
  }
  return filename.substring(lastDotIndex).toLowerCase();
}

export function getIcon(appName) {
  const name = appName.toLowerCase();
  
  // Get file extension using the helper function
  const extension = getFileExtension(name);
  
  // Check for file extensions first using the map
  if (extension && iconMapping.hasOwnProperty(extension)) {
    return iconMapping[extension];
  }

  // Check for specific system items
  if (name === "my computer" || name === "recycle bin" || name === "my documents" || name === "my pictures" || name === "my music") {
    return iconMapping[name];
  }
  
  // Check for known apps/shortcuts by name
  if (iconMapping.hasOwnProperty(name)) {
    return iconMapping[name];
  }
  
  // Return the default file icon for unknown file types with an extension
  if (extension) {
    return iconMapping["default"];
  }
  
  // Default to folder icon if it's not a file and not a known app/item
  return iconMapping["folder"];
}