import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Video,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Trash2,
  Edit2,
  FileText,
} from "lucide-react";
import { useLocation } from "react-router-dom";

export default function TpoInterviews() {
  const location = useLocation();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  
  // Form states
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [shortlistedStudents, setShortlistedStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("technical");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [roundNumber, setRoundNumber] = useState("1");
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState("pending");
  const [isPastInterview, setIsPastInterview] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Selected day list
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Fetch interviews on mount
  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/interviews`, { withCredentials: true });
      setInterviews(res.data);
    } catch (err) {
      console.error("Error fetching interviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Fetch jobs when modal is opened
  const fetchJobsAndStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/jobs`, { withCredentials: true });
      // Only keep active jobs
      setJobs(res.data.filter(j => j.status !== "completed"));
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      const fetchApplicants = async () => {
        try {
          const res = await axios.get(`${API_URL}/applications/job/${selectedJobId}`, { withCredentials: true });
          // Only students with shortlisted status are eligible for interviews
          const shortlisted = res.data.filter(app => app.status === "shortlisted");
          setShortlistedStudents(shortlisted);
        } catch (err) {
          console.error("Error fetching shortlisted applicants:", err);
        }
      };
      fetchApplicants();
    } else {
      setShortlistedStudents([]);
    }
  }, [selectedJobId]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to format date string to compare
  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  // Get interviews scheduled on specific day
  const getInterviewsForDay = (day) => {
    const checkDate = new Date(year, month, day);
    return interviews.filter(i => {
      const iDate = new Date(i.scheduledAt);
      return isSameDay(checkDate, iDate);
    });
  };

  // Open scheduler modal
  const openScheduleModal = (day = selectedDay, prefillJobId = "", prefillStudentId = "") => {
    setEditingInterview(null);
    setSelectedJobId(prefillJobId);
    setSelectedStudentId(prefillStudentId);
    setTitle("");
    setType("technical");
    setLink("");
    setNotes("");
    setDuration("30");
    setInterviewer("");
    setRoundNumber("1");
    setFeedback("");
    setResult("pending");
    setIsPastInterview(false);
    
    // Set default date
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setScheduledDate(dStr);
    setScheduledTime("10:00");
    
    fetchJobsAndStudents();
    setIsModalOpen(true);
  };

  // Prefill state from navigation
  useEffect(() => {
    if (location.state && location.state.jobId && location.state.studentId) {
      const { jobId, studentId } = location.state;
      openScheduleModal(selectedDay, jobId, studentId);
      
      // Clear history state to prevent repeating modal on page reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Open Edit Reschedule modal
  const openEditModal = (interview) => {
    setEditingInterview(interview);
    setSelectedJobId(interview.jobId);
    setSelectedStudentId(interview.studentId);
    setTitle(interview.title);
    setType(interview.type);
    setLink(interview.link || "");
    setNotes(interview.notes || "");
    setDuration(String(interview.duration));
    setInterviewer(interview.interviewer || "");
    setRoundNumber(String(interview.roundNumber || 1));
    setFeedback(interview.feedback || "");
    setResult(interview.result || "pending");
    setIsPastInterview(new Date(interview.scheduledAt) < new Date());
    
    const iDate = new Date(interview.scheduledAt);
    const dStr = `${iDate.getFullYear()}-${String(iDate.getMonth() + 1).padStart(2, "0")}-${String(iDate.getDate()).padStart(2, "0")}`;
    const tStr = `${String(iDate.getHours()).padStart(2, "0")}:${String(iDate.getMinutes()).padStart(2, "0")}`;
    
    setScheduledDate(dStr);
    setScheduledTime(tStr);
    
    fetchJobsAndStudents();
    setIsModalOpen(true);
  };

  // Submit interview creation/rescheduling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const datetime = new Date(`${scheduledDate}T${scheduledTime}`);

    const payload = {
      jobId: selectedJobId,
      studentId: selectedStudentId,
      title,
      type,
      scheduledAt: datetime.toISOString(),
      duration: parseInt(duration),
      link,
      notes,
      interviewer,
      roundNumber: parseInt(roundNumber) || 1,
      feedback,
      result,
    };

    try {
      if (editingInterview) {
        // Reschedule
        await axios.put(`${API_URL}/interviews/${editingInterview._id || editingInterview.id}`, payload, { withCredentials: true });
        alert("Interview rescheduled successfully!");
      } else {
        // Schedule new
        await axios.post(`${API_URL}/interviews`, payload, { withCredentials: true });
        alert("Interview scheduled successfully!");
      }
      setIsModalOpen(false);
      fetchInterviews();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to process interview request");
    } finally {
      setFormLoading(false);
    }
  };

  // Cancel interview
  const handleCancelInterview = async (interviewId) => {
    if (!window.confirm("Are you sure you want to cancel and delete this interview round?")) return;
    try {
      await axios.delete(`${API_URL}/interviews/${interviewId}`, { withCredentials: true });
      alert("Interview round cancelled!");
      fetchInterviews();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel interview round.");
    }
  };

  const selectedDayInterviews = getInterviewsForDay(selectedDay);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">Placement Interviews Scheduler</h2>
          <p className="text-sm text-gray-400 font-medium">Manage and coordinate virtual interview rounds for shortlisted students</p>
        </div>
        <Button onClick={() => openScheduleModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Schedule Round
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid card */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-slate-800">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                {monthNames[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={prevMonth} className="rounded-lg h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs font-bold px-3 py-1 h-8 rounded-lg">
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={nextMonth} className="rounded-lg h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-white">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-400 mb-2">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            <div className="grid grid-cols-7 gap-2 min-h-[320px]">
              {/* Empty offsets */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`offset-${i}`} className="bg-slate-50/40 rounded-xl border border-dashed border-slate-100" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayInts = getInterviewsForDay(day);
                const isSelected = selectedDay === day;
                const isToday = isSameDay(new Date(), new Date(year, month, day));

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() => setSelectedDay(day)}
                    className={`p-2 border rounded-xl flex flex-col justify-between transition-all cursor-pointer select-none min-h-[64px] ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/30 text-blue-700 shadow-sm"
                        : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        isToday ? "bg-blue-600 text-white font-extrabold" : ""
                      }`}>
                        {day}
                      </span>
                    </div>

                    {dayInts.length > 0 && (
                      <div className="mt-1 flex flex-col gap-0.5">
                        {dayInts.slice(0, 2).map((int, idx) => (
                          <div
                            key={idx}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${
                              int.type === "technical"
                                ? "bg-blue-50 text-blue-700"
                                : int.type === "hr"
                                ? "bg-green-50 text-green-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {int.job?.company}: {int.title}
                          </div>
                        ))}
                        {dayInts.length > 2 && (
                          <span className="text-[8px] font-black text-slate-400 pl-1">
                            +{dayInts.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected day interviews sidebar */}
        <Card className="border-slate-100 shadow-sm rounded-2xl bg-white flex flex-col h-full min-h-[420px]">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-base font-extrabold text-slate-800">
              {selectedDay} {monthNames[month]} {year}
            </CardTitle>
            <CardDescription className="text-xs">
              List of interviews scheduled for this date
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto max-h-[360px]">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-gray-500 font-semibold animate-pulse">
                Loading schedules...
              </div>
            ) : selectedDayInterviews.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center text-slate-400">
                <CalendarIcon className="h-12 w-12 text-slate-200 mb-3" />
                <p className="text-xs font-bold text-slate-400">No interviews scheduled</p>
                <button
                  type="button"
                  onClick={() => openScheduleModal(selectedDay)}
                  className="text-xs font-black text-blue-600 mt-2 hover:underline"
                >
                  Schedule one now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayInterviews.map((int) => {
                  const isPast = new Date(int.scheduledAt).getTime() + (int.duration * 60 * 1000) < Date.now();
                  return (
                    <div
                      key={int.id}
                      className={`p-3 border border-slate-100 rounded-xl space-y-3 shadow-sm transition-all bg-white relative group ${
                        isPast ? "opacity-65 border-slate-200 bg-slate-50/50" : "hover:border-slate-200 hover:shadow"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                              int.type === "technical" ? "border-blue-100 bg-blue-50 text-blue-700" : "border-green-100 bg-green-50 text-green-700"
                            }`}>
                              {int.type.toUpperCase()}
                            </Badge>
                            {isPast && (
                              <Badge variant="secondary" className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-600">
                                COMPLETED
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-800 pt-1 leading-tight">{int.title}</h4>
                          <p className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                            <Briefcase className="h-3 w-3 text-slate-400" /> {int.job?.company}
                          </p>
                        </div>
                        {!isPast && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => openEditModal(int)}
                              className="p-1 hover:bg-slate-50 text-slate-500 hover:text-blue-600 rounded transition-colors"
                              title="Reschedule"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelInterview(int.id)}
                              className="p-1 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded transition-colors"
                              title="Cancel Round"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-50 pt-2 flex flex-col gap-1 text-[10px] text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>Student: <strong className="text-slate-800 font-bold">{int.student?.fullName}</strong> ({int.student?.email})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(int.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({int.duration} mins)</span>
                        </div>
                        {int.link && (
                          <div className="flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5 text-slate-400" />
                            {isPast ? (
                              <span className="text-slate-500 line-through truncate">{int.link}</span>
                            ) : (
                              <a href={int.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline truncate">
                                {int.link}
                              </a>
                            )}
                          </div>
                        )}
                        {int.notes && (
                          <div className="flex items-start gap-1.5 pt-1 mt-1 border-t border-dashed border-slate-100">
                            <FileText className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                            <p className="text-slate-500 text-[10px] leading-relaxed italic">"{int.notes}"</p>
                          </div>
                        )}

                        {/* Interview Enhancements details */}
                        {(int.interviewer || int.roundNumber || int.result || int.feedback) && (
                          <div className="pt-2 mt-2 border-t border-dashed border-slate-100 space-y-1.5">
                            {int.interviewer && (
                              <div className="text-[10px] text-slate-700">
                                <span className="font-bold text-gray-400">Interviewer:</span> <span className="font-black text-slate-800">{int.interviewer}</span>
                              </div>
                            )}
                            {int.roundNumber !== undefined && (
                              <div className="text-[10px] text-slate-700">
                                <span className="font-bold text-gray-400">Round:</span> <span className="font-black text-slate-800">#{int.roundNumber}</span>
                              </div>
                            )}
                            {int.result && int.result !== "pending" && (
                              <div className="text-[10px] flex items-center gap-1.5">
                                <span className="font-bold text-gray-400">Result:</span>
                                <Badge variant="outline" className={`text-[8.5px] font-black px-1.5 py-0.2 capitalize rounded-sm ${
                                  int.result === "passed" ? "border-green-150 bg-green-50 text-green-700" : "border-red-150 bg-red-50 text-red-700"
                                }`}>
                                  {int.result === "passed" ? "Passed" : "Failed"}
                                </Badge>
                              </div>
                            )}
                            {int.feedback && (
                              <p className="text-[9.5px] text-slate-500 leading-normal bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                                <strong className="text-slate-700">Feedback:</strong> "{int.feedback}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Reschedule history log trails */}
                        {Array.isArray(int.history) && int.history.length > 0 && (
                          <div className="pt-2 mt-2 border-t border-dashed border-slate-100 space-y-1">
                            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Reschedule History:</span>
                            {int.history.map((hist, idx) => (
                              <p key={idx} className="text-[9px] text-gray-400 font-medium leading-relaxed pl-1.5 border-l-2 border-slate-200">
                                Changed from <strong className="text-slate-550">{new Date(hist.rescheduledFrom).toLocaleDateString()}</strong> to <strong className="text-slate-550">{new Date(hist.rescheduledTo).toLocaleDateString()}</strong> on {new Date(hist.timestamp).toLocaleDateString()}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingInterview ? "Reschedule Interview Round" : "Schedule Interview Round"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-xl transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Job Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase">Select Placement Drive</label>
                <Select
                  value={selectedJobId}
                  onValueChange={setSelectedJobId}
                  disabled={!!editingInterview}
                >
                  <SelectTrigger className="w-full bg-slate-50/50 border-slate-100 rounded-xl h-10 text-xs">
                    <SelectValue placeholder="Choose drive..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job._id} value={job._id} className="text-xs">
                        {job.company} - {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Student Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase">Select Shortlisted Candidate</label>
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  disabled={!!editingInterview || !selectedJobId}
                >
                  <SelectTrigger className="w-full bg-slate-50/50 border-slate-100 rounded-xl h-10 text-xs">
                    <SelectValue placeholder="Choose candidate..." />
                  </SelectTrigger>
                  <SelectContent>
                    {shortlistedStudents.map((app) => (
                      <SelectItem key={app.studentId} value={app.studentId} className="text-xs">
                        {app.student?.fullName} ({app.student?.email})
                      </SelectItem>
                    ))}
                    {selectedJobId && shortlistedStudents.length === 0 && (
                      <SelectItem value="none" disabled className="text-xs text-red-500">
                        No shortlisted candidates in this drive
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Title & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Round Title</label>
                  <Input
                    required
                    placeholder="e.g. Round 1 Technical"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isPastInterview}
                    className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Interview Type</label>
                  <Select value={type} onValueChange={setType} disabled={isPastInterview}>
                    <SelectTrigger className="w-full bg-slate-50/50 border-slate-100 rounded-xl h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical" className="text-xs">Technical</SelectItem>
                      <SelectItem value="hr" className="text-xs">HR Interview</SelectItem>
                      <SelectItem value="group_discussion" className="text-xs">Group Discussion</SelectItem>
                      <SelectItem value="managerial" className="text-xs">Managerial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Date</label>
                  <Input
                    required
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    disabled={isPastInterview}
                    className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Time</label>
                  <Input
                    required
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={isPastInterview}
                    className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              {/* Duration & Meeting Link */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Duration</label>
                  <Select value={duration} onValueChange={setDuration} disabled={isPastInterview}>
                    <SelectTrigger className="w-full bg-slate-50/50 border-slate-100 rounded-xl h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15" className="text-xs">15 mins</SelectItem>
                      <SelectItem value="30" className="text-xs">30 mins</SelectItem>
                      <SelectItem value="45" className="text-xs">45 mins</SelectItem>
                      <SelectItem value="60" className="text-xs">60 mins</SelectItem>
                      <SelectItem value="90" className="text-xs">90 mins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Meeting Link (Virtual)</label>
                  <Input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    disabled={isPastInterview}
                    className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              {/* Interviewer & Round Number */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Allocated Interviewer</label>
                  <Input
                    placeholder="e.g. John Doe (Tech Lead)"
                    value={interviewer}
                    onChange={(e) => setInterviewer(e.target.value)}
                    className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase">Round No.</label>
                  <Input
                    type="number"
                    min="1"
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(e.target.value)}
                    className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              {/* Result Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase">Evaluation Result</label>
                <Select value={result} onValueChange={setResult}>
                  <SelectTrigger className="w-full bg-slate-50/50 border-slate-100 rounded-xl h-10 text-xs">
                    <SelectValue placeholder="Pending / Selected / Rejected" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending" className="text-xs text-yellow-600 font-bold">Pending</SelectItem>
                    <SelectItem value="passed" className="text-xs text-green-600 font-bold">Passed / Promoted</SelectItem>
                    <SelectItem value="failed" className="text-xs text-red-605 font-bold">Failed / Eliminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feedback */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase">Candidate Evaluation Feedback</label>
                <textarea
                  placeholder="Record interviewer observations, ratings, and technical remarks..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="2"
                  className="w-full p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase">TPO Instructions / Notes</label>
                <textarea
                  placeholder="Provide instructions for the candidate (pre-requisites, join guidelines, etc.)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isPastInterview}
                  rows="2"
                  className="w-full p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl h-10 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading || !selectedStudentId || selectedStudentId === "none"}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 text-xs shadow-sm shadow-blue-100 disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editingInterview ? "Reschedule Round" : "Confirm Schedule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
