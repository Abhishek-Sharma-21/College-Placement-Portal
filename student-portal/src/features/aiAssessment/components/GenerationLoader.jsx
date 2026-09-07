import React from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function GenerationLoader({ generating, genStatus }) {
  if (!generating) return null;

  return (
    <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden p-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-slate-800">Generating Questions</h4>
          <p className="text-xs text-slate-400 font-bold animate-pulse">{genStatus}</p>
        </div>
      </div>
    </Card>
  );
}
