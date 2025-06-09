# FarHaven 3D Isometric RPG

A browser-based 3D isometric RPG world built on Three.js you will want to run npx run dev first.

---

## 🚀 Features

- **Modular architecture**  
  - `config.js`  
  - `main.js`  
- **World setup** (`scripts/world`)  
  - `worldSetup.js` (lights, ground, grid & labels)  
  - `modelLoader.js` (async loader + progress)  
  - `grass.js` (procedural vegetation)  
- **Structures** (`scripts/structures`)  
  - walls, houses, mine shafts, parking lot…  
- **NPCs & creatures** (`scripts/*.js`)  
  - ranger, ivey, tal_ehn, promethean_robot…  
- **Player & camera**  
  - `controls.js`  
  - `player.js`  
- **UI modules**  
  - `loadingScreen.js`  
  - `popupUI.js`  
  - `compass.js`  
  - `glb_status.js`  
  - `credits.js`  
- **Assets**  
  - GLB/GLTF under `assets/`  
- **Lightweight server**  
  - `static_server.py`

---

## 📂 Folder Structure

```text
FarHaven/
├─ assets/
├─ configs/
├─ pages/
├─ scripts/
│  ├─ world/
│  ├─ structures/
│  └─ *.js
├─ index.html
├─ main.js
├─ config.js
├─ controls.js
├─ loadingScreen.js
├─ popupUI.js
├─ static_server.py
└─ style.css  (or style.min.css / style[whatever].css)
