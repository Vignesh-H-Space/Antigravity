// Web Audio API Synthesizer for Mechanical Keyboard Clicks
class KeyboardAudioSynth {
  constructor() {
    this.audioCtx = null;
    this.mode = 'clicky'; // 'clicky', 'tactile', 'linear', 'typewriter', 'off'
    this.volume = 0.3;
    this.modesList = ['clicky', 'tactile', 'linear', 'typewriter', 'off'];
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  nextMode() {
    const currentIndex = this.modesList.indexOf(this.mode);
    this.mode = this.modesList[(currentIndex + 1) % this.modesList.length];
    return this.mode;
  }

  playClick(isSpace = false, isError = false) {
    if (this.mode === 'off') return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    if (isError) {
      // Error buzz tone
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
      return;
    }

    if (this.mode === 'clicky') {
      // Cherry MX Blue style double click
      this._playClickySound(now, isSpace);
    } else if (this.mode === 'tactile') {
      // Cherry MX Brown tactile thock
      this._playTactileSound(now, isSpace);
    } else if (this.mode === 'linear') {
      // Cherry MX Red smooth bottoming out
      this._playLinearSound(now, isSpace);
    } else if (this.mode === 'typewriter') {
      // Vintage mechanical typewriter metallic click
      this._playTypewriterSound(now, isSpace);
    }
  }

  _playClickySound(now, isSpace) {
    // High frequency snap + low resonant thock
    const pitch = isSpace ? 800 : 1800 + (Math.random() * 300 - 150);

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    gain.gain.setValueAtTime(this.volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  _playTactileSound(now, isSpace) {
    const pitch = isSpace ? 350 : 650 + (Math.random() * 100 - 50);

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

    gain.gain.setValueAtTime(this.volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  _playLinearSound(now, isSpace) {
    const pitch = isSpace ? 250 : 450 + (Math.random() * 80 - 40);

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  _playTypewriterSound(now, isSpace) {
    const pitch = isSpace ? 500 : 2400 + (Math.random() * 400 - 200);

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

window.keyAudio = new KeyboardAudioSynth();
