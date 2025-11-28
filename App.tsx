
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SessionBuilder } from './components/SessionBuilder';
import { MeditationPlayer } from './components/MeditationPlayer';
import { ChatBot } from './components/ChatBot';
import { NavBar } from './components/NavBar';
import { Dashboard } from './components/Dashboard';
import { Plus } from 'lucide-react';
import { Button } from './components/Button';

/**
 * Inner layout component that consumes the AppContext.
 * Handles the main view routing (Dashboard <-> SessionBuilder).
 */
const AppLayout: React.FC = () => {
  const { isKid, activeSession, setActiveSession } = useApp();
  const [view, setView] = useState<'dashboard' | 'create'>('dashboard');

  const handleCreateNew = () => {
    setView('create');
  };

  const handleSessionComplete = () => {
    setView('dashboard');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isKid ? 'bg-sky-50 font-rounded' : 'bg-slate-50 font-sans'}`}>
      
      {/* Navigation Bar */}
      <NavBar />

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
                onClick={handleCreateNew}
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
          <SessionBuilder onComplete={handleSessionComplete} />
        ) : (
          <Dashboard onCreateNew={handleCreateNew} />
        )}
      </main>

      {/* Active Session Player Overlay */}
      {activeSession && (
        <MeditationPlayer 
          session={activeSession} 
          onClose={() => setActiveSession(null)}
        />
      )}

      {/* Persistent Chat Bot */}
      <ChatBot />

    </div>
  );
};

/**
 * Main Application Entry.
 * Wraps the layout in the Context Provider.
 */
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default App;
