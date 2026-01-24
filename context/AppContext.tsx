
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
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>(AppMode.Adult);
  
  // Initialize dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('MINDFUL_MATES_DARK_MODE');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Initialize sessions from local storage
  const [sessions, setSessions] = useState<MeditationSession[]>(() => {
    try {
      const saved = localStorage.getItem('MINDFUL_MATES_SESSIONS');
      if (saved) {
        // Note: AudioBuffers cannot be stringified. Persisted sessions will strictly be
        // for history/display unless we re-synthesize or cache audio blobs (advanced).
        // For now, we accept that reloaded sessions might need regeneration of audio or 
        // will just show metadata. 
        // *Improvement*: Filter out sessions without audio support or indicate they are archived.
        return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const isKid = mode === AppMode.Kid;

  // Persist Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('MINDFUL_MATES_DARK_MODE', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Persist Sessions (excluding heavy buffers to avoid quota limits)
  useEffect(() => {
    const sessionsToSave = sessions.map(s => {
      // Strip audioBuffer and non-serializable fields for storage
      const { audioBuffer, ...rest } = s;
      return rest;
    });
    localStorage.setItem('MINDFUL_MATES_SESSIONS', JSON.stringify(sessionsToSave));
  }, [sessions]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

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
