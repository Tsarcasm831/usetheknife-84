// render_proxy.js
// Proxy for main thread to communicate with render.worker.js using OffscreenCanvas

export function startWorkerRenderer(canvas, width, height, sceneConfig) {
  if (!canvas.transferControlToOffscreen) {
    alert('OffscreenCanvas not supported in this browser.');
    return null;
  }
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('render.worker.js', { type: 'module' });
  worker.postMessage({ type: 'init', canvas: offscreen, width, height, sceneConfig }, [offscreen]);
  return worker;
}

export function resizeWorkerRenderer(worker, width, height) {
  worker.postMessage({ type: 'resize', width, height });
}

export function updateSceneInWorker(worker, sceneConfig) {
  worker.postMessage({ type: 'updateScene', sceneConfig });
}
