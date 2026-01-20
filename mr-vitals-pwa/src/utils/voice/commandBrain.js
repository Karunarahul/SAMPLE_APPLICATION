import { getGeminiIntent } from '../ai/geminiService';
import { getOllamaIntent } from '../ai/ollamaService';
import { getOpenAiIntent } from '../ai/openAiService';
import { getHealthAnswer, analyzeSpecificValue } from './healthKnowledge';

const PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'gemini'; // 'gemini', 'ollama', 'openai'

export const processCommand = async (text, context = {}) => {
    try {
        console.log(`[Jarvis] Processing via ${PROVIDER}: "${text}"`);
        let intent = null;

        if (PROVIDER === 'ollama') {
            intent = await getOllamaIntent(text, context);
        } else if (PROVIDER === 'openai') {
            intent = await getOpenAiIntent(text, context);
        } else {
            // Default to Gemini (existing logic handles fallback to mock if key missing)
            intent = await getGeminiIntent(text, context);
        }

        // If provider returned null (e.g. key missing), try mock
        if (!intent) intent = mockFallback(text);

        return intent;

    } catch (error) {
        console.error("[Jarvis] Global Error:", error);
        return mockFallback(text);
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
        response: `I'm in Offline Mode (${PROVIDER} unavailable). I can still run basic commands.`
    };
};
