
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
    ? "You are a friendly, magical meditation buddy. Keep answers short, encouraging, and use simple language. Use emojis! If you use search, tell me cool facts." 
    : "You are a professional meditation coach. Provide helpful, calming advice about mindfulness and stress relief. If asked about facts, use search to provide accurate info.";

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
  const wordCount = duration === 'Short' ? '150' : '300';
  
  const speaker1 = "Guide";
  const speaker2 = isKid ? "Buddy" : "InnerSelf";
  const context = isKid 
    ? "The 'Guide' is a gentle narrator. 'Buddy' is a curious, calm child or creature learning along."
    : "The 'Guide' is the instructor. 'InnerSelf' is the listener's internal voice affirming the practice.";

  return `
    You are an expert meditation guide and content creator for ${isKid ? 'children' : 'adults'}.
    Create a custom guided meditation session formatted as a dialogue between two characters: ${speaker1} and ${speaker2}.
    ${context}
    
    Target Audience Age: ${ageGroup}
    Goal/Mood: ${mood}
    Visual Theme: ${visualStyle}
    Duration: ${duration}
    
    Return the response in JSON format with the following schema:
    {
      "title": "A creative title for the session",
      "script": "The full dialogue script. Use the format '${speaker1}: [text]' and '${speaker2}: [text]'. Total approx ${wordCount} words.",
      "visualPrompt": "A detailed video generation prompt describing a scene that matches the script and visual theme. Focus on movement, lighting, and atmosphere."
    }
  `;
};
