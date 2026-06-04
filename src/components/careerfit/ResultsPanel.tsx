import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Link2,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/analyze.functions";
import type { Locale, LocaleCopy } from "@/lib/i18n";

type Props = {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  locale: Locale;
  copy: LocaleCopy;
};

export function ResultsPanel({ result, isLoading, error, locale, copy }: Props) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} copy={copy} />;
  if (!result) return <EmptyState copy={copy} />;
  return <ResultsView result={result} locale={locale} copy={copy} />;
}

function EmptyState({ copy }: { copy: LocaleCopy }) {
  return (
    <Card
      className="flex min-h-[400px] flex-col items-center justify-center border-dashed bg-card/60 p-10 text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Target className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{copy.results.emptyTitle}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{copy.results.emptyDesc}</p>
    </Card>
  );
}

function ErrorState({ message, copy }: { message: string; copy: LocaleCopy }) {
  return (
    <Card
      className="flex min-h-[400px] flex-col items-center justify-center border border-destructive/30 bg-destructive/5 p-10 text-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{copy.results.errorTitle}</h3>
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

function ResultsView({
  result,
  locale,
  copy,
}: {
  result: AnalysisResult;
  locale: Locale;
  copy: LocaleCopy;
}) {
  const recStyle = recommendationStyle(result.recommendation);
  const score = Math.max(0, Math.min(100, Math.round(result.fitScore)));
  const breakdown = result.scoreBreakdown;
  const typeLabel = (type: AnalysisResult["learningRoadmap"][number]["type"]) => {
    if (locale === "en") {
      switch (type) {
        case "technical":
          return "Technical";
        case "review":
          return "Review";
        case "portfolio":
          return "Portfolio";
        case "interview":
          return "Interview";
        case "project":
          return "Project";
      }
    }
    switch (type) {
      case "technical":
        return "Kỹ thuật";
      case "review":
        return "Rà soát";
      case "portfolio":
        return "Portfolio";
      case "interview":
        return "Phỏng vấn";
      case "project":
        return "Dự án";
    }
  };
  const criteria = [
    {
      key: "skillsMatch",
      label: copy.results.criteria.skillsMatch.label,
      weight: copy.results.criteria.skillsMatch.weight,
      hint: copy.results.criteria.skillsMatch.hint,
      score: breakdown?.skillsMatch,
    },
    {
      key: "experienceMatch",
      label: copy.results.criteria.experienceMatch.label,
      weight: copy.results.criteria.experienceMatch.weight,
      hint: copy.results.criteria.experienceMatch.hint,
      score: breakdown?.experienceMatch,
    },
    {
      key: "educationMatch",
      label: copy.results.criteria.educationMatch.label,
      weight: copy.results.criteria.educationMatch.weight,
      hint: copy.results.criteria.educationMatch.hint,
      score: breakdown?.educationMatch,
    },
    {
      key: "certificates",
      label: copy.results.criteria.certificates.label,
      weight: copy.results.criteria.certificates.weight,
      hint: copy.results.criteria.certificates.hint,
      score: breakdown?.certificates,
    },
    {
      key: "languageMatch",
      label: copy.results.criteria.languageMatch.label,
      weight: copy.results.criteria.languageMatch.weight,
      hint: copy.results.criteria.languageMatch.hint,
      score: breakdown?.languageMatch,
    },
    {
      key: "locationMatch",
      label: copy.results.criteria.locationMatch.label,
      weight: copy.results.criteria.locationMatch.weight,
      hint: copy.results.criteria.locationMatch.hint,
      score: breakdown?.locationMatch,
    },
    {
      key: "industryMatch",
      label: copy.results.criteria.industryMatch.label,
      weight: copy.results.criteria.industryMatch.weight,
      hint: copy.results.criteria.industryMatch.hint,
      score: breakdown?.industryMatch,
    },
    {
      key: "achievements",
      label: copy.results.criteria.achievements.label,
      weight: copy.results.criteria.achievements.weight,
      hint: copy.results.criteria.achievements.hint,
      score: breakdown?.achievements,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/60 bg-card p-6" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <ScoreRing score={score} color={recStyle.ring} />
          <div className="flex-1 text-center sm:text-left">
            {result.jobTitle && (
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {result.jobTitle}
              </p>
            )}
            <h2 className="mt-1 text-2xl font-semibold text-foreground">{copy.results.scoreTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.results.scoreDesc}</p>
            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${recStyle.className}`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {copy.results.recommendation[result.recommendation]}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{copy.results.whyScore}</h3>
        </div>
        <div className="space-y-3">
          {criteria.map((item) => {
            const value = item.score;
            const normalized = typeof value === "number" ? Math.max(0, Math.min(100, Math.round(value))) : null;
            const status =
              normalized == null
                ? copy.results.scoreStatus.notScored
                : normalized >= 80
                  ? copy.results.scoreStatus.strong
                  : normalized >= 60
                    ? copy.results.scoreStatus.partial
                    : copy.results.scoreStatus.weak;
            const statusClass =
              normalized == null
                ? "bg-secondary text-muted-foreground border-border"
                : normalized >= 80
                  ? "bg-[oklch(0.95_0.06_155)] text-[oklch(0.35_0.14_155)] border-[oklch(0.85_0.1_155)]"
                  : normalized >= 60
                    ? "bg-[oklch(0.97_0.06_75)] text-[oklch(0.4_0.14_75)] border-[oklch(0.88_0.12_75)]"
                    : "bg-[oklch(0.96_0.05_27)] text-[oklch(0.42_0.18_27)] border-[oklch(0.88_0.1_27)]";

            return (
              <div key={item.key} className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusClass}`}>
                        {status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {locale === "en" ? "Weight" : "Trọng số"} {item.weight}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {normalized == null ? "—" : `${normalized}/100`}
                  </div>
                </div>
                {normalized != null && normalized < 60 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {locale === "en"
                      ? "This criterion is below the strict-fit threshold, so it is reducing the final score."
                      : "Tiêu chí này thấp hơn ngưỡng chặt, nên đang kéo điểm tổng xuống."}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{copy.results.howToReadTitle}</p>
          <p className="mt-1">{copy.results.howToReadBody}</p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <SkillCard
          icon={<CheckCircle2 className="h-4 w-4 text-[oklch(0.55_0.16_155)]" />}
          title={copy.results.matchedSkills}
          items={result.matchedSkills}
          variant="success"
          empty={locale === "en" ? "No clear matches found." : "Chưa thấy kỹ năng khớp rõ ràng."}
        />
        <SkillCard
          icon={<XCircle className="h-4 w-4 text-destructive" />}
          title={copy.results.missingSkills}
          items={result.missingSkills}
          variant="destructive"
          empty={locale === "en" ? "Nothing critical is missing — nice." : "Không thiếu gì quá nghiêm trọng."}
        />
      </div>

      {result.weakEvidence.length > 0 && (
        <SkillCard
          icon={<AlertCircle className="h-4 w-4 text-[oklch(0.6_0.16_75)]" />}
          title={copy.results.weakEvidence}
          items={result.weakEvidence}
          variant="warning"
          empty=""
          hint={copy.results.weakEvidenceHint}
        />
      )}

      <Card className="p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{copy.results.learningRoadmap}</h3>
        </div>
        {result.learningRoadmap.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.results.roadmapEmpty}</p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-6">
            {result.learningRoadmap.map((item) => (
              <li key={`${item.phase}-${item.title}`} className="relative">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-card text-[11px] font-semibold text-primary">
                  {item.phase.replace(/^Phase\s*/i, "").slice(0, 2) || "•"}
                </span>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.phase}</p>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                  >
                    {typeLabel(item.type)}
                  </Badge>
                  {item.type === "technical" && item.courseUrl && (
                    <a
                      href={item.courseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Link2 className="h-3 w-3" />
                      {copy.results.courseLink}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card className="p-6" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{copy.results.cvSuggestions}</h3>
        </div>
        {result.cvSuggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{copy.results.cvSuggestionsEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {result.cvSuggestions.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-sm text-foreground">
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
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-border)" strokeWidth={stroke} fill="none" />
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
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
