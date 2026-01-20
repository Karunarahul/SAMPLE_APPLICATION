import { GoogleGenerativeAI } from "@google/generative-ai";
import { getHealthAnswer, analyzeSpecificValue } from '../voice/healthKnowledge';

/**
 * Service to interact with Google Gemini AI.
 * Handles the "Thinking" part of Jarvis 2.0.
 */

// Initialize with Safety fallback if no key is present (Mock Mode)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
let genAI = null;
let model = null;

if (API_KEY) {
    try {
        console.log("Initializing Gemini with model: gemini-pro");
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-pro" });
    } catch (e) {
        console.error("Failed to initialize Gemini:", e);
    }
} else {
    console.warn("Jarvis Warning: No VITE_GEMINI_API_KEY found. Running in MOCK Mode.");
}

export const getGeminiIntent = async (userText, context = {}) => {
    if (!API_KEY || !model) {
        return mockFallback(userText);
    }

    try {
        // System Prompt: Defines Persona and JSON Output Schema
        const systemPrompt = `
You are Jarvis, an advanced AI health assistant.
Your goal is to parse user commands and questions into structured JSON.

CONTEXT:
Current Route: ${context.route || 'unknown'}
User Vitals: ${JSON.stringify(context.vitals || {})}

AVAILABLE ACTIONS:
- NAVIGATE: target can be '/home', '/analysis', '/welcome'
- TRIGGER_ANALYSIS: if user wants to run checks/diagnostics (only valid on '/analysis')

OUTPUT FORMAT:
Return ONLY a raw JSON object (no markdown, no backticks):
{
  "type": "NAVIGATE" | "ACTION" | "RESPONSE",
  "target": "/route" (optional, for navigation),
  "action": "ACTION_NAME" (optional),
  "response": "Text to speak back to the user" (required)
}

RULES:
1. If user asks a general health question, type is "RESPONSE" and provide a helpful medical answer (approx 2 sentences).
2. If user wants to move, type is "NAVIGATE".
3. If user wants to run analysis, check if they are on '/analysis'. If yes, type "ACTION" + "TRIGGER_ANALYSIS". If no, navigate them there first.
4. "response" field should be conversational (e.g., "Certainly, navigating now.").

USER INPUT: "${userText}"
        `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if Gemini adds it
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(text);

    } catch (error) {
        console.error("Gemini Error:", error);

        // Graceful fallback for 404 or other API issues
        if (error.message.includes("404") || error.message.includes("not found")) {
            console.warn("Model not found or API issue. Falling back to Mock Mode.");
            return mockFallback(userText);
        }

        return {
            type: "RESPONSE",
            response: "I'm having trouble connecting to my neural net. " + (error.message || "")
        };
    }
};

const mockFallback = (text) => {
    // Advanced Mock Brain: Simulates LLM behavior
    const lower = text.toLowerCase();

    // 1. Navigation
    if (lower.includes("home") || lower.includes("dashboard")) {
        return { type: "NAVIGATE", target: "/home", response: "Navigating to Home Dashboard." };
    }
    if (lower.includes("analysis") || lower.includes("page")) {
        return { type: "NAVIGATE", target: "/analysis", response: "Opening Analysis Module." };
    }

    // 2. Actions
    if (lower.includes("run") || lower.includes("check") || lower.includes("test")) {
        // Assume they want analysis if using these words
        return {
            type: "ACTION",
            action: "TRIGGER_ANALYSIS",
            response: "Initiating diagnostic check."
        };
    }

    // 3. Health Knowledge (Local)
    // Check specific values first
    const valAnalysis = analyzeSpecificValue(text);
    if (valAnalysis) return { type: "RESPONSE", response: valAnalysis };

    // Check general QA
    const fact = getHealthAnswer(text);
    if (fact) return { type: "RESPONSE", response: fact };

    // 4. Fallback
    return {
        type: "RESPONSE",
        response: "I am functioning in Offline Mode. I can navigate, run tests, and answer basic health questions. How can I assist?"
    };
};
