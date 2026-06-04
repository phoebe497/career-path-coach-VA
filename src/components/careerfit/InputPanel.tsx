import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Link2, Loader2, Sparkles, Upload } from "lucide-react";
import { extractPdfText } from "@/lib/pdf-parse";
import type { Locale, LocaleCopy } from "@/lib/i18n";
import { toast } from "sonner";

type Props = {
  isAnalyzing: boolean;
  locale: Locale;
  copy: LocaleCopy;
  onAnalyze: (input: {
    cvText: string;
    jobDescription?: string;
    jobUrl?: string;
  }) => void;
};

export function InputPanel({ isAnalyzing, locale, copy, onAnalyze }: Props) {
  const [cvText, setCvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdMode, setJdMode] = useState<"paste" | "url">("paste");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error(copy.input.uploadPdf);
      return;
    }
    setParsing(true);
    setFileName(file.name);
    try {
      const text = await extractPdfText(file);
      if (!text || text.length < 50) {
        toast.error(copy.input.extractionFailed);
        setFileName(null);
      } else {
        setCvText(text);
        toast.success(copy.input.extracted(text.length));
      }
    } catch (e) {
      console.error(e);
      toast.error(copy.input.extractionFailed);
      setFileName(null);
    } finally {
      setParsing(false);
    }
  };

  const handleAnalyze = () => {
    if (cvText.trim().length < 50) {
      toast.error(copy.input.cvTooShort);
      return;
    }
    if (jdMode === "paste" && jdText.trim().length < 20) {
      toast.error(copy.input.pasteMoreJd);
      return;
    }
    if (jdMode === "url" && !jdUrl.trim()) {
      toast.error(copy.input.pasteUrl);
      return;
    }
    onAnalyze({
      cvText,
      jobDescription: jdMode === "paste" ? jdText : undefined,
      jobUrl: jdMode === "url" ? jdUrl : undefined,
    });
  };

  return (
    <Card className="border-border/60 bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="space-y-6">
        <section>
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">{copy.input.yourCv}</h2>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={parsing || isAnalyzing}
            className="group flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-secondary/70 disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {fileName ?? copy.input.uploadCv}
                </p>
                <p className="text-xs text-muted-foreground">
                  {parsing ? copy.input.extracting : copy.input.dragDrop}
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
              {copy.input.pasteManually}
            </Label>
            <Textarea
              id="cv-text"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder={copy.input.cvPlaceholder}
              className="mt-1 min-h-[140px] resize-y"
              disabled={isAnalyzing}
            />
            {cvText && (
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {cvText.length.toLocaleString()} {locale === "en" ? "characters" : "ký tự"}
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">{copy.input.targetJob}</h2>
          </div>

          <Tabs value={jdMode} onValueChange={(v) => setJdMode(v as "paste" | "url")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">
                <FileText className="mr-2 h-3.5 w-3.5" /> {copy.input.pasteJd}
              </TabsTrigger>
              <TabsTrigger value="url">
                <Link2 className="mr-2 h-3.5 w-3.5" /> {copy.input.fromUrl}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="mt-3">
              <Textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder={copy.input.jdPlaceholder}
                className="min-h-[160px] resize-y"
                disabled={isAnalyzing}
              />
            </TabsContent>
            <TabsContent value="url" className="mt-3 space-y-1">
              <Input
                type="url"
                value={jdUrl}
                onChange={(e) => setJdUrl(e.target.value)}
                placeholder={copy.input.urlPlaceholder}
                disabled={isAnalyzing}
              />
              <p className="text-xs text-muted-foreground">{copy.input.urlHint}</p>
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {copy.input.analyzing}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> {copy.input.analyze}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
