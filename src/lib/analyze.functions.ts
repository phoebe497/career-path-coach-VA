import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  cvText: z.string().min(50, "CV text is too short").max(50000),
  jobDescription: z.string().min(20).max(50000).optional(),
  jobUrl: z.string().url().optional(),
});

export type AnalysisResult = {
  fitScore: number;
  recommendation: "Apply Now" | "Apply After Improvement" | "Learn First";
  matchedSkills: string[];
  missingSkills: string[];
  weakEvidence: string[];
  learningRoadmap: { week: number; title: string }[];
  cvSuggestions: string[];
  jobTitle?: string;
};

const SYSTEM_PROMPT = `You are CareerFit AI — a Career Learning Coach (not a recruiter).
Your job is to help students and early-career job seekers understand how well their CV
matches a target job description, and identify what they need to learn before applying.

Be honest, encouraging, and specific. Focus on learning, not gatekeeping.

You MUST call the function "return_career_analysis" with structured fields.
Rules:
- fitScore: integer 0-100. <60 = "Learn First". 60-79 = "Apply After Improvement". 80+ = "Apply Now".
- matchedSkills: skills clearly present in BOTH the CV and the JD.
- missingSkills: required/preferred JD skills NOT evidenced in the CV.
- weakEvidence: skills mentioned in CV but with weak/no concrete evidence (no projects, no metrics).
- learningRoadmap: 3-6 week plan, each item { week, title }. Concrete, sequenced, actionable.
- cvSuggestions: 3-6 specific improvements (quantify achievements, add projects, etc.).
- jobTitle: the role name inferred from the JD if obvious; otherwise omit.
If the JD is too vague to evaluate, return fitScore 0, recommendation "Learn First",
and put "Insufficient job information" as the first cvSuggestion.`;

async function fetchJobFromUrl(url: string): Promise<string> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("TAVILY_API_KEY is not configured");
  const res = await fetch("https://api.tavily.com/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: key, urls: [url] }),
  });
  if (!res.ok) throw new Error(`Tavily extract failed: ${res.status}`);
  const data = (await res.json()) as {
    results?: { raw_content?: string; content?: string }[];
  };
  const first = data.results?.[0];
  const content = first?.raw_content || first?.content || "";
  if (!content || content.length < 50) {
    throw new Error("Could not extract job description from URL");
  }
  return content.slice(0, 20000);
}

export const analyzeCareerFit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    let jd = data.jobDescription?.trim() ?? "";
    if (!jd && data.jobUrl) {
      jd = await fetchJobFromUrl(data.jobUrl);
    }
    if (!jd || jd.length < 20) {
      throw new Error(
        "Insufficient job information for accurate evaluation. Please provide a more detailed job description.",
      );
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const tools = [
      {
        type: "function" as const,
        function: {
          name: "return_career_analysis",
          description: "Return structured CV-vs-JD analysis for the learner.",
          parameters: {
            type: "object",
            properties: {
              fitScore: { type: "integer", minimum: 0, maximum: 100 },
              recommendation: {
                type: "string",
                enum: ["Apply Now", "Apply After Improvement", "Learn First"],
              },
              matchedSkills: { type: "array", items: { type: "string" } },
              missingSkills: { type: "array", items: { type: "string" } },
              weakEvidence: { type: "array", items: { type: "string" } },
              learningRoadmap: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    week: { type: "integer", minimum: 1 },
                    title: { type: "string" },
                  },
                  required: ["week", "title"],
                  additionalProperties: false,
                },
              },
              cvSuggestions: { type: "array", items: { type: "string" } },
              jobTitle: { type: "string" },
            },
            required: [
              "fitScore",
              "recommendation",
              "matchedSkills",
              "missingSkills",
              "weakEvidence",
              "learningRoadmap",
              "cvSuggestions",
            ],
            additionalProperties: false,
          },
        },
      },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `=== CV ===\n${data.cvText.slice(0, 25000)}\n\n=== JOB DESCRIPTION ===\n${jd}`,
          },
        ],
        tools,
        tool_choice: {
          type: "function",
          function: { name: "return_career_analysis" },
        },
      }),
    });

    if (res.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (res.status === 402) {
      throw new Error(
        "AI credits exhausted. Please add credits in your workspace settings.",
      );
    }
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error("AI analysis failed. Please try again.");
    }

    const payload = (await res.json()) as {
      choices?: {
        message?: {
          tool_calls?: { function?: { arguments?: string } }[];
        };
      }[];
    };
    const args = payload.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("AI did not return a valid analysis.");

    let parsed: AnalysisResult;
    try {
      parsed = JSON.parse(args) as AnalysisResult;
    } catch {
      throw new Error("AI returned malformed analysis JSON.");
    }

    // Enforce recommendation from fitScore as the source of truth
    const s = parsed.fitScore;
    parsed.recommendation =
      s >= 80 ? "Apply Now" : s >= 60 ? "Apply After Improvement" : "Learn First";

    // Persist (anonymous MVP)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("analysis_results").insert({
        fit_score: parsed.fitScore,
        recommendation: parsed.recommendation,
        matched_skills: parsed.matchedSkills,
        missing_skills: parsed.missingSkills,
        weak_evidence: parsed.weakEvidence,
        learning_roadmap: parsed.learningRoadmap,
        cv_suggestions: parsed.cvSuggestions,
        job_title: parsed.jobTitle ?? null,
      });
    } catch (e) {
      console.error("Failed to persist analysis:", e);
    }

    return parsed;
  });
