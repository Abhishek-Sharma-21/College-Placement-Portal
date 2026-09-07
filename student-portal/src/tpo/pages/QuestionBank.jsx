import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [topic, setTopic] = useState("");
  const [skill, setSkill] = useState("");
  const [questionType, setQuestionType] = useState("all");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Form states (Create/Edit modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    points: 10,
    difficulty: "medium",
    topic: "",
    skill: "",
    questionType: "MCQ"
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [page, difficulty, questionType]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        topic: topic || undefined,
        skill: skill || undefined,
      };
      if (difficulty !== "all") params.difficulty = difficulty;
      if (questionType !== "all") params.questionType = questionType;

      const res = await axios.get(`${API_URL}/question-bank`, {
        params,
        withCredentials: true,
      });
      setQuestions(res.data.questions || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch question bank library.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleClearFilters = () => {
    setSearch("");
    setDifficulty("all");
    setTopic("");
    setSkill("");
    setQuestionType("all");
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setForm({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      points: 10,
      difficulty: "medium",
      topic: "",
      skill: "",
      questionType: "MCQ"
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setForm({
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      points: q.points || 10,
      difficulty: q.difficulty || "medium",
      topic: q.topic || "",
      skill: q.skill || "",
      questionType: q.questionType || "MCQ"
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOptionChange = (idx, value) => {
    const nextOpts = [...form.options];
    nextOpts[idx] = value;
    setForm(prev => ({ ...prev, options: nextOpts }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    // Basic Validation
    if (!form.question.trim()) {
      setFormError("Question text is required.");
      setFormLoading(false);
      return;
    }
    if (form.options.some(opt => !opt.trim())) {
      setFormError("All 4 option choices must be filled.");
      setFormLoading(false);
      return;
    }

    try {
      if (editingQuestion) {
        // Edit Question
        await axios.put(`${API_URL}/question-bank/${editingQuestion.id || editingQuestion._id}`, form, {
          withCredentials: true,
        });
        alert("Question updated successfully!");
      } else {
        // Create Question
        await axios.post(`${API_URL}/question-bank`, form, {
          withCredentials: true,
        });
        alert("Question created successfully!");
      }
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || "Failed to save question bank item.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question? Already published assessments will not be affected, but it will be removed from the library.")) return;
    try {
      await axios.delete(`${API_URL}/question-bank/${id}`, {
        withCredentials: true,
      });
      alert("Question deleted successfully!");
      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert("Failed to delete question bank library item.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">TPO Question Bank Library</h2>
          <p className="text-sm text-gray-400 font-medium">Create, edit, and reuse standard evaluation questions for placements assessments</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white">
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search question text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
              />
            </div>
            <div>
              <Input
                placeholder="Filter by Skill..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
              />
            </div>
            <div>
              <Input
                placeholder="Filter by Topic..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-10 flex-1">
                <Search className="h-4 w-4 mr-1.5" /> Search
              </Button>
              <Button type="button" onClick={handleClearFilters} variant="outline" className="text-xs font-bold rounded-xl h-10">
                Clear
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-50 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold uppercase text-[10px]">Difficulty:</span>
              <select
                value={difficulty}
                onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
                className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 font-semibold text-gray-700"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold uppercase text-[10px]">Question Type:</span>
              <select
                value={questionType}
                onChange={(e) => { setQuestionType(e.target.value); setPage(1); }}
                className="bg-slate-50 border border-slate-100 rounded-lg p-1.5 font-semibold text-gray-700"
              >
                <option value="all">All Types</option>
                <option value="MCQ">Multiple Choice</option>
                <option value="Subjective">Subjective</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16 text-gray-500 font-semibold animate-pulse">
              Loading library questions...
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600 font-semibold">
              {error}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-medium">
              No questions found in Question Bank matching current filters.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {questions.map((q) => (
                <div key={q.id || q._id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`capitalize text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        q.difficulty === "easy" ? "border-green-100 bg-green-50 text-green-700" :
                        q.difficulty === "hard" ? "border-red-100 bg-red-50 text-red-700" :
                        "border-blue-100 bg-blue-50 text-blue-700"
                      }`}>
                        {q.difficulty}
                      </Badge>
                      <Badge variant="secondary" className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                        {q.skill || "General"}
                      </Badge>
                      {q.topic && (
                        <Badge variant="secondary" className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                          {q.topic}
                        </Badge>
                      )}
                      <span className="text-[10px] text-gray-400 font-semibold">{q.points || 10} Points</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-800 leading-snug">{q.question}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4 text-xs pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-2 border rounded-lg flex items-center ${
                          oIdx === q.correctAnswer ? "bg-green-50 border-green-200 text-green-800 font-bold" : "border-slate-100 text-slate-600"
                        }`}>
                          <span className="mr-2 font-black uppercase text-[10px] opacity-60">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-slate-400 italic pt-1 pl-4">
                        <strong>Explanation:</strong> "{q.explanation}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(q)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id || q._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500 font-medium">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl shadow-xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <h3 className="text-base font-extrabold text-slate-800">
                {editingQuestion ? "Edit Question" : "Add New Question to Library"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Question Text</label>
                  <Textarea
                    placeholder="Enter the question statement..."
                    value={form.question}
                    onChange={(e) => setForm(prev => ({ ...prev, question: e.target.value }))}
                    className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-20 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase">Skill Category</label>
                    <Input
                      placeholder="e.g. JavaScript"
                      value={form.skill}
                      onChange={(e) => setForm(prev => ({ ...prev, skill: e.target.value }))}
                      className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase">Topic</label>
                    <Input
                      placeholder="e.g. Closures"
                      value={form.topic}
                      onChange={(e) => setForm(prev => ({ ...prev, topic: e.target.value }))}
                      className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase">Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl text-xs h-10 px-3 font-semibold text-gray-700"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase">Points</label>
                    <Input
                      type="number"
                      value={form.points}
                      onChange={(e) => setForm(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                      className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase">Type</label>
                    <select
                      value={form.questionType}
                      onChange={(e) => setForm(prev => ({ ...prev, questionType: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl text-xs h-10 px-3 font-semibold text-gray-700"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="Subjective">Subjective</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-50 pt-4">
                  <label className="text-xs font-black text-slate-400 uppercase block mb-1">Option Choices</label>
                  {form.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswerForm"
                        checked={form.correctAnswer === idx}
                        onChange={() => setForm(prev => ({ ...prev, correctAnswer: idx }))}
                        className="w-4 h-4 text-blue-600 focus:ring-0"
                      />
                      <span className="text-xs font-black text-slate-400 w-4">{String.fromCharCode(65 + idx)}.</span>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10 flex-1"
                      />
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">Select the radio button next to the correct answer choice.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Explanation (Optional)</label>
                  <Textarea
                    placeholder="Enter correct answer logic explanation..."
                    value={form.explanation}
                    onChange={(e) => setForm(prev => ({ ...prev, explanation: e.target.value }))}
                    className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-16 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl h-10 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 text-xs shadow-sm shadow-blue-100 disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : "Save Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
