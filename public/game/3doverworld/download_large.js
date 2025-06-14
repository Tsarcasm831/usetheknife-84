// download_large.js
// This script downloads a subset of large GLB assets in the background,
// caches them using the Cache API, and creates object URLs which are stored in a global mapping (window.LargeGLBAssetURLs).
// When all large assets are loaded, a popup message is displayed in the scene that fades away.

const largeGLBFiles = [
  {
    local: '/cottage_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/cottage_textured_mesh.glb'
  },
  {
    local: '/dead_tree_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/dead_tree_textured_mesh.glb'
  },
  {
    local: '/dengar_charger_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/dengar_charger_textured_mesh.glb'
  },
  {
    local: '/dengar_shalrah_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/dengar_shalrah_textured_mesh.glb'
  },
  {
    local: '/chiropteran_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/chiropteran_textured_mesh.glb'
  },
  {
    local: '/Animation_Slow_Orc_Walk_withSkin.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/OBJ%20Objects/Prometheus%20Faction/Killswitch/Animation_Slow_Orc_Walk_withSkin.glb'
  }
];

async function downloadLargeAssets() {
  if (!('caches' in window)) {
    console.warn('Cache API not supported in this browser.');
    return Promise.reject(new Error('Cache API not supported'));
  }

  const cache = await caches.open('large-glb-cache');
  const assetURLs = {};

  const downloadPromises = largeGLBFiles.map(file => {
    return fetch(file.url, { cache: 'no-cache' })
      .then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          cache.put(file.local, responseClone);
          return response.blob().then(blob => {
            const objectURL = URL.createObjectURL(blob);
            assetURLs[file.local] = objectURL;
          });
        } else {
          throw new Error(`Failed to fetch ${file.url}: ${response.status}`);
        }
      });
  });

  await Promise.all(downloadPromises);
  window.LargeGLBAssetURLs = assetURLs;
  console.log('All large GLB assets have been processed and cached:', assetURLs);
  showLargeAssetsLoadedPopup();
}

function showLargeAssetsLoadedPopup() {
  const popup = document.createElement('div');
  popup.textContent = "Large assets loaded successfully!";
  Object.assign(popup.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '5px',
    zIndex: '1100',
    opacity: '1',
    transition: 'opacity 1s ease-out'
  });
  document.body.appendChild(popup);

  // Fade out the popup after 3 seconds.
  setTimeout(() => {
    popup.style.opacity = '0';
  }, 3000);

  // Remove the popup from the DOM after the fade-out transition.
  setTimeout(() => {
    popup.remove();
  }, 4000);
}

// Start downloading large assets in the background.
downloadLargeAssets().catch(error => {
  console.error('Error downloading large assets:', error);
});