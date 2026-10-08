export const ttsService = {
  speak: (text: string, enabled: boolean = true, accent: string = 'Default Browser Voice', onEnd?: () => void) => {
    if (!enabled || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (accent.includes('US Female')) {
        const v = voices.find(v => v.lang.includes('en-US') && v.name.includes('Female'));
        if (v) utterance.voice = v;
      } else if (accent.includes('US Male')) {
        const v = voices.find(v => v.lang.includes('en-US') && v.name.includes('Male'));
        if (v) utterance.voice = v;
      } else if (accent.includes('UK')) {
        const v = voices.find(v => v.lang.includes('en-GB'));
        if (v) utterance.voice = v;
      }
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
