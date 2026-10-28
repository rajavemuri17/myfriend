/**
 * Audio conversion utilities for Gemini 3.8 Live API
 * - Input: 16kHz 16-bit Little-Endian Mono PCM
 * - Output: 24kHz 16-bit Little-Endian Mono PCM
 */

export function float32ToInt16(float32Array: Float32Array): Int16Array {
  const int16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

export function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
  let binary = '';
  const bytes = new Uint8Array(buffer as ArrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToAudioBuffer(
  base64: string,
  audioCtx: AudioContext,
  sampleRate: number = 24000
): AudioBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  // 16-bit little endian PCM
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  const audioBuffer = audioCtx.createBuffer(1, float32.length, sampleRate);
  audioBuffer.copyToChannel(float32, 0);
  return audioBuffer;
}

/**
 * Procedural ambient sound synthesis using Web Audio API.
 * Provides instant soothing soundscapes without requiring heavy external MP3s.
 */
export class AmbientSoundGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private cleanupFns: Array<() => void> = [];

  constructor() {}

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      // Smooth volume transition
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    for (const cleanup of this.cleanupFns) {
      try {
        cleanup();
      } catch (e) {
        // ignore
      }
    }
    this.cleanupFns = [];
    this.isPlaying = false;
  }

  public play(type: 'rain' | 'waves' | 'hearth' | 'zen') {
    this.stop();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;

    if (type === 'rain') {
      this.startRain();
    } else if (type === 'waves') {
      this.startOceanWaves();
    } else if (type === 'hearth') {
      this.startHearthFire();
    } else if (type === 'zen') {
      this.startZenSingingBowl();
    }
  }

  private startRain() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Pink noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Gentle low-pass for rain
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.35, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start();

    // Occasional gentle droplet resonance
    const dropTimer = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      if (Math.random() > 0.4) {
        const osc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        const freq = 1200 + Math.random() * 800;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.08);

        dropGain.gain.setValueAtTime(0.015, ctx.currentTime);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

        osc.connect(dropGain);
        dropGain.connect(this.masterGain!);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      }
    }, 280);

    this.cleanupFns.push(() => {
      clearInterval(dropTimer);
      try {
        whiteNoise.stop();
        whiteNoise.disconnect();
      } catch (e) {}
    });
  }

  private startOceanWaves() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    // LFO to swell the ocean volume gently every 8 seconds
    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.1, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec period
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.25, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.cleanupFns.push(() => {
      try {
        noise.stop();
        lfo.stop();
      } catch (e) {}
    });
  }

  private startHearthFire() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Low gentle fire rumble
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, ctx.currentTime);

    const hearthGain = ctx.createGain();
    hearthGain.gain.setValueAtTime(0.28, ctx.currentTime);

    noise.connect(filter);
    filter.connect(hearthGain);
    hearthGain.connect(this.masterGain);
    noise.start();

    // Random little crackles
    const crackleInterval = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      if (Math.random() > 0.45) {
        const crackle = ctx.createBufferSource();
        const count = Math.floor(ctx.sampleRate * 0.015);
        const crackleBuf = ctx.createBuffer(1, count, ctx.sampleRate);
        const crackleData = crackleBuf.getChannelData(0);
        for (let j = 0; j < count; j++) {
          crackleData[j] = (Math.random() * 2 - 1) * 0.1;
        }
        crackle.buffer = crackleBuf;
        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime(0.08, ctx.currentTime);
        crackle.connect(cGain);
        cGain.connect(this.masterGain!);
        crackle.start();
      }
    }, 140);

    this.cleanupFns.push(() => {
      clearInterval(crackleInterval);
      try {
        noise.stop();
      } catch (e) {}
    });
  }

  private startZenSingingBowl() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const baseFreq = 216; // Harmonic gentle A/C# tone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc2.frequency.setValueAtTime(baseFreq * 2.01, ctx.currentTime);
    osc3.frequency.setValueAtTime(baseFreq * 3.02, ctx.currentTime);

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const gain3 = ctx.createGain();

    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain2.gain.setValueAtTime(0.05, ctx.currentTime);
    gain3.gain.setValueAtTime(0.02, ctx.currentTime);

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    const zenMaster = ctx.createGain();
    zenMaster.gain.setValueAtTime(0.2, ctx.currentTime);

    gain1.connect(zenMaster);
    gain2.connect(zenMaster);
    gain3.connect(zenMaster);
    zenMaster.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc3.start();

    this.cleanupFns.push(() => {
      try {
        osc1.stop();
        osc2.stop();
        osc3.stop();
      } catch (e) {}
    });
  }
}
