import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLatestResumeForUser } from "@/lib/db";
import { ResumeUploadCard } from "@/components/resume-upload-card";
import { ResumeAnalysisView } from "@/components/resume-analysis";
import { AnalyzeSection } from "./analyze-section";

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
