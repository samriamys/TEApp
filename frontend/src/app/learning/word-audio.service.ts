import { Injectable } from '@angular/core';

/** Plays recorded media when available, otherwise asks the device to speak the word. */
@Injectable({ providedIn: 'root' })
export class WordAudioService {
  private audio?: HTMLAudioElement;
  private speaking = false;
  private request = 0;

  play(url: string | null | undefined, word: string, onUnavailable: () => void): void {
    this.stop();
    const request = this.request;
    let fallbackStarted = false;
    const fallback = () => {
      if (request !== this.request || fallbackStarted) return;
      fallbackStarted = true;
      this.audio = undefined;
      if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
        onUnavailable();
        return;
      }
      try {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'es-MX';
        const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.toLowerCase().startsWith('es'));
        utterance.voice = voices.find(voice => voice.localService) || voices[0] || null;
        utterance.onerror = () => {
          if (request === this.request) { this.speaking = false; onUnavailable(); }
        };
        utterance.onend = () => { if (request === this.request) this.speaking = false; };
        this.speaking = true;
        window.speechSynthesis.speak(utterance);
      } catch {
        this.speaking = false;
        if (request === this.request) onUnavailable();
      }
    };

    const source = url?.trim();
    if (!source) { fallback(); return; }
    try {
      const audio = new Audio(source);
      this.audio = audio;
      audio.onerror = fallback;
      void audio.play().catch(fallback);
    } catch {
      fallback();
    }
  }

  stop(): void {
    this.request++;
    if (this.audio) {
      this.audio.onerror = null;
      this.audio.pause();
      this.audio = undefined;
    }
    if (this.speaking && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    this.speaking = false;
  }
}
