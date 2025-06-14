// download.js
// This script downloads and caches the necessary GLB files for the game
// from file.garden links. It uses the Cache API to store the files for later use.
// Additionally, it creates object URLs from the downloaded blobs and stores them
// in a global mapping (window.GLTFAssetURLs) that GLTFLoader modules can use to load assets.

const glbFiles = [
  {
    local: '/axe_iron_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/axe_iron_textured_mesh.glb'
  },
  {
    local: '/H_I_V_E_Drone_texture.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/H_I_V_E_Drone_texture.glb'
  },
  {
    local: '/kilrathi_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/kilrathi_textured_mesh.glb'
  },
  {
    local: '/bar_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/bar_white_mesh.glb'
  },
  {
    local: '/bone_fragment_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/bone_fragment_textured_mesh.glb'
  },
  {
    local: '/broken_car_two_door_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/broken_car_two_door_textured_mesh.glb'
  },
  {
    local: '/broken_car_two_door_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/broken_car_two_door_white_mesh.glb'
  },
  {
    local: '/bronze_bar_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/bronze_bar_textured_mesh.glb'
  },
  {
    local: '/bronze_bar_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/bronze_bar_white_mesh.glb'
  },
  {
    local: '/chest_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/chest_textured_mesh.glb'
  },
  {
    local: '/chest_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/chest_white_mesh.glb'
  },
  {
    local: '/copper_bar_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/copper_bar_textured_mesh.glb'
  },
  {
    local: '/copper_bar_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/copper_bar_white_mesh.glb'
  },
  {
    local: '/copper_ore_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/copper_ore_textured_mesh.glb'
  },
  {
    local: '/copper_ore_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/copper_ore_white_mesh.glb'
  },
  {
    local: '/cottage_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/cottage_textured_mesh.glb'
  },
  {
    local: '/dead_tree_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/dead_tree_textured_mesh.glb'
  },
  {
    local: '/dirt_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/dirt_textured_mesh.glb'
  },
  {
    local: '/engine_part_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/engine_part_textured_mesh.glb'
  },
  {
    local: '/fir_log_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/fir_log_textured_mesh.glb'
  },
  {
    local: '/house_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/house_textured_mesh.glb'
  },
  {
    local: '/house_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/house_white_mesh.glb'
  },
  {
    local: '/human_ranger_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/human_ranger_textured_mesh.glb'
  },
  {
    local: '/human_ranger_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/human_ranger_white_mesh.glb'
  },
  {
    local: '/log_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/log_white_mesh.glb'
  },
  {
    local: '/marthas_structure_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/marthas_structure_textured_mesh.glb'
  },
  {
    local: '/npc_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/npc_textured_mesh.glb'
  },
  {
    local: '/pine_tree_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/pine_tree_textured_mesh.glb'
  },
  {
    local: '/prometheus_root_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/prometheus_root_textured_mesh.glb'
  },
  {
    local: '/prometheus_root_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/prometheus_root_white_mesh.glb'
  },
  {
    local: '/prometheus_trojan_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/prometheus_trojan_textured_mesh.glb'
  },
  {
    local: '/prometheus_trojan_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/prometheus_trojan_white_mesh.glb'
  },
  {
    local: '/prometheus_virus_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/prometheus_virus_textured_mesh.glb'
  },
  {
    local: '/prometheus_virus_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/prometheus_virus_white_mesh.glb'
  },
  {
    local: '/radox_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/radox_textured_mesh.glb'
  },
  {
    local: '/radrabbit_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/radrabbit_textured_mesh.glb'
  },
  {
    local: '/radroach_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/radroach_textured_mesh.glb'
  },
  {
    local: '/radroach_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/radroach_white_mesh.glb'
  },
  {
    local: '/rad_chicken_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/rad_chicken_textured_mesh.glb'
  },
  {
    local: '/rad_stag_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/rad_stag_textured_mesh.glb'
  },
  {
    local: '/rad_stag_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/rad_stag_white_mesh.glb'
  },
  {
    local: '/rope_coil_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/rope_coil_textured_mesh.glb'
  },
  {
    local: '/rotten_log_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/rotten_log_textured_mesh.glb'
  },
  {
    local: '/rotten_log_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/rotten_log_white_mesh.glb'
  },
  {
    local: '/shalrah_prime_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/shalrah_prime_white_mesh.glb'
  },
  {
    local: '/table_white_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/table_white_mesh.glb'
  },
  {
    local: '/tin_ore_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/tin_ore_textured_mesh.glb'
  },
  {
    local: '/weird_tree_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/weird_tree_textured_mesh.glb'
  },

  // === NEW MESHES ===
  {
    local: '/tanarhe_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/tanarhe_textured_mesh.glb'
  },
  {
    local: '/dengar_charger_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/dengar_charger_textured_mesh.glb'
  },
  {
    local: '/dengar_charger_royal_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/dengar_charger_royal_textured_mesh.glb'
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
    local: '/avianos_textured_mesh.glb',
    url: 'https://file.garden/Zy7B0LkdIVpGyzA1/3DGLBASSETS/avianos_textured_mesh.glb'
  }
];

// Initialize the global mapping for asset URLs.
window.GLTFAssetURLs = window.GLTFAssetURLs || {};

export async function downloadGLBFiles() {
  if (!('caches' in window)) {
    console.warn('Cache API not supported in this browser.');
    return Promise.reject(new Error('Cache API not supported'));
  }

  try {
    const cache = await caches.open('glb-cache');
    const downloadPromises = [];
    
    for (const file of glbFiles) {
      const filePromise = (async () => {
        try {
          const response = await fetch(file.url, { cache: 'no-cache' });
          if (response.ok) {
            // Clone response for caching and blob conversion.
            const responseClone = response.clone();
            await cache.put(file.local, responseClone);

            // Convert the response to a blob and create an object URL.
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);
            window.GLTFAssetURLs[file.local] = objectURL;
            console.log(`${file.local} cached and object URL created successfully.`);
          } else {
            throw new Error(`Failed to fetch ${file.url}: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error fetching ${file.url}:`, error);
          throw error; // Re-throw to mark this file as failed
        }
      })();
      downloadPromises.push(filePromise);
    }

    await Promise.all(downloadPromises);
    console.log('All GLB files have been processed for caching.');
    return true; // Indicate successful completion
  } catch (error) {
    console.error('Error in downloadGLBFiles:', error);
    throw error; // Re-throw to properly reject the promise
  }
}

const glbPromise = downloadGLBFiles();
window.GLTFAssetsReady = glbPromise;
