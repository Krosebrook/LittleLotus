import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage audio playback, seeking, and progress tracking.
 * 
 * @param {AudioContext} audioContext - The AudioContext instance.
 * @param {AudioBuffer} [buffer] - The audio buffer to play.
 * @returns {Object} Controls and state for the audio player.
 */
export const useAudioPlayer = (audioContext: AudioContext, buffer?: AudioBuffer) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (buffer) {
      setDuration(buffer.duration);
    }
  }, [buffer]);

  /**
   * Stops the current audio source and cancels the animation frame.
   */
  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {
        // ignore errors if source is already stopped
      }
      sourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  /**
   * Starts playback from a specific offset.
   * @param {number} offset - The time in seconds to start playing from.
   */
  const playAudio = useCallback((offset: number) => {
    if (!buffer) return;

    stopAudio();

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    startTimeRef.current = audioContext.currentTime;
    pauseTimeRef.current = offset;

    source.start(0, offset);
    sourceRef.current = source;
    setIsPlaying(true);

    const loop = () => {
      const elapsed = audioContext.currentTime - startTimeRef.current + pauseTimeRef.current;
      const d = buffer.duration || 0;

      setProgress(Math.min(elapsed, d));

      if (elapsed < d) {
        animationFrameRef.current = requestAnimationFrame(loop);
      } else {
        setIsPlaying(false);
        pauseTimeRef.current = 0;
        setProgress(0);
      }
    };
    animationFrameRef.current = requestAnimationFrame(loop);
  }, [audioContext, buffer, stopAudio]);

  /**
   * Toggles between play and pause states.
   */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAudio();
      pauseTimeRef.current += audioContext.currentTime - startTimeRef.current;
      setIsPlaying(false);
    } else {
      playAudio(pauseTimeRef.current);
    }
  }, [isPlaying, audioContext, stopAudio, playAudio]);

  /**
   * Seeks to a relative position in the audio.
   * @param {number} seconds - The number of seconds to skip (positive or negative).
   */
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

  /**
   * Restarts the audio from the beginning.
   */
  const restart = useCallback(() => {
    if (isPlaying) {
      playAudio(0);
    } else {
      pauseTimeRef.current = 0;
      setProgress(0);
    }
  }, [isPlaying, playAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  return {
    isPlaying,
    progress,
    duration,
    togglePlay,
    seek,
    restart
  };
};
