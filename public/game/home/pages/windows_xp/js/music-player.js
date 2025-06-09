export function initMusicPlayer(win, showNotification, specificTrack = null) {
  const contentArea = win.querySelector('.window-content');
  const instanceId = Math.random().toString(36).substr(2, 9);
  contentArea.innerHTML = `
    <div style="padding: 10px;" id="mp-container-${instanceId}">
      <h2>Music Player</h2>
      <div id="mp-song-info-${instanceId}" style="margin-bottom: 10px;">No song playing</div>
      <div id="mp-controls-${instanceId}" style="margin-bottom: 10px; display: flex; flex-wrap: nowrap; justify-content: space-around;">
        <button id="mp-prev-${instanceId}">Prev</button>
        <button id="mp-play-${instanceId}">Play</button>
        <button id="mp-pause-${instanceId}">Pause</button>
        <button id="mp-next-${instanceId}">Next</button>
      </div>
      <div style="margin-bottom:10px;">
        <input id="mp-progress-${instanceId}" type="range" min="0" max="100" value="0" style="width:100%; pointer-events: none;">
      </div>
      <div style="height: 120px; overflow-y: auto; border: 1px solid #ccc;">
        <ul id="mp-playlist-${instanceId}" style="list-style-type: none; padding: 0; margin: 0;"></ul>
      </div>
    </div>
  `;

  // Fetch music files from file system instead of hardcoded list
  const songs = [];
  const musicFolder = window.fileSystem['C:']?.children['Users']?.children['User']?.children['Music']?.children;

  // Convert file system entries to song objects
  if (musicFolder) {
    Object.entries(musicFolder).forEach(([filename, fileData]) => {
      if (fileData.type === "file") {
        songs.push({
          title: filename.replace(/\.(mp3|wav|ogg)$/i, ''), // Remove extension for title
          src: fileData.content
        });
      }
    });
  } else {
    console.warn("Music folder not found in filesystem.");
  }

  const audio = new Audio();
  audio.preload = 'auto';

  const container = win.querySelector(`#mp-container-${instanceId}`);
  const songInfo = container.querySelector(`#mp-song-info-${instanceId}`);
  const progressBar = container.querySelector(`#mp-progress-${instanceId}`);
  const playlistEl = container.querySelector(`#mp-playlist-${instanceId}`);
  const playBtn = container.querySelector(`#mp-play-${instanceId}`);
  const pauseBtn = container.querySelector(`#mp-pause-${instanceId}`);
  const nextBtn = container.querySelector(`#mp-next-${instanceId}`);
  const prevBtn = container.querySelector(`#mp-prev-${instanceId}`);

  let currentSongIndex = 0;

  // If a specific track was passed, handle it
  if (specificTrack) {
    const existingIndex = songs.findIndex(song => song.src === specificTrack);

    if (existingIndex !== -1) {
      // The song is already in the default playlist
      currentSongIndex = existingIndex;
    } else {
      // The song is not in the default playlist, add it temporarily
      const filePath = win.dataset.filePath || "Unknown Track"; // Get filepath from window dataset
      const filename = filePath.split('/').pop().replace(/\.(mp3|wav|ogg)$/i, ''); // Extract filename for title
      
      songs.unshift({ // Add to the beginning of the list
        title: filename,
        src: specificTrack
      });
      currentSongIndex = 0; // Play the added song first
    }
  }

  function renderPlaylist() {
    playlistEl.innerHTML = '';
    songs.forEach((song, index) => {
      const li = document.createElement('li');
      li.textContent = song.title;
      li.style.padding = '5px';
      li.style.cursor = 'pointer';
      // Highlight based on the *actual* current song playing, not just the index
      li.style.backgroundColor = (audio.src === song.src && !audio.paused) ? '#ccc' : index === currentSongIndex ? '#ddd' : 'transparent';
      li.addEventListener('click', () => {
        currentSongIndex = index;
        playSong();
      });
      playlistEl.appendChild(li);
    });
  }

  function updateSongInfo() {
    if (songs.length > 0 && currentSongIndex >= 0 && currentSongIndex < songs.length) {
       songInfo.textContent = "Now Playing: " + songs[currentSongIndex].title;
    } else {
       songInfo.textContent = "No song selected";
    }
    renderPlaylist(); // Update playlist highlighting
  }

  function playSong() {
    const song = songs[currentSongIndex];
    const currentSrc = audio.currentSrc || audio.src || "";
    // If same song and already playing, do nothing
    if (currentSrc.endsWith(song.src) && !audio.paused) {
        updateSongInfo();
        return;
    }
    // Load new song if needed
    if (!currentSrc.endsWith(song.src)) {
        audio.src = song.src;
    }

    // Attempt to play (resumes if paused)
    audio.play().then(() => {
        updateSongInfo();
        showNotification(`Playing: ${song.title}`);
    }).catch(err => {
        console.warn(`Audio play prevented: ${err.message}`);
        showNotification(`Error playing song: ${err.message}`);
        updateSongInfo();
    });
  }
  
  // Update playlist highlighting when play/pause state changes
  audio.addEventListener('play', renderPlaylist);
  audio.addEventListener('pause', renderPlaylist);

  audio.addEventListener('timeupdate', () => {
    if (audio.duration && !isNaN(audio.duration)) { // Check if duration is valid
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressBar.value = progressPercent;
    } else {
      progressBar.value = 0; // Reset progress if duration is not available
    }
  });

  playBtn.addEventListener('click', () => {
    // If already playing, do nothing
    if (!audio.paused) return;
    // If a source is loaded, resume; otherwise start playback
    if (audio.src) {
      audio.play().catch(err => {
        console.warn(`Audio play prevented: ${err.message}`);
        showNotification(`Error playing song: ${err.message}`);
      });
    } else {
      playSong();
    }
  });

  pauseBtn.addEventListener('click', () => {
    if (!audio.paused) {
        audio.pause();
        if (songs.length > 0) {
           showNotification(`Paused: ${songs[currentSongIndex]?.title || 'Unknown Track'}`);
        }
    }
  });

  nextBtn.addEventListener('click', () => {
    if (songs.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (songs.length > 0) {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong();
    }
  });

  audio.addEventListener('ended', () => {
    // Only auto-play next if there are multiple songs
    if (songs.length > 1) {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      playSong();
    } else {
      // If only one song, just reset UI
      progressBar.value = 0;
      updateSongInfo(); // Update highlighting
    }
  });

  // Fix: Ensure the audio stops when the music app is closed.
  const closeBtn = win.querySelector('button[aria-label="Close"]');
  if (closeBtn) {
    // Need to store the original handler to call it after our cleanup
    const originalCloseHandler = closeBtn.onclick;
    closeBtn.onclick = null; // Remove existing handler first
    
    closeBtn.addEventListener('click', (e) => {
      console.log("Music player close clicked");
      audio.pause();
      audio.removeAttribute('src'); // Release the audio source
      audio.load(); // Abort potential pending loads
      
      // Call the original handler if it exists, otherwise just close
      if (typeof originalCloseHandler === 'function') {
          originalCloseHandler(e);
      } else {
          // Default close behavior if no original handler was found
          win.remove();
          const taskbarButtons = document.querySelector('.taskbar-buttons');
          const btnToRemove = taskbarButtons.querySelector(`.taskbar-button[data-id="${win.dataset.id}"]`);
          if(btnToRemove) btnToRemove.remove();
          if (window.currentActiveWindowId === win.dataset.id) {
              window.currentActiveWindowId = null;
          }
      }
    });
  }

  renderPlaylist();

  // If a specific track was provided, play it immediately
  if (specificTrack && songs.length > 0) {
    // Ensure the index is correct after potential unshift
    currentSongIndex = songs.findIndex(song => song.src === specificTrack);
    if (currentSongIndex !== -1) {
      playSong();
    } else {
      // Fallback if somehow the specific track wasn't added or found
      currentSongIndex = 0;
      updateSongInfo(); // Update UI to show the default first song
    }
  } else if (songs.length > 0) {
    // If no specific track, update UI to show the first song but don't auto-play
    updateSongInfo();
  } else {
    songInfo.textContent = "No music found in My Music";
  }
}