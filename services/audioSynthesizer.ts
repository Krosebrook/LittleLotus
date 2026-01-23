
import { MusicGenre } from "../types";

/**
 * Creates a buffer of White Noise.
 * Used as a building block for Nature and Lo-fi sounds.
 */
const createNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

/**
 * Plays a specific ambient soundscape based on the requested genre.
 * Returns a cleanup function to stop the sound.
 * 
 * @param ctx - The AudioContext to render audio in.
 * @param genre - The selected music genre.
 * @param destination - The destination node (usually a GainNode) to connect to.
 * @returns A function that stops and disconnects all nodes created.
 */
export const playAmbience = (
  ctx: AudioContext, 
  genre: MusicGenre, 
  destination: AudioNode
): (() => void) => {
  const nodes: AudioNode[] = [];
  const time = ctx.currentTime;

  // Master gain for this specific ambience track to balance levels
  const gain = ctx.createGain();
  gain.connect(destination);
  nodes.push(gain);

  // Helper to start an oscillator
  const playOsc = (type: OscillatorType, freq: number, vol: number, detune = 0) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    
    oscGain.gain.value = vol;
    
    osc.connect(oscGain);
    oscGain.connect(gain);
    
    osc.start();
    nodes.push(osc, oscGain);
    return { osc, oscGain };
  };

  // Helper to play noise
  const playNoise = (filterType: BiquadFilterType, freq: number, vol: number) => {
    const bufferSrc = ctx.createBufferSource();
    bufferSrc.buffer = createNoiseBuffer(ctx);
    bufferSrc.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = vol;
    
    bufferSrc.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(gain);
    
    bufferSrc.start();
    nodes.push(bufferSrc, filter, noiseGain);
  };

  switch (genre) {
    case MusicGenre.TibetanBowls:
      // Deep, resonant sine waves with slow amplitude modulation
      gain.gain.value = 0.3;
      playOsc('sine', 110, 0.5); // Fundamental (A2)
      playOsc('sine', 220, 0.2, 5); // Harmonic 1
      playOsc('sine', 330, 0.1, -5); // Harmonic 2
      
      // LFO for subtle pulsing
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.1; // Very slow
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.1;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      nodes.push(lfo, lfoGain);
      break;

    case MusicGenre.AmbientSynth:
      // Warm pads using detuned triangle waves
      gain.gain.value = 0.2;
      playOsc('triangle', 130.81, 0.4); // C3
      playOsc('triangle', 164.81, 0.3, 10); // E3 (detuned)
      playOsc('triangle', 196.00, 0.3, -10); // G3 (detuned)
      
      // Lowpass filter to soften the sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      gain.disconnect();
      gain.connect(filter);
      filter.connect(destination);
      nodes.push(filter);
      break;

    case MusicGenre.NatureSounds:
      // Brown noise for wind/rain texture
      gain.gain.value = 0.15;
      playNoise('lowpass', 400, 1.0); // Deep rumble
      playNoise('highpass', 800, 0.2); // Airy hiss
      break;

    case MusicGenre.LoFi:
      // Vinyl crackle (noise) + Electric Piano chord
      gain.gain.value = 0.25;
      playNoise('bandpass', 1000, 0.05); // Subtle static
      
      // Simple Major 7th chord
      playOsc('sine', 261.63, 0.3); // C4
      playOsc('sine', 329.63, 0.2); // E4
      playOsc('sine', 392.00, 0.2); // G4
      playOsc('sine', 493.88, 0.1); // B4
      break;

    case MusicGenre.NoMusic:
    default:
      // Do nothing
      break;
  }

  // Fade in
  const originalGain = gain.gain.value;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(originalGain, time + 2);

  // Return Cleanup Function
  return () => {
    const stopTime = ctx.currentTime;
    // Fade out
    gain.gain.cancelScheduledValues(stopTime);
    gain.gain.setValueAtTime(gain.gain.value, stopTime);
    gain.gain.linearRampToValueAtTime(0, stopTime + 1);

    setTimeout(() => {
      nodes.forEach(node => {
        try {
          if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
            node.stop();
          }
          node.disconnect();
        } catch (e) {
          // Ignore errors on already stopped nodes
        }
      });
    }, 1100);
  };
};
