
import { useState } from 'react';
import { generateMeditationScript, generateMeditationImage, generateMeditationAudio } from '../services/geminiService';
import { MeditationSession, SessionFormData } from '../types';

interface UseSessionGeneratorProps {
  addSession: (session: MeditationSession) => void;
  setActiveSession: (session: MeditationSession | null) => void;
  audioContext: AudioContext | null;
}

/**
 * Custom hook to encapsulate the business logic for generating a full meditation session.
 * Orchestrates a sequence of 3 API calls:
 * 1. Generate Script (Text)
 * 2. Generate Image (Visual)
 * 3. Generate Audio (TTS)
 * 
 * Manages loading states and status messages for UI feedback.
 * 
 * @param {UseSessionGeneratorProps} props - Dependencies needed to save and play the session.
 * @returns {Object} Methods and state for the generation process.
 */
export const useSessionGenerator = ({ addSession, setActiveSession, audioContext }: UseSessionGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  /**
   * Trigger the generation workflow.
   * @param {SessionFormData} formData - The user's configuration for the session.
   * @param {boolean} isKid - Whether to generate kid-appropriate content.
   */
  const generateSession = async (formData: SessionFormData, isKid: boolean): Promise<void> => {
    if (!audioContext) {
      throw new Error("Audio context is not initialized. User interaction required.");
    }

    setLoading(true);
    setStatus('Writing your meditation script...');

    try {
      // Step 1: Generate the script using the LLM
      const { title, script, visualPrompt } = await generateMeditationScript(
        isKid ? "6-9" : "Adult",
        formData.mood,
        formData.visualStyle,
        formData.duration
      );

      setStatus('Painting your unique visual...');
      
      // Step 2: Generate the background image based on the LLM's visual prompt
      const imageUrl = await generateMeditationImage(visualPrompt, formData.imageSize);

      setStatus('Recording the voiceover...');
      
      // Step 3: Generate the audio speech from the script
      const audioBuffer = await generateMeditationAudio(script, formData.voice, audioContext);

      // Construct the final session object
      const newSession: MeditationSession = {
        id: Date.now().toString(),
        title,
        script,
        mood: formData.mood,
        duration: formData.duration,
        visualStyle: formData.visualStyle,
        visualPrompt,
        imageUrl,
        backgroundMusic: formData.backgroundMusic,
        audioBuffer,
        createdAt: Date.now()
      };

      // Update global state
      addSession(newSession);
      setActiveSession(newSession);
    } catch (error) {
      console.error('Session generation failed:', error);
      throw error;
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return {
    generateSession,
    loading,
    status
  };
};