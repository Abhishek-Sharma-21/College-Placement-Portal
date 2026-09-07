/**
 * Utility to parse Gemini's generated content response into a clean JSON object.
 */
export const parseAIResponse = (responseText) => {
  if (!responseText) {
    throw new Error("No response text received to parse.");
  }

  let cleanText = responseText.trim();

  // Strip markdown formatting blocks if the model wrapped it
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.substring(7);
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.substring(3);
  }

  if (cleanText.endsWith("```")) {
    cleanText = cleanText.substring(0, cleanText.length - 3);
  }

  cleanText = cleanText.trim();

  try {
    const parsedData = JSON.parse(cleanText);
    return parsedData;
  } catch (error) {
    console.error("Malformed AI Response Text:", cleanText);
    throw new Error(`Failed to parse AI response as valid JSON: ${error.message}`);
  }
};

export default { parseAIResponse };
