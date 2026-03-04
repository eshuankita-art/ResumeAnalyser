"use client";

import { useFormState, useFormStatus } from "react-dom";
import { analyzeResumeAction, type AnalyzeResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function AnalyzeButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="secondary">
      {pending ? "Analyzing..." : "Analyze resume with AI"}
    </Button>
  );
}

export function AnalyzeSection({ resumeId }: { resumeId: string }) {
  const router = useRouter();
  const [state, formAction] = useFormState<AnalyzeResult | null, FormData>(
    analyzeResumeAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Resume analyzed successfully.");
      router.refresh();
    } else if (state && !state.success) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <input type="hidden" name="resumeId" value={resumeId} />
          <p className="mb-4 text-sm text-muted-foreground">
            Run AI analysis to get your resume score, detected skills, missing
            skills, improvement suggestions, and ATS compatibility feedback.
          </p>
          <AnalyzeButton />
        </form>
      </CardContent>
    </Card>
  );
}
