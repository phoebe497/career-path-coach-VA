import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/analyze.functions";

type Props = {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
};

export function ResultsPanel({ result, isLoading, error }: Props) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!result) return <EmptyState />;
  return <ResultsView result={result} />;
}

function EmptyState() {
  return (
    <Card
      className="flex min-h-[400px] flex-col items-center justify-center border-dashed bg-card/60 p-10 text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Target className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Your analysis appears here
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Upload your CV and a job description on the left, then run the analysis
        to see your fit score, missing skills, and a learning roadmap.
      </p>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card
      className="flex min-h-[400px] flex-col items-center justify-center border border-destructive/30 bg-destructive/5 p-10 text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Analysis failed</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
    </Card>
  );
}

function LoadingState() {
  return (
    <Card className="space-y-6 p-6" style={{ boxShadow: "var(--shadow-card)" }}>
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-48 w-full" />
    </Card>
  );
}

function recommendationStyle(rec: AnalysisResult["recommendation"]) {
  switch (rec) {
    case "Apply Now":
      return {
        className: "bg-[oklch(0.95_0.06_155)] text-[oklch(0.35_0.14_155)] border-[oklch(0.85_0.1_155)]",
        ring: "oklch(0.65 0.16 155)",
      };
    case "Apply After Improvement":
      return {
        className:
          "bg-[oklch(0.97_0.06_75)] text-[oklch(0.4_0.14_75)] border-[oklch(0.88_0.12_75)]",
        ring: "oklch(0.78 0.16 75)",
      };
    case "Learn First":
      return {
        className:
          "bg-[oklch(0.96_0.05_27)] text-[oklch(0.42_0.18_27)] border-[oklch(0.88_0.1_27)]",
        ring: "oklch(0.62 0.2 27)",
      };
  }
}

function ResultsView({ result }: { result: AnalysisResult }) {
  const recStyle = recommendationStyle(result.recommendation);
  const score = Math.max(0, Math.min(100, Math.round(result.fitScore)));

  return (
    <div className="space-y-6">
      {/* Score card */}
      <Card
        className="overflow-hidden border-border/60 bg-card p-6"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <ScoreRing score={score} color={recStyle.ring} />
          <div className="flex-1 text-center sm:text-left">
            {result.jobTitle && (
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {result.jobTitle}
              </p>
            )}
            <h2 className="mt-1 text-2xl font-semibold text-foreground">
              Fit Score
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on skills, experience, and evidence in your CV.
            </p>
            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${recStyle.className}`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {result.recommendation}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Skills */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SkillCard
          icon={<CheckCircle2 className="h-4 w-4 text-[oklch(0.55_0.16_155)]" />}
          title="Matched skills"
          items={result.matchedSkills}
          variant="success"
          empty="No clear matches found."
        />
        <SkillCard
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          title="Missing skills"
          items={result.missingSkills}
          variant="destructive"
          empty="Nothing critical is missing — nice."
        />
      </div>

      {result.weakEvidence.length > 0 && (
        <SkillCard
          icon={<AlertCircle className="h-4 w-4 text-[oklch(0.6_0.16_75)]" />}
          title="Weak evidence"
          items={result.weakEvidence}
          variant="warning"
          empty=""
          hint="These appear on your CV but lack concrete projects, metrics, or context."
        />
      )}

      {/* Roadmap */}
      <Card className="p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Learning roadmap
          </h3>
        </div>
        {result.learningRoadmap.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You&apos;re ready — no roadmap needed.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-6">
            {result.learningRoadmap.map((item) => (
              <li key={item.week} className="relative">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-card text-[11px] font-semibold text-primary">
                  {item.week}
                </span>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Week {item.week}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {item.title}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {/* CV Suggestions */}
      <Card className="p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            CV improvement suggestions
          </h3>
        </div>
        {result.cvSuggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your CV looks solid for this role.
          </p>
        ) : (
          <ul className="space-y-2">
            {result.cvSuggestions.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-sm text-foreground"
              >
                <span className="mt-0.5 text-primary">›</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function SkillCard({
  icon,
  title,
  items,
  empty,
  hint,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  empty: string;
  hint?: string;
  variant: "success" | "destructive" | "warning";
}) {
  const styles =
    variant === "success"
      ? "bg-[oklch(0.96_0.05_155)] text-[oklch(0.32_0.12_155)] border-[oklch(0.88_0.08_155)]"
      : variant === "destructive"
      ? "bg-[oklch(0.97_0.04_27)] text-[oklch(0.42_0.18_27)] border-[oklch(0.9_0.08_27)]"
      : "bg-[oklch(0.97_0.06_75)] text-[oklch(0.4_0.14_75)] border-[oklch(0.9_0.1_75)]";

  return (
    <Card className="p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((it, i) => (
            <Badge
              key={i}
              variant="outline"
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}
            >
              {it}
            </Badge>
          ))}
        </div>
      )}
      {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const size = 140;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--color-border)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-foreground">{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          / 100
        </span>
      </div>
    </div>
  );
}
