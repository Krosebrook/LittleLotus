
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppMode, MeditationSession } from '../types';
import { getAudioContext } from '../utils/audio';

interface AppContextType {
  mode: AppMode;
  isKid: boolean;
  toggleMode: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  sessions: MeditationSession[];
  addSession: (session: MeditationSession) => void;
  activeSession: MeditationSession | null;
  setActiveSession: (session: MeditationSession | null) => void;
  audioContext: AudioContext | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Global Context Provider for the application.
 * Manages:
 * - Application Mode (Kid/Adult)
 * - Dark Mode (Persistence & HTML Class)
 * - AudioContext Lifecycle (Unlocking on user interaction)
 * - Session Storage (In-memory)
 * - Active Playback Session
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>(AppMode.Adult);
  
  // Initialize dark mode from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('MINDFUL_MATES_DARK_MODE');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const isKid = mode === AppMode.Kid;

  // Apply dark mode class to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('MINDFUL_MATES_DARK_MODE', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  /**
   * Initializes the AudioContext.
   * Browsers require a user gesture (click, touch, keydown) to unlock the AudioContext.
   * We listen for the first interaction to create and resume the context.
   */
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext) {
        try {
          const ctx = getAudioContext();
          setAudioContext(ctx);
        } catch (e) {
          console.error("Failed to initialize audio context", e);
        }
      }
    };

    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [audioContext]);

  const toggleMode = () => {
    setMode(prev => prev === AppMode.Adult ? AppMode.Kid : AppMode.Adult);
  };

  const addSession = (session: MeditationSession) => {
    setSessions(prev => [session, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      mode,
      isKid,
      toggleMode,
      isDarkMode,
      toggleDarkMode,
      sessions,
      addSession,
      activeSession,
      setActiveSession,
      audioContext
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
