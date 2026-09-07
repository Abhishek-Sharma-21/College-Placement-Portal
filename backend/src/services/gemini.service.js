import { geminiConfig } from "../config/gemini.config.js";

/**
 * Service to communicate directly with the Gemini API via HTTP requests.
 */
export const generateContent = async (prompt, systemInstruction = "") => {
  try {
    const { apiKey, defaultModel, apiUrl } = geminiConfig;

    if (!apiKey) {
      throw new Error("Gemini API key is not configured in the backend environment.");
    }

    const endpoint = `${apiUrl}/${defaultModel}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error (HTTP ${response.status}): ${errorText}`);
    }

    const data = await response.json();

    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Malformed response received from Gemini API (no candidate content).");
    }

    return candidateText;
  } catch (error) {
    console.error("Gemini Service Error:", error.message);
    throw new Error(error.message || "Failed to communicate with AI generation provider.");
  }
};

export default { generateContent };
