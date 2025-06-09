from pygltflib import GLTF2
import sys

def summarize_gltf(path):
    gltf = GLTF2().load_binary(path)

    summary = {
        "File": path,
        "Has Skins": len(gltf.skins) > 0,
        "Has Animations": len(gltf.animations) > 0,
        "Number of Skins": len(gltf.skins),
        "Number of Animations": len(gltf.animations),
        "Total Joints": sum(len(skin.joints) for skin in gltf.skins) if gltf.skins else 0,
        "Total Animation Channels": sum(len(anim.channels) for anim in gltf.animations) if gltf.animations else 0,
        "Total Animation Samplers": sum(len(anim.samplers) for anim in gltf.animations) if gltf.animations else 0,
        "Mesh Count": len(gltf.meshes),
        "Node Count": len(gltf.nodes),
    }

    return summary


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_glb.py <file.glb>")
        sys.exit(1)

    path = sys.argv[1]
    summary = summarize_gltf(path)
    for k, v in summary.items():
        print(f"{k}: {v}")
