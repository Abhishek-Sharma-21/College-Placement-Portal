import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

export default function QuestionEditor({
  q,
  qIndex,
  isExpanded,
  onToggleExpand,
  isSelected,
  onToggleSelect,
  onEditQuestionText,
  onEditExplanation,
  onEditOptionText,
}) {
  return (
    <div className="p-4 space-y-3 transition-colors hover:bg-slate-50/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="mt-1 h-4 w-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400">Q{qIndex + 1}</span>
              <Badge variant="outline" className="text-[9px] font-black uppercase">
                {q.points || 10} pts
              </Badge>
            </div>
            
            {isExpanded ? (
              <textarea
                value={q.question}
                onChange={(e) => onEditQuestionText(e.target.value)}
                rows="2"
                className="w-full mt-1.5 p-2.5 border border-slate-100 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800 mt-1 leading-relaxed truncate">
                {q.question}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleExpand}
          className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="pl-7 space-y-4 pt-1 animate-in slide-in-from-top-1 duration-200">
          {/* Options Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {q.options.map((opt, optIndex) => {
              const isCorrect = q.correctAnswer === optIndex;
              return (
                <div
                  key={optIndex}
                  className={`p-2.5 border rounded-xl flex items-center justify-between gap-3 ${
                    isCorrect
                      ? "bg-green-50/50 border-green-200 text-green-700"
                      : "bg-white border-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isCorrect ? "bg-green-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => onEditOptionText(optIndex, e.target.value)}
                      className="bg-transparent border-none p-0 text-xs focus:ring-0 focus:outline-none w-full font-bold"
                    />
                  </div>
                  {isCorrect && (
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation & Feedback */}
          <div className="space-y-1.5 pt-1.5 border-t border-dashed border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase">AI Explanation</label>
            <textarea
              value={q.explanation}
              onChange={(e) => onEditExplanation(e.target.value)}
              rows="2"
              className="w-full p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium text-slate-600 leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
}
