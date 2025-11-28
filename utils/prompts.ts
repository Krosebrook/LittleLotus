
/**
 * Generates the system instruction for the ChatBot based on the active application mode.
 * - Kid Mode: Persona is friendly, magical, and simple.
 * - Adult Mode: Persona is professional, calm, and insightful.
 * 
 * @param {boolean} isKid - Whether the app is currently in Kid mode.
 * @returns {string} The formatted system instruction text.
 */
export const getChatSystemInstruction = (isKid: boolean): string => 
  isKid 
    ? "You are a friendly, magical meditation buddy. Keep answers short, encouraging, and use simple language. Use emojis!" 
    : "You are a professional meditation coach. Provide helpful, calming advice about mindfulness and stress relief.";

/**
 * Builds a detailed prompt for generating a structured meditation script via the LLM.
 * The prompt enforces a JSON output schema to ensure the app can parse the result.
 * 
 * @param {string} ageGroup - The target age group (e.g. "Adult", "6-9").
 * @param {string} mood - The desired goal (e.g. "Sleep", "Focus").
 * @param {string} visualStyle - The visual theme description.
 * @param {string} duration - The approximate length category ("Short", "Long").
 * @returns {string} The fully constructed prompt string.
 */
export const buildMeditationScriptPrompt = (
  ageGroup: string,
  mood: string,
  visualStyle: string,
  duration: string
): string => {
  const isKid = ageGroup !== "Adult";
  // Word count guidance is 150 words for short sessions (~1-2 mins) and 300 for long (~3-4 mins).
  const wordCount = duration === 'Short' ? '150' : '300';
  
  return `
    You are an expert meditation guide and content creator for ${isKid ? 'children' : 'adults'}.
    Create a custom guided meditation session.
    
    Target Audience Age: ${ageGroup}
    Goal/Mood: ${mood}
    Visual Theme: ${visualStyle}
    Duration: ${duration}
    
    Return the response in JSON format with the following schema:
    {
      "title": "A creative title for the session",
      "script": "The full meditation script, written to be spoken. Approx ${wordCount} words.",
      "visualPrompt": "A detailed image generation prompt describing a scene that matches the script and visual theme. Focus on lighting, atmosphere, and style."
    }
  `;
};
