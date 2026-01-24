
import React, { useState, useEffect } from 'react';
import { ImageSize, VoiceName, SessionFormData, MusicGenre, AppMode } from '../types';
import { Button } from './Button';
import { Wand2, Image as ImageIcon, Music, Sparkles, LucideIcon, Mic, Clock, PenTool, ArrowLeft } from 'lucide-react';
import { MOODS, VISUAL_STYLES, VISUAL_DESCRIPTIONS, VOICES, VOICE_DESCRIPTIONS, MUSIC_GENRES } from '../constants';
import { useApp } from '../context/AppContext';
import { useSessionGenerator } from '../hooks/useSessionGenerator';

interface SessionBuilderProps {
  /** Callback fired when the session generation is complete and stored */
  onComplete: () => void;
}

// --- Sub-Components ---

/**
 * Displays a single step in the progress bar.
 * Clickable if the step has already been visited/completed to allow navigation (Undo).
 */
const StepIndicator: React.FC<{ 
  num: number; 
  icon: LucideIcon; 
  step: number; 
  isKid: boolean;
  onClick: () => void;
}> = ({ num, icon: Icon, step, isKid, onClick }) => {
  const isCompleted = step > num;
  const isCurrent = step === num;
  const isFuture = step < num;
  
  return (
    <button 
      onClick={onClick}
      disabled={isFuture} 
      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all relative 
        ${isCurrent 
          ? (isKid ? 'border-kid-primary bg-white text-kid-primary scale-110 shadow-md' : 'border-indigo-600 bg-white text-indigo-600 scale-110 shadow-md') 
          : isCompleted 
            ? (isKid ? 'bg-kid-primary border-kid-primary text-white cursor-pointer hover:bg-kid-secondary hover:border-kid-secondary' : 'bg-indigo-600 border-indigo-600 text-white cursor-pointer hover:bg-indigo-700')
            : 'border-slate-300 text-slate-300 dark:border-slate-600 dark:text-slate-600 cursor-not-allowed'
        }
      `}
      aria-current={isCurrent ? 'step' : undefined}
      title={isCompleted ? `Go back to Step ${num}` : undefined}
    >
      <Icon size={20} />
    </button>
  );
};

/**
 * Displays the loading spinner and status message during generation.
 */
const LoadingView: React.FC<{ isKid: boolean; status: string }> = ({ isKid, status }) => (
  <div className="text-center py-20" role="status" aria-live="polite">
    <div className={`w-20 h-20 mx-auto mb-6 rounded-full border-4 border-t-transparent animate-spin ${isKid ? 'border-kid-primary' : 'border-indigo-600'}`} />
    <h3 className={`text-2xl font-bold mb-2 ${isKid ? 'font-rounded text-kid-primary' : 'text-slate-800 dark:text-white'}`}>{isKid ? "Magic happening..." : "Generating Session"}</h3>
    <p className="text-slate-500 dark:text-slate-400">{status}</p>
  </div>
);

/**
 * Step 1: User selects their current mood and session duration.
 * Supports Freestyle text input.
 */
const MoodStep: React.FC<{
  isKid: boolean;
  moods: string[];
  selectedMood: string;
  duration: string;
  onSelectMood: (mood: string) => void;
  onSelectDuration: (duration: string) => void;
  onNext: () => void;
}> = ({ isKid, moods, selectedMood, duration, onSelectMood, onSelectDuration, onNext }) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Check if initial selectedMood is not in the presets list (implies previously custom)
  useEffect(() => {
    if (selectedMood && !moods.includes(selectedMood)) {
      setIsCustom(true);
      setCustomInput(selectedMood);
    }
  }, []);

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onSelectMood(customInput.trim());
      onNext();
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right fade-in duration-300">
      <div className="space-y-4">
        <h2 className={`text-2xl font-bold text-center ${isKid ? 'font-rounded text-kid-primary' : 'text-slate-800 dark:text-white'}`}>
          {isKid ? "How are you feeling today?" : "What is your goal for this session?"}
        </h2>
        
        {isCustom ? (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-4">
               <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={isKid ? "I feel happy because..." : "e.g., Anxious about a public speaking event..."}
                  className={`w-full p-4 rounded-xl border-2 h-32 resize-none focus:outline-none focus:ring-2 ${isKid ? 'border-kid-primary focus:ring-kid-secondary' : 'border-indigo-200 focus:border-indigo-600 focus:ring-indigo-200'} bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white`}
                  autoFocus
               />
               <button 
                  onClick={() => setIsCustom(false)}
                  className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 self-start"
               >
                  <ArrowLeft size={14} /> Back to presets
               </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {moods.map(m => (
              <button
                key={m}
                onClick={() => onSelectMood(m)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMood === m
                    ? (isKid ? 'border-kid-primary bg-sky-50 dark:bg-sky-900/30' : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30')
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-200'
                }`}
                aria-pressed={selectedMood === m}
              >
                {m}
              </button>
            ))}
            {/* Custom Option Tile */}
            <button
                onClick={() => { setIsCustom(true); onSelectMood(""); }}
                className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
                   isKid ? 'border-kid-secondary text-kid-secondary hover:bg-amber-50' : 'border-indigo-400 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
            >
                <PenTool size={20} />
                <span className="font-medium">Write Your Own</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
         <h2 className={`text-xl font-bold text-center ${isKid ? 'font-rounded text-kid-primary' : 'text-slate-800 dark:text-white'}`}>
          {isKid ? "How long should we play?" : "Session Duration"}
        </h2>
        <div className="flex justify-center gap-4">
          {['Short', 'Long'].map((d) => (
            <button
              key={d}
              onClick={() => onSelectDuration(d)}
              className={`px-6 py-3 rounded-xl border-2 transition-all min-w-[140px] flex flex-col items-center ${
                duration === d
                  ? (isKid ? 'border-kid-primary bg-sky-50 dark:bg-sky-900/30 font-bold' : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 font-medium')
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} />
                <span className="text-lg">{d}</span>
              </div>
              <div className={`text-xs ${isKid ? 'text-kid-secondary' : 'text-slate-400'}`}>
                {d === 'Short' ? '~2 mins' : '~5 mins'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        {isCustom ? (
             <Button variant={isKid ? 'kid' : 'primary'} onClick={handleCustomSubmit} disabled={!customInput.trim()}>
                 Next
             </Button>
        ) : (
             <Button variant={isKid ? 'kid' : 'primary'} onClick={onNext} disabled={!selectedMood}>Next</Button>
        )}
      </div>
    </div>
  );
};

/**
 * Step 2: User selects visual style and image resolution.
 * Supports Freestyle text input.
 */
const VisualStep: React.FC<{
  isKid: boolean;
  visualStyles: string[];
  selectedStyle: string;
  onSelectStyle: (style: string) => void;
  imageSize: ImageSize;
  onSelectSize: (size: ImageSize) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ isKid, visualStyles, selectedStyle, onSelectStyle, imageSize, onSelectSize, onBack, onNext }) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Check if initial selectedStyle is not in the presets list
  useEffect(() => {
    if (selectedStyle && !visualStyles.includes(selectedStyle)) {
      setIsCustom(true);
      setCustomInput(selectedStyle);
    }
  }, []);

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onSelectStyle(customInput.trim());
      onNext();
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
      <h2 className={`text-2xl font-bold text-center ${isKid ? 'font-rounded text-kid-primary' : 'text-slate-800 dark:text-white'}`}>
        {isKid ? "Pick a magical place!" : "Choose a visual environment"}
      </h2>
      
      {isCustom ? (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-4">
               <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={isKid ? "A castle made of candy..." : "e.g., A cyberpunk city in the rain..."}
                  className={`w-full p-4 rounded-xl border-2 h-32 resize-none focus:outline-none focus:ring-2 ${isKid ? 'border-kid-primary focus:ring-kid-secondary' : 'border-indigo-200 focus:border-indigo-600 focus:ring-indigo-200'} bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white`}
                  autoFocus
               />
               <button 
                  onClick={() => setIsCustom(false)}
                  className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 self-start"
               >
                  <ArrowLeft size={14} /> Back to presets
               </button>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visualStyles.map(v => (
            <button
              key={v}
              onClick={() => onSelectStyle(v)}
              className={`p-4 rounded-xl border-2 transition-all text-left group ${
                selectedStyle === v
                  ? (isKid ? 'border-kid-primary bg-sky-50 dark:bg-sky-900/30' : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30')
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              aria-pressed={selectedStyle === v}
            >
              <div className={`font-semibold mb-1 ${isKid ? 'text-slate-800 dark:text-slate-100' : 'text-slate-900 dark:text-white'}`}>{v}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                {VISUAL_DESCRIPTIONS[v] || "A beautiful, generated scene."}
              </div>
            </button>
          ))}
          {/* Custom Option Tile */}
          <button
              onClick={() => { setIsCustom(true); onSelectStyle(""); }}
              className={`p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 min-h-[80px] ${
                  isKid ? 'border-kid-secondary text-kid-secondary hover:bg-amber-50' : 'border-indigo-400 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
              }`}
          >
              <PenTool size={20} />
              <span className="font-medium">Describe Your Own</span>
          </button>
        </div>
      )}
      
      <div className="mt-4">
         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image Quality</label>
         <div className="flex gap-2">
            {Object.values(ImageSize).map(size => (
              <button
                key={size}
                onClick={() => onSelectSize(size)}
                className={`px-3 py-1 rounded border text-sm ${
                   imageSize === size 
                   ? (isKid ? 'bg-kid-primary text-white border-kid-primary' : 'bg-indigo-600 text-white border-indigo-600')
                   : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                }`}
                aria-pressed={imageSize === size}
              >
                {size}
              </button>
            ))}
         </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        {isCustom ? (
             <Button variant={isKid ? 'kid' : 'primary'} onClick={handleCustomSubmit} disabled={!customInput.trim()}>
                 Next
             </Button>
        ) : (
            <Button variant={isKid ? 'kid' : 'primary'} onClick={onNext} disabled={!selectedStyle}>Next</Button>
        )}
      </div>
    </div>
  );
};

/**
 * Step 3: User selects background music.
 */
const MusicStep: React.FC<{
  isKid: boolean;
  musicGenres: MusicGenre[];
  selectedMusic: MusicGenre;
  onSelectMusic: (genre: MusicGenre) => void;
  onBack: () => void;
  onNext: () => void;
}> = ({ isKid, musicGenres, selectedMusic, onSelectMusic, onBack, onNext }) => (
  <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
    <h2 className={`text-2xl font-bold text-center ${isKid ? 'font-rounded text-kid-primary' : 'text-slate-800 dark:text-white'}`}>
      {isKid ? "Choose some gentle sounds" : "Select background ambience"}
    </h2>
    <div className="grid grid-cols-2 gap-4">
      {musicGenres.map(m => (
        <button
          key={m}
          onClick={() => onSelectMusic(m)}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedMusic === m
              ? (isKid ? 'border-kid-primary bg-sky-50 dark:bg-sky-900/30' : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30')
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:text-slate-200'
          }`}
          aria-pressed={selectedMusic === m}
        >
          {m}
        </button>
      ))}
    </div>
    <div className="flex justify-between pt-4">
      <Button variant="ghost" onClick={onBack}>Back</Button>
      <Button variant={isKid ? 'kid' : 'primary'} onClick={onNext}>Next</Button>
    </div>
  </div>
);

/**
 * Step 4: User selects the narrator voice and confirms generation.
 */
const VoiceStep: React.FC<{
  isKid: boolean;
  voices: VoiceName[];
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  formData: SessionFormData;
  onBack: () => void;
  onGenerate: () => void;
}> = ({ isKid, voices, selectedVoice, onSelectVoice, formData, onBack, onGenerate }) => (
  <div className="space-y-6 animate-in slide-in-from-right fade-in duration-300">
    <h2 className={`text-2xl font-bold text-center ${isKid ? 'font-rounded text-kid-primary' : 'text-slate-800 dark:text-white'}`}>
      {isKid ? "Who should read the story?" : "Select a voice guide"}
    </h2>
    <div className="grid grid-cols-2 gap-4">
      {voices.map(v => (
        <button
          key={v}
          onClick={() => onSelectVoice(v)}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            selectedVoice === v
              ? (isKid ? 'border-kid-primary bg-sky-50 dark:bg-sky-900/30' : 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30')
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
          aria-pressed={selectedVoice === v}
        >
          <div className={`font-semibold ${isKid ? 'text-slate-800 dark:text-slate-100' : 'text-slate-900 dark:text-white'}`}>{v}</div>
          <div className={`text-xs ${isKid ? 'text-kid-secondary' : 'text-slate-500 dark:text-slate-400'}`}>
            {VOICE_DESCRIPTIONS[v]}
          </div>
        </button>
      ))}
    </div>
    
    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      <h4 className="font-semibold mb-1">Summary</h4>
      <p>Mood: <span className="font-medium">{formData.mood}</span></p>
      <p>Duration: {formData.duration}</p>
      <p>Visual: <span className="font-medium">{formData.visualStyle}</span> ({formData.imageSize})</p>
      <p>Ambience: {formData.backgroundMusic}</p>
      <p>Voice: {formData.voice} ({VOICE_DESCRIPTIONS[formData.voice]})</p>
    </div>

    <div className="flex justify-between pt-4">
      <Button variant="ghost" onClick={onBack}>Back</Button>
      <Button variant={isKid ? 'kid' : 'primary'} onClick={onGenerate}>
        <Wand2 size={18} className="mr-2" />
        {isKid ? "Create Magic!" : "Generate Session"}
      </Button>
    </div>
  </div>
);

// --- Main Component ---

const PREFS_KEY = 'MINDFUL_MATES_PREFS';

/**
 * Main orchestration component for the Session Builder wizard.
 * Manages the multi-step form state and delegates final generation to `useSessionGenerator`.
 */
export const SessionBuilder: React.FC<SessionBuilderProps> = ({ onComplete }) => {
  const { mode, isKid, addSession, setActiveSession, audioContext } = useApp();
  const [step, setStep] = useState(1);
  const { generateSession, loading, status } = useSessionGenerator({ 
    addSession, 
    setActiveSession, 
    audioContext 
  });

  const moods = MOODS[mode];
  const visualStyles = VISUAL_STYLES[mode];
  const voices = VOICES[mode];

  // Helper to load persisted preferences or defaults
  const getInitialState = (): SessionFormData => {
    const defaults: SessionFormData = {
      mood: '',
      visualStyle: '',
      imageSize: ImageSize.Size_1K,
      voice: isKid ? VoiceName.Puck : VoiceName.Kore,
      backgroundMusic: MusicGenre.NoMusic,
      duration: 'Short'
    };

    try {
      const saved = localStorage.getItem(`${PREFS_KEY}_${mode}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validVoice = voices.includes(parsed.voice) ? parsed.voice : defaults.voice;
        
        return { 
          ...defaults, 
          ...parsed,
          voice: validVoice
        };
      }
    } catch (e) {
      console.warn("Failed to load preferences", e);
    }
    return defaults;
  };

  const [formData, setFormData] = useState<SessionFormData>(getInitialState);

  // Reset/Reload state when app mode changes
  useEffect(() => {
    setFormData(getInitialState());
    setStep(1); // Reset wizard on mode switch
  }, [mode, isKid]);

  const handleGenerate = async () => {
    if (!audioContext) {
      alert("Audio not ready. Please click anywhere on the page first.");
      return;
    }

    try {
      // Save preferences for next time
      localStorage.setItem(`${PREFS_KEY}_${mode}`, JSON.stringify(formData));
      
      await generateSession(formData, isKid);
      onComplete();
    } catch (error) {
      alert('Something went wrong creating your session. Please try again.');
    }
  };

  /**
   * Allows jumping back to previous steps (Undo) but not forward.
   */
  const handleJumpToStep = (target: number) => {
    if (target < step) {
      setStep(target);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-2xl transition-colors ${isKid ? 'bg-white border-4 border-kid-secondary shadow-[8px_8px_0px_rgba(245,158,11,0.5)] dark:bg-slate-900' : 'bg-white shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800'}`}>
      
      {!loading && (
        <div className="flex justify-between mb-8 px-8 relative" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-10" />
          <StepIndicator num={1} icon={Sparkles} step={step} isKid={isKid} onClick={() => handleJumpToStep(1)} />
          <StepIndicator num={2} icon={ImageIcon} step={step} isKid={isKid} onClick={() => handleJumpToStep(2)} />
          <StepIndicator num={3} icon={Music} step={step} isKid={isKid} onClick={() => handleJumpToStep(3)} />
          <StepIndicator num={4} icon={Mic} step={step} isKid={isKid} onClick={() => handleJumpToStep(4)} />
        </div>
      )}

      {loading ? (
        <LoadingView isKid={isKid} status={status} />
      ) : (
        <>
          {step === 1 && (
            <MoodStep 
              isKid={isKid}
              moods={moods}
              selectedMood={formData.mood}
              duration={formData.duration}
              onSelectMood={(m) => setFormData({ ...formData, mood: m })}
              onSelectDuration={(d) => setFormData({ ...formData, duration: d })}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <VisualStep 
              isKid={isKid}
              visualStyles={visualStyles}
              selectedStyle={formData.visualStyle}
              onSelectStyle={(v) => setFormData({ ...formData, visualStyle: v })}
              imageSize={formData.imageSize}
              onSelectSize={(s) => setFormData({ ...formData, imageSize: s })}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <MusicStep
              isKid={isKid}
              musicGenres={MUSIC_GENRES}
              selectedMusic={formData.backgroundMusic}
              onSelectMusic={(m) => setFormData({ ...formData, backgroundMusic: m })}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <VoiceStep 
              isKid={isKid}
              voices={voices}
              selectedVoice={formData.voice}
              onSelectVoice={(v) => setFormData({ ...formData, voice: v })}
              formData={formData}
              onBack={() => setStep(3)}
              onGenerate={handleGenerate}
            />
          )}
        </>
      )}
    </div>
  );
};
