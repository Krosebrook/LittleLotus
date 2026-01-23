
import React from 'react';
import { Moon, Sun, Baby, User, WifiOff } from 'lucide-react';
import { AppMode } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useApp } from '../context/AppContext';

/**
 * Top navigation component containing the logo and mode switcher.
 * Includes a status banner when the application is offline.
 */
export const NavBar: React.FC = () => {
  const { mode, isKid, toggleMode, isDarkMode, toggleDarkMode } = useApp();
  const isOnline = useOnlineStatus();
  
  return (
    <nav className={`sticky top-0 z-30 shadow-sm flex flex-col transition-colors ${isKid ? 'bg-white border-b-4 border-kid-primary dark:bg-slate-900 dark:border-kid-primary' : 'bg-white/80 backdrop-blur border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-800'}`}>
      
      {/* Main Navigation Content */}
      <div className="px-6 py-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isKid ? 'bg-kid-primary text-white' : 'bg-indigo-600 text-white'}`}>
            <Moon size={24} />
          </div>
          <span className={`text-xl font-bold ${isKid ? 'text-kid-primary tracking-wide' : 'text-slate-900 dark:text-white'}`}>
            Mindful Mates
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button 
            onClick={toggleMode}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-800 dark:text-slate-200"
            aria-label={`Switch to ${mode === AppMode.Adult ? 'Kid' : 'Adult'} mode`}
          >
            {mode === AppMode.Adult ? <><Baby size={18}/> Switch to Kids</> : <><User size={18}/> Switch to Parents</>}
          </button>
        </div>
      </div>

      {/* Offline Indicator Banner */}
      {!isOnline && (
        <div className={`w-full py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold animate-in slide-in-from-top-2 ${isKid ? 'bg-amber-400 text-amber-900' : 'bg-slate-800 text-white dark:bg-slate-700'}`} role="alert">
          <WifiOff size={16} />
          <span>
            {isKid ? "Uh oh! No internet connection 🔌" : "You are currently offline. Features may be limited."}
          </span>
        </div>
      )}
    </nav>
  );
};
