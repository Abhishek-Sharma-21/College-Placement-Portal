import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";

export default function AssessmentConfigForm({
  domain,
  setDomain,
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  numQuestions,
  setNumQuestions,
  generating,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Domain / Industry</label>
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g. Software Engineering"
          className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Test Topic / Skill</label>
        <Input
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. React Hooks, Docker Basics, Python OOP"
          className="bg-slate-50/50 border-slate-100 rounded-xl text-xs h-10 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl text-xs h-10 px-3 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Questions</label>
          <select
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl text-xs h-10 px-3 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="5">5 Qs</option>
            <option value="10">10 Qs</option>
            <option value="15">15 Qs</option>
            <option value="20">20 Qs</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={generating}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 text-xs shadow-md shadow-blue-100 flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Questions
          </>
        )}
      </Button>
    </form>
  );
}
