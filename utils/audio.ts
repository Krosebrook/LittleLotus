
/**
 * Interface extension to support vendor-prefixed AudioContext for legacy browser support.
 */
interface WindowWithAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
  AudioContext?: typeof AudioContext;
}

/**
 * Creates and returns a new AudioContext instance.
 * Checks for standard `AudioContext` and legacy `webkitAudioContext`.
 * 
 * @returns {AudioContext} The initialized AudioContext.
 * @throws {Error} If the Web Audio API is not supported in the current environment.
 */
export const getAudioContext = (): AudioContext => {
  const win = window as unknown as WindowWithAudio;
  const AudioContextClass = win.AudioContext || win.webkitAudioContext;
  
  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported in this browser.");
  }
  
  return new AudioContextClass();
};

/**
 * Helper utility to decode a base64 encoded string into a Uint8Array.
 * Used to convert the raw API response data into a binary buffer.
 * 
 * @param {string} base64 - The base64 string to decode.
 * @returns {Uint8Array} The decoded byte array.
 */
export function atobHelper(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM (Pulse Code Modulation) audio data into a Web Audio API AudioBuffer.
 * The Gemini API returns raw 16-bit signed integer PCM data which must be normalized
 * to floating point numbers between -1.0 and 1.0 for the Web Audio API.
 * 
 * @param {Uint8Array} data - The raw PCM audio data (little-endian 16-bit integers).
 * @param {AudioContext} ctx - The AudioContext used to create the buffer.
 * @param {number} [sampleRate=24000] - The sample rate of the audio data (Default: 24kHz for Gemini).
 * @param {number} [numChannels=1] - The number of audio channels (Default: 1 for Mono).
 * @returns {Promise<AudioBuffer>} A promise that resolves to the playable AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize 16-bit integer (-32768 to 32767) to float (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
