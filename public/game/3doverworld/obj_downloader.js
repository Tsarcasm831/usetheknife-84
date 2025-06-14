// obj_downloader.js
// This module preloads the Promethean Spiderbot OBJ, MTL, and texture assets.
// It downloads the assets from the external URLs and stores the results in a global OBJAssetData object.
// Other modules can wait on window.OBJAssetsReady to ensure the assets are available.

const objURL = 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/OBJ%20Objects/Spider/promethean_spiderbot_texture.obj';
const mtlURL = 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/OBJ%20Objects/Spider/promethean_spiderbot_texture.mtl';
const textureURL = 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/OBJ%20Objects/Spider/promethean_spiderbot_texture.png';

// Download the OBJ file as text
const loadOBJ = fetch(objURL).then(response => {
  if (!response.ok) {
    throw new Error(`Failed to load OBJ: ${response.statusText}`);
  }
  return response.text();
});

// Download the MTL file as text
const loadMTL = fetch(mtlURL).then(response => {
  if (!response.ok) {
    throw new Error(`Failed to load MTL: ${response.statusText}`);
  }
  return response.text();
});

// Preload the texture image
const loadTexture = new Promise((resolve, reject) => {
  const image = new Image();
  // Set crossOrigin to allow loading from an external source if needed
  image.crossOrigin = "anonymous";
  image.onload = () => resolve(image);
  image.onerror = () =>
    reject(new Error(`Failed to load texture image: ${textureURL}`));
  image.src = textureURL;
});

// Wait for all assets to load, then store the data globally
window.OBJAssetsReady = Promise.all([loadOBJ, loadMTL, loadTexture])
  .then(([objData, mtlData, textureImage]) => {
    window.OBJAssetData = {
      obj: objData,           // The raw OBJ file text
      mtl: mtlData,           // The raw MTL file text
      texture: textureImage,  // The loaded HTMLImageElement
      urls: {
        obj: objURL,
        mtl: mtlURL,
        texture: textureURL
      }
    };
    console.log('OBJ assets loaded successfully:', window.OBJAssetData);
  })
  .catch(error => {
    console.error('Error loading OBJ assets:', error);
  });