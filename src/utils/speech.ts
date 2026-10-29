/**
 * Text-to-speech utility using Web Speech API
 */

export function speakEnglish(text: string, rate = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Try to pick a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang.startsWith('en-US') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Siri'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      null;

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}
