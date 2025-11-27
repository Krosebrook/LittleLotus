import { AppMode, VoiceName } from "./types";

/**
 * Mood options available for different app modes.
 */
export const MOODS = {
  [AppMode.Kid]: ['Sleepy Time 😴', 'Calm Down 🧘', 'Happy Thoughts 🌟', 'Focus Power 🧠'],
  [AppMode.Adult]: ['Stress Relief', 'Better Sleep', 'Morning Energy', 'Deep Focus', 'Anxiety Release']
};

/**
 * Visual style prompts available for different app modes.
 */
export const VISUAL_STYLES = {
  [AppMode.Kid]: ['Magic Forest 🌳', 'Space Adventure 🚀', 'Underwater World 🐠', 'Cartoon Animals 🦊'],
  [AppMode.Adult]: ['Zen Garden', 'Abstract Geometry', 'Misty Mountains', 'Cosmic Nebula', 'Surrealist Dream']
};

/**
 * Voice configurations available for different app modes.
 */
export const VOICES = {
  [AppMode.Kid]: [VoiceName.Puck, VoiceName.Zephyr],
  [AppMode.Adult]: [VoiceName.Kore, VoiceName.Fenrir, VoiceName.Charon, VoiceName.Puck]
};
