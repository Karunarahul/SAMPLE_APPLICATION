import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Read .env manually since we are running via simple node script
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const API_KEY = match ? match[1].trim() : null;

if (!API_KEY) {
    console.error("No API KEY found in .env");
    process.exit(1);
}

console.log("Using API KEY:", API_KEY.substring(0, 10) + "...");

async function listModels() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    try {
        // There isn't a direct "listModels" on the instance in some SDK versions, 
        // asking the model directly is the standard way, but we can try to find a valid one 
        // by trying a few known candidates if list isn't easily accessible in this version shorthand.

        // Actually the SDK *does* probably expose it via a ModelManager or similar, 
        // but checking the docs, the direct `genAI.getGenerativeModel` is the main entry.
        // Let's brute force check a few standard ones.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-1.5-pro",
            "gemini-1.5-pro-001",
            "gemini-1.5-pro-002",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        console.log("Testing model availability...");

        for (const modelName of candidates) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test.");
                console.log(`SUCCESS: ${modelName} is available.`);
                return; // Found one!
            } catch (e) {
                if (e.message.includes("404")) {
                    console.log(`Failed: ${modelName} (404 Not Found)`);
                } else {
                    console.log(`Failed: ${modelName} (${e.message})`);
                }
            }
        }
    } catch (e) {
        console.error("Fatal Error:", e);
    }
}

listModels();
