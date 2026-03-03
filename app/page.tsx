import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 py-12">
      <section className="grid gap-10 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <ShieldCheck className="h-3 w-3" />
            <span>ATS-ready · Privacy-first · AI powered</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Turn your resume into a{" "}
            <span className="text-primary">job-winning asset</span>.
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your resume, get an AI-powered score, and instantly see how
            well you match live job openings. Actionable feedback, missing
            skills, and ATS compatibility in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/auth/register">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Log in</Link>
            </Button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>
              Free plan includes 3 AI job matches. Upgrade anytime for
              unlimited insights.
            </span>
          </div>
        </div>
        <div className="rounded-2xl border bg-muted/40 p-6 shadow-sm">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Example analysis
            </p>
            <div className="rounded-xl border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Resume score</span>
                <span className="text-sm font-semibold text-primary">86 / 100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[86%] rounded-full bg-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                Strong experience in full-stack development. Improve impact by
                quantifying achievements and aligning skills with target roles.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border bg-background p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Top skills detected
                </p>
                <p className="mt-1 text-xs">
                  React · TypeScript · Node.js · PostgreSQL · AWS
                </p>
              </div>
              <div className="rounded-xl border bg-background p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Missing skills
                </p>
                <p className="mt-1 text-xs">
                  System design · Observability · CI/CD tooling
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

