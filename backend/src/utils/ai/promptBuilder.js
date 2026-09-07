/**
 * Builder utility to construct clean and precise prompts for Gemini.
 */
export const buildAssessmentPrompt = ({ domain, topic, difficulty = "medium", numberOfQuestions = 10 }) => {
  return `You are an expert technical interviewer and university placement cell coordinator.
Generate a structured placement assessment for college students with the following parameters:
- General Domain: ${domain || "General Computer Science"}
- Technical Topic: ${topic}
- Target Difficulty: ${difficulty}
- Number of Questions: ${numberOfQuestions}

Your response must be a single, valid JSON object matching the JSON schema below. Do not output any HTML, markdown blocks (like \`\`\`json), or explaining text. Return only the JSON object.

### Response JSON Schema:
{
  "title": "A short descriptive title for this assessment",
  "description": "A brief description of what this assessment tests",
  "duration": 30, // Recommended test duration in minutes (integer)
  "questions": [
    {
      "id": 1, // Integer starting from 1
      "question": "The question text, code block, or question scenario",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ], // Must contain exactly 4 options
      "correctAnswer": 0, // CRITICAL: This MUST be the 0-indexed integer index (0, 1, 2, or 3) of the correct string inside the options array. Never return a string or character here.
      "explanation": "A short, helpful explanation of why the correct option is right",
      "points": 10, // Recommended points for this question (integer)
      "topic": "Specific topic (e.g. Collections)",
      "skill": "Language/framework (e.g. Java)",
      "difficulty": "easy, medium, or hard",
      "questionType": "MCQ"
    }
  ]
}

### Guidelines:
1. Ensure the questions test core conceptual knowledge, practical troubleshooting, and best practices.
2. Avoid generic or overly simplistic questions. For code-related topics, include realistic code snippets in the question text.
3. Every option must be unique, logical, and unambiguous.
4. Double check that "correctAnswer" matches the index of the correct option (e.g. if the second option is correct, set correctAnswer to 1).
5. All JSON parameters must be fully populated.
`;
};

export default { buildAssessmentPrompt };
