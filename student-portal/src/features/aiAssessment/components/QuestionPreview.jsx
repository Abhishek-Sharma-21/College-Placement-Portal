import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import QuestionEditor from "./QuestionEditor";

export default function QuestionPreview({
  generatedAssessment,
  selectedIndices,
  onToggleSelect,
  onEditQuestionText,
  onEditExplanation,
  onEditOptionText,
  onImport,
  expandedIndex,
  setExpandedIndex,
}) {
  if (!generatedAssessment) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800">AI Generated Preview</h4>
          <p className="text-xs text-slate-400 font-bold">
            {selectedIndices.length} of {generatedAssessment.questions.length} questions selected
          </p>
        </div>
        <Button
          onClick={onImport}
          disabled={selectedIndices.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs h-10 px-5 shadow-sm shadow-green-100"
        >
          Import Selected to Draft
        </Button>
      </div>

      <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0 divide-y divide-slate-100">
          <div className="p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase block">Suggested Test Parameters</span>
              <div className="flex items-center gap-3">
                <strong className="text-xs font-extrabold text-slate-700">{generatedAssessment.title}</strong>
                <Badge className="bg-slate-100 text-slate-700 border-none hover:bg-slate-100 text-[10px]">
                  {generatedAssessment.duration} mins
                </Badge>
              </div>
            </div>
          </div>

          {generatedAssessment.questions.map((q, qIndex) => {
            const isExpanded = expandedIndex === qIndex;
            const isSelected = selectedIndices.includes(qIndex);

            return (
              <QuestionEditor
                key={qIndex}
                q={q}
                qIndex={qIndex}
                isExpanded={isExpanded}
                onToggleExpand={() => setExpandedIndex(isExpanded ? null : qIndex)}
                isSelected={isSelected}
                onToggleSelect={() => onToggleSelect(qIndex)}
                onEditQuestionText={(val) => onEditQuestionText(qIndex, val)}
                onEditExplanation={(val) => onEditExplanation(qIndex, val)}
                onEditOptionText={(optIndex, val) => onEditOptionText(qIndex, optIndex, val)}
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
