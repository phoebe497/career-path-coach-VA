import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Link2, Loader2, Sparkles, Upload } from "lucide-react";
import { extractPdfText } from "@/lib/pdf-parse";
import { toast } from "sonner";

type Props = {
  isAnalyzing: boolean;
  onAnalyze: (input: {
    cvText: string;
    jobDescription?: string;
    jobUrl?: string;
  }) => void;
};

export function InputPanel({ isAnalyzing, onAnalyze }: Props) {
  const [cvText, setCvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdMode, setJdMode] = useState<"paste" | "url">("paste");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setParsing(true);
    setFileName(file.name);
    try {
      const text = await extractPdfText(file);
      if (!text || text.length < 50) {
        toast.error(
          "Unable to extract CV content with high confidence. Please upload a clearer PDF or paste CV text manually.",
        );
        setFileName(null);
      } else {
        setCvText(text);
        toast.success(`Extracted ${text.length.toLocaleString()} characters`);
      }
    } catch (e) {
      console.error(e);
      toast.error(
        "Unable to extract CV content with high confidence. Please upload a clearer PDF or paste CV text manually.",
      );
      setFileName(null);
    } finally {
      setParsing(false);
    }
  };

  const handleAnalyze = () => {
    if (cvText.trim().length < 50) {
      toast.error("CV text is too short — please upload a PDF or paste your CV.");
      return;
    }
    if (jdMode === "paste" && jdText.trim().length < 20) {
      toast.error("Please paste a more detailed job description.");
      return;
    }
    if (jdMode === "url" && !jdUrl.trim()) {
      toast.error("Please paste a job posting URL.");
      return;
    }
    onAnalyze({
      cvText,
      jobDescription: jdMode === "paste" ? jdText : undefined,
      jobUrl: jdMode === "url" ? jdUrl : undefined,
    });
  };

  return (
    <Card
      className="border-border/60 bg-card p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="space-y-6">
        {/* CV Upload */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Your CV</h2>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={parsing || isAnalyzing}
            className="group flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-secondary/70 disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {parsing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {fileName ?? "Upload CV (PDF)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {parsing
                    ? "Extracting text…"
                    : "Drag-free upload · text extracted in your browser"}
                </p>
              </div>
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
          />

          <div className="mt-3">
            <Label htmlFor="cv-text" className="text-xs text-muted-foreground">
              Or paste CV text manually
            </Label>
            <Textarea
              id="cv-text"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV content here…"
              className="mt-1 min-h-[140px] resize-y"
              disabled={isAnalyzing}
            />
            {cvText && (
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {cvText.length.toLocaleString()} characters
              </p>
            )}
          </div>
        </section>

        {/* Job Description */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Target Job</h2>
          </div>

          <Tabs value={jdMode} onValueChange={(v) => setJdMode(v as "paste" | "url")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">
                <FileText className="mr-2 h-3.5 w-3.5" /> Paste JD
              </TabsTrigger>
              <TabsTrigger value="url">
                <Link2 className="mr-2 h-3.5 w-3.5" /> From URL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="mt-3">
              <Textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the full job description…"
                className="min-h-[160px] resize-y"
                disabled={isAnalyzing}
              />
            </TabsContent>
            <TabsContent value="url" className="mt-3 space-y-1">
              <Input
                type="url"
                value={jdUrl}
                onChange={(e) => setJdUrl(e.target.value)}
                placeholder="https://company.com/jobs/123"
                disabled={isAnalyzing}
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll fetch and clean the posting automatically.
              </p>
            </TabsContent>
          </Tabs>
        </section>

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || parsing}
          size="lg"
          className="w-full bg-[var(--gradient-primary)] text-primary-foreground hover:opacity-95"
          style={{ background: "var(--gradient-primary)" }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Analyze fit
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
