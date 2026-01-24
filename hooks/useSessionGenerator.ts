
import { useState, useRef, useEffect } from 'react';
import { generateMeditationScript, generateMeditationVideo, generateMeditationAudio } from '../services/geminiService';
import { MeditationSession, SessionFormData, ImageSize, VoiceName, MusicGenre } from '../types';
import { MOODS, VISUAL_STYLES, VOICES, MUSIC_GENRES } from '../constants';

interface UseSessionGeneratorProps {
  addSession: (session: MeditationSession) => void;
  setActiveSession: (session: MeditationSession | null) => void;
  audioContext: AudioContext | null;
}

export const useSessionGenerator = ({ addSession, setActiveSession, audioContext }: UseSessionGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const generateSession = async (formData: SessionFormData, isKid: boolean): Promise<void> => {
    if (!audioContext) {
      throw new Error("Audio context is not initialized. User interaction required.");
    }

    setLoading(true);
    setStatus('Writing your meditation story...');

    try {
      const { title, script, visualPrompt } = await generateMeditationScript(
        isKid ? "6-9" : "Adult",
        formData.mood,
        formData.visualStyle,
        formData.duration
      );

      if (!isMounted.current) return;
      setStatus('Creating a magical video loop (this takes a moment)...');
      
      const videoUrl = await generateMeditationVideo(visualPrompt);

      if (!isMounted.current) return;
      setStatus('Recording the voices...');
      
      const audioBuffer = await generateMeditationAudio(script, formData.voice, audioContext);

      if (!isMounted.current) return;

      const newSession: MeditationSession = {
        id: Date.now().toString(),
        title,
        script,
        mood: formData.mood,
        duration: formData.duration,
        visualStyle: formData.visualStyle,
        visualPrompt,
        videoUrl,
        backgroundMusic: formData.backgroundMusic,
        audioBuffer,
        createdAt: Date.now()
      };

      addSession(newSession);
      setActiveSession(newSession);
    } catch (error) {
      console.error('Session generation failed:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setStatus('');
      }
    }
  };

  /**
   * Generates a session with random parameters.
   */
  const surpriseMe = async (isKid: boolean) => {
    const random = <T>(arr: T[] | Record<string, T[]>): T => {
        const list = Array.isArray(arr) ? arr : (arr as any)[isKid ? 'KID' : 'ADULT']; // Fallback for Mode keyed constants if raw array passed
        return list[Math.floor(Math.random() * list.length)];
    }
    
    // Pick random constants appropriate for mode
    const mood = MOODS[isKid ? 'KID' : 'ADULT'][Math.floor(Math.random() * MOODS[isKid ? 'KID' : 'ADULT'].length)];
    const style = VISUAL_STYLES[isKid ? 'KID' : 'ADULT'][Math.floor(Math.random() * VISUAL_STYLES[isKid ? 'KID' : 'ADULT'].length)];
    const voice = VOICES[isKid ? 'KID' : 'ADULT'][Math.floor(Math.random() * VOICES[isKid ? 'KID' : 'ADULT'].length)];
    const music = MUSIC_GENRES[Math.floor(Math.random() * MUSIC_GENRES.length)];
    
    const randomData: SessionFormData = {
        mood,
        visualStyle: style,
        voice,
        backgroundMusic: music,
        duration: 'Short',
        imageSize: ImageSize.Size_1K
    };
    
    await generateSession(randomData, isKid);
  };

  return {
    generateSession,
    surpriseMe,
    loading,
    status
  };
};
