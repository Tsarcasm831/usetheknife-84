// ollamaClient.js
const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL      = "goekdenizguelmez/JOSIEFIED-Qwen3:8b-q4_k_m";

/**
 * Send a prompt (optionally with history) to Ollama and get a single reply.
 * @param {string[]} history – alternating user/NPC lines, oldest‑first
 * @param {string}   prompt  – the player’s latest line
 * @returns {Promise<string>} – the model’s reply
 */
export async function askOllama(history, prompt) {
  // Flatten history into one text block.  Adjust the format to taste.
  const historyText = history.map(({ speaker, text }) => `${speaker}: ${text}`).join("\n");
  const fullPrompt  = `${historyText}\nYou: ${prompt}\nNPC:`.trim();

  const res = await fetch(OLLAMA_URL, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({
      model : MODEL,
      prompt: fullPrompt,
      stream: false        // easier first; flip to true later for streaming
    })
  });

  if (!res.ok) throw new Error(`Ollama error ${res.status}`);

  const data = await res.json();          // { response: "...", ... }
  return data.response.trim();
}
