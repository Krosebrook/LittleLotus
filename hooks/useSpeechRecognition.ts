
import { useState, useRef, useEffect, useCallback } from 'react';
import { ISpeechRecognition, ISpeechRecognitionEvent, ISpeechRecognitionErrorEvent } from '../types';

// Extend Window interface locally to include SpeechRecognition constructors
interface WindowWithSpeech extends Window {
  webkitSpeechRecognition?: new () => ISpeechRecognition;
  SpeechRecognition?: new () => ISpeechRecognition;
}

interface UseSpeechRecognitionProps {
  /** Callback triggered when speech is successfully transcribed. */
  onResult: (text: string) => void;
  /** Callback triggered when a recognition error occurs. */
  onError?: (error: string) => void;
}

/**
 * Custom hook for using the Web Speech API (SpeechRecognition).
 * Handles browser compatibility, listening state, and strict typing.
 * 
 * @param {UseSpeechRecognitionProps} props - Configuration props.
 * @returns {Object} An object containing the listening state and a toggle function.
 */
export const useSpeechRecognition = ({ onResult, onError }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    // If currently listening, stop the recognition
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

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
    
    recognition.onresult = (event: ISpeechRecognitionEvent) => {
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

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      onError?.(event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, onResult, onError]);

  return { isListening, toggleListening };
};
