
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageSize, VoiceName } from "../types";
import { atobHelper, decodeAudioData } from "../utils/audio";
import { buildMeditationScriptPrompt, getChatSystemInstruction } from "../utils/prompts";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a meditation script, title, and visual prompt based on user inputs.
 * Uses the `gemini-3-pro-preview` model for structured JSON output.
 * 
 * @param {string} ageGroup - The target age group (e.g., "Adult", "6-9").
 * @param {string} mood - The desired mood or goal of the session.
 * @param {string} visualStyle - The visual theme for the session.
 * @param {string} duration - The approximate duration ("Short" or "Long").
 * @returns {Promise<{ title: string; script: string; visualPrompt: string }>} The generated content.
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
          title: { type: Type.STRING },
          script: { type: Type.STRING },
          visualPrompt: { type: Type.STRING }
        },
        required: ["title", "script", "visualPrompt"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No script generated");
  return JSON.parse(text);
};

/**
 * Generates an image for the meditation session using Gemini 3.0 Pro Image.
 * 
 * @param {string} prompt - The image generation prompt.
 * @param {ImageSize} size - The desired resolution (1K, 2K, 4K).
 * @returns {Promise<string>} The base64 data URL of the generated image.
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
  throw new Error("No image generated");
};

/**
 * Generates audio speech from text using Gemini 2.5 Flash TTS.
 * 
 * @param {string} text - The text to speak.
 * @param {VoiceName} voiceName - The specific voice configuration to use.
 * @param {AudioContext} audioContext - The AudioContext to decode the result into.
 * @returns {Promise<AudioBuffer>} The decoded audio buffer.
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
  if (!base64Audio) throw new Error("No audio generated");

  const audioBytes = atobHelper(base64Audio);
  return await decodeAudioData(audioBytes, audioContext);
};

/**
 * Sends a chat message to the Gemini bot and retrieves the response.
 * 
 * @param {string} message - The user's message.
 * @param {{ role: 'user' | 'model'; text: string }[]} history - The conversation history.
 * @param {boolean} isKid - Whether the chat is in Kid mode (adjusts persona).
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
