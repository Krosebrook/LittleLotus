
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageSize, VoiceName } from "../types";
import { atobHelper, decodeAudioData } from "../utils/audio";
import { buildMeditationScriptPrompt, getChatSystemInstruction } from "../utils/prompts";

// Initialize Gemini Client with the API Key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a structured meditation script, title, and visual prompt based on user inputs.
 * Uses the `gemini-3-pro-preview` model to ensure high-quality reasoning and JSON adherence.
 * 
 * @param {string} ageGroup - The target age group (e.g., "Adult", "6-9").
 * @param {string} mood - The desired mood or goal of the session.
 * @param {string} visualStyle - The visual theme for the session.
 * @param {string} duration - The approximate duration ("Short" or "Long").
 * @returns {Promise<{ title: string; script: string; visualPrompt: string }>} A promise resolving to the generated content.
 * @throws {Error} If the model fails to generate valid text or JSON.
 */
export const generateMeditationScript = async (
  ageGroup: string,
  mood: string,
  visualStyle: string,
  duration: string
): Promise<{ title: string; script: string; visualPrompt: string }> => {
  const prompt = buildMeditationScriptPrompt(ageGroup, mood, visualStyle, duration);

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A calming or creative title" },
          script: { type: Type.STRING, description: "The spoken meditation script" },
          visualPrompt: { type: Type.STRING, description: "Prompt for image generation" }
        },
        required: ["title", "script", "visualPrompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No script generated from Gemini.");
  return JSON.parse(text);
};

/**
 * Generates a background image for the meditation session using Gemini 3.0 Pro Image.
 * 
 * @param {string} prompt - The descriptive prompt generated in the previous step.
 * @param {ImageSize} size - The desired resolution (1K, 2K, 4K).
 * @returns {Promise<string>} The base64 data URL of the generated image (PNG format).
 * @throws {Error} If no image data is returned.
 */
export const generateMeditationImage = async (
  prompt: string,
  size: ImageSize
): Promise<string> => {
  // Using gemini-3-pro-image-preview for high quality images
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size // 1K, 2K, or 4K
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated.");
};

/**
 * Generates audio speech from text using the `gemini-2.5-flash-preview-tts` model.
 * 
 * @param {string} text - The text script to be spoken.
 * @param {VoiceName} voiceName - The specific voice persona configuration.
 * @param {AudioContext} audioContext - The AudioContext used to decode the raw PCM data.
 * @returns {Promise<AudioBuffer>} The decoded AudioBuffer, ready for playback.
 * @throws {Error} If audio generation or decoding fails.
 */
export const generateMeditationAudio = async (
  text: string,
  voiceName: VoiceName,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated.");

  const audioBytes = atobHelper(base64Audio);
  return await decodeAudioData(audioBytes, audioContext);
};

/**
 * Sends a chat message to the Gemini bot and retrieves the response.
 * Uses a persistent history (passed from the client) to maintain context.
 * 
 * @param {string} message - The user's input message.
 * @param {{ role: 'user' | 'model'; text: string }[]} history - The conversation history.
 * @param {boolean} isKid - Whether to use the Kid-friendly system instruction.
 * @returns {Promise<string>} The model's text response.
 */
export const chatWithBot = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  isKid: boolean
): Promise<string> => {
  const systemInstruction = getChatSystemInstruction(isKid);

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { systemInstruction },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message });
  return result.text || "I'm having a little trouble thinking right now. Let's take a deep breath.";
};
