import { getFolderAndFilename, getItemByPath } from "./system.js";

export function initPaint(win, showNotification) {
  const container = win.querySelector('.window-content');
  container.innerHTML = ""; // clear existing content
  
  // Create a button container for Save and Export (common functionality like Notepad)
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'paint-buttons';
  buttonContainer.style.marginBottom = '5px';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '5px';
  container.appendChild(buttonContainer);

  // Save button: saves the canvas image data URL into the filesystem.
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png'); // Save as PNG data URL
    if (win.dataset.filePath) {
      const { folder, filename } = getFolderAndFilename(win.dataset.filePath);
      if (folder && filename) {
        // Ensure filename ends with .bmp for consistency, but content is PNG data URL
        const finalFilename = filename.endsWith('.bmp') ? filename : filename + '.bmp';
        folder.children[finalFilename] = { type: "file", content: dataURL };
        win.dataset.filePath = win.dataset.filePath.replace(filename, finalFilename); // Update path if extension changed
        showNotification(`Picture saved to ${win.dataset.filePath}`);
        // Update window title
        const titleBar = win.querySelector('.title-bar-text');
        if (titleBar) {
            titleBar.textContent = finalFilename + " - Paint";
        }
        const taskbarBtn = document.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
        if (taskbarBtn) {
          const span = taskbarBtn.querySelector('span');
          if (span) span.innerText = titleBar.textContent;
        }

      } else {
        showNotification("Error saving file: Invalid path.");
      }
    } else {
      // Open Save As window if no filePath is set.
      const saveAsWin = window.createWindow("Save As");
      import("./saveAs.js").then(module => {
        module.initSaveAs(saveAsWin, win, showNotification);
      });
    }
  });
  buttonContainer.appendChild(saveBtn);
  
  // Export button: download the current canvas as a PNG file.
  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export';
  exportBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    // Ensure exported file has .png extension
    let downloadName = win.dataset.filePath ? win.dataset.filePath.split('/').pop() : 'untitled.bmp';
    if (downloadName.toLowerCase().endsWith('.bmp')) {
      downloadName = downloadName.substring(0, downloadName.lastIndexOf('.')) + '.png';
    } else if (!downloadName.toLowerCase().endsWith('.png')) {
       downloadName += '.png';
    }
    a.download = downloadName;
    a.click();
    showNotification(`Picture exported as ${a.download}`);
  });
  buttonContainer.appendChild(exportBtn);
  
  // Create main container holding tools and canvas
  const mainContainer = document.createElement('div');
  mainContainer.style.display = 'flex';
  mainContainer.style.gap = '10px';
  mainContainer.style.alignItems = 'flex-start';
  
  // Tools container (left column) – same as before
  const toolContainer = document.createElement('div');
  toolContainer.style.display = 'flex';
  toolContainer.style.flexDirection = 'column';
  toolContainer.style.gap = '10px';
  
  const brushBtn = document.createElement('button');
  brushBtn.textContent = '🖌️';
  brushBtn.title = "Brush";
  brushBtn.style.fontSize = '24px';
  brushBtn.style.padding = '5px';
  brushBtn.style.cursor = 'pointer';
  brushBtn.addEventListener('click', () => {
    currentTool = 'brush';
    showNotification('Switched to Brush tool');
  });
  toolContainer.appendChild(brushBtn);
  
  const pencilBtn = document.createElement('button');
  pencilBtn.textContent = '✏️';
  pencilBtn.title = "Pencil (1px)";
  pencilBtn.style.fontSize = '24px';
  pencilBtn.style.padding = '5px';
  pencilBtn.style.cursor = 'pointer';
  pencilBtn.addEventListener('click', () => {
    currentTool = 'pencil';
    showNotification('Switched to Pencil tool');
  });
  toolContainer.appendChild(pencilBtn);
  
  const airbrushBtn = document.createElement('button');
  airbrushBtn.textContent = '💨';
  airbrushBtn.title = "Airbrush";
  airbrushBtn.style.fontSize = '24px';
  airbrushBtn.style.padding = '5px';
  airbrushBtn.style.cursor = 'pointer';
  airbrushBtn.addEventListener('click', () => {
    currentTool = 'airbrush';
    showNotification('Switched to Airbrush tool');
  });
  toolContainer.appendChild(airbrushBtn);
  
  const lineBtn = document.createElement('button');
  lineBtn.textContent = '📏';
  lineBtn.title = "Line";
  lineBtn.style.fontSize = '24px';
  lineBtn.style.padding = '5px';
  lineBtn.style.cursor = 'pointer';
  lineBtn.addEventListener('click', () => {
    currentTool = 'line';
    startLine = null; // reset any pending line start
    showNotification('Switched to Line tool');
  });
  toolContainer.appendChild(lineBtn);
  
  const bucketBtn = document.createElement('button');
  bucketBtn.textContent = '🪣';
  bucketBtn.title = "Paint Bucket";
  bucketBtn.style.fontSize = '24px';
  bucketBtn.style.padding = '5px';
  bucketBtn.style.cursor = 'pointer';
  bucketBtn.addEventListener('click', () => {
    currentTool = 'bucket';
    showNotification('Switched to Paint Bucket tool');
  });
  toolContainer.appendChild(bucketBtn);
  
  const eraserBtn = document.createElement('button');
  eraserBtn.textContent = '🩹';
  eraserBtn.title = "Eraser";
  eraserBtn.style.fontSize = '24px';
  eraserBtn.style.padding = '5px';
  eraserBtn.style.cursor = 'pointer';
  eraserBtn.addEventListener('click', () => {
    currentTool = 'eraser';
    showNotification('Switched to Eraser tool');
  });
  toolContainer.appendChild(eraserBtn);
  
  // Canvas container (right column)
  const canvasContainer = document.createElement('div');
  canvasContainer.style.flexGrow = '1';
  const canvas = document.createElement('canvas');
  canvas.id = 'paint-canvas';
  canvas.width = 500;
  canvas.height = 300;
  canvas.style.border = '1px solid #000';
  canvasContainer.appendChild(canvas);
  
  mainContainer.appendChild(toolContainer);
  mainContainer.appendChild(canvasContainer);
  container.appendChild(mainContainer);
  
  // Container below for color picker and palette
  const bottomContainer = document.createElement('div');
  bottomContainer.style.display = 'flex';
  bottomContainer.style.alignItems = 'center';
  bottomContainer.style.gap = '10px';
  bottomContainer.style.marginTop = '10px';
  
  const colorPicker = document.createElement('input');
  colorPicker.type = 'color';
  colorPicker.value = '#000000';
  colorPicker.style.cursor = 'pointer';
  colorPicker.addEventListener('change', (e) => { 
    color = e.target.value; 
  });
  bottomContainer.appendChild(colorPicker);
  
  const paletteColors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'];
  const paletteContainer = document.createElement('div');
  paletteContainer.style.display = 'flex';
  paletteContainer.style.gap = '5px';
  paletteColors.forEach(pColor => {
    const colorSwatch = document.createElement('div');
    colorSwatch.style.width = '20px';
    colorSwatch.style.height = '20px';
    colorSwatch.style.backgroundColor = pColor;
    colorSwatch.style.border = '1px solid #ccc';
    colorSwatch.style.cursor = 'pointer';
    colorSwatch.addEventListener('click', () => {
      color = pColor;
      colorPicker.value = pColor;
    });
    paletteContainer.appendChild(colorSwatch);
  });
  bottomContainer.appendChild(paletteContainer);
  container.appendChild(bottomContainer);
  
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false; // Keep pixelated style
  
  function loadImageOntoCanvas(imageSource) {
    const imgToLoad = new Image();
    imgToLoad.crossOrigin = "anonymous"; 
    imgToLoad.onload = () => {
      // Clear canvas before drawing loaded image
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw the loaded image onto the canvas, fitting it
      ctx.drawImage(imgToLoad, 0, 0, canvas.width, canvas.height);
      console.log("Image loaded onto canvas:", imageSource);
    };
    imgToLoad.onerror = (error) => {
      console.error("Error loading image:", error, "Source:", imageSource);
      showNotification("Error: Could not load image onto canvas.");
      // Optionally clear canvas or show error message on canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'red';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText("Error loading image", canvas.width / 2, canvas.height / 2);
    };
    imgToLoad.src = imageSource;
  }

  // --- Updated Image Loading Logic ---
  // Prioritize loading from data-filecontent if it exists (direct data URL)
  if (win.dataset.filecontent) {
    console.log("Loading from data-filecontent:", win.dataset.filecontent);
    setTimeout(() => loadImageOntoCanvas(win.dataset.filecontent), 0);
  } 
  // Fallback to using filePath to look up the item
  else if (win.dataset.filePath) {
    console.log("Loading from filePath:", win.dataset.filePath);
    const item = getItemByPath(win.dataset.filePath);
    console.log("Attempting to load:", win.dataset.filePath, "Item:", item);
    if (item && item.content) {
      console.log("Item content found via filePath:", item.content);
      // Use a timeout to ensure canvas is ready in the DOM
      setTimeout(() => loadImageOntoCanvas(item.content), 0);
    } else {
      console.warn("File item or content not found for path:", win.dataset.filePath);
      // Default background if file content is missing
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    // Default background for new Paint window
    console.log("No file path or content, using default background.");
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  // --- End of Updated Image Loading Logic ---
  
  let painting = false;
  let currentTool = 'brush';
  let color = '#000000';
  let startLine = null;
  
  function getCanvasOffset() {
    const rect = canvas.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  }
  
  function airbrushDraw(e) {
    const { left, top } = getCanvasOffset();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const radius = 15;
    const density = 50;
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      ctx.fillStyle = color;
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }
  }
  
  function draw(e) {
    const { left, top } = getCanvasOffset();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    
    if (currentTool === 'brush') {
      ctx.lineWidth = 5;
      ctx.lineCap = 'butt';
      ctx.strokeStyle = color;
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mouseX, mouseY);
    } else if (currentTool === 'pencil') {
      ctx.lineWidth = 1;
      ctx.lineCap = 'butt';
      ctx.strokeStyle = color;
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mouseX, mouseY);
    } else if (currentTool === 'eraser') {
      ctx.lineWidth = 10;
      ctx.lineCap = 'butt';
      ctx.strokeStyle = 'white';
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mouseX, mouseY);
    } else if (currentTool === 'airbrush') {
      airbrushDraw(e);
    }
  }
  
  function startDrawing(e) {
    const { left, top } = getCanvasOffset();
    const startX = e.clientX - left;
    const startY = e.clientY - top;

    if (currentTool === 'line') {
      startLine = { x: startX, y: startY };
    } else if (currentTool === 'brush' || currentTool === 'pencil' || currentTool === 'eraser' || currentTool === 'airbrush') {
      painting = true;
      ctx.beginPath(); // Start new path on mouse down
      ctx.moveTo(startX, startY); // Move to starting point
      draw(e); // Draw initial point/start of stroke
    }
  }
  
  function stopDrawing(e) {
    if (currentTool === 'line' && startLine) {
      const { left, top } = getCanvasOffset();
      const endLine = { x: e.clientX - left, y: e.clientY - top };
      ctx.lineWidth = 5;
      ctx.lineCap = 'butt';
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(startLine.x, startLine.y);
      ctx.lineTo(endLine.x, endLine.y);
      ctx.stroke();
      startLine = null;
    }
    painting = false;
    ctx.beginPath(); // Reset path after stroke ends
  }
  
  function handleDrawing(e) {
    if (!painting) return;
    draw(e);
  }
  
  function handleBucket(e) {
    if (currentTool !== 'bucket') return;
    const { left, top } = getCanvasOffset();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    floodFill(ctx, Math.floor(mouseX), Math.floor(mouseY), hexToRgb(color));
  }
  
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing); // Stop drawing if mouse leaves canvas
  canvas.addEventListener('mousemove', handleDrawing);
  canvas.addEventListener('click', (e) => {
    if (currentTool === 'bucket') handleBucket(e);
  });
  
  function floodFill(ctx, startX, startY, fillColor) {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const pixelData = imageData.data;
    const startPos = (startY * canvasWidth + startX) * 4;
    
    // Check if start position is outside canvas bounds
    if (startX < 0 || startX >= canvasWidth || startY < 0 || startY >= canvasHeight) {
      return;
    }
    
    const startColor = {
      r: pixelData[startPos],
      g: pixelData[startPos + 1],
      b: pixelData[startPos + 2],
      a: pixelData[startPos + 3]
    };

    // If start color is same as fill color, do nothing
    if (colorsMatch(startColor, fillColor)) return;

    // Check for edge case where startColor might be fully transparent but should be treated as white
    if (startColor.a === 0) {
        startColor.r = 255;
        startColor.g = 255;
        startColor.b = 255;
        startColor.a = 255;
    }

    // If start color is STILL the same as fill color (e.g., filling white with white), return
    if (colorsMatch(startColor, fillColor)) return;


    const pixelStack = [[startX, startY]];
    while (pixelStack.length) {
      let [x, y] = pixelStack.pop();
      let currentY = y;
      let currentPos = (currentY * canvasWidth + x) * 4;

      // Move upwards until we hit boundary or different color
      while (currentY >= 0 && colorsMatch(getColorAt(pixelData, currentPos, true), startColor)) {
        currentY--;
        currentPos -= canvasWidth * 4;
      }
      // Move back down one step
      currentY++;
      currentPos += canvasWidth * 4;

      let reachLeft = false;
      let reachRight = false;

      // Fill downwards
      while (currentY < canvasHeight && colorsMatch(getColorAt(pixelData, currentPos, true), startColor)) {
        setColorAt(pixelData, currentPos, fillColor);

        // Check left neighbor
        if (x > 0) {
          if (colorsMatch(getColorAt(pixelData, currentPos - 4, true), startColor)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, currentY]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        // Check right neighbor
        if (x < canvasWidth - 1) {
          if (colorsMatch(getColorAt(pixelData, currentPos + 4, true), startColor)) {
            if (!reachRight) {
              pixelStack.push([x + 1, currentY]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        currentY++;
        currentPos += canvasWidth * 4;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
  
  function getColorAt(data, pos, treatTransparentAsWhite = false) {
    const color = {
      r: data[pos],
      g: data[pos + 1],
      b: data[pos + 2],
      a: data[pos + 3]
    };
    // If alpha is 0 and we should treat it as white, return white
    if (treatTransparentAsWhite && color.a === 0) {
        return { r: 255, g: 255, b: 255, a: 255 };
    }
    return color;
  }
  
  function setColorAt(data, pos, color) {
    data[pos] = color.r;
    data[pos + 1] = color.g;
    data[pos + 2] = color.b;
    data[pos + 3] = 255; // Always set alpha to 255 (opaque)
  }
  
  function colorsMatch(a, b) {
    // Consider colors matching if RGB values are close enough (tolerance)
    const tolerance = 10; // Adjust as needed
    return Math.abs(a.r - b.r) <= tolerance && 
           Math.abs(a.g - b.g) <= tolerance && 
           Math.abs(a.b - b.b) <= tolerance && 
           a.a === b.a; // Alpha must match exactly
  }
  
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    let bigint = parseInt(hex, 16);
    let r, g, b;
    if (hex.length === 3) {
      r = (bigint >> 8) & 0xF;
      g = (bigint >> 4) & 0xF;
      b = bigint & 0xF;
      r = (r << 4) | r;
      g = (g << 4) | g;
      b = (b << 4) | b;
    } else {
      r = (bigint >> 16) & 0xFF;
      g = (bigint >> 8) & 0xFF;
      b = bigint & 0xFF;
    }
    return { r, g, b, a: 255 }; // Return opaque color
  }
}