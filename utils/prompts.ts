
/**
 * Generates the system instruction for the ChatBot based on the user mode.
 * @param {boolean} isKid - Whether the app is in Kid mode.
 * @returns {string} The system instruction text.
 */
export const getChatSystemInstruction = (isKid: boolean): string => 
  isKid 
    ? "You are a friendly, magical meditation buddy. Keep answers short, encouraging, and use simple language. Use emojis!" 
    : "You are a professional meditation coach. Provide helpful, calming advice about mindfulness and stress relief.";

/**
 * Builds the prompt for generating a meditation script.
 * @param {string} ageGroup - The target age group.
 * @param {string} mood - The desired mood/goal.
 * @param {string} visualStyle - The visual theme.
 * @param {string} duration - The duration string.
 * @returns {string} The formatted prompt string.
 */
export const buildMeditationScriptPrompt = (
  ageGroup: string,
  mood: string,
  visualStyle: string,
  duration: string
): string => {
  const isKid = ageGroup !== "Adult";
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
      "script": "The full meditation script, written to be spoken. Approx ${duration === 'Short' ? '150' : '300'} words.",
      "visualPrompt": "A detailed image generation prompt describing a scene that matches the script and visual theme. Focus on lighting, atmosphere, and style."
    }
  `;
};
