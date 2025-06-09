#!/usr/bin/env python3

import os
from ursina import Ursina, Entity, color, DirectionalLight, AmbientLight
from ursina.prefabs.editor_camera import EditorCamera

# Initialize Ursina application
app = Ursina()

# Setup lighting
DirectionalLight()
AmbientLight(color=color.rgb(100,100,100))

# Camera with orbit controls
EditorCamera()

# Ground plane
ground = Entity(
    model='plane',
    scale=(100, 1, 100),
    texture='white_cube',
    texture_scale=(50, 50),
    collider='box',
    color=color.rgb(128, 128, 128)
)

# Load all .glb models from assets directory
assets_dir = os.path.normpath(
    os.path.join(os.path.dirname(__file__), '..', 'assets')
)
for root, dirs, files in os.walk(assets_dir):
    for file in files:
        if file.lower().endswith('.glb'):
            model_path = os.path.join(root, file)
            Entity(
                model=model_path,
                collider='mesh',
                scale=1
            )

# Run the application
app.run()
