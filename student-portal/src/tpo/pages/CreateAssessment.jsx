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
import {
  Plus,
  Trash2,
  Save,
  Eye,
  History,
  Clock,
  CheckCircle2,
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
    job: "",
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
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Load assessment history and jobs from backend on mount
  useEffect(() => {
    fetchAssessments();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await axios.get("http://localhost:4000/api/jobs", {
        withCredentials: true,
      });
      // Only show active jobs
      setJobs(response.data.filter((job) => job.status === "active"));
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

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

      await axios.post(
        "http://localhost:4000/api/assessments",
        assessmentData,
        {
          withCredentials: true,
        }
      );

      setSuccess("Assessment created successfully!");

      // Refresh the assessment list
      await fetchAssessments();

      // Switch to history tab after 2 seconds
      setTimeout(() => {
        setActiveTab("history");
      }, 2000);

      // Reset form
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
        job: "",
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
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to create assessment.";
      setError(errorMsg);
      console.error("Error creating assessment:", err);
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
      job: assessment.job?._id || assessment.job || "",
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

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">
        Assessment Management
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="create" className="flex items-center gap-2">
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

              <div>
                <label className="block font-semibold mb-2">
                  Link to Job (Optional)
                </label>
                <Select
                  value={form.job}
                  onValueChange={(value) =>
                    setForm({ ...form, job: value === "none" ? "" : value })
                  }
                  disabled={loadingJobs}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        loadingJobs
                          ? "Loading jobs..."
                          : "Select a job (optional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      No Job (General Assessment)
                    </SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title} - {job.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.job && (
                  <p className="text-sm text-gray-500 mt-1">
                    This assessment will be linked to the selected job
                  </p>
                )}
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
                {loading ? "Creating..." : "Create Assessment"}
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
                      {form.job && jobs.find((j) => j._id === form.job) && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                          Job: {jobs.find((j) => j._id === form.job)?.title} -{" "}
                          {jobs.find((j) => j._id === form.job)?.company}
                        </span>
                      )}
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
                          {assessment.job && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              Job: {assessment.job?.title || "Linked Job"}
                            </span>
                          )}
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
                            job: assessment.job?._id || assessment.job || "",
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
      </Tabs>
    </div>
  );
}

export default CreateAssessment;
