
import { AppMode, VoiceName, MusicGenre } from "./types";

/**
 * Mood options available for different app modes.
 */
export const MOODS = {
  [AppMode.Kid]: ['Sleepy Time 😴', 'Calm Down 🧘', 'Happy Thoughts 🌟', 'Focus Power 🧠', 'Brave Heart 🦁'],
  [AppMode.Adult]: ['Stress Relief', 'Better Sleep', 'Morning Energy', 'Deep Focus', 'Anxiety Release', 'Creative Flow']
};

/**
 * Visual style prompts available for different app modes.
 */
export const VISUAL_STYLES = {
  [AppMode.Kid]: ['Magic Forest 🌳', 'Space Adventure 🚀', 'Underwater World 🐠', 'Cartoon Animals 🦊', 'Cloud Castle ☁️', 'Dinosaur Valley 🦕'],
  [AppMode.Adult]: ['Zen Garden', 'Abstract Geometry', 'Misty Mountains', 'Cosmic Nebula', 'Surrealist Dream', 'Nordic Cabin', 'Rainy Window']
};

/**
 * Detailed descriptions for visual styles to help users choose.
 */
export const VISUAL_DESCRIPTIONS: Record<string, string> = {
  // Adult Styles
  'Zen Garden': 'Raked sand, ancient stones, and falling cherry blossoms.',
  'Abstract Geometry': 'Floating shapes and soothing color gradients.',
  'Misty Mountains': 'Fog-covered peaks at sunrise with pine trees.',
  'Cosmic Nebula': 'Deep space clouds with shimmering stars and galaxies.',
  'Surrealist Dream': 'Floating islands and impossible architecture.',
  'Nordic Cabin': 'Cozy wood interior with a view of snow and aurora.',
  'Rainy Window': 'Raindrops on glass with city lights blurring in background.',
  
  // Kid Styles
  'Magic Forest 🌳': 'Glowing mushrooms and fairy lights in a green forest.',
  'Space Adventure 🚀': 'Cartoon planets and friendly aliens in a rocket ship.',
  'Underwater World 🐠': 'Colorful coral reef with smiling fish and bubbles.',
  'Cartoon Animals 🦊': 'A picnic scene with cute foxes, bears, and rabbits.',
  'Cloud Castle ☁️': 'A fluffy castle floating in a pink and blue sky.',
  'Dinosaur Valley 🦕': 'Friendly dinos eating leaves near a sparkling volcano.'
};

/**
 * Available background music options.
 */
export const MUSIC_GENRES = [
  MusicGenre.TibetanBowls,
  MusicGenre.LoFi,
  MusicGenre.AmbientSynth,
  MusicGenre.NatureSounds,
  MusicGenre.NoMusic
];

/**
 * Voice configurations available for different app modes.
 * Expanded to offer diverse accents and styles.
 */
export const VOICES = {
  [AppMode.Kid]: [
    VoiceName.Puck,      // British / Playful
    VoiceName.Aoede,     // British / Bright
    VoiceName.Zephyr,    // American / Gentle
    VoiceName.Leda,      // British / Soft
    VoiceName.Leto,      // International / Peaceful
    VoiceName.Kore,      // American / Calm
    VoiceName.Mnemosyne, // International / Clear
    VoiceName.Orpheus,   // American / Confident
    VoiceName.Iapetus    // American / Steady
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
 * Updated with specific accent indicators.
 */
export const VOICE_DESCRIPTIONS: Record<VoiceName, string> = {
  [VoiceName.Puck]: "Playful & Witty (British)",
  [VoiceName.Charon]: "Deep & Authoritative (American)",
  [VoiceName.Kore]: "Calm & Soothing (American)",
  [VoiceName.Fenrir]: "Deep & Resonant (American)",
  [VoiceName.Zephyr]: "Gentle & Warm (American)",
  [VoiceName.Aoede]: "Expressive & Bright (British)",
  [VoiceName.Leda]: "Soft & Nurturing (British)",
  [VoiceName.Orpheus]: "Confident & Rich (American)",
  [VoiceName.Iapetus]: "Grounded & Steady (American)",
  [VoiceName.Leto]: "Peaceful & Serene (Mid-Atlantic)",
  [VoiceName.Mnemosyne]: "Clear & Articulate (International)"
};
