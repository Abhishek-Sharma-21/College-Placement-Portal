import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  History,
  Clock,
  CheckCircle2,
  Edit,
  MoreVertical,
  Users,
  BarChart3,
  FileText,
  ArrowLeft,
  AlertCircle,
  X,
  XCircle,
} from "lucide-react";

function CreateAssessment() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    passingScore: "",
    startDate: "",
    endDate: "",
    difficulty: "",
    category: "",
    instructions: "",
  });

  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: null,
      points: 1,
    },
  ]);

  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // Default to "create" tab since this is a create assessment page
  const [activeTab, setActiveTab] = useState("create");
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [editingAssessmentId, setEditingAssessmentId] = useState(null);
  const [viewingResultsId, setViewingResultsId] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showAnswerDetails, setShowAnswerDetails] = useState(false);

  // Load assessment history from backend on mount
  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:4000/api/assessments/my",
        {
          withCredentials: true,
        }
      );
      setAssessmentHistory(response.data);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const startNewAssessment = () => {
    setEditingAssessmentId(null);
    setForm({
      title: "",
      description: "",
      duration: "",
      passingScore: "",
      startDate: "",
      endDate: "",
      difficulty: "",
      category: "",
      instructions: "",
    });
    setQuestions([
      {
        id: 1,
        question: "",
        type: "multiple-choice",
        options: ["", "", "", ""],
        correctAnswer: null,
        points: 1,
      },
    ]);
    setActiveTab("create");
  };

  const handleQuestionChange = (questionId, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, idx) =>
                idx === optionIndex ? value : opt
              ),
            }
          : q
      )
    );
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        question: "",
        type: "multiple-choice",
        options: ["", "", "", ""],
        correctAnswer: null,
        points: 1,
      },
    ]);
  };

  const removeQuestion = (questionId) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== questionId));
    }
  };

  const addOption = (questionId) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };

  const removeOption = (questionId, optionIndex) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.filter((_, idx) => idx !== optionIndex),
            }
          : q
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setLoading(true);

    // Validation
    if (!form.title || !form.description || !form.duration) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (questions.some((q) => !q.question || q.options.some((opt) => !opt))) {
      setError("Please fill in all questions and options");
      setLoading(false);
      return;
    }

    try {
      const assessmentData = {
        ...form,
        duration: parseInt(form.duration),
        passingScore: form.passingScore
          ? parseInt(form.passingScore)
          : undefined,
        questions: questions.map((q) => ({
          question: q.question,
          type: q.type,
          options: q.options.filter((opt) => opt.trim() !== ""),
          correctAnswer: q.correctAnswer !== null ? q.correctAnswer : undefined,
          points: q.points || 1,
        })),
      };

      // If editing an existing assessment, use PUT, otherwise use POST
      if (editingAssessmentId) {
        await axios.put(
          `http://localhost:4000/api/assessments/${editingAssessmentId}`,
          assessmentData,
          {
            withCredentials: true,
          }
        );
        setSuccess("Assessment updated successfully!");
      } else {
        await axios.post(
          "http://localhost:4000/api/assessments",
          assessmentData,
          {
            withCredentials: true,
          }
        );
        setSuccess("Assessment created successfully!");
      }

      // Refresh the assessment list
      await fetchAssessments();

      // Switch to history tab after 2 seconds
      setTimeout(() => {
        setActiveTab("history");
      }, 2000);

      // Reset form and clear editing state
      setForm({
        title: "",
        description: "",
        duration: "",
        passingScore: "",
        startDate: "",
        endDate: "",
        difficulty: "",
        category: "",
        instructions: "",
      });
      setQuestions([
        {
          id: 1,
          question: "",
          type: "multiple-choice",
          options: ["", "", "", ""],
          correctAnswer: null,
          points: 1,
        },
      ]);
      setEditingAssessmentId(null);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (editingAssessmentId
          ? "Failed to update assessment."
          : "Failed to create assessment.");
      setError(errorMsg);
      console.error("Error saving assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async (assessmentId) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(
        `http://localhost:4000/api/assessments/${assessmentId}`,
        {
          withCredentials: true,
        }
      );
      setSuccess("Assessment deleted successfully!");
      // Refresh the assessment list
      await fetchAssessments();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to delete assessment.";
      setError(errorMsg);
      console.error("Error deleting assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessmentForEdit = (assessment) => {
    // Format dates for datetime-local input
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Store the assessment ID for editing
    setEditingAssessmentId(assessment._id || assessment.id);

    setForm({
      title: assessment.title || "",
      description: assessment.description || "",
      duration: assessment.duration?.toString() || "",
      passingScore: assessment.passingScore?.toString() || "",
      startDate: formatDateForInput(assessment.startDate),
      endDate: formatDateForInput(assessment.endDate),
      difficulty: assessment.difficulty || "",
      category: assessment.category || "",
      instructions: assessment.instructions || "",
    });
    setQuestions(
      assessment.questions?.map((q, idx) => ({
        id: idx + 1,
        question: q.question || "",
        type: q.type || "multiple-choice",
        options: q.options || ["", "", "", ""],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null,
        points: q.points || 1,
      })) || [
        {
          id: 1,
          question: "",
          type: "multiple-choice",
          options: ["", "", "", ""],
          correctAnswer: null,
          points: 1,
        },
      ]
    );
    setActiveTab("create");
  };

  // Calculate total points for preview
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

  const fetchAssessmentResults = async (assessmentId) => {
    try {
      setLoadingResults(true);
      const response = await axios.get(
        `http://localhost:4000/api/assessments/${assessmentId}/results`,
        { withCredentials: true }
      );
      setResultsData(response.data);
      setViewingResultsId(assessmentId);
      setActiveTab("results");
    } catch (err) {
      console.error("Error fetching results:", err);
      setError(
        err.response?.data?.message || "Failed to load assessment results"
      );
    } finally {
      setLoadingResults(false);
    }
  };

  const closeResultsView = () => {
    setViewingResultsId(null);
    setResultsData(null);
    setActiveTab("history");
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">
        Assessment Management
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={`grid w-full mb-6 ${
            viewingResultsId ? "grid-cols-4" : "grid-cols-3"
          }`}
        >
          <TabsTrigger
            value="create"
            className="flex items-center gap-2"
            onClick={() => {
              // If clicking create tab and form is empty, start new assessment
              if (!form.title && !editingAssessmentId) {
                startNewAssessment();
              }
            }}
          >
            <Plus className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History ({assessmentHistory.length})
          </TabsTrigger>
          {viewingResultsId && (
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Results
            </TabsTrigger>
          )}
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-xl font-semibold text-gray-700">
                Basic Information
              </h3>

              <div>
                <label className="block font-semibold mb-2">
                  Assessment Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript Fundamentals Assessment"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  name="description"
                  required
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe what this assessment covers..."
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="duration"
                    required
                    min="1"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="60"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Passing Score (%)
                  </label>
                  <Input
                    type="number"
                    name="passingScore"
                    min="0"
                    max="100"
                    value={form.passingScore}
                    onChange={handleChange}
                    placeholder="70"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Difficulty Level
                  </label>
                  <Select
                    value={form.difficulty}
                    onValueChange={(value) =>
                      setForm({ ...form, difficulty: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Category</label>
                  <Input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g., Programming, Aptitude"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Start Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    End Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-2">Instructions</label>
                <Textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Provide instructions for students taking this assessment..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-6 border-b pb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-700">
                  Questions
                </h3>
                <Button
                  type="button"
                  onClick={addQuestion}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {questions.map((question, qIndex) => (
                <div
                  key={question.id}
                  className="p-4 border rounded-lg bg-gray-50 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-600">
                      Question {qIndex + 1}
                    </h4>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(
                          question.id,
                          "question",
                          e.target.value
                        )
                      }
                      rows="2"
                      placeholder="Enter your question here..."
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-2">
                        Question Type
                      </label>
                      <Select
                        value={question.type}
                        onValueChange={(value) =>
                          handleQuestionChange(question.id, "type", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">Points</label>
                      <Input
                        type="number"
                        min="1"
                        value={question.points}
                        onChange={(e) =>
                          handleQuestionChange(
                            question.id,
                            "points",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-semibold">
                        Options <span className="text-red-500">*</span>
                      </label>
                      <Button
                        type="button"
                        onClick={() => addOption(question.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    </div>

                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center gap-2 mb-2"
                      >
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === optIndex}
                          onChange={() =>
                            handleQuestionChange(
                              question.id,
                              "correctAnswer",
                              optIndex
                            )
                          }
                          className="w-4 h-4"
                        />
                        <Input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(
                              question.id,
                              optIndex,
                              e.target.value
                            )
                          }
                          placeholder={`Option ${optIndex + 1}`}
                          className="flex-1"
                        />
                        {question.options.length > 2 && (
                          <Button
                            type="button"
                            onClick={() => removeOption(question.id, optIndex)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
              {error && (
                <div className="text-red-600 text-sm flex-1">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm flex-1">{success}</div>
              )}
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading
                  ? editingAssessmentId
                    ? "Updating..."
                    : "Creating..."
                  : editingAssessmentId
                  ? "Update Assessment"
                  : "Create Assessment"}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <div className="space-y-6">
            {!form.title && !form.description ? (
              <div className="text-center py-12 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assessment data to preview.</p>
                <p className="text-sm mt-2">
                  Fill in the form in the Create tab to see a preview.
                </p>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        {form.title || "Untitled Assessment"}
                      </CardTitle>
                      {form.description && (
                        <p className="text-gray-600 mt-2">{form.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 text-sm text-gray-600">
                      {form.difficulty && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                          {form.difficulty}
                        </span>
                      )}
                      {form.category && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {form.category}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Assessment Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    {form.duration && (
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">{form.duration} minutes</p>
                      </div>
                    )}
                    {form.passingScore && (
                      <div>
                        <p className="text-sm text-gray-600">Passing Score</p>
                        <p className="font-semibold">{form.passingScore}%</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Total Questions</p>
                      <p className="font-semibold">{questions.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Points</p>
                      <p className="font-semibold">{totalPoints}</p>
                    </div>
                  </div>

                  {form.instructions && (
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <p className="font-semibold mb-2">Instructions:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {form.instructions}
                      </p>
                    </div>
                  )}

                  {/* Questions Preview */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Questions Preview</h3>
                    {questions.map((question, qIndex) => (
                      <Card
                        key={qIndex}
                        className="border-l-4 border-l-blue-500"
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-lg">
                                  Question {qIndex + 1}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({question.points} point
                                  {question.points !== 1 ? "s" : ""})
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">
                                  {question.type.replace("-", " ")}
                                </span>
                              </div>
                              {question.question ? (
                                <p className="text-gray-700 mb-4">
                                  {question.question}
                                </p>
                              ) : (
                                <p className="text-gray-400 italic mb-4">
                                  [No question text entered]
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Options Preview */}
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-3 rounded border-2 ${
                                  question.correctAnswer === optIndex
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      question.correctAnswer === optIndex
                                        ? "border-green-500 bg-green-500"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {question.correctAnswer === optIndex && (
                                      <CheckCircle2 className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                  <span
                                    className={
                                      question.correctAnswer === optIndex
                                        ? "font-semibold text-green-700"
                                        : "text-gray-700"
                                    }
                                  >
                                    {option ||
                                      `[Option ${optIndex + 1} not entered]`}
                                  </span>
                                  {question.correctAnswer === optIndex && (
                                    <span className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                      Correct Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Date Information */}
                  {(form.startDate || form.endDate) && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-semibold mb-2">Schedule:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {form.startDate && (
                          <div>
                            <p className="text-gray-600">Start Date & Time</p>
                            <p className="font-medium">
                              {new Date(form.startDate).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {form.endDate && (
                          <div>
                            <p className="text-gray-600">End Date & Time</p>
                            <p className="font-medium">
                              {new Date(form.endDate).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <p>Loading assessments...</p>
              </div>
            ) : assessmentHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assessments created yet.</p>
                <p className="text-sm mt-2">
                  Create your first assessment in the Create tab.
                </p>
              </div>
            ) : (
              assessmentHistory.map((assessment) => (
                <Card
                  key={assessment._id || assessment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {assessment.title || "Untitled Assessment"}
                        </CardTitle>
                        {assessment.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {assessment.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(
                                assessment.createdAt
                              ).toLocaleDateString()}{" "}
                              {new Date(
                                assessment.createdAt
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                          {assessment.duration && (
                            <span>Duration: {assessment.duration} min</span>
                          )}
                          <span>
                            Questions: {assessment.questions?.length || 0}
                          </span>
                          {assessment.passingScore && (
                            <span>Passing: {assessment.passingScore}%</span>
                          )}
                          {assessment.difficulty && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
                              {assessment.difficulty}
                            </span>
                          )}
                          <Badge
                            variant={
                              assessment.status === "live"
                                ? "default"
                                : assessment.status === "published"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              assessment.status === "live"
                                ? "bg-green-100 text-green-700"
                                : ""
                            }
                          >
                            {assessment.status.charAt(0).toUpperCase() +
                              assessment.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadAssessmentForEdit(assessment)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Load for Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() =>
                          fetchAssessmentResults(
                            assessment._id || assessment.id
                          )
                        }
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Format dates for datetime-local input
                          const formatDateForInput = (dateString) => {
                            if (!dateString) return "";
                            const date = new Date(dateString);
                            if (isNaN(date.getTime())) return "";
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(
                              2,
                              "0"
                            );
                            const day = String(date.getDate()).padStart(2, "0");
                            const hours = String(date.getHours()).padStart(
                              2,
                              "0"
                            );
                            const minutes = String(date.getMinutes()).padStart(
                              2,
                              "0"
                            );
                            return `${year}-${month}-${day}T${hours}:${minutes}`;
                          };

                          setForm({
                            title: assessment.title || "",
                            description: assessment.description || "",
                            duration: assessment.duration?.toString() || "",
                            passingScore:
                              assessment.passingScore?.toString() || "",
                            startDate: formatDateForInput(assessment.startDate),
                            endDate: formatDateForInput(assessment.endDate),
                            difficulty: assessment.difficulty || "",
                            category: assessment.category || "",
                            instructions: assessment.instructions || "",
                          });
                          setQuestions(
                            assessment.questions?.map((q, idx) => ({
                              id: idx + 1,
                              question: q.question || "",
                              type: q.type || "multiple-choice",
                              options: q.options || ["", "", "", ""],
                              correctAnswer:
                                q.correctAnswer !== undefined
                                  ? q.correctAnswer
                                  : null,
                              points: q.points || 1,
                            })) || []
                          );
                          setActiveTab("preview");
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      {/* Status Management */}
                      {assessment.status === "live" ? (
                        <>
                          <Badge className="bg-green-100 text-green-700">
                            Live
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={async () => {
                              if (
                                !confirm(
                                  "Are you sure you want to change this assessment from live to draft? Students will no longer be able to access it."
                                )
                              ) {
                                return;
                              }
                              try {
                                await axios.put(
                                  `http://localhost:4000/api/assessments/${
                                    assessment._id || assessment.id
                                  }`,
                                  { status: "draft" },
                                  { withCredentials: true }
                                );
                                setSuccess("Assessment changed to draft!");
                                await fetchAssessments();
                              } catch (err) {
                                setError(
                                  err.response?.data?.message ||
                                    "Failed to change assessment status"
                                );
                              }
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Make Draft
                          </Button>
                        </>
                      ) : assessment.status === "draft" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={async () => {
                            try {
                              await axios.put(
                                `http://localhost:4000/api/assessments/${
                                  assessment._id || assessment.id
                                }`,
                                { status: "live" },
                                { withCredentials: true }
                              );
                              setSuccess("Assessment is now live!");
                              await fetchAssessments();
                            } catch (err) {
                              setError(
                                err.response?.data?.message ||
                                  "Failed to make assessment live"
                              );
                            }
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Make Live
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={async () => {
                            try {
                              await axios.put(
                                `http://localhost:4000/api/assessments/${
                                  assessment._id || assessment.id
                                }`,
                                { status: "live" },
                                { withCredentials: true }
                              );
                              setSuccess("Assessment is now live!");
                              await fetchAssessments();
                            } catch (err) {
                              setError(
                                err.response?.data?.message ||
                                  "Failed to make assessment live"
                              );
                            }
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Make Live
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          deleteAssessment(assessment._id || assessment.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Results Tab */}
        {viewingResultsId && (
          <TabsContent value="results">
            {loadingResults ? (
              <div className="text-center py-12 text-gray-500">
                <p>Loading results...</p>
              </div>
            ) : resultsData ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {resultsData.assessment.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Assessment Results & Analytics
                    </p>
                  </div>
                  <Button variant="outline" onClick={closeResultsView}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to History
                  </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Students
                          </p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">
                            {resultsData.statistics.totalStudents}
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Passed
                          </p>
                          <p className="text-3xl font-bold text-green-600 mt-2">
                            {resultsData.statistics.passedCount}
                          </p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Failed
                          </p>
                          <p className="text-3xl font-bold text-red-600 mt-2">
                            {resultsData.statistics.failedCount}
                          </p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Average Score
                          </p>
                          <p className="text-3xl font-bold text-blue-600 mt-2">
                            {resultsData.statistics.averageScore}%
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Students Results Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Student Submissions ({resultsData.results.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {resultsData.results.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No students have taken this assessment yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Student
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                                Email
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                Score
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                Percentage
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                Status
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                Time Taken
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                Submitted
                              </th>
                              <th className="text-center py-3 px-4 font-semibold text-gray-700">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultsData.results.map((result) => (
                              <tr
                                key={result._id}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="py-3 px-4">
                                  {result.student?.fullName || "Unknown"}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {result.student?.email || "-"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="font-semibold">
                                    {result.score}
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    /{result.totalPoints}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`font-semibold ${
                                      result.percentage >=
                                      (resultsData.assessment.passingScore || 0)
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {result.percentage.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Badge
                                    variant={
                                      result.passed ? "default" : "destructive"
                                    }
                                  >
                                    {result.passed ? "Passed" : "Failed"}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-gray-600">
                                  {result.timeTaken} min
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-gray-600">
                                  {result.submittedAt
                                    ? new Date(
                                        result.submittedAt
                                      ).toLocaleString()
                                    : "-"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedResult(result);
                                      setShowAnswerDetails(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Answers
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No results data available</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Answer Details Modal */}
      {showAnswerDetails && selectedResult && resultsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex items-center justify-between sticky top-0 bg-white z-10 border-b">
              <CardTitle>
                {selectedResult.student?.fullName || "Student"}'s Answers
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAnswerDetails(false);
                  setSelectedResult(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Student Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-xl font-bold">
                    {selectedResult.score}/{selectedResult.totalPoints}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p
                    className={`text-xl font-bold ${
                      selectedResult.passed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {selectedResult.percentage.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    variant={selectedResult.passed ? "default" : "destructive"}
                  >
                    {selectedResult.passed ? "Passed" : "Failed"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Taken</p>
                  <p className="text-lg font-semibold">
                    {selectedResult.timeTaken} min
                  </p>
                </div>
              </div>

              {/* Questions and Answers */}
              <div className="space-y-4">
                {resultsData.assessment.questions?.map((question, qIndex) => {
                  const answer = selectedResult.answers.find(
                    (a) => a.questionIndex === qIndex
                  );
                  const selectedOptionIndex = answer?.selectedAnswer;
                  const isCorrect = answer?.isCorrect || false;
                  const pointsEarned = answer?.pointsEarned || 0;

                  return (
                    <Card
                      key={qIndex}
                      className={`${
                        isCorrect ? "border-green-500" : "border-red-500"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Question {qIndex + 1} ({question.points} point
                            {question.points !== 1 ? "s" : ""})
                          </CardTitle>
                          <Badge
                            variant={isCorrect ? "default" : "destructive"}
                          >
                            {isCorrect
                              ? `Correct (+${pointsEarned})`
                              : `Incorrect (0/${question.points})`}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="font-medium text-gray-800">
                          {question.question}
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => {
                            const isSelected = selectedOptionIndex === optIndex;
                            const isCorrectAnswer =
                              question.correctAnswer === optIndex;

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrectAnswer
                                    ? "border-green-500 bg-green-50"
                                    : isSelected && !isCorrectAnswer
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectAnswer && (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  )}
                                  {isSelected && !isCorrectAnswer && (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                  )}
                                  <span
                                    className={`flex-1 ${
                                      isSelected
                                        ? "font-semibold"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIndex)}.{" "}
                                    {option}
                                  </span>
                                  {isCorrectAnswer && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-100 text-green-700 border-green-500"
                                    >
                                      Correct Answer
                                    </Badge>
                                  )}
                                  {isSelected && (
                                    <Badge variant="outline">
                                      Student's Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default CreateAssessment;
