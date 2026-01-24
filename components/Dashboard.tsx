
import React from 'react';
import { Button } from './Button';
import { Moon, Sparkles, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSessionGenerator } from '../hooks/useSessionGenerator';

interface DashboardProps {
  onCreateNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCreateNew }) => {
  const { isKid, sessions, setActiveSession, addSession, audioContext } = useApp();
  
  // We instantiate generator here for the Surprise Me feature
  const { surpriseMe, loading, status } = useSessionGenerator({ 
      addSession, 
      setActiveSession, 
      audioContext 
  });

  const handleSurprise = () => {
    if(!audioContext) {
        alert("Please tap anywhere to unlock audio first!");
        return;
    }
    surpriseMe(isKid);
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className={`w-20 h-20 mb-6 rounded-full border-4 border-t-transparent animate-spin ${isKid ? 'border-kid-primary' : 'border-indigo-600'}`} />
            <h3 className="text-2xl font-bold mb-2">Creating a Surprise!</h3>
            <p className="text-slate-500">{status}</p>
        </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Stats & Quick Actions */}
      <div className="flex flex-col md:flex-row gap-6">
         {!isKid && sessions.length > 0 && (
             <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
               <div>
                 <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Sessions</h3>
                 <p className="text-4xl font-light text-slate-800">{sessions.length}</p>
               </div>
               <Moon size={40} className="text-slate-200" />
             </div>
         )}
         
         <div className="flex-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                    <Zap size={20} className="text-yellow-300 fill-yellow-300" />
                    {isKid ? "Magic Surprise Button" : "Feeling Adventurous?"}
                </h3>
                <p className="opacity-90 text-sm mb-4">
                    {isKid ? "Let the magic pick a story for you!" : "Generate a completely random session instantly."}
                </p>
                <Button 
                    variant={isKid ? 'kid' : 'secondary'} 
                    className="w-full bg-white text-indigo-600 hover:bg-slate-100 border-none"
                    onClick={handleSurprise}
                >
                    <Sparkles size={18} className="mr-2" />
                    {isKid ? "Surprise Me!" : "Generate Random Session"}
                </Button>
            </div>
            {/* Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform">
                <Sparkles size={120} />
            </div>
         </div>
      </div>

      {/* Recent Sessions */}
      <div className="space-y-4">
        <h2 className={`text-2xl font-bold ${isKid ? 'text-kid-primary' : 'text-slate-800 dark:text-white'}`}>
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
                onClick={() => session.audioBuffer ? setActiveSession(session) : alert("This session was loaded from history. Audio regeneration is not yet supported in this demo.")}
                className={`group cursor-pointer rounded-2xl overflow-hidden transition-all hover:shadow-xl relative ${
                  isKid ? 'bg-white shadow-[4px_4px_0px_#f59e0b] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#f59e0b]' : 'bg-white shadow-md hover:shadow-lg'
                } ${!session.audioBuffer ? 'opacity-70 grayscale-[0.5]' : ''}`}
              >
                {!session.audioBuffer && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                        <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold">Archived (No Audio)</span>
                    </div>
                )}
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  {session.videoUrl ? (
                     <video src={session.videoUrl} className="w-full h-full object-cover opacity-80" muted />
                  ) : session.imageUrl ? (
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
