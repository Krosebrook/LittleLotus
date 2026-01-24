
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageSize, VoiceName } from "../types";
import { atobHelper, decodeAudioData } from "../utils/audio";
import { buildMeditationScriptPrompt, getChatSystemInstruction } from "../utils/prompts";

// Initialize Gemini Client with the API Key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a structured meditation script, title, and visual prompt.
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
          script: { type: Type.STRING, description: "The spoken meditation script dialogue" },
          visualPrompt: { type: Type.STRING, description: "Prompt for video generation" }
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
 * Generates a video background using Veo 3.1.
 */
export const generateMeditationVideo = async (
  prompt: string
): Promise<string> => {
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '1:1' 
    }
  });

  // Poll for completion with timeout
  const startTime = Date.now();
  const MAX_WAIT_MS = 60000; // 60 seconds max wait

  while (!operation.done) {
    if (Date.now() - startTime > MAX_WAIT_MS) {
        throw new Error("Video generation timed out.");
    }
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed.");

  // Append API Key to fetch the binary content
  return `${videoUri}&key=${process.env.API_KEY}`;
};

/**
 * Generates multi-speaker audio from text using `gemini-2.5-flash-preview-tts`.
 */
export const generateMeditationAudio = async (
  script: string,
  mainVoice: VoiceName,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  // Determine secondary voice based on main voice to ensure contrast
  const secondaryVoice = mainVoice === VoiceName.Puck ? VoiceName.Kore : VoiceName.Puck;

  const prompt = `TTS the following conversation:\n${script}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'Guide',
              voiceConfig: { prebuiltVoiceConfig: { voiceName: mainVoice } }
            },
            {
              speaker: 'Buddy', // Used for Kid mode prompt
              voiceConfig: { prebuiltVoiceConfig: { voiceName: secondaryVoice } }
            },
            {
              speaker: 'InnerSelf', // Used for Adult mode prompt
              voiceConfig: { prebuiltVoiceConfig: { voiceName: secondaryVoice } }
            }
          ]
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
 * Sends a chat message to the Gemini bot with Search Grounding enabled.
 */
export const chatWithBot = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  isKid: boolean
): Promise<{ text: string; sources?: { title: string; uri: string }[] }> => {
  const systemInstruction = getChatSystemInstruction(isKid);

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { 
      systemInstruction,
      tools: [{ googleSearch: {} }] // Enable Search Grounding
    },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message });
  
  // Extract grounding metadata
  const sources: { title: string; uri: string }[] = [];
  const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  chunks.forEach(chunk => {
    if (chunk.web) {
      sources.push({ title: chunk.web.title || "Source", uri: chunk.web.uri || "#" });
    }
  });

  return {
    text: result.text || "I'm listening...",
    sources: sources.length > 0 ? sources : undefined
  };
};

export const geminiClient = ai;
