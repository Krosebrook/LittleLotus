
import { MusicGenre } from "../types";
import { audioBufferToWav } from "../utils/audio";

/**
 * Creates a buffer of White Noise.
 * Used as a building block for Nature and Lo-fi sounds.
 */
const createNoiseBuffer = (ctx: BaseAudioContext): AudioBuffer => {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

interface AmbienceController {
  stop: () => void;
  gainNode: GainNode;
}

/**
 * Plays a specific ambient soundscape based on the requested genre.
 * Returns a controller object to stop the sound or manipulate its gain.
 * 
 * @param ctx - The AudioContext (or OfflineAudioContext) to render audio in.
 * @param genre - The selected music genre.
 * @param destination - The destination node (usually a GainNode) to connect to.
 * @returns {AmbienceController} Object containing stop function and the main gain node.
 */
export const playAmbience = (
  ctx: BaseAudioContext, 
  genre: MusicGenre, 
  destination: AudioNode
): AmbienceController => {
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
  const stop = () => {
    // Check if context is closed/offline before trying to schedule params
    if (ctx.state === 'closed') return;

    const stopTime = ctx.currentTime;
    try {
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.linearRampToValueAtTime(0, stopTime + 1);
    } catch(e) { /* ignore if already stopped */ }

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

  return { stop, gainNode: gain };
};


/**
 * Renders the full session (voice + synthesized music) to a WAV blob.
 */
export const renderSessionToWav = async (
    voiceBuffer: AudioBuffer,
    musicGenre: MusicGenre,
    musicVolume: number,
    voiceVolume: number
): Promise<Blob> => {
    // Create Offline Context matching voice duration + tail
    const duration = voiceBuffer.duration + 2; // +2s tail
    const sampleRate = voiceBuffer.sampleRate;
    const offlineCtx = new OfflineAudioContext(2, duration * sampleRate, sampleRate);

    // 1. Setup Voice
    const voiceSrc = offlineCtx.createBufferSource();
    voiceSrc.buffer = voiceBuffer;
    const voiceGain = offlineCtx.createGain();
    voiceGain.gain.value = voiceVolume;
    voiceSrc.connect(voiceGain);
    voiceGain.connect(offlineCtx.destination);
    voiceSrc.start(0);

    // 2. Setup Music
    if (musicGenre !== MusicGenre.NoMusic) {
        // We use a gain node to apply the user's volume preference
        const musicMasterGain = offlineCtx.createGain();
        musicMasterGain.gain.value = musicVolume;
        musicMasterGain.connect(offlineCtx.destination);
        
        // Play ambience into that gain
        const { gainNode } = playAmbience(offlineCtx, musicGenre, musicMasterGain);
        
        // Schedule fade out at end of session
        gainNode.gain.setValueAtTime(gainNode.gain.value, duration - 2);
        gainNode.gain.linearRampToValueAtTime(0, duration);
    }

    // 3. Render
    const renderedBuffer = await offlineCtx.startRendering();

    // 4. Encode to WAV
    return audioBufferToWav(renderedBuffer);
};
