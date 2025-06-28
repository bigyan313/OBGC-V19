// Sound utility functions for click and submission feedback

class SoundManager {
  private clickSound: HTMLAudioElement | null = null;
  private submitSound: HTMLAudioElement | null = null;
  private successSound: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    try {
      // Create click sound (short, pleasant click)
      this.clickSound = new Audio();
      this.clickSound.volume = 0.3;
      this.clickSound.preload = 'auto';
      
      // Create submit sound (satisfying submission sound)
      this.submitSound = new Audio();
      this.submitSound.volume = 0.4;
      this.submitSound.preload = 'auto';
      
      // Create success sound (celebration sound)
      this.successSound = new Audio();
      this.successSound.volume = 0.5;
      this.successSound.preload = 'auto';
      
      // Generate sounds using Web Audio API
      this.generateClickSound();
      this.generateSubmitSound();
      this.generateSuccessSound();
    } catch (error) {
      console.warn('Sound initialization failed:', error);
      this.isEnabled = false;
    }
  }

  private generateClickSound() {
    if (!this.clickSound) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      // Convert to blob and create URL
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
      this.clickSound.src = this.createSoundDataUrl(800, 400, 0.1, 0.3);
    } catch (error) {
      console.warn('Click sound generation failed:', error);
    }
  }

  private generateSubmitSound() {
    if (!this.submitSound) return;
    
    try {
      this.submitSound.src = this.createSoundDataUrl(600, 300, 0.3, 0.4);
    } catch (error) {
      console.warn('Submit sound generation failed:', error);
    }
  }

  private generateSuccessSound() {
    if (!this.successSound) return;
    
    try {
      this.successSound.src = this.createSoundDataUrl(523, 659, 0.5, 0.5); // C to E major chord
    } catch (error) {
      console.warn('Success sound generation failed:', error);
    }
  }

  private createSoundDataUrl(startFreq: number, endFreq: number, duration: number, volume: number): string {
    const sampleRate = 44100;
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate audio data
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const freq = startFreq + (endFreq - startFreq) * (t / duration);
      const envelope = Math.exp(-t * 3); // Exponential decay
      const sample = Math.sin(2 * Math.PI * freq * t) * envelope * volume * 32767;
      view.setInt16(44 + i * 2, sample, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  playClickSound() {
    if (!this.isEnabled || !this.clickSound) return;
    
    try {
      this.clickSound.currentTime = 0;
      this.clickSound.play().catch(() => {
        // Ignore play errors (user interaction required)
      });
    } catch (error) {
      // Ignore sound errors
    }
  }

  playSubmitSound() {
    if (!this.isEnabled || !this.submitSound) return;
    
    try {
      this.submitSound.currentTime = 0;
      this.submitSound.play().catch(() => {
        // Ignore play errors
      });
    } catch (error) {
      // Ignore sound errors
    }
  }

  playSuccessSound() {
    if (!this.isEnabled || !this.successSound) return;
    
    try {
      this.successSound.currentTime = 0;
      this.successSound.play().catch(() => {
        // Ignore play errors
      });
    } catch (error) {
      // Ignore sound errors
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }
}

// Create singleton instance
export const soundManager = new SoundManager();

// Export convenience functions
export const playClickSound = () => soundManager.playClickSound();
export const playSubmitSound = () => soundManager.playSubmitSound();
export const playSuccessSound = () => soundManager.playSuccessSound();
export const setSoundEnabled = (enabled: boolean) => soundManager.setEnabled(enabled);
export const isSoundEnabled = () => soundManager.isAudioEnabled();