"use client";

import { useFormState } from "react-dom";
import { analyzeResumeAction, type AnalyzeResult } from "./actions";
import { Button } from "@/components/ui/button";

type Props = {
  resumeId: string;
};

export function AnalyzeSection({ resumeId }: Props) {
  const [state, formAction] = useFormState<AnalyzeResult | null, FormData>(
    analyzeResumeAction,
    null
  );

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="resumeId" value={resumeId} />
      <Button type="submit">
        {state?.success ? "Re-run analysis" : "Run analysis"}
      </Button>
      {state && !state.success && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
    </form>
  );
}

