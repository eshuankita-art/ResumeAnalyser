import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getLatestResumeForUser } from "@/lib/db";
import { ResumeUploadCard } from "@/components/resume-upload-card";
import { ResumeAnalysisView } from "@/components/resume-analysis";
import { analyzeResumeAction, type AnalyzeResult } from "./actions";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    redirect("/auth/login");
  }

  const resume = await getLatestResumeForUser(userId);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload your resume and get AI-powered feedback on skills, gaps, and ATS readiness.
        </p>
      </section>

      {!resume ? (
        <ResumeUploadCard />
      ) : (
        <div className="space-y-6">
          <ResumeUploadCard />
          <AnalyzeSection resumeId={resume.id} />
          <ResumeAnalysisView
            score={resume.ai_score}
            feedback={resume.ai_feedback}
          />
        </div>
      )}
    </div>
  );
}

function AnalyzeSection({ resumeId }: { resumeId: string }) {
  "use client";
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

