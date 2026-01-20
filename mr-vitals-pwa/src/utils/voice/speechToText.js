/**
 * Simple wrapper for the Web Speech API (SpeechRecognition).
 * Handles browser compatibility and basic event bridging.
 */

// Browser compatibility
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export class VoiceInput {
    constructor() {
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
            this.isSupported = false;
            return;
        }
        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false; // Capture one command at a time for "Jarvis" style
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = true; // Show text as user speaks
    }

    start(onResult, onEnd, onError) {
        if (!this.isSupported) return;

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            // Pass final flag to let UI know if it's done
            const isFinal = event.results[0].isFinal;
            onResult(transcript, isFinal);
        };

        this.recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (onError) onError(event.error);
        };

        this.recognition.onend = () => {
            if (onEnd) onEnd();
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.error("Failed to start recognition", e);
        }
    }

    stop() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }
}
