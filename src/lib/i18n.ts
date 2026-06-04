export type Locale = "vi" | "en";

export const SUPPORTED_LOCALES: Locale[] = ["vi", "en"];

export function normalizeLocale(value?: string | null): Locale {
  return value === "en" ? "en" : "vi";
}

export function getLocaleLabel(locale: Locale) {
  return locale === "vi" ? "Tiếng Việt" : "English";
}

export function getRecommendationLabel(locale: Locale, value: "Apply Now" | "Apply After Improvement" | "Learn First") {
  if (locale === "en") return value;
  switch (value) {
    case "Apply Now":
      return "Nộp ngay";
    case "Apply After Improvement":
      return "Cải thiện rồi nộp";
    case "Learn First":
      return "Nên học thêm";
  }
}

export function getLocaleCopy(locale: Locale) {
  const vi = {
    app: {
      brand: "Learning OS · Career Coach",
      title: "CareerFit AI",
      subtitle:
        "Học trước khi ứng tuyển. So khớp CV với bất kỳ job nào, xem điểm phù hợp và nhận lộ trình để lấp khoảng trống.",
      footer:
        "CareerFit AI là công cụ định hướng học tập, không phải nhà tuyển dụng. Hãy luôn đối chiếu gợi ý AI với mentor và mô tả công việc thực tế.",
      analysisComplete: "Phân tích hoàn tất",
    },
    input: {
      yourCv: "CV của bạn",
      uploadCv: "Tải lên CV (PDF)",
      dragDrop: "Kéo thả thoải mái · văn bản được trích xuất ngay trong trình duyệt",
      extracting: "Đang trích xuất văn bản...",
      pasteManually: "Hoặc dán nội dung CV thủ công",
      cvPlaceholder: "Dán nội dung CV của bạn ở đây…",
      targetJob: "Công việc mục tiêu",
      pasteJd: "Dán JD",
      fromUrl: "Từ URL",
      jdPlaceholder: "Dán toàn bộ mô tả công việc…",
      urlPlaceholder: "https://company.com/jobs/123",
      urlHint: "Hệ thống sẽ tự đọc và làm sạch nội dung bài đăng.",
      analyze: "Phân tích mức phù hợp",
      analyzing: "Đang phân tích…",
      cvTooShort: "Nội dung CV quá ngắn — vui lòng tải PDF lên hoặc dán CV.",
      pasteMoreJd: "Vui lòng dán mô tả công việc chi tiết hơn.",
      pasteUrl: "Vui lòng dán URL bài đăng tuyển dụng.",
      uploadPdf: "Vui lòng tải lên file PDF",
      extractionFailed:
        "Không trích xuất được nội dung CV với độ tin cậy cao. Vui lòng dùng bản PDF rõ hơn hoặc dán CV bằng tay.",
      extracted: (count: number) => `Đã trích xuất ${count.toLocaleString()} ký tự`,
    },
    results: {
      emptyTitle: "Kết quả phân tích sẽ hiển thị ở đây",
      emptyDesc:
        "Tải CV và mô tả công việc ở bên trái, sau đó chạy phân tích để xem điểm phù hợp, các kỹ năng thiếu và lộ trình học.",
      errorTitle: "Phân tích thất bại",
      scoreTitle: "Điểm phù hợp",
      scoreDesc: "Dựa trên kỹ năng, kinh nghiệm và bằng chứng trong CV của bạn.",
      whyScore: "Vì sao ra điểm này",
      breakdownHow: "Cách đọc phần chấm điểm",
      breakdownNote:
        "Các tiêu chí dưới 60 được xem là yếu. Model được yêu cầu chấm thận trọng và chỉ cho điểm cao khi CV chứng minh rõ ràng.",
      matchedSkills: "Kỹ năng khớp",
      missingSkills: "Kỹ năng còn thiếu",
      weakEvidence: "Bằng chứng yếu",
      weakEvidenceHint:
        "Mục này có trong CV nhưng thiếu dự án, số liệu hoặc bối cảnh cụ thể.",
      learningRoadmap: "Lộ trình học",
      roadmapEmpty: "Bạn đã sẵn sàng — không cần lộ trình thêm.",
      courseLink: "Link khóa học",
      cvSuggestions: "Gợi ý cải thiện CV",
      cvSuggestionsEmpty: "CV của bạn nhìn khá ổn cho vị trí này.",
      howToReadTitle: "Cách hiểu kết quả",
      howToReadBody:
        "Mỗi tiêu chí được chấm riêng theo trọng số. Điểm dưới 60 sẽ kéo điểm tổng xuống mạnh.",
      scoreStatus: {
        strong: "Phù hợp mạnh",
        partial: "Phù hợp một phần",
        weak: "Phù hợp yếu",
        notScored: "Chưa chấm",
      },
      criteria: {
        skillsMatch: {
          label: "Kỹ năng",
          hint: "Công nghệ, công cụ và kỹ năng cốt lõi",
          weight: "35%",
        },
        experienceMatch: {
          label: "Kinh nghiệm",
          hint: "Số năm, cấp độ và kinh nghiệm đúng lĩnh vực",
          weight: "25%",
        },
        educationMatch: {
          label: "Học vấn",
          hint: "Bằng cấp, chuyên ngành và nền tảng học thuật",
          weight: "10%",
        },
        certificates: {
          label: "Chứng chỉ",
          hint: "Chứng chỉ và khóa học liên quan",
          weight: "7%",
        },
        languageMatch: {
          label: "Ngôn ngữ",
          hint: "Yêu cầu tiếng Anh hoặc ngôn ngữ khác trong JD",
          weight: "8%",
        },
        locationMatch: {
          label: "Địa điểm",
          hint: "Phù hợp remote, hybrid hay onsite",
          weight: "5%",
        },
        industryMatch: {
          label: "Ngành nghề",
          hint: "Kinh nghiệm trong đúng lĩnh vực hoặc domain",
          weight: "5%",
        },
        achievements: {
          label: "Thành tích & dự án",
          hint: "Kết quả, số liệu và dự án liên quan",
          weight: "5%",
        },
      },
      recommendation: {
        "Apply Now": "Nộp ngay",
        "Apply After Improvement": "Cải thiện rồi nộp",
        "Learn First": "Nên học thêm",
      } as const,
    },
  };

  const en = {
    app: {
      brand: "Learning OS · Career Coach",
      title: "CareerFit AI",
      subtitle:
        "Learn before you apply. Match your CV against any job, see your fit score, and get a roadmap to close the gaps.",
      footer:
        "CareerFit AI is a learning coach, not a recruiter. Always verify AI suggestions against real mentors and job postings.",
      analysisComplete: "Analysis complete",
    },
    input: {
      yourCv: "Your CV",
      uploadCv: "Upload CV (PDF)",
      dragDrop: "Drag-free upload · text extracted in your browser",
      extracting: "Extracting text…",
      pasteManually: "Or paste CV text manually",
      cvPlaceholder: "Paste your CV content here…",
      targetJob: "Target Job",
      pasteJd: "Paste JD",
      fromUrl: "From URL",
      jdPlaceholder: "Paste the full job description…",
      urlPlaceholder: "https://company.com/jobs/123",
      urlHint: "We’ll fetch and clean the posting automatically.",
      analyze: "Analyze fit",
      analyzing: "Analyzing…",
      cvTooShort: "CV text is too short — please upload a PDF or paste your CV.",
      pasteMoreJd: "Please paste a more detailed job description.",
      pasteUrl: "Please paste a job posting URL.",
      uploadPdf: "Please upload a PDF file",
      extractionFailed:
        "Unable to extract CV content with high confidence. Please upload a clearer PDF or paste CV text manually.",
      extracted: (count: number) => `Extracted ${count.toLocaleString()} characters`,
    },
    results: {
      emptyTitle: "Your analysis appears here",
      emptyDesc:
        "Upload your CV and a job description on the left, then run the analysis to see your fit score, missing skills, and a learning roadmap.",
      errorTitle: "Analysis failed",
      scoreTitle: "Fit Score",
      scoreDesc: "Based on skills, experience, and evidence in your CV.",
      whyScore: "Why this score",
      breakdownHow: "How to read this",
      breakdownNote:
        "Scores below 60 are treated as weak evidence. The model is expected to be conservative and only give high scores when the CV clearly proves the requirement.",
      matchedSkills: "Matched skills",
      missingSkills: "Missing skills",
      weakEvidence: "Weak evidence",
      weakEvidenceHint:
        "These appear on your CV but lack concrete projects, metrics, or context.",
      learningRoadmap: "Learning roadmap",
      roadmapEmpty: "You're ready — no roadmap needed.",
      courseLink: "Course link",
      cvSuggestions: "CV improvement suggestions",
      cvSuggestionsEmpty: "Your CV looks solid for this role.",
      howToReadTitle: "How to read this",
      howToReadBody:
        "Each criterion is scored separately using the weighted rubric. Scores below 60 drag the final score down strongly.",
      scoreStatus: {
        strong: "Strong fit",
        partial: "Partial fit",
        weak: "Weak fit",
        notScored: "Not scored",
      },
      criteria: {
        skillsMatch: {
          label: "Skills Match",
          hint: "Core technologies, tools, and required skills",
          weight: "35%",
        },
        experienceMatch: {
          label: "Experience Match",
          hint: "Years, seniority, and directly relevant work experience",
          weight: "25%",
        },
        educationMatch: {
          label: "Education Match",
          hint: "Degree, major, and academic background fit",
          weight: "10%",
        },
        certificates: {
          label: "Certificates",
          hint: "Relevant certifications and training evidence",
          weight: "7%",
        },
        languageMatch: {
          label: "Language Match",
          hint: "English or other language requirements in the JD",
          weight: "8%",
        },
        locationMatch: {
          label: "Location Match",
          hint: "Work location, remote, hybrid, or on-site fit",
          weight: "5%",
        },
        industryMatch: {
          label: "Industry Match",
          hint: "Domain or sector experience relevant to the role",
          weight: "5%",
        },
        achievements: {
          label: "Achievements & Projects",
          hint: "Impact, metrics, and relevant project evidence",
          weight: "5%",
        },
      },
      recommendation: {
        "Apply Now": "Apply Now",
        "Apply After Improvement": "Apply After Improvement",
        "Learn First": "Learn First",
      } as const,
    },
  };

  return locale === "en" ? en : vi;
}

export type LocaleCopy = ReturnType<typeof getLocaleCopy>;
