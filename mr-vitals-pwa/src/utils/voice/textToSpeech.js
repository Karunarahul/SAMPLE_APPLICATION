/**
 * Wrapper for Web Speech API (SpeechSynthesis).
 * Gives the bot a specific "persona" voice if available.
 */

export const speakResponse = (text) => {
    if (!window.speechSynthesis) {
        console.warn("Text-to-Speech not supported.");
        return;
    }

    // Cancel any current speech to avoid overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Slightly faster/slower if needed
    utterance.pitch = 1.0;
    utterance.volume = 5.0;

    // Priority Order for "Human-like" voices
    // 1. Microsoft Natural (Edge/Windows) - Very realistic
    // 2. Google US English (Chrome) - Standard standard
    // 3. Indian English (if requested for localized feel)
    const voices = window.speechSynthesis.getVoices();

    // Log available voices to help debug if needed (user won't see this unless console open)
    // console.log("Available Voices:", voices.map(v => v.name));

    const preferredVoice = voices.find(voice =>
        voice.name.includes('Natural') ||
        voice.name.includes('Google US English') ||
        voice.name.includes('Rishi') || // Microsoft Indian English (Male)
        voice.name.includes('Neerja')    // Microsoft Indian English (Female)
    );

    if (preferredVoice) {
        utterance.voice = preferredVoice;
        // Adjust slightly for specific voices if needed
        if (preferredVoice.name.includes('Rishi') || preferredVoice.name.includes('Indian')) {
            utterance.rate = 1.1; // Indian English voices are often slow
        }
    }

    window.speechSynthesis.speak(utterance);
};
