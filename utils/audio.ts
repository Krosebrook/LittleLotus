/**
 * Creates and returns a new AudioContext instance.
 * Handles browser prefixes if necessary (e.g., webkitAudioContext).
 * @returns {AudioContext} The created AudioContext.
 */
export const getAudioContext = (): AudioContext => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContextClass();
};

/**
 * Decodes a base64 encoded string into a Uint8Array.
 * Useful for processing binary data received from APIs.
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
 * Decodes raw PCM audio data into an AudioBuffer.
 * This is specific to the raw PCM format returned by some Gemini models.
 * @param {Uint8Array} data - The raw audio data (PCM).
 * @param {AudioContext} ctx - The AudioContext to use for decoding.
 * @param {number} [sampleRate=24000] - The sample rate of the audio data.
 * @param {number} [numChannels=1] - The number of channels in the audio data.
 * @returns {Promise<AudioBuffer>} A promise that resolves to the decoded AudioBuffer.
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
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
