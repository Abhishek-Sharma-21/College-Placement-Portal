import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, AlertCircle } from "lucide-react";
import AssessmentConfigForm from "./AssessmentConfigForm";
import GenerationLoader from "./GenerationLoader";
import QuestionPreview from "./QuestionPreview";

export default function AIQuestionGenerator({ onImport }) {
  const [domain, setDomain] = useState("Software Engineering");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState("5");
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [error, setError] = useState("");

  const [generatedAssessment, setGeneratedAssessment] = useState(null);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Status ticker for loader
  useEffect(() => {
    if (!generating) return;
    const statuses = [
      "Contacting Gemini AI...",
      "Analyzing topic guidelines...",
      "Generating technical questions...",
      "Creating options and distractors...",
      "Enforcing correct answer index safety...",
      "Verifying question structures with Zod...",
      "Completing validation audit..."
    ];
    let idx = 0;
    setGenStatus(statuses[0]);
    const timer = setInterval(() => {
      idx = (idx + 1) % statuses.length;
      setGenStatus(statuses[idx]);
    }, 2500);
    return () => clearInterval(timer);
  }, [generating]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setGenerating(true);
    setError("");
    setGeneratedAssessment(null);

    try {
      const res = await axios.post(
        `${API_URL}/ai-assessments/generate`,
        {
          domain,
          topic,
          difficulty,
          numberOfQuestions: parseInt(numQuestions),
        },
        { withCredentials: true }
      );

      const data = res.data.assessment;
      setGeneratedAssessment(data);
      setSelectedIndices(data.questions.map((_, idx) => idx));
      setExpandedIndex(0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to generate questions. Please verify your API key or try again.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelectQuestion = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((idx) => idx !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleEditQuestionText = (index, value) => {
    if (!generatedAssessment) return;
    const updatedQuestions = [...generatedAssessment.questions];
    updatedQuestions[index].question = value;
    setGeneratedAssessment({ ...generatedAssessment, questions: updatedQuestions });
  };

  const handleEditExplanation = (index, value) => {
    if (!generatedAssessment) return;
    const updatedQuestions = [...generatedAssessment.questions];
    updatedQuestions[index].explanation = value;
    setGeneratedAssessment({ ...generatedAssessment, questions: updatedQuestions });
  };

  const handleEditOptionText = (qIndex, optIndex, value) => {
    if (!generatedAssessment) return;
    const updatedQuestions = [...generatedAssessment.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setGeneratedAssessment({ ...generatedAssessment, questions: updatedQuestions });
  };

  const handleImport = () => {
    if (!generatedAssessment || selectedIndices.length === 0) return;

    const chosenQuestions = generatedAssessment.questions
      .filter((_, idx) => selectedIndices.includes(idx))
      .map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points || 10,
        explanation: q.explanation || "",
      }));

    onImport({
      title: generatedAssessment.title,
      description: generatedAssessment.description,
      duration: generatedAssessment.duration,
      questions: chosenQuestions,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
            <h3 className="text-base font-extrabold text-slate-800">Generate Questions with Gemini AI</h3>
          </div>

          <AssessmentConfigForm
            domain={domain}
            setDomain={setDomain}
            topic={topic}
            setTopic={setTopic}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            numQuestions={numQuestions}
            setNumQuestions={setNumQuestions}
            generating={generating}
            onSubmit={handleGenerate}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <GenerationLoader generating={generating} genStatus={genStatus} />

      {!generating && generatedAssessment && (
        <QuestionPreview
          generatedAssessment={generatedAssessment}
          selectedIndices={selectedIndices}
          onToggleSelect={toggleSelectQuestion}
          onEditQuestionText={handleEditQuestionText}
          onEditExplanation={handleEditExplanation}
          onEditOptionText={handleEditOptionText}
          onImport={handleImport}
          expandedIndex={expandedIndex}
          setExpandedIndex={setExpandedIndex}
        />
      )}
    </div>
  );
}
