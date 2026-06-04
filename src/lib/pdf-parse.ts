let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function loadPdfJs() {
  if (typeof window === "undefined") {
    throw new Error("PDF extraction is only supported in the browser.");
  }

  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist");
  }

  const pdfjsLib = await pdfjsPromise;
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjsLib;
}

type PdfTextItem = {
  str: string;
  transform: [number, number, number, number, number, number] | number[];
  width?: number;
  hasEOL?: boolean;
};

type RawPdfTextItem = {
  str: unknown;
  transform?: unknown;
  width?: unknown;
  hasEOL?: unknown;
};

function normalizeLine(text: string) {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isPunctuationLike(text: string) {
  return /^[,.;:!?)]/.test(text);
}

function estimateItemWidth(item: PdfTextItem) {
  if (typeof item.width === "number" && Number.isFinite(item.width) && item.width > 0) {
    return item.width;
  }

  const fontSize = Math.abs(item.transform?.[0] ?? 0);
  return Math.max(fontSize * Math.max(item.str.length, 1) * 0.45, 0);
}

function extractLineText(items: PdfTextItem[]) {
  const sorted = [...items].sort(
    (a, b) => a.transform[4] - b.transform[4] || a.str.localeCompare(b.str),
  );
  let text = "";
  let prevEnd = Number.NEGATIVE_INFINITY;

  for (const item of sorted) {
    const segment = item.str.trim();
    if (!segment) continue;

    const start = item.transform[4];
    const gap = start - prevEnd;
    const needsSpace =
      text.length > 0 &&
      !text.endsWith(" ") &&
      !text.endsWith("-") &&
      !isPunctuationLike(segment) &&
      gap > Math.max(1.5, estimateItemWidth(item) * 0.15);

    if (needsSpace) {
      text += " ";
    }

    text += segment;
    prevEnd = Math.max(prevEnd, start + estimateItemWidth(item));
  }

  return normalizeLine(text);
}

function mergeHyphenatedLines(lines: string[]) {
  const merged: string[] = [];

  for (const line of lines) {
    const current = line.trim();
    if (!current) continue;

    if (merged.length > 0) {
      const prev = merged[merged.length - 1];
      const shouldJoin =
        prev.endsWith("-") && current.length > 0 && /^[a-z]/.test(current);

      if (shouldJoin) {
        merged[merged.length - 1] = prev.slice(0, -1) + current;
        continue;
      }
    }

    merged.push(current);
  }

  return merged;
}

async function extractPageText(page: any) {
  const content = await page.getTextContent({
    normalizeWhitespace: true,
    disableCombineTextItems: false,
  });

  const items = (content.items as RawPdfTextItem[])
    .filter((item) => Boolean(item && typeof item === "object" && "str" in item))
    .map((item: RawPdfTextItem) => ({
      str: String(item.str ?? ""),
      transform: Array.isArray(item.transform) ? item.transform : [0, 0, 0, 0, 0, 0],
      width: typeof item.width === "number" ? item.width : undefined,
      hasEOL: Boolean(item.hasEOL),
    }))
    .filter((item) => item.str.trim().length > 0);

  if (items.length === 0) {
    return "";
  }

  const sorted = [...items].sort((a, b) => {
    const ay = a.transform[5] ?? 0;
    const by = b.transform[5] ?? 0;
    if (Math.abs(by - ay) > 2) return by - ay;
    return (a.transform[4] ?? 0) - (b.transform[4] ?? 0);
  });

  const lines: PdfTextItem[][] = [];
  let currentLine: PdfTextItem[] = [];
  let baselineY: number | null = null;

  for (const item of sorted) {
    const y = item.transform[5] ?? 0;

    if (baselineY === null || Math.abs(y - baselineY) <= 2) {
      currentLine.push(item);
      baselineY = baselineY === null ? y : (baselineY + y) / 2;
      continue;
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    currentLine = [item];
    baselineY = y;
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  const textLines = lines.map(extractLineText).filter(Boolean);
  return mergeHyphenatedLines(textLines).join("\n").trim();
}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await loadPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const pageText = await extractPageText(page);
    if (pageText) {
      text += pageText + "\n\n";
    }
  }
  return normalizeLine(text);
}
