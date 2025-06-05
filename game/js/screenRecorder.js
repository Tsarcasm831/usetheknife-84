let mediaRecorder;
let recordedChunks = [];
const screenRecordPanel = document.getElementById("screen-record-panel"); // Get panel once

function startScreenRecording() {
  if (screenRecordPanel) {
    screenRecordPanel.classList.add("active"); 
  }

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((faceStream) => {
      const faceVideo = document.getElementById("face-video");
      faceVideo.srcObject = faceStream;

      navigator.mediaDevices
        .getDisplayMedia({ video: true })
        .then((screenStream) => {
          const combinedStream = new MediaStream([
            ...screenStream.getTracks(),
            ...faceStream.getTracks()
          ]);
          mediaRecorder = new MediaRecorder(combinedStream);

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunks.push(event.data);
            }
          };

          mediaRecorder.start();

          const controls = document.getElementById("screen-record-controls");
          if (controls) controls.style.display = "flex"; // Ensure controls are visible
        })
        .catch((error) => console.error("Error accessing screen:", error));
    })
    .catch((error) => console.error("Error accessing camera:", error));
}

function pauseRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.pause();
  }
}

function resumeRecording() {
  if (mediaRecorder && mediaRecorder.state === "paused") {
    mediaRecorder.resume();
  }
}

function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
     if (screenRecordPanel) { // Optionally hide panel on stop
        // screenRecordPanel.classList.remove("active"); 
     }
  }
}

function downloadRecording() {
  const blob = new Blob(recordedChunks, { type: "video/mp4" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "screen-recording.mp4";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a); // Clean up the anchor element
  recordedChunks = []; // Clear chunks after download
}

export function initScreenRecorder() {
  const screenRecordBtn = document.getElementById("screen-record-btn");
  const pauseBtn = document.getElementById("pause-record");
  const stopBtn = document.getElementById("stop-record");
  const playBtn = document.getElementById("play-record"); 
  const downloadBtn = document.getElementById("download-record");

  if (screenRecordBtn) {
    screenRecordBtn.addEventListener("click", startScreenRecording);
  }
  if (pauseBtn) {
    pauseBtn.addEventListener("click", pauseRecording);
  }
  if (stopBtn) {
    stopBtn.addEventListener("click", stopRecording);
  }
  if (playBtn) { 
    playBtn.addEventListener("click", resumeRecording);
  }
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadRecording);
  }
  
  // Also add a way to close the panel if it's not automatically closed on stop
  // For instance, if you add a close button to screen-record-panel HTML:
  // const closeRecordPanelBtn = document.getElementById("close-screen-record-panel");
  // if (closeRecordPanelBtn && screenRecordPanel) {
  //   closeRecordPanelBtn.addEventListener("click", () => screenRecordPanel.classList.remove("active"));
  // }
}