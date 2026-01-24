
import { useState, useRef, useCallback, useEffect } from 'react';
import { geminiClient } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';
import { atobHelper, decodeAudioData } from '../utils/audio';

interface UseLiveSessionProps {
  onDisconnect: () => void;
  voiceName: string;
  isKid: boolean;
}

/**
 * Hook to manage a Gemini Live API session for real-time conversational audio.
 */
export const useLiveSession = ({ onDisconnect, voiceName, isKid }: UseLiveSessionProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false); // Model is talking
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null);
  
  // Audio Playback Queue State
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Initialize Audio Context on demand
  const getContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    return audioContextRef.current;
  };

  const connect = async () => {
    try {
      setError(null);
      const ctx = getContext();
      if (ctx.state === 'suspended') await ctx.resume();

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
      streamRef.current = stream;

      // Establish Live Connection
      const sessionPromise = geminiClient.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
          },
          systemInstruction: isKid 
            ? "You are a friendly, magical listener. Listen to the child and help them feel calm." 
            : "You are a supportive meditation coach. Listen empathetically and offer brief guidance.",
        },
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setIsConnected(true);
            
            // Start Audio Streaming
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const b64Data = pcmFloat32ToBase64(inputData);
              
              // Only send if session is active
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                    media: { 
                        mimeType: 'audio/pcm;rate=16000', 
                        data: b64Data 
                    } 
                });
              }).catch(() => {
                // Session closed or failed, ignore
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
            
            inputSourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            const data = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (data) {
              setIsTalking(true);
              const buffer = await decodeAudioData(atobHelper(data), ctx);
              playAudioBuffer(buffer);
            }
            
            if (msg.serverContent?.turnComplete) {
               setIsTalking(false);
            }
            
            if (msg.serverContent?.interrupted) {
               stopAllAudio();
            }
          },
          onclose: () => {
            console.log("Live Session Closed");
            cleanup();
          },
          onerror: (err) => {
            console.error("Live Session Error", err);
            setError("Connection error");
            cleanup();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (e: any) {
      console.error(e);
      setError("Failed to start live session");
      cleanup();
    }
  };

  const playAudioBuffer = (buffer: AudioBuffer) => {
    const ctx = getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    // Schedule playback
    const currentTime = ctx.currentTime;
    // Ensure we don't schedule in the past
    const startTime = Math.max(currentTime, nextStartTimeRef.current);
    
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
    
    sourcesRef.current.add(source);
    source.onended = () => {
      sourcesRef.current.delete(source);
      if (sourcesRef.current.size === 0) setIsTalking(false);
    };
  };

  const stopAllAudio = () => {
    // Convert to array to avoid modification during iteration issues
    const sources: AudioBufferSourceNode[] = Array.from(sourcesRef.current);
    sources.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsTalking(false);
  };

  const cleanup = () => {
    setIsConnected(false);
    stopAllAudio();
    
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
        inputSourceRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    
    // Close session if possible
    if (sessionRef.current) {
        sessionRef.current.then((s: any) => {
            if(s.close) s.close();
        }).catch(() => {});
        sessionRef.current = null;
    }

    onDisconnect();
  };

  const disconnect = () => {
    cleanup();
  };

  return { connect, disconnect, isConnected, isTalking, error };
};

// --- Helper for Float32 to Base64 PCM ---
function pcmFloat32ToBase64(data: Float32Array): string {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // Clamp and scale
        const s = Math.max(-1, Math.min(1, data[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
