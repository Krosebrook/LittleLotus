
import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage advanced audio playback features.
 * Handles:
 * - Play/Pause/Stop
 * - Seeking (Skip forward/backward)
 * - Volume Control (GainNode)
 * - Progress tracking via RequestAnimationFrame
 * 
 * @param {AudioContext} audioContext - The initialized AudioContext.
 * @param {AudioBuffer} [buffer] - The audio buffer to play.
 * @returns {Object} An object containing player state (isPlaying, progress, volume) and control methods.
 */
export const useAudioPlayer = (audioContext: AudioContext, buffer?: AudioBuffer) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // Current playback position in seconds
  const [duration, setDuration] = useState(0); // Total duration in seconds
  const [volume, setVolume] = useState(1); // Volume level from 0.0 to 1.0

  // References to Web Audio nodes and state
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0); // When the current play started (audioContext time)
  const pauseTimeRef = useRef<number>(0); // Offset within the buffer when paused
  const animationFrameRef = useRef<number>(0); // ID for the progress loop

  // Update duration when the buffer changes
  useEffect(() => {
    if (buffer) {
      setDuration(buffer.duration);
    }
  }, [buffer]);

  /**
   * Stops the current audio source, disconnects nodes, and cancels the animation loop.
   * This is called when pausing, seeking, or unmounting.
   */
  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {
        // Source might already be stopped
      }
      sourceRef.current = null;
    }
    
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect();
      } catch (e) {
        // Gain node might already be disconnected
      }
      gainNodeRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  /**
   * Starts playback from a specific time offset.
   * Recreates the SourceNode and GainNode as they are single-use objects.
   * 
   * @param {number} offset - The time in seconds to start playing from.
   */
  const playAudio = useCallback((offset: number) => {
    if (!buffer) return;

    // Ensure any previous playback is fully stopped
    stopAudio();

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Create GainNode for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    // Signal path: Source -> Gain -> Destination
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    sourceRef.current = source;
    gainNodeRef.current = gainNode;

    startTimeRef.current = audioContext.currentTime;
    pauseTimeRef.current = offset;

    source.start(0, offset);
    setIsPlaying(true);

    // Animation loop to update progress bar smoothly
    const loop = () => {
      const elapsed = audioContext.currentTime - startTimeRef.current + pauseTimeRef.current;
      const trackDuration = buffer.duration || 0;

      setProgress(Math.min(elapsed, trackDuration));

      if (elapsed < trackDuration) {
        animationFrameRef.current = requestAnimationFrame(loop);
      } else {
        // Playback finished
        setIsPlaying(false);
        pauseTimeRef.current = 0;
        setProgress(0);
      }
    };
    animationFrameRef.current = requestAnimationFrame(loop);
  }, [audioContext, buffer, stopAudio, volume]);

  /**
   * Updates the volume of the active GainNode in real-time.
   * Uses `setTargetAtTime` for smooth transitions (de-clicking).
   */
  useEffect(() => {
    if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(volume, audioContext.currentTime, 0.05);
    }
  }, [volume, audioContext]);

  /**
   * Toggles playback state between Play and Pause.
   */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopAudio();
      // Calculate where we left off
      pauseTimeRef.current += audioContext.currentTime - startTimeRef.current;
      setIsPlaying(false);
    } else {
      playAudio(pauseTimeRef.current);
    }
  }, [isPlaying, audioContext, stopAudio, playAudio]);

  /**
   * Skips forward or backward in the track.
   * @param {number} seconds - Seconds to skip (positive or negative).
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
   * Resets playback to the beginning.
   */
  const restart = useCallback(() => {
    if (isPlaying) {
      playAudio(0);
    } else {
      pauseTimeRef.current = 0;
      setProgress(0);
    }
  }, [isPlaying, playAudio]);

  // Cleanup when component unmounts
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
    setVolume
  };
};
