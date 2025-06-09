import bpy
import os

# Clear existing objects
bpy.ops.wm.read_homefile(use_empty=True)

# Load GLB
script_dir = os.path.dirname(os.path.realpath(__file__))
input_filename = "Alien_Warlord_A_pos_0508161015_texture.glb"
output_filename = "Alien_Warlord_Rigged.glb"
input_path = os.path.join(script_dir, input_filename)
output_path = os.path.join(script_dir, output_filename)

bpy.ops.import_scene.gltf(filepath=input_path)

# Add armature
bpy.ops.object.armature_add(enter_editmode=False, location=(0, 0, 0))
armature = bpy.context.active_object
armature.name = "AlienRig"

# Switch to edit mode and add a few bones (example only)
bpy.ops.object.mode_set(mode='EDIT')
edit_bones = armature.data.edit_bones

# Add a spine bone
bone = edit_bones.new("Spine")
bone.head = (0, 0, 0)
bone.tail = (0, 0, 1)

# Add a head bone
head_bone = edit_bones.new("Head")
head_bone.head = (0, 0, 1)
head_bone.tail = (0, 0, 1.5)
head_bone.parent = bone

bpy.ops.object.mode_set(mode='OBJECT')

# Parent mesh to armature with automatic weights
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        bpy.context.view_layer.objects.active = obj
        armature.select_set(True)
        obj.select_set(True)
        bpy.ops.object.parent_set(type='ARMATURE_AUTO')
        break  # Assuming one mesh

# Save/export the rigged GLB
bpy.ops.export_scene.gltf(filepath=output_path, export_format='GLB')
