"""
Name: Zonos2
Description: This program synthesizes text into audio 
using the locally hosted Zonos tool and provides a command-line interface for synthesis.
"""

import sys
import os
import shutil
from datetime import datetime
from gradio_client import Client, handle_file

def synthesize_text(text, speaker_audio_path, output_dir=None, custom_filename=None, file_extension=".wav"):
    """
    Synthesize text into audio using the locally hosted Zonos tool at http://127.0.0.1:7860/.
    
    Args:
        text (str): The text to synthesize.
        speaker_audio_path (str): Path to the speaker audio file for voice cloning.
        output_dir (str, optional): Directory to save the output audio file. If None, returns the temporary file.
        custom_filename (str, optional): If provided, use this as the output filename (without extension).
        file_extension (str): Extension for the output file (default ".wav").
    
    Returns:
        tuple: (generated_audio_filepath, seed) where generated_audio_filepath is the path to the
               generated audio file and seed is the value used during synthesis.
    """
    try:
        # Ensure the speaker audio file exists
        if not os.path.exists(speaker_audio_path):
            raise FileNotFoundError(f"Speaker audio file not found: {speaker_audio_path}")

        # Initialize the Gradio client to connect to the locally hosted Zonos tool
        client = Client("http://127.0.0.1:7860/")

        # Call the /generate_audio endpoint with provided parameters
        result = client.predict(
            model_choice="Zyphra/Zonos-v0.1-transformer",
            text=text,
            language="en-us",
            speaker_audio=handle_file(speaker_audio_path),
            prefix_audio=None,
            e1=1,
            e2=0.05,
            e3=0.05,
            e4=0.05,
            e5=0.05,
            e6=0.05,
            e7=0.1,
            e8=0.2,
            vq_single=0.78,
            fmax=24000,
            pitch_std=45,
            speaking_rate=15,
            dnsmos_ovrl=4,
            speaker_noised=False,
            cfg_scale=2,
            min_p=0.15,
            seed=420,
            randomize_seed=True,
            unconditional_keys=["emotion"],
            api_name="/generate_audio"
        )

        temp_audio_filepath = result[0]
        seed = result[1]

        # If an output directory is provided, copy the file with a proper filename
        if output_dir:
            if custom_filename:
                output_filename = f"{custom_filename}{file_extension}"
            else:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                clean_text = ''.join(c if c.isalnum() else '_' for c in text[:30])
                output_filename = f"{timestamp}_{clean_text}_{seed}{file_extension}"
            output_filepath = os.path.join(output_dir, output_filename)
            shutil.copy2(temp_audio_filepath, output_filepath)
            return output_filepath, seed
        else:
            return temp_audio_filepath, seed

    except Exception as e:
        print(f"Error during synthesis: {e}")
        return None, None

def main():
    """
    Minimal command-line interface for synthesis.
    Usage: python program.py <text_to_synthesize> <path_to_speaker_audio> [output_directory]
    """
    if len(sys.argv) < 3:
        print("Usage: python program.py <text_to_synthesize> <path_to_speaker_audio> [output_directory]")
        sys.exit(1)

    text_to_synthesize = sys.argv[1]
    speaker_audio_path = sys.argv[2]
    output_dir = sys.argv[3] if len(sys.argv) > 3 else None

    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        print(f"Created output directory: {output_dir}")

    print(f"Synthesizing text: {text_to_synthesize}")
    print(f"Using speaker audio: {speaker_audio_path}")
    if output_dir:
        print(f"Output directory: {output_dir}")

    generated_audio_filepath, seed = synthesize_text(text_to_synthesize, speaker_audio_path, output_dir)

    if generated_audio_filepath:
        print(f"Generated audio file: {generated_audio_filepath}")
        print(f"Seed used: {seed}")
    else:
        print("Synthesis failed.")

if __name__ == "__main__":
    main()
