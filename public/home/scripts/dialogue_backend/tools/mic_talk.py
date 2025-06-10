import speech_recognition as sr
import requests
from zonos_tts import synthesize_and_play

FLASK_SERVER_URL = "http://localhost:5000"
DEFAULT_NPC_ID = "jace"

def listen_for_input():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print(f"Speak to {DEFAULT_NPC_ID.capitalize()} (Ctrl+C to quit)...")
        audio = recognizer.listen(source)

    try:
        user_input = recognizer.recognize_google(audio)
        print(f"You said: {user_input}")
        return user_input
    except sr.UnknownValueError:
        print("Sorry, I couldn't understand you.")
        return None
    except sr.RequestError as e:
        print(f"Speech Recognition error: {e}")
        return None

def send_and_listen_response(user_input, npc_id):
    try:
        response = requests.post(
            f"{FLASK_SERVER_URL}/npc/{npc_id}",
            data={"user_input": user_input}
        )

        if response.status_code == 200:
            print(f"Sent to {npc_id.capitalize()} successfully.")

            # Extract NPC reply and emotion
            npc_response, npc_emotion = extract_npc_response(npc_id)
            if npc_response:
                print(f"{npc_id.capitalize()} says ({npc_emotion}): {npc_response}")
                synthesize_and_play(npc_response, emotion=npc_emotion)

        else:
            print(f"Failed to send input: {response.status_code}")
    except Exception as e:
        print(f"Failed to connect: {e}")

def extract_npc_response(npc_id):
    """Pull the latest reply and emotion from memory."""
    try:
        memory = requests.get(f"{FLASK_SERVER_URL}/npc/{npc_id}/memory").json()
        last = memory[-1]
        if 'ai' in last and 'emotion' in last:
            return last['ai'], last['emotion'].strip().lower()
        elif 'ai' in last:
            return last['ai'], "neutral"
        return None, "neutral"
    except Exception as e:
        print(f"Failed to fetch memory: {e}")
        return None, "neutral"

if __name__ == "__main__":
    while True:
        user_input = listen_for_input()
        if user_input:
            send_and_listen_response(user_input, DEFAULT_NPC_ID)
