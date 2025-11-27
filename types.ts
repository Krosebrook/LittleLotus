
/**
 * Defines the application operation modes.
 * - ADULT: Standard interface and content.
 * - KID: Simplified interface, gamified elements, and child-friendly content.
 */
export enum AppMode {
  Adult = 'ADULT',
  Kid = 'KID'
}

/**
 * Supported image resolutions for generation.
 * Only available for specific models (e.g. gemini-3-pro-image-preview).
 */
export enum ImageSize {
  Size_1K = '1K',
  Size_2K = '2K',
  Size_4K = '4K'
}

/**
 * Predefined voice personas for Text-to-Speech generation.
 */
export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
  Aoede = 'Aoede',
  Leda = 'Leda',
  Orpheus = 'Orpheus',
  Iapetus = 'Iapetus',
  Leto = 'Leto',
  Mnemosyne = 'Mnemosyne'
}

/**
 * Represents a generated meditation session.
 */
export interface MeditationSession {
  /** Unique identifier for the session */
  id: string;
  /** Title of the meditation */
  title: string;
  /** The full text transcript of the guided meditation */
  script: string;
  /** The selected mood or goal (e.g., "Sleep", "Focus") */
  mood: string;
  /** Approximate duration category */
  duration: string; 
  /** Description of the visual style */
  visualStyle: string;
  /** The prompt used to generate the background image */
  visualPrompt: string;
  /** Base64 data URL of the generated background image */
  imageUrl?: string;
  /** Decoded audio buffer for playback */
  audioBuffer?: AudioBuffer;
  /** Timestamp of creation */
  createdAt: number;
}

/**
 * Represents a single message in the chat history.
 */
export interface ChatMessage {
  id: string;
  /** 'user' for human input, 'model' for AI response */
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

/**
 * User profile preferences.
 */
export interface UserPreferences {
  name: string;
  ageGroup: string; // "Adult", "3-5", "6-9", etc.
}

/**
 * Interface representing the structure of the session creation form data.
 */
export interface SessionFormData {
  mood: string;
  visualStyle: string;
  imageSize: ImageSize;
  voice: VoiceName;
  duration: string;
}

// --- Web Speech API Type Definitions ---

/**
 * Interface for the SpeechRecognition API.
 */
export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
}

/**
 * Event object for SpeechRecognition errors.
 */
export interface ISpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported' | string;
  message: string;
}

/**
 * Event object for SpeechRecognition results.
 */
export interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ISpeechRecognitionResultList;
}

/**
 * List of speech recognition results.
 */
export interface ISpeechRecognitionResultList {
  length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}

/**
 * Single speech recognition result, containing alternatives.
 */
export interface ISpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): ISpeechRecognitionAlternative;
  [index: number]: ISpeechRecognitionAlternative;
}

/**
 * Single recognition alternative with transcript and confidence.
 */
export interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
