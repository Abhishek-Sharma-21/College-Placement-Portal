import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function StudentInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Fetch interviews for this student
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

  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const getInterviewsForDay = (day) => {
    const checkDate = new Date(year, month, day);
    return interviews.filter(i => {
      const iDate = new Date(i.scheduledAt);
      return isSameDay(checkDate, iDate);
    });
  };

  const selectedDayInterviews = getInterviewsForDay(selectedDay);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-gray-900">My Interview Schedule</h2>
        <p className="text-sm text-gray-400 font-medium">Keep track of your technical rounds, group discussions, and HR interviews</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Calendar View */}
        <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-50">
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
          <CardContent className="p-4">
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
              {/* Offset empty days */}
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
                            {int.job?.company}
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

        {/* Selected Day Details list */}
        <Card className="border-slate-100 shadow-sm rounded-2xl bg-white flex flex-col h-full min-h-[420px]">
          <CardHeader className="border-b border-slate-50">
            <CardTitle className="text-base font-extrabold text-slate-800">
              {selectedDay} {monthNames[month]} {year}
            </CardTitle>
            <CardDescription className="text-xs">
              Scheduled interviews on this date
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
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  When the placement team schedules an interview, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayInterviews.map((int) => {
                  const isPast = new Date(int.scheduledAt).getTime() + (int.duration * 60 * 1000) < Date.now();
                  return (
                    <div
                      key={int.id}
                      className={`p-4 border border-slate-100 rounded-xl space-y-3.5 shadow-sm transition-all bg-white relative ${
                        isPast ? "opacity-60 border-slate-200 bg-slate-50/50" : "hover:border-slate-200 hover:shadow"
                      }`}
                    >
                      <div className="space-y-1">
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
                        <h4 className="font-extrabold text-sm text-slate-800 leading-tight pt-1">{int.title}</h4>
                        <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" /> {int.job?.company}
                        </p>
                      </div>

                      <div className="border-t border-slate-50 pt-3 flex flex-col gap-2 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span>
                            {new Date(int.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {" "}({int.duration} mins)
                          </span>
                        </div>
                        
                        {isPast ? (
                          <div className="flex items-center gap-2 text-slate-500 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span className="text-[10px] font-bold">Interview ended. Joining meeting room is disabled.</span>
                          </div>
                        ) : int.link ? (
                          <div className="flex flex-col gap-1.5 pt-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Virtual Meeting Room</span>
                            <a
                              href={int.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-100"
                            >
                              <Video className="h-4 w-4" /> Join Interview <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-xl border border-amber-100">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span className="text-[10px] font-bold">Meeting link will be shared shortly by TPO.</span>
                          </div>
                        )}

                      {int.notes && (
                        <div className="flex items-start gap-1.5 pt-2.5 mt-1.5 border-t border-dashed border-slate-100">
                          <FileText className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase block">Instructions</span>
                            <p className="text-slate-500 text-[11px] leading-relaxed italic">"{int.notes}"</p>
                          </div>
                        </div>
                      )}

                      {/* Interview Enhancements details */}
                      {(int.interviewer || int.roundNumber || int.result || int.feedback) && (
                        <div className="pt-2 mt-2 border-t border-dashed border-slate-100 space-y-1.5">
                          {int.interviewer && (
                            <div className="text-[10px] text-slate-750">
                              <span className="font-bold text-gray-400">Interviewer:</span> <span className="font-extrabold text-slate-800">{int.interviewer}</span>
                            </div>
                          )}
                          {int.roundNumber !== undefined && (
                            <div className="text-[10px] text-slate-750">
                              <span className="font-bold text-gray-400">Round:</span> <span className="font-extrabold text-slate-800">#{int.roundNumber}</span>
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
                            <div className="text-[10px] text-slate-500 leading-normal bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                              <strong className="text-slate-700">Remarks:</strong> "{int.feedback}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reschedule history log trails */}
                      {Array.isArray(int.history) && int.history.length > 0 && (
                        <div className="pt-2.5 mt-2.5 border-t border-dashed border-slate-100 space-y-1">
                          <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Reschedule History:</span>
                          {int.history.map((hist, idx) => (
                            <p key={idx} className="text-[9px] text-gray-450 font-medium leading-relaxed pl-1.5 border-l-2 border-slate-200">
                              Changed from <strong className="text-slate-600">{new Date(hist.rescheduledFrom).toLocaleDateString()}</strong> to <strong className="text-slate-600">{new Date(hist.rescheduledTo).toLocaleDateString()}</strong> on {new Date(hist.timestamp).toLocaleDateString()}
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
    </div>
  );
}
