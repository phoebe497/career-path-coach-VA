import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { analyzeCareerFit, type AnalysisResult } from "@/lib/analyze.functions";
import { InputPanel } from "./InputPanel";
import { ResultsPanel } from "./ResultsPanel";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export function CareerFitApp() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const analyzeFn = useServerFn(analyzeCareerFit);

  const mutation = useMutation({
    mutationFn: async (input: {
      cvText: string;
      jobDescription?: string;
      jobUrl?: string;
    }) => analyzeFn({ data: input }),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Analysis complete");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  return (
    <div className="relative min-h-screen bg-background">
      {/* Hero background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{ background: "var(--gradient-hero)" }}
      />

      <Toaster richColors position="top-center" />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Learning OS · Career Coach
          </div>
          <h1 className="bg-clip-text text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            CareerFit AI
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Learn before you apply. Match your CV against any job, see your fit
            score, and get a focused roadmap to close the gaps.
          </p>
        </header>

        <main className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <InputPanel
            isAnalyzing={mutation.isPending}
            onAnalyze={(input) => mutation.mutate(input)}
          />
          <ResultsPanel
            result={result}
            isLoading={mutation.isPending}
            error={mutation.error?.message ?? null}
          />
        </main>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          CareerFit AI acts as a learning coach, not a recruiter. Always verify
          AI suggestions with real mentors and job postings.
        </footer>
      </div>
    </div>
  );
}
