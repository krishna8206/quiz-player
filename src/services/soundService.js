class SoundService {
  constructor() {
    this.audioContext = null;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playTone(frequency, type, duration, vol = 0.1) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playCorrect() {
    this.init();
    this.playTone(523.25, 'sine', 0.1, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.1), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.1), 200); // G5
  }

  playWrong() {
    this.init();
    this.playTone(300, 'sawtooth', 0.3, 0.05);
    setTimeout(() => this.playTone(250, 'sawtooth', 0.4, 0.05), 150);
  }

  playTick() {
    this.init();
    this.playTone(800, 'square', 0.05, 0.02);
  }
}

export const soundService = new SoundService();
