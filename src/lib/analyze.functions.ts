import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { normalizeLocale, type Locale } from "./i18n";

const InputSchema = z.object({
  cvText: z.string().min(50, "CV text is too short").max(50000),
  jobDescription: z.string().min(20).max(50000).optional(),
  jobUrl: z.string().url().optional(),
  locale: z.enum(["vi", "en"]).optional(),
});

export type AnalysisResult = {
  fitScore: number;
  recommendation: "Apply Now" | "Apply After Improvement" | "Learn First";
  scoreBreakdown?: {
    skillsMatch?: number;
    experienceMatch?: number;
    educationMatch?: number;
    certificates?: number;
    languageMatch?: number;
    locationMatch?: number;
    industryMatch?: number;
    achievements?: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  weakEvidence: string[];
  learningRoadmap: {
    phase: string;
    title: string;
    type: "technical" | "review" | "portfolio" | "interview" | "project";
    courseUrl?: string;
  }[];
  cvSuggestions: string[];
  jobTitle?: string;
};

const FIT_SCORE_WEIGHTS = {
  skillsMatch: 0.35,
  experienceMatch: 0.25,
  educationMatch: 0.1,
  certificates: 0.07,
  languageMatch: 0.08,
  locationMatch: 0.05,
  industryMatch: 0.05,
  achievements: 0.05,
} as const;

function getAnalysisMessages(locale: Locale) {
  if (locale === "en") {
    return {
      system: `You are CareerFit AI, a career learning coach, not a recruiter.
Your job is to help students and early-career job seekers understand how well their CV matches a target job description, and identify what they need to learn before applying.

Be honest, encouraging, specific, and conservative.

Return ONLY valid JSON with the fields below.
Rules:
- fitScore: integer 0-100. Score strictly from the weighted rubric below.
- scoreBreakdown: optional but preferred. Give each category a 0-100 sub-score.
- matchedSkills: skills clearly present in BOTH the CV and the JD.
- missingSkills: required/preferred JD skills NOT evidenced in the CV.
- weakEvidence: skills mentioned in CV but with weak/no concrete evidence (no projects, no metrics).
- Scoring rubric:
  - Skills Match: 35%
  - Experience Match: 25%
  - Education Match: 10%
  - Certificates: 7%
  - Language Match: 8%
  - Location Match: 5%
  - Industry Match: 5%
  - Achievements & Relevant Projects: 5%
- Scoring rules:
  - Be strict. If a category is not clearly evidenced, score it low.
  - Only count direct evidence from the CV. Do not infer missing experience or credentials.
  - If the JD explicitly requires a category and the CV does not show it, penalize heavily.
  - If the role is junior/intern and the JD is flexible, still score conservatively.
- learningRoadmap: 3-6 phased plan, each item { phase, title, type, courseUrl? }. Concrete, sequenced, actionable.
- phase: short label like "Phase 1", "Phase 2", "Portfolio", "Interview Prep".
- type: one of "technical", "review", "portfolio", "interview", "project".
- courseUrl: include only for technical items; use a stable public learning link that matches the topic. Omit it for review, portfolio, interview, or general reflection items.
- cvSuggestions: 3-6 specific improvements (quantify achievements, add projects, etc.).
- jobTitle: the role name inferred from the JD if obvious; otherwise omit.
If the JD is too vague to evaluate, return fitScore 0, recommendation "Learn First",
and put "Insufficient job information" as the first cvSuggestion.`,
      userPrefix: `Return ONLY valid JSON. No markdown, no code fences, no extra text.

Use this exact shape:
{
  "fitScore": 0,
  "recommendation": "Apply Now",
  "scoreBreakdown": {
    "skillsMatch": 0,
    "experienceMatch": 0,
    "educationMatch": 0,
    "certificates": 0,
    "languageMatch": 0,
    "locationMatch": 0,
    "industryMatch": 0,
    "achievements": 0
  },
  "matchedSkills": [],
  "missingSkills": [],
  "weakEvidence": [],
  "learningRoadmap": [
    {
      "phase": "Phase 1",
      "title": "...",
      "type": "technical",
      "courseUrl": "https://..."
    }
  ],
  "cvSuggestions": [],
  "jobTitle": "optional string"
}

Answer in English.`,
    };
  }

  return {
    system: `Bạn là CareerFit AI, một trợ lý định hướng học tập nghề nghiệp, không phải nhà tuyển dụng.
Nhiệm vụ của bạn là giúp sinh viên và người mới đi làm hiểu CV khớp với mô tả công việc đến mức nào, và cần học gì trước khi ứng tuyển.

Hãy trả lời trung thực, khích lệ, cụ thể và thận trọng.

Chỉ trả về JSON hợp lệ với các trường bên dưới.
Quy tắc:
- fitScore: số nguyên 0-100. Chấm điểm строго theo bảng trọng số bên dưới.
- scoreBreakdown: không bắt buộc nhưng nên có. Mỗi hạng mục là một điểm 0-100.
- matchedSkills: các kỹ năng xuất hiện rõ trong cả CV và JD.
- missingSkills: các kỹ năng bắt buộc/ưu tiên trong JD nhưng CV không chứng minh được.
- weakEvidence: kỹ năng có nhắc trong CV nhưng bằng chứng yếu/thiếu cụ thể (không có dự án, số liệu).
- Bảng trọng số:
  - Kỹ năng: 35%
  - Kinh nghiệm: 25%
  - Học vấn: 10%
  - Chứng chỉ: 7%
  - Ngôn ngữ: 8%
  - Địa điểm: 5%
  - Ngành nghề: 5%
  - Thành tích & dự án liên quan: 5%
- Quy tắc chấm:
  - Rất chặt. Nếu một hạng mục không có bằng chứng rõ ràng, hãy chấm thấp.
  - Chỉ dùng bằng chứng trực tiếp từ CV. Không tự suy diễn kinh nghiệm hoặc bằng cấp còn thiếu.
  - Nếu JD yêu cầu rõ một hạng mục mà CV không thể hiện, hãy trừ mạnh.
  - Nếu vị trí là intern/junior và JD linh hoạt, vẫn chấm thận trọng.
- learningRoadmap: kế hoạch theo 3-6 giai đoạn, mỗi mục { phase, title, type, courseUrl? }. Cụ thể, có trình tự, có hành động rõ ràng.
- phase: nhãn ngắn như "Phase 1", "Phase 2", "Portfolio", "Interview Prep".
- type: một trong "technical", "review", "portfolio", "interview", "project".
- courseUrl: chỉ thêm cho mục technical; dùng link học public, ổn định, khớp chủ đề. Không thêm cho review, portfolio, interview hoặc mục phản tư chung.
- cvSuggestions: 3-6 đề xuất cải thiện cụ thể (định lượng thành tích, thêm dự án, v.v.).
- jobTitle: tên vị trí suy ra từ JD nếu rõ; nếu không thì bỏ qua.
Nếu JD quá mơ hồ để đánh giá, trả về fitScore 0, recommendation "Learn First",
và đặt "Insufficient job information" ở cvSuggestion đầu tiên.`,
    userPrefix: `Chỉ trả về JSON hợp lệ. Không markdown, không code fence, không thêm text ngoài JSON.

Dùng đúng cấu trúc sau:
{
  "fitScore": 0,
  "recommendation": "Apply Now",
  "scoreBreakdown": {
    "skillsMatch": 0,
    "experienceMatch": 0,
    "educationMatch": 0,
    "certificates": 0,
    "languageMatch": 0,
    "locationMatch": 0,
    "industryMatch": 0,
    "achievements": 0
  },
  "matchedSkills": [],
  "missingSkills": [],
  "weakEvidence": [],
  "learningRoadmap": [
    {
      "phase": "Phase 1",
      "title": "...",
      "type": "technical",
      "courseUrl": "https://..."
    }
  ],
  "cvSuggestions": [],
  "jobTitle": "optional string"
}

Hãy trả lời bằng tiếng Việt.`,
  };
}

const LLM_ENDPOINT =
  process.env.OPENROUTER_BASE_URL ??
  process.env.LLM_ENDPOINT ??
  "https://opencode.ai/zen/go/v1";
const LLM_API_KEY = process.env.OPENROUTER_API_KEY ?? process.env.API_KEY;
const LLM_MODEL = process.env.OPENROUTER_MODEL ?? process.env.MODEL ?? "deepseek-v4-flash";
const LLM_SITE_URL = process.env.OPENROUTER_SITE_URL ?? process.env.HTTP_REFERER;
const LLM_SITE_NAME = process.env.OPENROUTER_SITE_NAME ?? process.env.OPENROUTER_TITLE;

function getChatCompletionsUrl(endpoint: string) {
  const trimmed = endpoint.replace(/\/+$/, "");
  return trimmed.endsWith("/chat/completions")
    ? trimmed
    : `${trimmed}/chat/completions`;
}

async function fetchJobFromUrl(url: string, locale: Locale): Promise<string> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error(locale === "en" ? "TAVILY_API_KEY is not configured" : "Chưa cấu hình TAVILY_API_KEY");
  const res = await fetch("https://api.tavily.com/extract", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      urls: [url],
      extract_depth: "advanced",
      format: "text",
      include_favicon: false,
      include_images: false,
    }),
  });
  if (!res.ok) {
    const details = await res.text();
    throw new Error(
      `Tavily extract failed (${res.status}). ${details.slice(0, 300)}`.trim(),
    );
  }
  const data = (await res.json()) as {
    results?: { url?: string; raw_content?: string; content?: string }[];
    failed_results?: { url?: string; error?: string }[];
  };
  const first = data.results?.[0];
  const content = first?.raw_content || first?.content || "";
  if (!content || content.length < 50) {
    const failed = data.failed_results?.[0];
    const suffix = failed?.error ? ` (${failed.error})` : "";
    throw new Error(
      `Could not extract job description from URL${suffix}`.trim(),
    );
  }
  return content.slice(0, 20000);
}

export const analyzeCareerFit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const locale = normalizeLocale(data.locale);
    const messages = getAnalysisMessages(locale);

    let jd = data.jobDescription?.trim() ?? "";
    if (!jd && data.jobUrl) {
      try {
        jd = await fetchJobFromUrl(data.jobUrl, locale);
      } catch (error) {
        console.error("Failed to extract job description from URL:", error);
        throw new Error(
          locale === "en"
            ? "Could not read the job posting from that URL. Please paste the job description manually or try a different public job link."
            : "Không đọc được nội dung job từ URL này. Vui lòng dán mô tả công việc thủ công hoặc thử một link public khác.",
        );
      }
    }

    if (!jd || jd.length < 20) {
      throw new Error(
        locale === "en"
          ? "Insufficient job information for accurate evaluation. Please provide a more detailed job description."
          : "Thông tin job chưa đủ để đánh giá chính xác. Vui lòng cung cấp mô tả công việc chi tiết hơn.",
      );
    }

    if (!LLM_API_KEY) {
      throw new Error(
        locale === "en"
          ? "OPENROUTER_API_KEY is not configured"
          : "Chưa cấu hình OPENROUTER_API_KEY",
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${LLM_API_KEY}`,
      "Content-Type": "application/json",
    };
    if (LLM_SITE_URL) {
      headers["HTTP-Referer"] = LLM_SITE_URL;
    }
    if (LLM_SITE_NAME) {
      headers["X-OpenRouter-Title"] = LLM_SITE_NAME;
    }

    const res = await fetch(getChatCompletionsUrl(LLM_ENDPOINT), {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: "system", content: messages.system },
          {
            role: "user",
            content: `${messages.userPrefix}

=== CV ===
${data.cvText.slice(0, 25000)}

=== JOB DESCRIPTION ===
${jd}`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (res.status === 429) {
      throw new Error(
        locale === "en"
          ? "Rate limit exceeded. Please try again in a moment."
          : "Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau ít phút.",
      );
    }
    if (res.status === 402) {
      throw new Error(
        locale === "en"
          ? "AI credits exhausted. Please add credits in your workspace settings."
          : "Hết tín dụng AI. Vui lòng nạp thêm credits trong workspace settings.",
      );
    }
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error(
        locale === "en"
          ? `AI analysis failed (${res.status}). ${t.slice(0, 300)}`
          : `Phân tích AI thất bại (${res.status}). ${t.slice(0, 300)}`,
      );
    }

    const payload = (await res.json()) as {
      choices?: {
        message?: {
          content?: string | null;
          tool_calls?: { function?: { arguments?: string } }[];
        };
      }[];
    };
    const message = payload.choices?.[0]?.message;
    const args =
      message?.tool_calls?.[0]?.function?.arguments ??
      (typeof message?.content === "string" ? message.content : undefined);
    if (!args) {
      throw new Error(
        locale === "en"
          ? "AI did not return a valid analysis."
          : "AI không trả về kết quả phân tích hợp lệ.",
      );
    }

    let parsed: AnalysisResult;
    try {
      const cleaned = args
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "");
      parsed = JSON.parse(cleaned) as AnalysisResult;
    } catch {
      throw new Error(
        locale === "en"
          ? "AI returned malformed analysis JSON."
          : "AI trả về JSON phân tích không hợp lệ.",
      );
    }

    if (parsed.scoreBreakdown) {
      const b = parsed.scoreBreakdown;
      const weightedScore = Math.floor(
        (b.skillsMatch ?? 0) * FIT_SCORE_WEIGHTS.skillsMatch +
          (b.experienceMatch ?? 0) * FIT_SCORE_WEIGHTS.experienceMatch +
          (b.educationMatch ?? 0) * FIT_SCORE_WEIGHTS.educationMatch +
          (b.certificates ?? 0) * FIT_SCORE_WEIGHTS.certificates +
          (b.languageMatch ?? 0) * FIT_SCORE_WEIGHTS.languageMatch +
          (b.locationMatch ?? 0) * FIT_SCORE_WEIGHTS.locationMatch +
          (b.industryMatch ?? 0) * FIT_SCORE_WEIGHTS.industryMatch +
          (b.achievements ?? 0) * FIT_SCORE_WEIGHTS.achievements,
      );
      parsed.fitScore = Math.max(0, Math.min(100, weightedScore));
    }

    const s = parsed.fitScore;
    parsed.recommendation =
      s >= 80 ? "Apply Now" : s >= 60 ? "Apply After Improvement" : "Learn First";

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
