import { generateContent } from "./gemini.service.js";
import { buildAssessmentPrompt } from "../utils/ai/promptBuilder.js";
import { parseAIResponse } from "../utils/ai/responseParser.js";
import { validateGeneratedAssessment } from "../utils/ai/questionValidator.js";

/**
 * Service to orchestrate the AI assessment generation workflow.
 */
const getMockQuestions = (domain, topic, difficulty, count) => {
  const mockQuestionsPool = [
    {
      question: `What is the primary purpose of ${topic || 'this topic'} in software engineering?`,
      options: [
        "To optimize application execution speed",
        "To abstract complex details and structure code logic",
        "To manage database transactions directly",
        "To build style components dynamically"
      ],
      correctAnswer: 1,
      explanation: "Abstraction and organization are key patterns across modern software engineering modules.",
      points: 10
    },
    {
      question: `Which data structure is typically preferred for implementing a FIFO queue?`,
      options: [
        "Stack",
        "Array / LinkedList",
        "Binary Search Tree",
        "Hash Map"
      ],
      correctAnswer: 1,
      explanation: "FIFO queues are best implemented using Arrays or linked pointers to shift elements efficiently.",
      points: 10
    },
    {
      question: `Which of the following describes a key characteristics of a stateless service?`,
      options: [
        "It stores user session context locally in memory",
        "It relies on the client to send credential token context with every request",
        "It requires a persistent database connection to load assets",
        "It runs exclusively on serverless platforms"
      ],
      correctAnswer: 1,
      explanation: "Stateless applications do not save context locally, requiring the client to supply JWTs with each request.",
      points: 10
    },
    {
      question: `What does the term 'Idempotency' refer to in REST API design?`,
      options: [
        "Making a request once returns the same HTTP code as making it multiple times",
        "Making multiple identical requests has the same side-effect as making a single request",
        "Encrypting request parameters automatically",
        "Supporting concurrent database insertions safely"
      ],
      correctAnswer: 1,
      explanation: "Idempotent POST/PUT/DELETE requests guarantee that duplicate executions leave the system state identical to a single run.",
      points: 10
    }
  ];

  const selected = [];
  for (let i = 0; i < count; i++) {
    const poolItem = mockQuestionsPool[i % mockQuestionsPool.length];
    selected.push({
      id: i + 1,
      question: i < mockQuestionsPool.length ? poolItem.question : `[Question ${i+1}] Specialized conceptual check for ${topic || 'domain'}.`,
      options: [...poolItem.options],
      correctAnswer: poolItem.correctAnswer,
      explanation: poolItem.explanation,
      points: poolItem.points,
      topic: topic || "General",
      skill: domain || "General",
      difficulty: difficulty || "medium",
      questionType: "MCQ"
    });
  }

  return {
    title: `Mock Assessment: ${topic || domain}`,
    description: `A simulated evaluation covering core concepts of ${topic || domain} generated in mock mode.`,
    duration: 30,
    questions: selected
  };
};

/**
 * Service to orchestrate the AI assessment generation workflow.
 */
export const generateAIAssessment = async ({ domain, topic, difficulty, numberOfQuestions }) => {
  if (process.env.AI_MODE === "mock") {
    console.log("[AI] Mock provider enabled — no external AI request made");
    return getMockQuestions(domain, topic, difficulty, numberOfQuestions);
  }

  console.log("[AI] Gemini provider enabled — external API request");

  // 1. Build prompt
  const prompt = buildAssessmentPrompt({
    domain,
    topic,
    difficulty,
    numberOfQuestions,
  });

  const systemInstruction = `You are a strict JSON generator. You must output exactly one JSON object following the schema provided. Do not write markdown tags or extra text.`;

  // 2. Call Gemini Service
  const rawText = await generateContent(prompt, systemInstruction);

  // 3. Parse Response
  const parsedData = parseAIResponse(rawText);

  // 4. Validate and Clean Questions
  const validatedAssessment = validateGeneratedAssessment(parsedData);

  return validatedAssessment;
};

export default { generateAIAssessment };
