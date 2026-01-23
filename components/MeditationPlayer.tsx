
import React, { useState, useEffect, useRef } from 'react';
import { MeditationSession, MusicGenre } from '../types';
import { X, Wind, Star, Send } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useApp } from '../context/AppContext';
import { KidControls, AdultControls } from './PlayerControls';
import { playAmbience } from '../services/audioSynthesizer';
import { Button } from './Button';

interface MeditationPlayerProps {
  session: MeditationSession;
  onClose: () => void;
}

const BreathingBubble: React.FC = () => {
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => p === 'in' ? 'out' : 'in');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-1000">
      <div 
        className={`
          relative flex items-center justify-center rounded-full transition-all duration-[4000ms] ease-in-out
          ${phase === 'in' ? 'w-72 h-72 scale-110 opacity-100' : 'w-40 h-40 scale-100 opacity-80'}
          bg-gradient-to-br from-kid-primary to-kid-accent shadow-[0_0_80px_rgba(255,255,255,0.5)] border-4 border-white/60
        `}
      >
        <div className="text-white font-bold text-3xl font-rounded drop-shadow-lg text-center animate-pulse">
          {phase === 'in' ? 'Breathe In... 🌸' : 'Breathe Out... 🌬️'}
        </div>
        
        <div className={`absolute inset-0 rounded-full border-2 border-white/40 transition-all duration-[4000ms] ease-out ${phase === 'in' ? 'scale-150 opacity-0' : 'scale-100 opacity-50'}`} />
        <div className={`absolute inset-0 rounded-full border-2 border-white/20 transition-all duration-[4000ms] ease-out delay-100 ${phase === 'in' ? 'scale-[2] opacity-0' : 'scale-100 opacity-40'}`} />
      </div>
    </div>
  );
};

export const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ session, onClose }) => {
  const { isKid, audioContext } = useApp();
  const [showBreathing, setShowBreathing] = useState(isKid);
  const [showFeedback, setShowFeedback] = useState(false);
  const ambienceCleanupRef = useRef<(() => void) | null>(null);
  const ambienceGainRef = useRef<GainNode | null>(null);
  
  if (!audioContext) return null;

  const { isPlaying, progress, duration, togglePlay, seek, restart, volume, setVolume } = useAudioPlayer(audioContext, session.audioBuffer);

  // Background Ambience Logic
  useEffect(() => {
    const ambienceGain = audioContext.createGain();
    ambienceGain.connect(audioContext.destination);
    ambienceGainRef.current = ambienceGain;
    ambienceGain.gain.value = volume * 0.3;

    return () => {
      if (ambienceCleanupRef.current) ambienceCleanupRef.current();
      ambienceGain.disconnect();
    };
  }, [audioContext]);

  useEffect(() => {
    if (!audioContext || !ambienceGainRef.current) return;

    if (isPlaying && !ambienceCleanupRef.current && session.backgroundMusic && session.backgroundMusic !== MusicGenre.NoMusic) {
      ambienceCleanupRef.current = playAmbience(audioContext, session.backgroundMusic, ambienceGainRef.current);
    } else if (!isPlaying && ambienceCleanupRef.current) {
      ambienceCleanupRef.current();
      ambienceCleanupRef.current = null;
    }
  }, [isPlaying, audioContext, session.backgroundMusic]);

  useEffect(() => {
    if (ambienceGainRef.current) {
      ambienceGainRef.current.gain.setTargetAtTime(volume * 0.3, audioContext.currentTime, 0.1);
    }
  }, [volume, audioContext]);

  // Handle Close Attempt
  const handleCloseRequest = () => {
    // If user listened to less than 15 seconds, just close.
    // Otherwise, ask for feedback.
    if (progress < 15 && !showFeedback) {
      onClose();
    } else {
      setShowFeedback(true);
      // Pause playback when showing feedback
      if (isPlaying) togglePlay();
    }
  };

  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = () => {
    setSubmitted(true);
    // In a real app, send to backend here.
    console.log("Feedback sent:", { rating, feedbackText, session: session.id });
    setTimeout(() => onClose(), 1500);
  };

  if (showFeedback) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95">
        <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl text-center ${isKid ? 'bg-white' : 'bg-slate-900 text-white'}`}>
          {!submitted ? (
            <>
              <h2 className={`text-2xl font-bold mb-4 ${isKid ? 'text-kid-primary' : 'text-white'}`}>
                {isKid ? "Did you like it? 🌟" : "Session Complete"}
              </h2>
              <p className={`mb-6 ${isKid ? 'text-slate-600' : 'text-slate-400'}`}>
                {isKid ? "How many stars for this magic story?" : "Your feedback helps improve future sessions."}
              </p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`transition-transform hover:scale-125 focus:outline-none ${rating >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                  >
                    <Star size={isKid ? 40 : 32} fill={rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>

              {!isKid && (
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Any thoughts on the voice or script?"
                  className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-6 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 text-slate-900 dark:text-slate-100"
                />
              )}

              <div className="flex gap-4 justify-center">
                 <Button variant="ghost" onClick={onClose}>Skip</Button>
                 <Button variant={isKid ? 'kid' : 'primary'} onClick={handleSubmitFeedback} disabled={rating === 0}>
                   {isKid ? "Send Magic!" : "Submit Feedback"}
                 </Button>
              </div>
            </>
          ) : (
            <div className="py-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Send size={32} />
              </div>
              <h3 className={`text-xl font-bold ${isKid ? 'text-kid-primary' : 'text-white'}`}>
                {isKid ? "Thanks, you're awesome! 🎉" : "Feedback Received"}
              </h3>
              <p className="text-slate-500 mt-2">Closing session...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <div className={`relative w-full max-w-4xl h-[85vh] overflow-hidden rounded-2xl flex flex-col md:flex-row shadow-2xl ${isKid ? 'bg-amber-50' : 'bg-slate-900'}`}>
        
        <button 
          onClick={handleCloseRequest}
          className="absolute top-4 right-4 z-30 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur transition-all"
        >
          <X size={24} />
        </button>

        {/* Visual Side */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-black group overflow-hidden">
          {session.imageUrl && (
            <img 
              src={session.imageUrl} 
              alt={session.visualPrompt} 
              className="w-full h-full object-cover opacity-90 transition-transform duration-[20s] ease-linear hover:scale-110"
            />
          )}
          
          {showBreathing && <BreathingBubble />}

          {isKid && (
            <button
              onClick={() => setShowBreathing(!showBreathing)}
              className={`
                absolute top-4 left-4 z-30 flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-lg transition-all
                ${showBreathing ? 'bg-white text-kid-primary hover:bg-slate-100' : 'bg-kid-primary/90 text-white hover:bg-kid-primary hover:scale-105'}
              `}
            >
              <Wind size={20} className={showBreathing ? 'animate-pulse' : ''} />
              {showBreathing ? "Hide Breathing" : "Start Breathing"}
            </button>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 pointer-events-none">
             <h2 className="text-white text-3xl font-bold mb-2 shadow-black drop-shadow-md">{session.title}</h2>
             <p className="text-white/80 text-sm">{session.visualStyle} • {session.mood}</p>
          </div>
        </div>

        {/* Controls Side */}
        <div className={`w-full md:w-1/2 h-1/2 md:h-full flex flex-col p-8 ${isKid ? 'bg-amber-50' : 'bg-white dark:bg-slate-900'}`}>
           
           <div className="flex-1 overflow-y-auto mb-6 pr-2 scrollbar-hide">
             <h3 className={`text-lg font-bold mb-4 ${isKid ? 'text-amber-800 font-rounded' : 'text-slate-800 dark:text-white'}`}>Transcript</h3>
             <p className={`text-lg leading-relaxed ${isKid ? 'text-slate-700 font-rounded' : 'text-slate-600 dark:text-slate-300'}`}>
               {session.script}
             </p>
           </div>

           <div className="mt-auto">
             <div className={`w-full h-2 rounded-full mb-6 overflow-hidden ${isKid ? 'bg-amber-200 h-6 border-2 border-amber-100' : 'bg-slate-200 dark:bg-slate-700'}`}>
               <div 
                  className={`h-full transition-all duration-100 ${isKid ? 'bg-kid-primary' : 'bg-indigo-600'}`} 
                  style={{ width: `${(progress / (duration || 1)) * 100}%` }} 
               />
             </div>

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
