import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { ROUTES } from "@/Routes/studentRout/routes.jsx";

const TakeAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [reviewed, setReviewed] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [startedAt, setStartedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    fetchAssessment();

    // Prevent accidental navigation
    const handleBeforeUnload = (e) => {
      if (!submitted && !submitting) {
        e.preventDefault();
        e.returnValue =
          "You have an assessment in progress. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [id, submitted, submitting]);

  // Tab switch and screen blur warning cheat evaluation
  useEffect(() => {
    if (submitted || submitting || !assessment) return;

    const handleWindowBlur = () => {
      setWarnings((prev) => {
        const next = prev + 1;
        alert(`⚠️ WARNING: You have left the assessment screen (${next}/3). Exits are logged and flagged for TPO review.`);
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings((prev) => {
          const next = prev + 1;
          alert(`⚠️ WARNING: Tab switching or minimized browser is flagged (${next}/3).`);
          return next;
        });
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [submitted, submitting, assessment]);

  useEffect(() => {
    if (timeLeft <= 0 && startedAt && !submitted && !submitting) {
      handleAutoSubmit();
    }
  }, [timeLeft, startedAt, submitted, submitting]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/assessments/${id}/take`, {
        withCredentials: true,
      });

      // Map original question index and options indices before shuffling
      const rawQuestions = (response.data.questions || []).map((q, idx) => {
        const mappedOptions = (q.options || []).map((opt, oIdx) => ({
          text: opt,
          originalOptionIndex: oIdx,
        }));
        return {
          ...q,
          originalIndex: idx,
          options: mappedOptions,
        };
      });

      let questionsToUse = [...rawQuestions];
      if (response.data.randomizeQuestions) {
        for (let i = questionsToUse.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [questionsToUse[i], questionsToUse[j]] = [questionsToUse[j], questionsToUse[i]];
        }
      }

      if (response.data.randomizeOptions) {
        questionsToUse = questionsToUse.map((q) => {
          const shuffledOptions = [...q.options];
          for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
          }
          return {
            ...q,
            options: shuffledOptions,
          };
        });
      }

      setAssessment({
        ...response.data,
        questions: questionsToUse,
      });
      const savedData = response.data.startedAt || new Date();
      setStartedAt(savedData);

      // Load saved answers from localStorage if available
      const savedAnswers = localStorage.getItem(`assessment_${id}_answers`);
      if (savedAnswers) {
        try {
          const parsed = JSON.parse(savedAnswers);
          if (parsed.answers) {
            setAnswers(parsed.answers);
          }
          if (parsed.startedAt) {
            setStartedAt(new Date(parsed.startedAt));
          }
        } catch (e) {
          console.error("Error parsing saved answers:", e);
        }
      }

      // Calculate time left based on duration and elapsed time
      const durationInSeconds = response.data.duration * 60;
      const elapsed = savedData
        ? Math.floor((new Date() - new Date(savedData)) / 1000)
        : 0;
      const remaining = Math.max(0, durationInSeconds - elapsed);
      setTimeLeft(remaining);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-save answers every 30 seconds
      autoSaveRef.current = setInterval(() => {
        saveAnswersLocally();
      }, 30000);
    } catch (err) {
      console.error("Error fetching assessment:", err);
      setError(err.response?.data?.message || "Failed to load assessment");
    } finally {
      setLoading(false);
    }
  };

  const saveAnswersLocally = () => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(
        `assessment_${id}_answers`,
        JSON.stringify({ answers, startedAt }),
      );
    }
  };

  const handleAnswerChange = (questionIndex, selectedAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedAnswer,
    }));
    // Auto-save on each answer change
    saveAnswersLocally();
  };

  const handleSubmit = async (autoSubmitted = false) => {
    if (submitting || submitted) return;

    try {
      setSubmitting(true);

      // Clear timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);

      // Convert answers to array format
      const answersArray = Object.keys(answers).map((key) => ({
        questionIndex: parseInt(key),
        selectedAnswer: answers[key],
      }));

      // Fill in unanswered questions
      for (let i = 0; i < assessment.questions.length; i++) {
        const originalIndex = assessment.questions[i].originalIndex ?? i;
        if (!answersArray.find((a) => a.questionIndex === originalIndex)) {
          answersArray.push({
            questionIndex: originalIndex,
            selectedAnswer: null,
          });
        }
      }

      const response = await axios.post(
        `${API_URL}/assessments/${id}/submit`,
        {
          answers: answersArray,
          startedAt,
          autoSubmitted,
          warnings,
        },
        { withCredentials: true },
      );

      setResult(response.data.result);
      setSubmitted(true);

      // Clear local storage
      localStorage.removeItem(`assessment_${id}_answers`);
    } catch (err) {
      console.error("Error submitting assessment:", err);
      setError(err.response?.data?.message || "Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    if (!submitted && !submitting) {
      handleSubmit(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLeft < 60) return "text-red-600";
    if (timeLeft < 300) return "text-orange-600";
    return "text-gray-700";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          Loading assessment...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate(ROUTES.ASSESSMENTS)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Assessment Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-800">
                  {result.autoSubmitted
                    ? "Assessment automatically submitted"
                    : "Assessment submitted successfully"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold">{result.score}</p>
                <p className="text-xs text-gray-500">
                  out of {result.totalPoints}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Percentage</p>
                <p className="text-2xl font-bold">
                  {result.percentage.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge
                  variant={result.passed ? "default" : "destructive"}
                  className="mt-1"
                >
                  {result.passed ? "Passed" : "Failed"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Taken</p>
                <p className="text-lg font-semibold">{result.timeTaken} min</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => navigate(ROUTES.ASSESSMENTS)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const currentQ = assessment.questions[currentQuestion];
  const totalQuestions = assessment.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with Timer */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{assessment.title}</h2>
          <p className="text-sm text-gray-600">{assessment.description}</p>
        </div>
        <div className="flex items-center gap-4">
          {timeLeft < 60 && timeLeft > 0 && (
            <div className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium animate-pulse">
              ⚠️ Time running out!
            </div>
          )}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
              timeLeft < 60
                ? "border-red-500 bg-red-50"
                : timeLeft < 300
                  ? "border-orange-500 bg-orange-50"
                  : "border-blue-500 bg-blue-50"
            }`}
          >
            <Clock className={`h-5 w-5 ${getTimeColor()}`} />
            <span className={`text-xl font-bold ${getTimeColor()}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-600">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Questions Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                {assessment.questions.map((q, index) => {
                  const isCurrent = currentQuestion === index;
                  const isAns = answers[q.originalIndex] !== undefined && answers[q.originalIndex] !== null;
                  const isRev = reviewed[q.originalIndex] === true;
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`p-2 rounded text-sm font-medium transition-colors flex items-center justify-between ${
                        isCurrent
                          ? "bg-blue-600 text-white"
                          : isRev
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                            : isAns
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>{index + 1}</span>
                      <span className="text-[10px]">
                        {isRev ? "🔖" : isAns ? "✓" : "?"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Question {currentQuestion + 1} ({currentQ.points} point
                  {currentQ.points !== 1 ? "s" : ""})
                </CardTitle>
                <Badge variant="outline" className="capitalize">
                  {currentQ.type.replace("-", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-medium">{currentQ.question}</p>

              <div className="space-y-2">
                {currentQ.options.map((option, optionIndex) => {
                  const optIndex = option.originalOptionIndex !== undefined ? option.originalOptionIndex : optionIndex;
                  const optText = option.text !== undefined ? option.text : option;
                  const isSelected = answers[currentQ.originalIndex] === optIndex;
                  return (
                    <label
                      key={optionIndex}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        checked={isSelected}
                        onChange={() =>
                          handleAnswerChange(currentQ.originalIndex, optIndex)
                        }
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="flex-1">{optText}</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentQuestion(Math.max(0, currentQuestion - 1))
                    }
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const isRev = reviewed[currentQ.originalIndex] === true;
                      setReviewed((prev) => ({
                        ...prev,
                        [currentQ.originalIndex]: !isRev,
                      }));
                    }}
                    className={reviewed[currentQ.originalIndex] ? "bg-amber-50 text-amber-700 border-amber-300" : ""}
                  >
                    {reviewed[currentQ.originalIndex] ? "Unmark Review" : "🔖 Mark for Review"}
                  </Button>
                </div>
                <div className="flex gap-2">
                  {currentQuestion < totalQuestions - 1 ? (
                    <Button
                      onClick={() =>
                        setCurrentQuestion(
                          Math.min(totalQuestions - 1, currentQuestion + 1),
                        )
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubmit(false)}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {submitting ? "Submitting..." : "Submit Assessment"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      {assessment.instructions && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold mb-2">Instructions:</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {assessment.instructions}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TakeAssessment;
