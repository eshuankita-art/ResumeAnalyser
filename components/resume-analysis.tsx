import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ResumeAnalysisProps = {
  score: number | null;
  feedback: any | null;
};

export function ResumeAnalysisView({ score, feedback }: ResumeAnalysisProps) {
  const skills: string[] = feedback?.skills ?? [];
  const missingSkills: string[] = feedback?.missing_skills ?? [];
  const suggestions: string[] = feedback?.suggestions ?? [];
  const atsFeedback: string = feedback?.ats_feedback ?? "";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Resume score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-semibold">
              {typeof score === "number" ? score : "—"}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <Progress value={typeof score === "number" ? score : 0} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Skills detected</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills detected yet.</p>
          ) : (
            skills.map(skill => (
              <span
                key={skill}
                className="rounded-full bg-secondary px-2 py-1 text-xs"
              >
                {skill}
              </span>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Missing skills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {missingSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No missing skills identified.
            </p>
          ) : (
            missingSkills.map(skill => (
              <span
                key={skill}
                className="rounded-full bg-destructive/10 px-2 py-1 text-xs text-destructive"
              >
                {skill}
              </span>
            ))
          )}
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Improvement suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Upload and analyze a resume to see tailored suggestions.
            </p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {suggestions.map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>ATS compatibility</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {atsFeedback || "Run an analysis to see ATS feedback."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

