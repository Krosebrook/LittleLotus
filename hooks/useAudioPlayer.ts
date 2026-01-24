
import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage advanced audio playback features.
 */
export const useAudioPlayer = (audioContext: AudioContext, buffer?: AudioBuffer) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (buffer) {
      setDuration(buffer.duration);
    }
  }, [buffer]);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {}
      sourceRef.current = null;
    }
    
    if (gainNodeRef.current) {
      try { gainNodeRef.current.disconnect(); } catch (e) {}
      gainNodeRef.current = null;
    }

    // Analyser doesn't need to be destroyed, but can be disconnected
    if (analyserRef.current) {
        try { analyserRef.current.disconnect(); } catch (e) {}
        analyserRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const playAudio = useCallback((offset: number) => {
    if (!buffer) return;

    stopAudio();

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    // Create Analyser
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    // Signal path: Source -> Analyser -> Gain -> Destination
    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);

    sourceRef.current = source;
    gainNodeRef.current = gainNode;

    startTimeRef.current = audioContext.currentTime;
    pauseTimeRef.current = offset;

    source.start(0, offset);
    setIsPlaying(true);

    const loop = () => {
      const elapsed = audioContext.currentTime - startTimeRef.current + pauseTimeRef.current;
      const trackDuration = buffer.duration || 0;

      setProgress(Math.min(elapsed, trackDuration));

      if (elapsed < trackDuration) {
        animationFrameRef.current = requestAnimationFrame(loop);
      } else {
        setIsPlaying(false);
        pauseTimeRef.current = 0;
        setProgress(0);
      }
    };
    animationFrameRef.current = requestAnimationFrame(loop);
  }, [audioContext, buffer, stopAudio, volume]);

  useEffect(() => {
    if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(volume, audioContext.currentTime, 0.05);
    }
  }, [volume, audioContext]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAudio();
      pauseTimeRef.current += audioContext.currentTime - startTimeRef.current;
      setIsPlaying(false);
    } else {
      playAudio(pauseTimeRef.current);
    }
  }, [isPlaying, audioContext, stopAudio, playAudio]);

  const seek = useCallback((seconds: number) => {
    let currentPos = pauseTimeRef.current;
    if (isPlaying) {
      currentPos = audioContext.currentTime - startTimeRef.current + pauseTimeRef.current;
    }
    const newPos = Math.max(0, Math.min(currentPos + seconds, duration));

    if (isPlaying) {
      playAudio(newPos);
    } else {
      pauseTimeRef.current = newPos;
      setProgress(newPos);
    }
  }, [isPlaying, audioContext, duration, playAudio]);

  const restart = useCallback(() => {
    if (isPlaying) {
      playAudio(0);
    } else {
      pauseTimeRef.current = 0;
      setProgress(0);
    }
  }, [isPlaying, playAudio]);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  return {
    isPlaying,
    progress,
    duration,
    togglePlay,
    seek,
    restart,
    volume,
    setVolume,
    analyser: analyserRef // Expose analyser for visualization
  };
};
