
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppMode, MeditationSession } from '../types';
import { getAudioContext } from '../utils/audio';

interface AppContextType {
  mode: AppMode;
  isKid: boolean;
  toggleMode: () => void;
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
 * - AudioContext Lifecycle (Unlocking on user interaction)
 * - Session Storage (In-memory)
 * - Active Playback Session
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>(AppMode.Adult);
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const isKid = mode === AppMode.Kid;

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
      // Remove listeners once successfully initialized
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

/**
 * Custom hook to access the global application state.
 * @throws {Error} If used outside of an AppProvider.
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
