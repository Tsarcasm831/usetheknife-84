export function initInternetExplorer(win, showNotification) {
  const urlBar = win.querySelector('#url-bar');
  const goBtn = win.querySelector('#go-btn');
  const ieContent = win.querySelector('#ie-content');
  if (!urlBar || !goBtn || !ieContent) {
    console.error('Internet Explorer elements not found');
    return;
  }
  
  // Set the default URL to blank for our custom homepage
  urlBar.value = "about:home";
  
  // Create a custom homepage with links instead of automatically loading Google
  const customHomepage = `
    <html>
    <head>
      <title>Internet Explorer Homepage</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f0f0f0;
        }
        h1 {
          color: #0078D7;
          text-align: center;
        }
        .favorites {
          width: 80%;
          margin: 20px auto;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .site {
          display: block;
          padding: 10px;
          margin: 10px 0;
          background-color: #e8f0fe;
          border-radius: 3px;
          text-decoration: none;
          color: #0067b8;
        }
        .site:hover {
          background-color: #d0e0fc;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to Internet Explorer</h1>
      <div class="favorites">
        <h2>Favorite Websites</h2>
        <a href="https://web.archive.org/web/20010602041016/http://www.google.com/" class="site">Google (2001)</a>
        <a href="https://websim.ai/@SofaKingSadBoi/newgrounds-flash-time-machine" class="site">Newgrounds Flash Time Machine</a>
        <a href="javascript:window.parent.postMessage('openSketchyWebsite', '*')" class="site">Sketchy Website</a>
      </div>
    </body>
    </html>
  `;
  
  // Set the custom homepage content
  setTimeout(() => {
    ieContent.setAttribute('srcdoc', customHomepage);
    
    // Add event listener for messages from the iframe
    window.addEventListener('message', (event) => {
      if (event.data === 'openSketchyWebsite') {
        navigateToSketchyWebsite();
      }
    });
    
  }, 100);
  
  goBtn.addEventListener('click', () => navigateTo(urlBar.value));
  urlBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') navigateTo(urlBar.value);
  });
  
  async function navigateTo(query) {
    let url = query.trim();
    
    // Special case for sketchy website
    if (url === "sketchy" || url === "sketchy website" || url === "sketchy-website") {
      navigateToSketchyWebsite();
      return;
    }
    
    // Special case for our custom homepage
    if (url === "about:home") {
      ieContent.setAttribute('srcdoc', customHomepage);
      return;
    }
    
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    urlBar.value = query;
    showNotification(`Connecting to ${query}...`);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.text();
      ieContent.setAttribute('srcdoc', data);
      // Force the iframe to update with a proper scrollbar; reflow needed.
      ieContent.style.overflowY = 'scroll';
    } catch (error) {
      showNotification(`Error loading website: ${error.message}`);
      ieContent.removeAttribute('srcdoc');
      ieContent.src = url;
    }
  }
  
  function navigateToSketchyWebsite() {
    const sketchyContent = `
      <html>
      <head>
        <title>FREE PRIZE WINNER!!!</title>
        <style>
          body {
            background-color: #ff00ff;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="10" y="30" font-size="30" fill="yellow">$$$</text></svg>');
            font-family: 'Comic Sans MS', cursive;
            color: yellow;
            text-align: center;
            overflow: hidden;
          }
          h1 {
            color: lime;
            font-size: 40px;
            text-shadow: 2px 2px blue;
            animation: blink 0.5s infinite;
          }
          .flash {
            animation: flash 0.3s infinite;
          }
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes flash {
            0% { background-color: yellow; }
            50% { background-color: red; }
            100% { background-color: blue; }
          }
          .button {
            background-color: red;
            color: white;
            border: 5px solid green;
            padding: 15px 30px;
            font-size: 24px;
            margin: 20px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h1 class="flash">🎉 CONGRATULATIONS! YOU ARE THE 1,000,000th VISITOR! 🎉</h1>
        <h2>You have won a FREE prize!</h2>
        <button class="button" onclick="spawnPopups()">CLICK HERE TO CLAIM NOW!!!</button>
        
        <script>
          let popupCount = 0;
          const messages = [
            "FREE IPHONE!!! CLICK NOW!",
            "HOT SINGLES IN YOUR AREA!",
            "YOU'VE WON A NEW CAR!",
            "UNLOCK SECRET MONEY TRICK!",
            "DOCTORS HATE THIS ONE WEIRD TRICK!",
            "DOWNLOAD MORE RAM NOW!",
            "YOUR COMPUTER HAS A VIRUS!",
            "CONGRATULATIONS AMAZON SHOPPER!",
            "CLAIM YOUR INHERITANCE NOW!",
            "MEETING SINGLES TONIGHT?",
            "WARNING: YOUR COMPUTER IS SLOW!",
            "FREE GIFT CARD!!!",
            "BECOME RICH OVERNIGHT!"
          ];
          
          const colors = [
            "#ff0000", "#00ff00", "#0000ff", "#ffff00", 
            "#ff00ff", "#00ffff", "#ff8800", "#ff0088",
            "#88ff00", "#0088ff", "#8800ff", "#00ff88"
          ];
          
          function randomPosition(max) {
            return Math.floor(Math.random() * max);
          }
          
          function randomSize(min, max) {
            return min + Math.floor(Math.random() * (max - min));
          }
          
          function spawnPopups() {
            // Create 5 popups immediately
            for (let i = 0; i < 5; i++) {
              createPopup();
            }
            
            // Then create one every second up to a maximum
            const interval = setInterval(() => {
              if (popupCount >= 20) {
                clearInterval(interval);
              } else {
                createPopup();
              }
            }, 1000);
          }
          
          function createPopup() {
            if (popupCount >= 20) return; // Limit total popups
            
            // Notify the parent window to create a popup
            window.parent.postMessage({
              type: 'createPopup', 
              message: messages[Math.floor(Math.random() * messages.length)],
              color: colors[Math.floor(Math.random() * colors.length)]
            }, '*');
            
            popupCount++;
          }
        </script>
      </body>
      </html>
    `;
    
    urlBar.value = "SKETCHY-WEBSITE.NET/WINNER!!!";
    ieContent.setAttribute('srcdoc', sketchyContent);
    
    // Set up message listener for popup requests
    window.addEventListener('message', handleSketchyMessage);
    
    // Make sure we clean up when IE is closed
    const closeBtn = win.querySelector('button[aria-label="Close"]');
    if (closeBtn) {
      const originalOnClick = closeBtn.onclick;
      closeBtn.onclick = () => {
        window.removeEventListener('message', handleSketchyMessage);
        if (originalOnClick) originalOnClick();
      };
    }
  }
  
  function handleSketchyMessage(event) {
    // Make sure it's from our sketchy website
    if (event.data && event.data.type === 'createPopup') {
      createAdvertPopup(event.data.message, event.data.color);
    }
  }
  
  function createAdvertPopup(message, color) {
    // Generate random size and position
    const width = 200 + Math.floor(Math.random() * 200);
    const height = 100 + Math.floor(Math.random() * 150);
    
    const desktop = document.querySelector('.desktop');
    const maxLeft = desktop.clientWidth - width;
    const maxTop = desktop.clientHeight - height;
    
    const left = Math.floor(Math.random() * maxLeft);
    const top = Math.floor(Math.random() * maxTop);
    
    // Create popup window with ad content
    const popupContent = `
      <div style="background-color: ${color}; height: 100%; overflow: hidden; 
                  display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h3 style="color: white; text-shadow: 2px 2px black; margin: 0; font-size: 24px; animation: blink 1s infinite;">⚠️ ${message} ⚠️</h3>
        <button style="margin-top: 10px; padding: 5px 15px; font-weight: bold; cursor: pointer;">CLICK HERE!</button>
      </div>
      <style>
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      </style>
    `;
    
    const popupWin = window.createWindow("Advertisement", popupContent);
    popupWin.style.width = width + "px";
    popupWin.style.height = height + "px";
    popupWin.style.left = left + "px";
    popupWin.style.top = top + "px";
  }
}