
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, VoiceName } from '../types';
import { chatWithBot } from '../services/geminiService';
import { MessageCircle, Send, X, Bot, Mic, MicOff, AlertCircle, Radio, Link as LinkIcon, Headphones } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useLiveSession } from '../hooks/useLiveSession';
import { useApp } from '../context/AppContext';

/**
 * AI ChatBot component with dual modes:
 * 1. Text/Search Mode: Standard chat with Google Search grounding.
 * 2. Live Mode: Real-time voice conversation via Gemini Live API.
 */
export const ChatBot: React.FC = () => {
  const { isKid } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mode State: 'text' or 'live'
  const [mode, setMode] = useState<'text' | 'live'>('text');

  // Initialize welcome message
  useEffect(() => {
    setMessages([{
      id: 'init',
      role: 'model',
      text: isKid 
        ? "Hi! I'm your mindfulness buddy. Want to chat or try Live Mode? 🌟" 
        : "Hello. I'm your mindfulness coach. You can type questions or switch to Live Mode for a voice conversation.",
      timestamp: Date.now()
    }]);
  }, [isKid]);

  // --- Text Mode Logic ---
  const handleSpeechResult = useCallback((text: string) => {
    setInput(prev => {
      const spacing = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
      return prev + spacing + text;
    });
    setVoiceError(null);
  }, []);

  const handleSpeechError = useCallback((error: string) => {
    setVoiceError(error === 'not-allowed' ? 'Microphone access denied.' : 'Error hearing voice.');
    setTimeout(() => setVoiceError(null), 3000);
  }, []);

  const { isListening: isRecListening, toggleListening: toggleRec } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError
  });

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages, isOpen, mode]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      // Call updated service which returns text AND sources
      const { text, sources } = await chatWithBot(userMsg.text, history, isKid);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text,
        timestamp: Date.now(),
        sources
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Live Mode Logic ---
  const { connect, disconnect, isConnected, isTalking, error: liveError } = useLiveSession({
    onDisconnect: () => {}, // Handle external disconnect if needed
    voiceName: isKid ? 'Puck' : 'Kore',
    isKid
  });

  const toggleLiveMode = () => {
    if (mode === 'live') {
      disconnect();
      setMode('text');
    } else {
      setMode('live');
      connect();
    }
  };

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && mode === 'live') {
      disconnect();
      setMode('text');
    }
  }, [isOpen]);


  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-40 flex items-center gap-2 ${
          isKid 
            ? 'bg-kid-primary text-white border-4 border-white' 
            : 'bg-indigo-600 text-white'
        }`}
      >
        <MessageCircle size={28} />
        <span className="font-bold pr-2">{isKid ? 'Chat Buddy' : 'AI Coach'}</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-80 md:w-96 h-[550px] flex flex-col rounded-2xl shadow-2xl z-40 overflow-hidden ${
      isKid ? 'bg-white border-4 border-kid-primary' : 'bg-white border border-slate-200'
    }`}>
      {/* Header */}
      <div className={`p-4 flex justify-between items-center ${
        isKid ? 'bg-kid-primary text-white' : 'bg-indigo-600 text-white'
      }`}>
        <div className="flex items-center gap-2">
          <Bot size={24} />
          <h3 className="font-bold">{isKid ? 'Mindful Buddy' : 'Meditation Coach'}</h3>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={toggleLiveMode}
             className={`p-2 rounded-full transition-colors ${mode === 'live' ? 'bg-white text-red-500 animate-pulse' : 'hover:bg-white/20'}`}
             title="Toggle Live Voice Mode"
           >
             <Headphones size={20} />
           </button>
           <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
             <X size={20} />
           </button>
        </div>
      </div>

      {/* Content Area */}
      {mode === 'live' ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white p-6 relative overflow-hidden">
          {/* Live Mode Visualizer */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-purple-900 to-black animate-pulse" />
          
          <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isTalking ? 'scale-110 bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.6)]' : 'bg-slate-700'}`}>
             <Mic size={48} className={isTalking ? 'text-white' : 'text-slate-400'} />
          </div>

          <div className="mt-8 text-center z-10">
             {isConnected ? (
                <>
                  <h3 className="text-xl font-bold mb-2">{isTalking ? "Speaking..." : "Listening..."}</h3>
                  <p className="text-slate-400 text-sm">Say "Help me relax" or "Tell me a fact"</p>
                </>
             ) : (
               <div className="text-amber-400">Connecting to Gemini Live...</div>
             )}
             {liveError && <p className="text-red-400 mt-2">{liveError}</p>}
          </div>

          <button 
            onClick={toggleLiveMode}
            className="mt-auto mb-4 px-6 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sm border border-slate-600 z-10"
          >
            Switch to Text Chat
          </button>
        </div>
      ) : (
        <>
          {/* Text Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? (isKid ? 'bg-kid-primary text-white rounded-br-none' : 'bg-indigo-600 text-white rounded-br-none')
                      : (isKid ? 'bg-white border-2 border-slate-100 text-slate-800 rounded-bl-none shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm')
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                {/* Sources Display */}
                {msg.sources && (
                  <div className="mt-2 ml-1 flex flex-wrap gap-2 max-w-[85%]">
                    {msg.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-600 transition-colors"
                      >
                        <LinkIcon size={10} />
                        <span className="truncate max-w-[100px]">{source.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-200 p-3 rounded-2xl rounded-bl-none animate-pulse">
                  <span className="opacity-0">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 relative">
            {voiceError && (
              <div className="absolute -top-10 left-4 right-4 bg-red-100 text-red-600 text-xs px-3 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <AlertCircle size={14} />
                {voiceError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={toggleRec}
                className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ${
                  isRecListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {isRecListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRecListening ? "Listening..." : "Ask me anything..."}
                className="flex-1 px-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                  isKid ? 'bg-kid-secondary text-white' : 'bg-indigo-600 text-white'
                } disabled:opacity-50`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
