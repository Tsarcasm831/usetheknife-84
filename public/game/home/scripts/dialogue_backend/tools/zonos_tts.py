from gradio_client import Client, handle_file
import os
import time

# Zonos TTS Server
ZONOS_URL = "http://127.0.0.1:7860/"
client = Client(ZONOS_URL)

# Default voice settings
DEFAULT_SETTINGS = {
    "model_choice": "Zyphra/Zonos-v0.1-transformer",
    "language": "en-us",
    "prefix_audio": None,
    "vq_single": 0.78,
    "fmax": 24000,
    "pitch_std": 45,
    "speaking_rate": 15,
    "dnsmos_ovrl": 4,
    "speaker_noised": False,
    "cfg_scale": 2,
    "min_p": 0.15,
    "seed": 420,
    "randomize_seed": True,
    "unconditional_keys": ["emotion"]
}

# Emotion-based modifiers
EMOTION_PROFILES = {
    "angry": {
        "e6": 0.9,  # Anger
        "e4": 0.1,  # Fear
        "speaking_rate": 18,
        "pitch_std": 60
    },
    "sad": {
        "e2": 0.8,  # Sadness
        "speaking_rate": 10,
        "pitch_std": 30
    },
    "happy": {
        "e1": 0.9,  # Happiness
        "speaking_rate": 17,
        "pitch_std": 50
    },
    "fearful": {
        "e4": 0.8,  # Fear
        "speaking_rate": 16,
        "pitch_std": 55
    },
    "neutral": {
        "e8": 0.8,  # Neutral
        "speaking_rate": 15,
        "pitch_std": 45
    },
    "disgusted": {
        "e3": 0.9,  # Disgust
        "speaking_rate": 13,
        "pitch_std": 40
    }
}

def synthesize_and_play(text, npc_id="jace", emotion="neutral"):
    if not text.strip():
        print("Nothing to synthesize.")
        return

    settings = DEFAULT_SETTINGS.copy()

    # Apply emotion modifications
    profile = EMOTION_PROFILES.get(emotion.lower(), EMOTION_PROFILES["neutral"])
    settings.update(profile)

    speaker_file_path = f"static/voices/{npc_id}.mp3"
    
    if not os.path.exists(speaker_file_path):
        print(f"No specific speaker audio found for {npc_id}. Using fallback voice (robot.mp3).")
        speaker_file_path = "static/voices/robot.mp3"

    try:
        result = client.predict(
            model_choice=settings["model_choice"],
            text=text,
            language=settings["language"],
            speaker_audio=handle_file(speaker_file_path),
            prefix_audio=settings["prefix_audio"],
            e1=settings.get("e1", 0.05),
            e2=settings.get("e2", 0.05),
            e3=settings.get("e3", 0.05),
            e4=settings.get("e4", 0.05),
            e5=settings.get("e5", 0.05),
            e6=settings.get("e6", 0.05),
            e7=settings.get("e7", 0.1),
            e8=settings.get("e8", 0.2),
            vq_single=settings["vq_single"],
            fmax=settings["fmax"],
            pitch_std=settings["pitch_std"],
            speaking_rate=settings["speaking_rate"],
            dnsmos_ovrl=settings["dnsmos_ovrl"],
            speaker_noised=settings["speaker_noised"],
            cfg_scale=settings["cfg_scale"],
            min_p=settings["min_p"],
            seed=settings["seed"],
            randomize_seed=settings["randomize_seed"],
            unconditional_keys=settings["unconditional_keys"],
            api_name="/generate_audio"
        )

        audio_path = result[0]
        print(f"Audio generated at: {audio_path}")

        if os.path.exists(audio_path):
            os.system(f'start {audio_path}' if os.name == 'nt' else f'xdg-open "{audio_path}"')
            time.sleep(1)
        else:
            print("Failed to find generated audio file.")

    except Exception as e:
        print(f"Error during TTS synthesis: {e}")
