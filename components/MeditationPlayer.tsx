import React, { useState, useEffect } from 'react';
import { MeditationSession } from '../types';
import { X, Wind } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useApp } from '../context/AppContext';
import { KidControls, AdultControls } from './PlayerControls';

interface MeditationPlayerProps {
  session: MeditationSession;
  onClose: () => void;
}

/**
 * Sub-component for the breathing animation.
 * Cycles between "Breathe In" and "Breathe Out" with a scaling visual.
 */
const BreathingBubble: React.FC = () => {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  
  useEffect(() => {
    // Simple 4-4-4 breathing rhythm loop
    const breathe = () => {
      setPhase('in');
      setTimeout(() => {
        setPhase('out');
      }, 4000); // Breathe in for 4s
    };

    breathe(); // Initial start
    const interval = setInterval(breathe, 8000); // Loop every 8s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div 
        className={`
          relative flex items-center justify-center rounded-full transition-all duration-[4000ms] ease-in-out
          ${phase === 'in' ? 'w-64 h-64 bg-kid-accent/80 scale-110' : 'w-32 h-32 bg-kid-primary/80 scale-100'}
          shadow-[0_0_60px_rgba(255,255,255,0.3)] border-4 border-white/50
        `}
      >
        <div className="text-white font-bold text-2xl font-rounded animate-pulse">
          {phase === 'in' ? 'Breathe In... 🌸' : 'Breathe Out... 🌬️'}
        </div>
        
        {/* Ripple Effect Rings */}
        <div className={`absolute inset-0 rounded-full border-2 border-white/30 transition-all duration-[4000ms] ease-in-out ${phase === 'in' ? 'scale-150 opacity-0' : 'scale-100 opacity-50'}`} />
        <div className={`absolute inset-0 rounded-full border-2 border-white/20 transition-all duration-[4000ms] ease-in-out delay-75 ${phase === 'in' ? 'scale-[2] opacity-0' : 'scale-100 opacity-50'}`} />
      </div>
    </div>
  );
};

/**
 * Component for playing back the meditation session (audio + visual).
 * Features different layouts for Adult and Kid modes.
 */
export const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ session, onClose }) => {
  const { isKid, audioContext } = useApp();
  const [showBreathing, setShowBreathing] = useState(false);
  
  if (!audioContext) return null;

  const { isPlaying, progress, duration, togglePlay, seek, restart, volume, setVolume } = useAudioPlayer(audioContext, session.audioBuffer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Meditation Player">
      <div className={`relative w-full max-w-4xl h-[85vh] overflow-hidden rounded-2xl flex flex-col md:flex-row shadow-2xl ${isKid ? 'bg-amber-50' : 'bg-slate-900'}`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur transition-all"
          aria-label="Close player"
        >
          <X size={24} />
        </button>

        {/* Visual Side */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-black group">
          {session.imageUrl && (
            <img 
              src={session.imageUrl} 
              alt={session.visualPrompt} 
              className="w-full h-full object-cover opacity-90"
            />
          )}
          
          {/* Breathing Overlay */}
          {showBreathing && <BreathingBubble />}

          {/* Kid Mode: Breathing Toggle Button */}
          {isKid && (
            <button
              onClick={() => setShowBreathing(!showBreathing)}
              className={`
                absolute top-4 left-4 z-30 flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all
                ${showBreathing ? 'bg-white text-kid-primary' : 'bg-kid-primary/80 text-white hover:bg-kid-primary'}
              `}
            >
              <Wind size={20} className={showBreathing ? 'animate-spin-slow' : ''} />
              {showBreathing ? "Stop Breathing" : "Breathing Exercise"}
            </button>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 pointer-events-none">
             <h2 className="text-white text-3xl font-bold mb-2 shadow-black drop-shadow-md">{session.title}</h2>
             <p className="text-white/80 text-sm">{session.visualStyle} • {session.mood}</p>
          </div>
        </div>

        {/* Controls Side */}
        <div className={`w-full md:w-1/2 h-1/2 md:h-full flex flex-col p-8 ${isKid ? 'bg-amber-50' : 'bg-white'}`}>
           
           <div className="flex-1 overflow-y-auto mb-6 pr-2">
             <h3 className={`text-lg font-bold mb-4 ${isKid ? 'text-amber-800 font-rounded' : 'text-slate-800'}`}>Transcript</h3>
             <p className={`text-lg leading-relaxed ${isKid ? 'text-slate-700 font-rounded' : 'text-slate-600'}`}>
               {session.script}
             </p>
           </div>

           <div className="mt-auto">
             {/* Progress Bar */}
             <div className={`w-full h-2 rounded-full mb-6 overflow-hidden ${isKid ? 'bg-amber-200 h-6 border-2 border-amber-100' : 'bg-slate-200'}`}>
               <div 
                  className={`h-full transition-all duration-100 ${isKid ? 'bg-kid-primary' : 'bg-indigo-600'}`} 
                  style={{ width: `${(progress / (duration || 1)) * 100}%` }} 
                  role="progressbar"
                  aria-valuenow={(progress / (duration || 1)) * 100}
                  aria-valuemin={0}
                  aria-valuemax={100}
               />
             </div>

             {/* Mode-Specific Controls */}
             {isKid ? (
               <KidControls 
                 isPlaying={isPlaying} 
                 onTogglePlay={togglePlay} 
                 onRestart={restart} 
                 onSeek={seek} 
               />
             ) : (
               <AdultControls 
                 isPlaying={isPlaying} 
                 onTogglePlay={togglePlay} 
                 onRestart={restart}
                 volume={volume}
                 onVolumeChange={setVolume}
               />
             )}
           </div>
        </div>

      </div>
    </div>
  );
};