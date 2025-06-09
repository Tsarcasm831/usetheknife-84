from pygltflib import GLTF2
import sys

def summarize_gltf(path):
    gltf = GLTF2().load_binary(path)
    return {
        "File": path,
        "Has Skins": len(gltf.skins) > 0,
        "Has Animations": len(gltf.animations) > 0,
        "Skins": len(gltf.skins),
        "Animations": len(gltf.animations),
        "Joints": sum(len(skin.joints) for skin in gltf.skins) if gltf.skins else 0,
        "Animation Channels": sum(len(anim.channels) for anim in gltf.animations) if gltf.animations else 0,
        "Animation Samplers": sum(len(anim.samplers) for anim in gltf.animations) if gltf.animations else 0,
        "Meshes": len(gltf.meshes),
        "Nodes": len(gltf.nodes),
    }

def print_comparison(file1_summary, file2_summary):
    keys = list(file1_summary.keys())[1:]  # skip "File" key

    print(f"\n{'Property':<25}{'File 1':<35}{'File 2':<35}")
    print("-" * 95)
    for key in keys:
        print(f"{key:<25}{str(file1_summary[key]):<35}{str(file2_summary[key]):<35}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python compare_glb_files.py <file1.glb> <file2.glb>")
        sys.exit(1)

    file1 = sys.argv[1]
    file2 = sys.argv[2]

    summary1 = summarize_gltf(file1)
    summary2 = summarize_gltf(file2)

    print_comparison(summary1, summary2)
