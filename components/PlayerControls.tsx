
import React from 'react';
import { Play, Pause, RefreshCw, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { Button } from './Button';

/**
 * Props shared by all player control variations.
 */
interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
}

/**
 * Props specific to Kid Mode controls (includes seeking).
 */
interface KidControlsProps extends PlayerControlsProps {
  onSeek: (seconds: number) => void;
}

/**
 * Props specific to Adult Mode controls (includes volume).
 */
interface AdultControlsProps extends PlayerControlsProps {
  volume: number;
  onVolumeChange: (val: number) => void;
}

/**
 * Specialized playback controls for Kid Mode.
 * Features:
 * - Oversized buttons for easy tapping.
 * - Bright, engaging colors.
 * - 10-second skip functionality.
 */
export const KidControls: React.FC<KidControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onRestart,
  onSeek
}) => (
  <div className="flex justify-center items-center gap-4 md:gap-8 py-4 w-full max-w-2xl mx-auto">
    <button 
      onClick={onRestart} 
      className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-amber-100 text-amber-700 border-4 border-amber-200 hover:bg-amber-200 hover:scale-105 active:scale-95 transition-all shadow-sm flex flex-col items-center justify-center group"
      title="Start Over"
      aria-label="Restart session"
    >
      <RotateCcw size={28} className="md:w-10 md:h-10 transition-transform group-hover:-rotate-90" strokeWidth={3} />
    </button>

    <button 
      onClick={() => onSeek(-10)} 
      className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-white border-4 border-kid-primary text-kid-primary hover:bg-sky-50 hover:scale-105 active:scale-95 transition-all shadow-[0_6px_0_rgb(14,165,233)] flex items-center justify-center group"
      title="Back 10 seconds"
      aria-label="Rewind 10 seconds"
    >
      <SkipBack size={32} className="md:w-12 md:h-12 transition-transform group-hover:-translate-x-1" strokeWidth={3} />
    </button>

    <Button 
       variant='kid' 
       className="rounded-full w-28 h-28 md:w-48 md:h-48 p-0 flex items-center justify-center shadow-[0_8px_0_rgb(217,119,6)] active:shadow-none active:translate-y-2 hover:scale-105 transition-transform z-10"
       onClick={onTogglePlay}
       aria-label={isPlaying ? "Pause" : "Play"}
    >
       {isPlaying ? (
         <Pause size={48} className="md:w-20 md:h-20" fill="currentColor" />
       ) : (
         <Play size={48} className="ml-2 md:ml-4 md:w-20 md:h-20" fill="currentColor" />
       )}
    </Button>

    <button 
      onClick={() => onSeek(10)} 
      className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-white border-4 border-kid-primary text-kid-primary hover:bg-sky-50 hover:scale-105 active:scale-95 transition-all shadow-[0_6px_0_rgb(14,165,233)] flex items-center justify-center group"
      title="Forward 10 seconds"
      aria-label="Fast forward 10 seconds"
    >
      <SkipForward size={32} className="md:w-12 md:h-12 transition-transform group-hover:translate-x-1" strokeWidth={3} />
    </button>
  </div>
);

/**
 * Minimalist playback controls for Adult Mode.
 * Features:
 * - Standard play/pause and restart buttons.
 * - Volume slider control.
 */
export const AdultControls: React.FC<AdultControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onRestart,
  volume,
  onVolumeChange
}) => (
  <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
    <div className="flex justify-center items-center gap-6">
      <Button 
         variant='primary' 
         className="rounded-full w-16 h-16 p-0 flex items-center justify-center shadow-lg hover:shadow-xl"
         onClick={onTogglePlay}
         aria-label={isPlaying ? "Pause" : "Play"}
      >
         {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
      </Button>
      
      <button 
        onClick={onRestart}
        className="p-4 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
        title="Restart"
        aria-label="Restart session"
      >
        <RefreshCw size={24} />
      </button>
    </div>

    {/* Volume Slider */}
    <div className="flex items-center gap-3 w-full px-8">
      <span className="text-xs text-slate-400 font-bold">VOL</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        aria-label="Volume Control"
      />
    </div>
  </div>
);
