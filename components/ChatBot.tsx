
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { chatWithBot } from '../services/geminiService';
import { MessageCircle, Send, X, Bot, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useApp } from '../context/AppContext';

/**
 * AI ChatBot component with voice input capabilities.
 * Adapts persona based on the AppMode (Kid vs Adult).
 */
export const ChatBot: React.FC = () => {
  const { isKid } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when mode changes or on mount
  useEffect(() => {
    setMessages([{
      id: 'init',
      role: 'model',
      text: isKid 
        ? "Hi! I'm your mindfulness buddy. How are you feeling? 🌟" 
        : "Hello. I'm your mindfulness coach. How can I help you today?",
      timestamp: Date.now()
    }]);
  }, [isKid]);

  const handleSpeechResult = useCallback((text: string) => {
    setInput(prev => {
      // Add space if there is existing text and it doesn't end with space
      const spacing = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
      return prev + spacing + text;
    });
    setVoiceError(null);
  }, []);

  const handleSpeechError = useCallback((error: string) => {
    let msg = '';
    if (error === 'not-allowed') {
      msg = 'Microphone access denied.';
    } else if (error === 'not-supported') {
      msg = 'Voice input not supported.';
    } else if (error === 'no-speech') {
      // User didn't say anything, just reset silently
      return; 
    } else {
      msg = 'Error hearing voice.';
      console.warn('Voice input error:', error);
    }
    
    if (msg) {
      setVoiceError(msg);
      setTimeout(() => setVoiceError(null), 3000);
    }
  }, []);

  const { isListening, toggleListening } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

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
      // Filter history for API
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const responseText = await chatWithBot(userMsg.text, history, isKid);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      // Optional error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-40 flex items-center gap-2 ${
          isKid 
            ? 'bg-kid-primary text-white border-4 border-white' 
            : 'bg-indigo-600 text-white'
        }`}
        aria-label="Open Chat Bot"
      >
        <MessageCircle size={28} />
        <span className="font-bold pr-2">{isKid ? 'Chat Buddy' : 'AI Coach'}</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-80 md:w-96 h-[500px] flex flex-col rounded-2xl shadow-2xl z-40 overflow-hidden ${
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
        <button 
          onClick={() => setIsOpen(false)} 
          className="hover:bg-white/20 p-1 rounded"
          aria-label="Close Chat Bot"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.role === 'user'
                  ? (isKid ? 'bg-kid-primary text-white rounded-br-none' : 'bg-indigo-600 text-white rounded-br-none')
                  : (isKid ? 'bg-white border-2 border-slate-100 text-slate-800 rounded-bl-none shadow-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm')
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
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

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 relative">
        
        {/* Voice Error Notification */}
        {voiceError && (
          <div className="absolute -top-10 left-4 right-4 bg-red-100 text-red-600 text-xs px-3 py-2 rounded-lg shadow-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <AlertCircle size={14} />
            {voiceError}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md scale-110'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            title="Voice Input"
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : (isKid ? "Say something..." : "Type your question...")}
            className={`flex-1 px-4 py-2 rounded-full border transition-all duration-300 focus:outline-none ${
              isListening 
                ? 'border-red-400 bg-red-50 ring-2 ring-red-200 placeholder-red-400' 
                : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'
            }`}
            aria-label="Message Input"
          />
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              isKid 
               ? 'bg-kid-secondary text-white hover:bg-amber-500' 
               : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } disabled:opacity-50`}
            aria-label="Send Message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
