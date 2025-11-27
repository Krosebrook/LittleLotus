import { useState, useRef, useEffect, useCallback } from 'react';

// Extend the Window interface to include SpeechRecognition types
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface UseSpeechRecognitionProps {
  onResult: (text: string) => void;
  onError?: (error: any) => void;
}

/**
 * Custom hook for using the Web Speech API (SpeechRecognition).
 * Handles browser compatibility and listening state.
 * 
 * @param {Function} onResult - Callback when speech is successfully recognized.
 * @param {Function} onError - Callback when an error occurs (e.g., permissions).
 * @returns {Object} { isListening, toggleListening }
 */
export const useSpeechRecognition = ({ onResult, onError }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionConstructor = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      onError?.("not-supported");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false; // Stop after one sentence/result
    recognition.interimResults = true; // Show results as they are being spoken
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      onError?.(event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, onResult, onError]);

  return { isListening, toggleListening };
};
