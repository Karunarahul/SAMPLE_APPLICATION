/**
 * Service to interact with Local Ollama instance.
 * Default URL: http://localhost:11434
 */

const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434/api/generate";
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || "llama3";

export const getOllamaIntent = async (userText, context = {}) => {
    console.log(`[Ollama] connecting to ${OLLAMA_URL} with model ${OLLAMA_MODEL}`);

    const systemPrompt = `
You are Jarvis, an advanced AI health assistant.
Parse user commands into JSON.

CONTEXT:
Route: ${context.route}
Vitals: ${JSON.stringify(context.vitals)}

OUTPUT JSON ONLY:
{
  "type": "NAVIGATE" | "ACTION" | "RESPONSE",
  "target": "/home" | "/analysis",
  "action": "TRIGGER_ANALYSIS",
  "response": "Brief spoken text"
}

USER: "${userText}"
    `;

    try {
        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: systemPrompt,
                stream: false,
                format: "json" // Ollama supports JSON mode natively
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.statusText}`);
        }

        const data = await response.json();
        // data.response contains the text
        return JSON.parse(data.response);

    } catch (error) {
        console.error("[Ollama] Error:", error);
        return null; // Return null so commandBrain triggers fallback
    }
};
