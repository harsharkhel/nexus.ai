import type { AnalysisResult } from "./types";

declare global {
  var __nexusCasesCache: Map<string, AnalysisResult> | undefined;
}

if (!global.__nexusCasesCache) {
  global.__nexusCasesCache = new Map<string, AnalysisResult>();
}

export const caseCache = global.__nexusCasesCache;
