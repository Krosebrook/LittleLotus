
import React from 'react';
import { AppMode, MeditationSession } from '../types';
import { Button } from './Button';
import { Moon } from 'lucide-react';

interface DashboardProps {
  /** Current application mode */
  mode: AppMode;
  /** List of created sessions */
  sessions: MeditationSession[];
  /** Callback when a session is selected */
  onSessionSelect: (session: MeditationSession) => void;
  /** Callback to trigger creation of a new session */
  onCreateNew: () => void;
}

/**
 * Dashboard component displaying user stats (adult only) and the grid of recent meditation sessions.
 */
export const Dashboard: React.FC<DashboardProps> = ({ mode, sessions, onSessionSelect, onCreateNew }) => {
  const isKid = mode === AppMode.Kid;

  return (
    <div className="space-y-10">
      {/* Quick Stats / Mood Tracker (Adult Only) */}
      {!isKid && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Sessions</h3>
              <p className="text-4xl font-light text-slate-800">{sessions.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Streak</h3>
              <p className="text-4xl font-light text-slate-800">3 Days</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Fav Mood</h3>
              <p className="text-4xl font-light text-slate-800">Focus</p>
            </div>
          </div>
      )}

      {/* Recent Sessions */}
      <div className="space-y-4">
        <h2 className={`text-2xl font-bold ${isKid ? 'text-kid-primary' : 'text-slate-800'}`}>
          {isKid ? "Your Magic Journeys" : "Recent Sessions"}
        </h2>
        
        {sessions.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${isKid ? 'border-kid-secondary bg-white' : 'border-slate-200 bg-slate-50'}`}>
            <p className="text-slate-400 mb-4">{isKid ? "No stories yet! Let's make one!" : "No sessions created yet."}</p>
            <Button variant={isKid ? 'kid' : 'outline'} onClick={onCreateNew}>Create First Session</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => (
              <div 
                key={session.id} 
                onClick={() => onSessionSelect(session)}
                className={`group cursor-pointer rounded-2xl overflow-hidden transition-all hover:shadow-xl ${
                  isKid ? 'bg-white shadow-[4px_4px_0px_#f59e0b] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#f59e0b]' : 'bg-white shadow-md hover:shadow-lg'
                }`}
                role="button"
                aria-label={`Play session: ${session.title}`}
              >
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  {session.imageUrl ? (
                    <img src={session.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                      <Moon className="text-indigo-200" size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded">
                    {session.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate">{session.title}</h3>
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>{session.mood}</span>
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
