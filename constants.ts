
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
  'Zen Garden': 'A tranquil sanctuary of raked white sand and timeless ancient stones. Best for grounding, clearing mental clutter, and finding deep inner peace.',
  'Abstract Geometry': 'Hypnotic, floating shapes in soothing gradients that rhythmically pulse. Excellent for inducing flow states, deep focus, and structured thinking.',
  'Misty Mountains': 'Sunlight piercing through rolling fog over majestic pine peaks. Evokes a profound sense of vastness, perspective, and fresh clarity.',
  'Cosmic Nebula': 'Shimmering stardust and deep space galaxies swirling in slow motion. Encourages a feeling of awe, connection to the universe, and letting go.',
  'Surrealist Dream': 'Floating islands and impossible architecture in a soft, pastel sky. Stimulates creativity, imagination, and "out of the box" problem solving.',
  'Nordic Cabin': 'Warm, crackling firelight with a view of falling snow and the aurora borealis. Ideal for feeling safe, cozy, protected, and deeply relaxed.',
  'Rainy Window': 'Soft, rhythmic raindrops sliding down glass with blurred city lights in the distance. The ultimate choice for sleep, relaxation, and washing away the day.',
  
  // Kid Styles
  'Magic Forest 🌳': 'Glowing mushrooms and dancing fairy lights in a gentle, mossy forest. Great for sparking imagination and feeling wonder!',
  'Space Adventure 🚀': 'Zooming past smiling planets and shooting stars in a safe rocket ship. Fun for feeling brave, big, and adventurous.',
  'Underwater World 🐠': 'A colorful coral reef with happy fish swimming slowly by. Very calming and slow, like floating weightlessly in a warm bath.',
  'Cartoon Animals 🦊': 'A cozy picnic with fuzzy friends in a sunny meadow. Helps with feeling lonely or sad by bringing comfort and joy.',
  'Cloud Castle ☁️': 'A fluffy, soft kingdom floating in a pink sunset sky. Perfect for drifting off to sweet dreams and sleep.',
  'Dinosaur Valley 🦕': 'Friendly dinos munching leaves by a warm volcano. Good for building energy, strength, and feeling powerful!'
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
  [VoiceName.Puck]: "Playful & Witty (British) - Energetic and fun. Best for keeping kids engaged and lifting spirits.",
  [VoiceName.Charon]: "Deep & Authoritative (American) - A grounded, strong baritone. Best for building confidence and resilience.",
  [VoiceName.Kore]: "Calm & Soothing (American) - A gentle, hushed tone. Perfect for sleep, deep relaxation, and anxiety relief.",
  [VoiceName.Fenrir]: "Deep & Resonant (American) - Low and slow. Excellent for slowing down a racing heart or panic.",
  [VoiceName.Zephyr]: "Gentle & Warm (American) - Friendly and approachable. Like a kind friend offering support.",
  [VoiceName.Aoede]: "Expressive & Bright (British) - Clear and modulating. Engaging for focus, motivation, and daytime use.",
  [VoiceName.Leda]: "Soft & Nurturing (British) - Motherly and comforting. Ideal for emotional healing and self-compassion.",
  [VoiceName.Orpheus]: "Confident & Rich (American) - Inspiring and clear. Great for visualization, success, and morning starts.",
  [VoiceName.Iapetus]: "Grounded & Steady (American) - Reliable and plain-spoken. Good for structured guidance and body scans.",
  [VoiceName.Leto]: "Peaceful & Serene (Mid-Atlantic) - Very neutral, airy, and calm. Good for meditation purists and emptiness.",
  [VoiceName.Mnemosyne]: "Clear & Articulate (International) - Precise and crisp. Best for instructional sessions or learning mindfulness techniques."
};
