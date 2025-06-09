import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createNoise2D } from 'simplex-noise';

import WebsimSocket from './utils/WebsimSocket.js';
import { slotThemes } from './constants/slotThemes.js';
import SocialSpace from './main/SocialSpace.js';

// start the app
document.addEventListener('DOMContentLoaded', () => new SocialSpace({ slotThemes, WebsimSocket, THREE, PointerLockControls, GLTFLoader, CSS3DRenderer, CSS3DObject, createNoise2D }));
