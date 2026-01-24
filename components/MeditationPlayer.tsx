
import React, { useState, useEffect, useRef } from 'react';
import { MeditationSession, MusicGenre } from '../types';
import { X, Wind, Star, Download, Check } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useApp } from '../context/AppContext';
import { KidControls, AdultControls } from './PlayerControls';
import { playAmbience, renderSessionToWav } from '../services/audioSynthesizer';
import { Button } from './Button';

interface MeditationPlayerProps {
  session: MeditationSession;
  onClose: () => void;
}

// Visualizer Component
const AudioVisualizer: React.FC<{ analyser: React.MutableRefObject<AnalyserNode | null> }> = ({ analyser }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !analyser.current) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let animationId: number;

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            analyser.current?.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                // Gradient color
                const r = barHeight + 25 * (i/bufferLength);
                const g = 250 * (i/bufferLength);
                const b = 50;

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();

        return () => cancelAnimationFrame(animationId);
    }, [analyser]);

    return <canvas ref={canvasRef} className="absolute bottom-0 left-0 w-full h-32 opacity-50 pointer-events-none" width={600} height={100} />;
};

export const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ session, onClose }) => {
  const { isKid, audioContext } = useApp();
  const [showBreathing, setShowBreathing] = useState(isKid);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Audio state
  const { isPlaying, progress, duration, togglePlay, seek, restart, volume, setVolume, analyser } = useAudioPlayer(audioContext!, session.audioBuffer);
  const [musicVolume, setMusicVolume] = useState(0.3); // Default music volume

  // Ambience refs
  const ambienceCleanupRef = useRef<(() => void) | null>(null);
  const ambienceGainRef = useRef<GainNode | null>(null);
  
  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  if (!audioContext) return null;

  // Background Ambience Logic
  useEffect(() => {
    const ambienceGain = audioContext.createGain();
    ambienceGain.connect(audioContext.destination);
    ambienceGainRef.current = ambienceGain;
    // Initialize with music volume state
    ambienceGain.gain.value = musicVolume;

    return () => {
      if (ambienceCleanupRef.current) ambienceCleanupRef.current();
      ambienceGain.disconnect();
    };
  }, [audioContext]); // Run once on mount (or if ctx changes)

  // Toggle ambience play/stop based on main playback
  useEffect(() => {
    if (!audioContext || !ambienceGainRef.current) return;

    if (isPlaying && !ambienceCleanupRef.current && session.backgroundMusic && session.backgroundMusic !== MusicGenre.NoMusic) {
      // playAmbience returns { stop, gainNode }
      // We pass the master ambience gain (ambienceGainRef) as destination
      const { stop } = playAmbience(audioContext, session.backgroundMusic, ambienceGainRef.current);
      ambienceCleanupRef.current = stop;
    } else if (!isPlaying && ambienceCleanupRef.current) {
      ambienceCleanupRef.current();
      ambienceCleanupRef.current = null;
    }
  }, [isPlaying, audioContext, session.backgroundMusic]);

  // Update Music Volume
  useEffect(() => {
    if (ambienceGainRef.current) {
      // Smoothly transition volume
      ambienceGainRef.current.gain.setTargetAtTime(musicVolume, audioContext.currentTime, 0.1);
    }
  }, [musicVolume, audioContext]);

  // Handle Close Attempt
  const handleCloseRequest = () => {
    if (progress < 15 && !showFeedback) {
      onClose();
    } else {
      setShowFeedback(true);
      if (isPlaying) togglePlay();
    }
  };

  const handleExport = async () => {
    if (!session.audioBuffer) return;
    setIsExporting(true);
    try {
        const blob = await renderSessionToWav(
            session.audioBuffer, 
            session.backgroundMusic || MusicGenre.NoMusic, 
            musicVolume, 
            volume
        );
        
        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindful-mates-${session.title.replace(/\s+/g, '-').toLowerCase()}.wav`;
        a.click();
        URL.revokeObjectURL(url);
        
        setExportComplete(true);
        setTimeout(() => setExportComplete(false), 3000);
    } catch (e) {
        console.error("Export failed", e);
        alert("Failed to export audio.");
    } finally {
        setIsExporting(false);
    }
  };

  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = () => {
    setSubmitted(true);
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
              <div className="flex gap-4 justify-center">
                 <Button variant="ghost" onClick={onClose}>Skip</Button>
                 <Button variant={isKid ? 'kid' : 'primary'} onClick={handleSubmitFeedback} disabled={rating === 0}>
                   {isKid ? "Send Magic!" : "Submit Feedback"}
                 </Button>
              </div>
            </>
          ) : (
            <div className="py-8 animate-in fade-in slide-in-from-bottom-4">
              <h3 className={`text-xl font-bold ${isKid ? 'text-kid-primary' : 'text-white'}`}>
                {isKid ? "Thanks, you're awesome! 🎉" : "Feedback Received"}
              </h3>
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

        {/* Visual Side (Video) */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-black group overflow-hidden">
          {session.videoUrl ? (
            <video 
              src={session.videoUrl} 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover opacity-90"
            />
          ) : session.imageUrl ? (
            <img 
              src={session.imageUrl} 
              alt={session.visualPrompt} 
              className="w-full h-full object-cover opacity-90 transition-transform duration-[20s] ease-linear hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white">No Visual</div>
          )}
          
          {/* Audio Visualizer Overlay */}
          <AudioVisualizer analyser={analyser} />

          {isKid && showBreathing && (
             <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                 <div className="w-48 h-48 rounded-full bg-white/20 animate-ping" />
             </div>
          )}

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
             <p className={`text-lg leading-relaxed whitespace-pre-wrap ${isKid ? 'text-slate-700 font-rounded' : 'text-slate-600 dark:text-slate-300'}`}>
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
                 volume={volume}
                 onVolumeChange={setVolume}
                 musicVolume={musicVolume}
                 onMusicVolumeChange={setMusicVolume}
               />
             ) : (
               <AdultControls 
                 isPlaying={isPlaying} 
                 onTogglePlay={togglePlay} 
                 onRestart={restart}
                 volume={volume}
                 onVolumeChange={setVolume}
                 musicVolume={musicVolume}
                 onMusicVolumeChange={setMusicVolume}
               />
             )}
             
             {/* Download/Export Button */}
             <div className="mt-4 flex justify-center">
                <Button 
                    variant="ghost" 
                    onClick={handleExport} 
                    disabled={isExporting}
                    className="text-xs text-slate-400 hover:text-indigo-600"
                >
                    {isExporting ? (
                         <span className="animate-pulse">Rendering Audio...</span>
                    ) : exportComplete ? (
                        <><Check size={14} className="text-green-500" /> Exported!</>
                    ) : (
                        <><Download size={14} /> Download Session (WAV)</>
                    )}
                </Button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
