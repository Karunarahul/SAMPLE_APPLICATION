/**
 * ATLAS BRAIN (Offline & Deterministic)
 * 
 * Rules:
 * 1. No External APIs.
 * 2. Strict Keyword Matching.
 * 3. Always return a valid response.
 */

import { getHealthAnswer, analyzeSpecificValue } from '../voice/healthKnowledge';

export const processAtlasCommand = (text) => {
    const normalize = text.toLowerCase().trim();

    // --- SYSTEM INTENTS ---
    if (normalize.includes("stop listening") || normalize.includes("cancel") || normalize.includes("shut down")) {
        return { type: "SYSTEM", action: "STOP_LISTENING", response: "Standing by." };
    }

    // --- NAVIGATION INTENTS ---
    if (normalize.includes("home") || normalize.includes("dashboard")) {
        return { type: "NAVIGATE", target: "/home", response: "Navigating to Home." };
    }

    if (normalize.includes("analysis") || normalize.includes("health")) {
        return { type: "NAVIGATE", target: "/analysis", response: "Opening Health Analysis." };
    }

    if (normalize.includes("profile") || normalize.includes("settings")) {
        return { type: "NAVIGATE", target: "/home", response: "Profile module is currently locked. Returning Home." }; // Placeholder for Profile
    }

    // --- QA INTENTS ---
    if (normalize.includes("who are you") || normalize.includes("what is this")) {
        return { type: "QA", response: "I am Atlas, your offline neural interface. I control navigation and provide system data." };
    }

    if (normalize.includes("help") || normalize.includes("commands")) {
        return { type: "QA", response: "You can say: Go to Home, Show Analysis, or Ask about this app." };
    }

    if (normalize.includes("hello") || normalize.includes("hey")) {
        return { type: "QA", response: "Atlas online. Awaiting command." };
    }

    // --- HEALTH QA (General & Specific) ---
    // 1. Check for specific values first ("Is 102 bad?")
    const specificAnalysis = analyzeSpecificValue(text);
    if (specificAnalysis) {
        return { type: "QA", response: specificAnalysis };
    }

    // 2. Check general knowledge base ("What is normal HR?")
    const generalAnswer = getHealthAnswer(text);
    if (generalAnswer) {
        return { type: "QA", response: generalAnswer };
    }

    // --- TELUGU / REGIONAL INTENTS ---
    // Check for Telugu script or Common transliterations

    // Greeting
    if (normalize.includes("namaskaram") || normalize.includes("నమస్కారం")) {
        return { type: "QA", response: "Namaskaram! I am Atlas. Nenu ela sahayam cheyagalanu? (How can I help?)" };
    }

    // Heart Rate (Hrudaya Spandana)
    if (normalize.includes("hrudaya") || normalize.includes("gunde") || normalize.includes("గుండె")) {
        return { type: "QA", response: "Heart Rate (Hrudaya Spandana) is the speed of the heartbeat. Normal is 60-100 bpm." };
    }

    // Health / Arogyam
    if (normalize.includes("arogyam") || normalize.includes("health")) {
        return { type: "QA", response: "Health is wealth. You can ask me about Heart Rate, BP, or Temperature." };
    }

    // Emergency
    if (normalize.includes("apada") || normalize.includes("emergency")) {
        return { type: "QA", response: "In case of emergency, please dial 108 or visit the nearest hospital immediately." };
    }

    // --- FALLBACK ---
    return {
        type: "QA",
        response: "Sorry, I don’t have information on that. Please consult a healthcare professional."
    };
};
