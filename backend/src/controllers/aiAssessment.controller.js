import { generateAIAssessment } from "../services/aiAssessment.service.js";

/**
 * Controller to handle AI assessment generation requests.
 */
export const generateAssessmentHandler = async (req, res) => {
  try {
    const { domain, topic, difficulty, numberOfQuestions } = req.body;

    if (req.user.role !== "tpo") {
      return res.status(403).json({ message: "Access denied. Only TPOs can generate assessments." });
    }

    const assessment = await generateAIAssessment({
      domain,
      topic,
      difficulty,
      numberOfQuestions: parseInt(numberOfQuestions),
    });

    res.status(200).json({
      message: "AI assessment generated successfully.",
      assessment,
    });
  } catch (error) {
    console.error("AI Generation Controller Error:", error);
    res.status(500).json({
      message: error.message || "Failed to generate assessment. Please try again.",
    });
  }
};

export default { generateAssessmentHandler };
