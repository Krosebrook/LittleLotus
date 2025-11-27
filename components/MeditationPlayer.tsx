import React from 'react';
import { MeditationSession, AppMode } from '../types';
import { Play, Pause, X, RefreshCw, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface MeditationPlayerProps {
  session: MeditationSession;
  mode: AppMode;
  onClose: () => void;
  audioContext: AudioContext;
}

/**
 * Component for playing back the meditation session (audio + visual).
 * Features different layouts for Adult and Kid modes.
 */
export const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ session, mode, onClose, audioContext }) => {
  const isKid = mode === AppMode.Kid;
  const { isPlaying, progress, duration, togglePlay, seek, restart } = useAudioPlayer(audioContext, session.audioBuffer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Meditation Player">
      <div className={`relative w-full max-w-4xl h-[85vh] overflow-hidden rounded-2xl flex flex-col md:flex-row shadow-2xl ${isKid ? 'bg-amber-50' : 'bg-slate-900'}`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur transition-all"
          aria-label="Close player"
        >
          <X size={24} />
        </button>

        {/* Visual Side */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-black">
          {session.imageUrl && (
            <img 
              src={session.imageUrl} 
              alt={session.visualPrompt} 
              className="w-full h-full object-cover opacity-90"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
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

             {/* Controls */}
             {isKid ? (
                <div className="flex justify-center items-center gap-4 md:gap-6">
                  {/* Repeat */}
                  <button 
                    onClick={restart} 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-100 text-amber-700 border-2 border-amber-200 hover:bg-amber-200 hover:scale-105 active:scale-95 transition-all shadow-[0_4px_0_rgb(217,119,6,0.2)] flex flex-col items-center justify-center"
                    title="Start Over"
                    aria-label="Restart session"
                  >
                    <RotateCcw size={32} strokeWidth={3} />
                  </button>

                  {/* Skip Back */}
                  <button 
                    onClick={() => seek(-10)} 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border-4 border-kid-primary text-kid-primary hover:bg-sky-50 hover:scale-105 active:scale-95 transition-all shadow-[0_6px_0_rgb(14,165,233)] flex items-center justify-center"
                    title="Back 10 seconds"
                    aria-label="Rewind 10 seconds"
                  >
                    <SkipBack size={40} strokeWidth={3} />
                  </button>

                  {/* Big Play/Pause */}
                  <Button 
                     variant='kid' 
                     className="rounded-full w-32 h-32 md:w-40 md:h-40 p-0 flex items-center justify-center shadow-[0_10px_0_rgb(217,119,6)] active:shadow-none active:translate-y-2 hover:scale-105 transition-transform z-10"
                     onClick={togglePlay}
                     aria-label={isPlaying ? "Pause" : "Play"}
                  >
                     {isPlaying ? <Pause size={64} fill="currentColor" /> : <Play size={64} fill="currentColor" className="ml-3" />}
                  </Button>

                  {/* Skip Forward */}
                  <button 
                    onClick={() => seek(10)} 
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border-4 border-kid-primary text-kid-primary hover:bg-sky-50 hover:scale-105 active:scale-95 transition-all shadow-[0_6px_0_rgb(14,165,233)] flex items-center justify-center"
                    title="Forward 10 seconds"
                    aria-label="Fast forward 10 seconds"
                  >
                    <SkipForward size={40} strokeWidth={3} />
                  </button>
                </div>
             ) : (
                <div className="flex justify-center items-center gap-6">
                  <Button 
                     variant='primary' 
                     className="rounded-full w-16 h-16 p-0 flex items-center justify-center shadow-lg hover:shadow-xl"
                     onClick={togglePlay}
                     aria-label={isPlaying ? "Pause" : "Play"}
                  >
                     {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                  </Button>
                  
                  <button 
                    onClick={restart}
                    className="p-4 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                    title="Restart"
                    aria-label="Restart session"
                  >
                    <RefreshCw size={24} />
                  </button>
                </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};
