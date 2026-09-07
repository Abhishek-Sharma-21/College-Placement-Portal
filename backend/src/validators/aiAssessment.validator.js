import { z } from "zod";

export const generateAssessmentSchema = z.object({
  domain: z.string().min(1, { message: "Domain is required." }),
  topic: z.string().min(1, { message: "Topic is required." }),
  difficulty: z.enum(["easy", "medium", "hard"], { message: "Difficulty must be 'easy', 'medium', or 'hard'." }),
  numberOfQuestions: z.number().int().min(1).max(30, { message: "Max questions limit is 30." }).default(10),
});

export default { generateAssessmentSchema };
