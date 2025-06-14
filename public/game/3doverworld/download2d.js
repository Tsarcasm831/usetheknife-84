// download2d.js
// This script downloads and caches a set of 2D sprite images for use in the game.
// It uses the Cache API to store the images and then creates object URLs for efficient retrieval.
// The object URLs are stored in a global mapping (window.ImageAssetURLs) that other modules (e.g. 2dsprites.js) can reference.

const spriteFiles = [
  {
    local: '/2DSprites/arrow.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/arrow.png'
  },
  {
    local: '/2DSprites/bread.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/bread.png'
  },
  {
    local: '/2DSprites/gold_coin.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/gold_coin.png'
  },
  {
    local: '/2DSprites/iron_axe.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/iron_axe.png'
  },
  {
    local: '/2DSprites/map.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/map.png'
  },
  {
    local: '/2DSprites/small_health_potion.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/small_health_potion.png'
  },
  {
    local: '/2DSprites/wood_icon.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/wood_icon.png'
  },
  {
    local: '/2DSprites/torch.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/torch.png'
  },
  // New sprite files
  {
    local: '/2DSprites/electronic_scraps.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/electronic_scraps.png'
  },
  {
    local: '/2DSprites/screw.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/screw.png'
  },
  {
    local: '/2DSprites/rebar_rod.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/rebar_rod.png'
  },
  {
    local: '/2DSprites/bone_fragments.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/bone_fragments.png'
  },
  {
    local: '/2DSprites/cloth_scraps.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/cloth_scraps.png'
  },
  {
    local: '/2DSprites/concrete_mix.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/concrete_mix.png'
  },
  {
    local: '/2DSprites/iron_scrap.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/iron_scrap.png'
  },
  {
    local: '/2DSprites/aluminium_scrap.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/aluminium_scrap.png'
  },
  {
    local: '/2DSprites/glass_shards.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/glass_shards.png'
  },
  {
    local: '/2DSprites/pile_of_screws.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/pile_of_screws.png'
  },
  {
    local: '/2DSprites/plywood_sheets.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/plywood_sheets.png'
  },
  {
    local: '/2DSprites/charcoal.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/charcoal.png'
  },
  {
    local: '/2DSprites/assorted_plastics.png',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/2DSprites/assorted_plastics.png'
  }
];

window.ImageAssetURLs = window.ImageAssetURLs || {};

export async function download2DSpriteFiles() {
  if (!('caches' in window)) {
    console.warn('Cache API not supported in this browser.');
    return Promise.reject(new Error('Cache API not supported'));
  }
  try {
    const cache = await caches.open('2d-sprite-cache');
    const downloadPromises = spriteFiles.map(file => (async () => {
      try {
        const response = await fetch(file.url, { cache: 'no-cache' });
        if (response.ok) {
          // Clone response for caching and blob conversion.
          const responseClone = response.clone();
          await cache.put(file.local, responseClone);
          
          // Convert the response to a blob and create an object URL.
          const blob = await response.blob();
          const objectURL = URL.createObjectURL(blob);
          window.ImageAssetURLs[file.local] = objectURL;
          console.log(`${file.local} cached and object URL created.`);
        } else {
          throw new Error(`Failed to fetch ${file.url}: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error fetching ${file.url}:`, error);
        throw error;
      }
    })());
    
    await Promise.all(downloadPromises);
    console.log('All 2D sprite files have been processed and cached.');
    return true;
  } catch (error) {
    console.error('Error in download2DSpriteFiles:', error);
    throw error;
  }
}

const downloadPromise = download2DSpriteFiles();
window.ImageAssetsReady = downloadPromise;