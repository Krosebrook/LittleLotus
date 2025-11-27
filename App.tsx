
import React, { useState, useEffect } from 'react';
import { AppMode, MeditationSession } from './types';
import { SessionBuilder } from './components/SessionBuilder';
import { MeditationPlayer } from './components/MeditationPlayer';
import { ChatBot } from './components/ChatBot';
import { NavBar } from './components/NavBar';
import { Dashboard } from './components/Dashboard';
import { Plus } from 'lucide-react';
import { Button } from './components/Button';
import { getAudioContext } from './utils/audio';

/**
 * Main Application Controller.
 * Handles top-level state:
 * - AppMode (Kid/Adult)
 * - Navigation View State
 * - Active Sessions
 * - AudioContext Initialization
 */
const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Adult);
  const [view, setView] = useState<'dashboard' | 'create' | 'history'>('dashboard');
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Initialize AudioContext on first interaction to comply with browser autoplay policies
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtx) {
        setAudioCtx(getAudioContext());
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, [audioCtx]);

  const handleSessionCreated = (session: MeditationSession) => {
    setSessions(prev => [session, ...prev]);
    setActiveSession(session);
    setView('dashboard');
  };

  const isKid = mode === AppMode.Kid;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isKid ? 'bg-sky-50 font-rounded' : 'bg-slate-50 font-sans'}`}>
      
      {/* Navigation Bar */}
      <NavBar 
        mode={mode} 
        onToggleMode={() => setMode(mode === AppMode.Adult ? AppMode.Kid : AppMode.Adult)} 
      />

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 max-w-5xl pb-24">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isKid ? 'text-slate-800' : 'text-slate-900'}`}>
              {isKid ? "Welcome to your Calm Corner! 🎪" : "Good Afternoon."}
            </h1>
            <p className="text-slate-500">
              {isKid ? "Let's find some magic today." : "Ready to find your center?"}
            </p>
          </div>
          
          <div className="flex gap-3">
            {view !== 'create' && (
              <Button 
                variant={isKid ? 'kid' : 'primary'} 
                onClick={() => setView('create')}
                className="py-3 px-6 text-lg"
              >
                <Plus size={20} />
                {isKid ? "New Magic Story" : "New Session"}
              </Button>
            )}
            {view !== 'dashboard' && (
              <Button variant="ghost" onClick={() => setView('dashboard')}>
                Cancel
              </Button>
            )}
          </div>
        </header>

        {/* View Router */}
        {view === 'create' ? (
          <SessionBuilder 
            mode={mode} 
            onSessionCreated={handleSessionCreated} 
            audioContext={audioCtx || getAudioContext()} 
          />
        ) : (
          <Dashboard 
            mode={mode}
            sessions={sessions}
            onSessionSelect={setActiveSession}
            onCreateNew={() => setView('create')}
          />
        )}
      </main>

      {/* Active Session Player Overlay */}
      {activeSession && (
        <MeditationPlayer 
          session={activeSession} 
          mode={mode}
          onClose={() => setActiveSession(null)}
          audioContext={audioCtx || getAudioContext()}
        />
      )}

      {/* Persistent Chat Bot */}
      <ChatBot mode={mode} />

    </div>
  );
};

export default App;
