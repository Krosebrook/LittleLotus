
import React from 'react';
import { Moon, Baby, User } from 'lucide-react';
import { AppMode } from '../types';

interface NavBarProps {
  /** Current application mode (Kid or Adult) */
  mode: AppMode;
  /** Function to toggle between modes */
  onToggleMode: () => void;
}

/**
 * Top navigation component containing the logo and mode switcher.
 */
export const NavBar: React.FC<NavBarProps> = ({ mode, onToggleMode }) => {
  const isKid = mode === AppMode.Kid;
  
  return (
    <nav className={`sticky top-0 z-30 px-6 py-4 shadow-sm flex items-center justify-between transition-colors ${isKid ? 'bg-white border-b-4 border-kid-primary' : 'bg-white/80 backdrop-blur border-b border-slate-200'}`}>
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${isKid ? 'bg-kid-primary text-white' : 'bg-indigo-600 text-white'}`}>
          <Moon size={24} />
        </div>
        <span className={`text-xl font-bold ${isKid ? 'text-kid-primary tracking-wide' : 'text-slate-900'}`}>
          Mindful Mates
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleMode}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium"
          aria-label={`Switch to ${mode === AppMode.Adult ? 'Kid' : 'Adult'} mode`}
        >
          {mode === AppMode.Adult ? <><Baby size={18}/> Switch to Kids</> : <><User size={18}/> Switch to Parents</>}
        </button>
      </div>
    </nav>
  );
};
