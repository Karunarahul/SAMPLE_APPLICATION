/**
 * Service to interact with OpenAI API.
 */

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const getOpenAiIntent = async (userText, context = {}) => {
    if (!API_KEY) {
        console.warn("No OpenAI API Key found.");
        return null; // Let brain fall back
    }

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
    `;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userText }
                ],
                temperature: 0.7
            }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const content = data.choices[0].message.content;
        // Strip markdown if present
        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("[OpenAI] Error:", error);
        return {
            type: "RESPONSE",
            response: "I encountered an error connecting to OpenAI."
        };
    }
};
