// Open With... dialog logic

import { getItemByPath } from "./system.js";
import { getIcon } from "./icons.js";

export function initOpenWith(win, filePath, showNotification) {
  const contentArea = win.querySelector('.window-content');
  contentArea.innerHTML = "";
  contentArea.style.padding = "15px";
  contentArea.style.fontFamily = 'Tahoma, sans-serif';

  const segments = filePath.split('/');
  const fileName = segments[segments.length - 1];

  // Message at the top
  const message = document.createElement('p');
  message.textContent = `Choose the program you want to use to open this file:`;
  contentArea.appendChild(message);

  // File info
  const fileInfo = document.createElement('div');
  fileInfo.style.display = 'flex';
  fileInfo.style.alignItems = 'center';
  fileInfo.style.border = '1px solid #ccc';
  fileInfo.style.padding = '10px';
  fileInfo.style.marginBottom = '15px';
  fileInfo.style.backgroundColor = '#f8f8f8';

  const fileIcon = document.createElement('img');
  fileIcon.src = getIcon(fileName); // Get icon based on filename/extension
  fileIcon.style.width = '32px';
  fileIcon.style.height = '32px';
  fileIcon.style.marginRight = '10px';

  const fileNameSpan = document.createElement('span');
  fileNameSpan.textContent = `File: ${fileName}`;
  fileNameSpan.style.fontWeight = 'bold';

  fileInfo.appendChild(fileIcon);
  fileInfo.appendChild(fileNameSpan);
  contentArea.appendChild(fileInfo);

  // Program list
  const programListLabel = document.createElement('p');
  programListLabel.textContent = 'Programs:';
  contentArea.appendChild(programListLabel);

  const programListContainer = document.createElement('div');
  programListContainer.style.height = '150px';
  programListContainer.style.overflowY = 'auto';
  programListContainer.style.border = '1px solid #ccc';
  programListContainer.style.marginBottom = '15px';
  programListContainer.style.backgroundColor = 'white';

  // Define available programs
  const availablePrograms = [
    { name: 'Notepad', type: 'app' },
    { name: 'Paint', type: 'app' },
    { name: 'Windows Media Player', type: 'app' },
    { name: 'Internet Explorer', type: 'app' },
    { name: 'Command Prompt', type: 'app' },
    // Add more programs as needed
  ];

  let selectedProgramElement = null;
  let selectedProgramName = null;

  availablePrograms.forEach(program => {
    const programItem = document.createElement('div');
    programItem.style.display = 'flex';
    programItem.style.alignItems = 'center';
    programItem.style.padding = '5px';
    programItem.style.cursor = 'pointer';
    programItem.dataset.programName = program.name;

    const programIcon = document.createElement('img');
    programIcon.src = getIcon(program.name);
    programIcon.style.width = '20px';
    programIcon.style.height = '20px';
    programIcon.style.marginRight = '8px';

    const programNameSpan = document.createElement('span');
    programNameSpan.textContent = program.name;

    programItem.appendChild(programIcon);
    programItem.appendChild(programNameSpan);

    programItem.addEventListener('click', () => {
      if (selectedProgramElement) {
        selectedProgramElement.style.backgroundColor = 'white';
        selectedProgramElement.style.color = 'black';
      }
      selectedProgramElement = programItem;
      selectedProgramName = program.name;
      programItem.style.backgroundColor = '#316AC5'; // XP selection blue
      programItem.style.color = 'white';
      okButton.disabled = false; // Enable OK button
    });

    programItem.addEventListener('dblclick', () => {
      if (selectedProgramElement) {
        selectedProgramElement.style.backgroundColor = 'white';
        selectedProgramElement.style.color = 'black';
      }
      selectedProgramElement = programItem;
      selectedProgramName = program.name;
      programItem.style.backgroundColor = '#316AC5'; // XP selection blue
      programItem.style.color = 'white';
      okButton.disabled = false; // Enable OK button
      openFileWithSelectedProgram(); // Open on double click
    });

    programListContainer.appendChild(programItem);
  });

  contentArea.appendChild(programListContainer);

  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'flex-end';
  buttonContainer.style.gap = '10px';

  const okButton = document.createElement('button');
  okButton.textContent = 'OK';
  okButton.disabled = true; // Initially disabled
  okButton.addEventListener('click', openFileWithSelectedProgram);

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => {
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
    else win.remove();
  });

  buttonContainer.appendChild(okButton);
  buttonContainer.appendChild(cancelButton);
  contentArea.appendChild(buttonContainer);

  // Function to open the file with the chosen program
  function openFileWithSelectedProgram() {
    if (!selectedProgramName) return;

    const item = getItemByPath(filePath);
    if (!item) {
      showNotification(`Error: Could not find file ${fileName}.`);
      return;
    }

    try {
      let targetWindow;
      // Based on the selected program, create the appropriate window and init
      switch (selectedProgramName) {
        case 'Notepad':
          targetWindow = window.createWindow("Notepad");
          targetWindow.dataset.filePath = filePath;
          targetWindow.dataset.filecontent = item.content || "";
          // initNotepad is handled by windowManager now
          break;
        case 'Paint':
          targetWindow = window.createWindow("Paint");
          targetWindow.dataset.filePath = filePath;
          targetWindow.dataset.filecontent = item.content;
          // initPaint is handled by windowManager
          break;
        case 'Windows Media Player':
          targetWindow = window.createWindow("Windows Media Player");
          targetWindow.dataset.filePath = filePath;
          targetWindow.dataset.filecontent = item.content;
          // initMusicPlayer needs to be called specifically after window creation
          setTimeout(() => {
            if (window.initMusicPlayer) {
              window.initMusicPlayer(targetWindow, window.showNotification, item.content);
            }
          }, 0);
          break;
        case 'Internet Explorer':
          targetWindow = window.createWindow("Internet Explorer");
          // Try to load the file content in IE - might work for simple text/html
          setTimeout(() => {
            const ieContent = targetWindow.querySelector('#ie-content');
            const urlBar = targetWindow.querySelector('#url-bar');
            if (ieContent && urlBar) {
              urlBar.value = `file:///${filePath.replace('C:/', '')}`; // Show a file path representation
              if (typeof item.content === 'string') {
                // Attempt to display content directly if it's text-based
                if (item.content.startsWith('<') || item.content.includes('html')) {
                  ieContent.srcdoc = item.content;
                } else {
                  ieContent.srcdoc = `<pre>${item.content}</pre>`;
                }
              } else {
                ieContent.srcdoc = `<p>Cannot display this file type in Internet Explorer.</p>`;
              }
            }
          }, 100);
          break;
        case 'Command Prompt':
          targetWindow = window.createWindow("Command Prompt");
          // No specific file opening logic for CMD prompt here
          break;
        default:
          showNotification(`Cannot open file with ${selectedProgramName}.`);
          return; // Don't close the dialog if program is invalid
      }

      // Close the "Open With..." dialog
      const closeBtn = win.querySelector('button[aria-label="Close"]');
      if (closeBtn) closeBtn.click();
      else win.remove();

    } catch (error) {
      console.error(`Error opening file with ${selectedProgramName}:`, error);
      showNotification(`Error opening file: ${error.message}`);
    }
  }

  // Adjust window size
  win.style.width = "400px";
  win.style.height = "auto"; // Auto height based on content
}