from flask import Flask, render_template, request, redirect, url_for
import json, os, requests, time
from gradio_client import Client, handle_file

app = Flask(__name__)

# configs...
NPC_MEMORY_FOLDER   = 'npc_brains'
DATA_FOLDER         = 'data'
VOICE_FOLDER        = 'static/voices'
AUDIO_OUTPUT_FOLDER = 'static/audio'
OLLAMA_URL          = "http://localhost:11434/api/chat"
MODEL_NAME          = "gemma3:1b"
ZONOS_URL           = "http://127.0.0.1:7860/"
zonos_client        = Client(ZONOS_URL)
MAX_MEMORY_ENTRIES  = 50

# load/sync roster...
def load_npc_roster():
    roster_path = os.path.join(DATA_FOLDER, 'npc_roster.json')
    roster = {}
    if os.path.exists(roster_path):
        roster = json.load(open(roster_path))
    for fn in os.listdir(VOICE_FOLDER):
        if fn.endswith('.mp3'):
            npc = fn[:-4].lower()
            if npc not in roster:
                roster[npc] = {
                    "display_name": npc.capitalize(),
                    "base_prompt": f"You are {npc.capitalize()}, a survivor in a post-collapse world.",
                    "speaking_style": "neutral, cautious"
                }
    os.makedirs(DATA_FOLDER, exist_ok=True)
    json.dump(roster, open(roster_path,'w'), indent=4)
    return roster

NPC_ROSTER = load_npc_roster()

def load_memory(npc_id):
    path = os.path.join(NPC_MEMORY_FOLDER, f"{npc_id}_memory.json")
    if os.path.exists(path):
        return json.load(open(path))
    os.makedirs(NPC_MEMORY_FOLDER, exist_ok=True)
    json.dump([], open(path,'w'))
    return []

def save_memory(npc_id, memory):
    path = os.path.join(NPC_MEMORY_FOLDER, f"{npc_id}_memory.json")
    json.dump(memory, open(path,'w'), indent=4)

def pulse_ollama(user_input, system_prompt=None):
    payload = {"model":MODEL_NAME, "messages":[], "stream":False}
    if system_prompt:
        payload["messages"].append({"role":"system","content":system_prompt})
    payload["messages"].append({"role":"user","content":user_input})
    try:
        r = requests.post(OLLAMA_URL, json=payload)
        r.raise_for_status()
        return r.json().get('message',{}).get('content','[No response]')
    except Exception as e:
        return f"Error: {e}"

def synthesize_zonos(text, npc_id):
    if not text.strip(): return None
    sp = os.path.join(VOICE_FOLDER, f"{npc_id}.mp3")
    if not os.path.exists(sp):
        sp = os.path.join(VOICE_FOLDER, "robot.mp3")
    try:
        out = zonos_client.predict(
            model_choice="Zyphra/Zonos-v0.1-transformer",
            text=text,
            language="en-us",
            speaker_audio=handle_file(sp),
            prefix_audio=None,
            e1=1,e2=0.05,e3=0.05,e4=0.05,e5=0.05,e6=0.05,e7=0.1,e8=0.2,
            vq_single=0.78,fmax=24000,pitch_std=45,speaking_rate=15,
            dnsmos_ovrl=4,speaker_noised=False,
            cfg_scale=2,min_p=0.15,seed=420,randomize_seed=True,
            unconditional_keys=["emotion"],
            api_name="/generate_audio"
        )
        return out[0]
    except Exception as e:
        print("TTS failed:", e)
        return None

def summarize_memory(npc_id, memory):
    if len(memory) <= MAX_MEMORY_ENTRIES:
        return memory
    old = memory[:-20]
    parts = [f"Player: {e['user']} {npc_id.capitalize()}: {e['ai']}" for e in old if 'user' in e]
    core = pulse_ollama("Summarize into a core belief: " + "; ".join(parts))
    return [{'reflection':core,'type':'core-belief'}] + memory[-20:]

@app.route('/', methods=['GET','POST'])
def home():
    if request.method=='POST':
        sel = request.form.get('npc_selector')
        if sel:
            return redirect(url_for('npc_interaction', npc_id=sel))
    return render_template('home.html', npc_roster=NPC_ROSTER)

@app.route('/npc/<npc_id>', methods=['GET','POST'])
def npc_interaction(npc_id):
    # handle selector
    sel = request.form.get('npc_selector', npc_id)
    npc_id = sel

    memory   = load_memory(npc_id)
    npc_data = NPC_ROSTER.get(npc_id, {
        "display_name": npc_id.capitalize(),
        "base_prompt": f"You are {npc_id.capitalize()}, a survivor.",
        "speaking_style":"neutral, functional"
    })

    audio_file = request.args.get('audio')  # get from query string

    if request.method=='POST' and request.form.get('user_input'):
        ui = request.form['user_input']
        # build context
        ctx = ""
        for e in memory[-3:]:
            if 'user' in e:
                ctx += f"Player: {e['user']}\n{npc_data['display_name']}: {e['ai']}\n"

        prompt = (
            f"{npc_data['base_prompt']}\n"
            f"Speaking Style: {npc_data['speaking_style']}\n"
            f"Context:\n{ctx}\n"
            "Respond in 2–4 sentences."
        )
        ai = pulse_ollama(ui, prompt)
        emo = pulse_ollama(f"Classify emotion: Player: {ui} | {npc_data['display_name']}: {ai}")

        stamp = time.strftime("%d%H%M", time.localtime())
        filename = f"{npc_id}_{stamp}.wav"
        outpath = os.path.join(AUDIO_OUTPUT_FOLDER, filename)

        tmp = synthesize_zonos(ai, npc_id)
        if tmp and os.path.exists(tmp):
            os.makedirs(AUDIO_OUTPUT_FOLDER, exist_ok=True)
            os.replace(tmp, outpath)

        memory.append({'user':ui, 'ai':ai, 'emotion':emo, 'likes':0})
        if sum(1 for e in memory if 'user' in e) % 5 == 0:
            last5 = [e for e in memory if 'user' in e][-5:]
            ref = pulse_ollama(
                "Reflect poetically: " +
                "; ".join(f"Player: {e['user']} {npc_data['display_name']}: {e['ai']}" for e in last5)
            )
            memory.append({'reflection':ref,'type':'reflection'})

        memory = summarize_memory(npc_id, memory)
        save_memory(npc_id, memory)

        # Redirect with audio filename in query
        return redirect(url_for('npc_interaction',
                                npc_id=npc_id,
                                audio=filename))

    return render_template('npc.html',
        memory=memory,
        npc_id=npc_id,
        npc_data=npc_data,
        npc_roster=NPC_ROSTER,
        audio_filename=audio_file
    )

@app.route('/npc/<npc_id>/memory')
def npc_memory_api(npc_id):
    return load_memory(npc_id)

if __name__=='__main__':
    app.run(debug=True)
