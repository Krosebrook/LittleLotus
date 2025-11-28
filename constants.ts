
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
  [AppMode.Kid]: [
    VoiceName.Puck,
    VoiceName.Zephyr,
    VoiceName.Aoede,
    VoiceName.Leto,
    VoiceName.Leda,
    VoiceName.Kore,
    VoiceName.Mnemosyne
  ],
  [AppMode.Adult]: [
    VoiceName.Kore,
    VoiceName.Fenrir,
    VoiceName.Charon,
    VoiceName.Orpheus,
    VoiceName.Iapetus,
    VoiceName.Mnemosyne,
    VoiceName.Puck,
    VoiceName.Zephyr,
    VoiceName.Leda,
    VoiceName.Aoede,
    VoiceName.Leto
  ]
};

/**
 * Descriptions for the voice personas to help users choose styles/accents.
 */
export const VOICE_DESCRIPTIONS: Record<VoiceName, string> = {
  [VoiceName.Puck]: "Playful & Energetic",
  [VoiceName.Charon]: "Deep & Authoritative",
  [VoiceName.Kore]: "Calm & Soothing",
  [VoiceName.Fenrir]: "Deep & Resonant",
  [VoiceName.Zephyr]: "Gentle & Warm",
  [VoiceName.Aoede]: "Expressive & Bright",
  [VoiceName.Leda]: "Soft & Nurturing",
  [VoiceName.Orpheus]: "Confident & Rich",
  [VoiceName.Iapetus]: "Grounded & Steady",
  [VoiceName.Leto]: "Peaceful & Serene",
  [VoiceName.Mnemosyne]: "Clear & Articulate"
};
