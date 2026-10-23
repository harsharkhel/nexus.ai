/* ──────────────────────────────────────────
   Shared types for NEXUS AI
   ────────────────────────────────────────── */

export type WorkflowType = "emergency" | "healthcare" | "civic";

export interface AnalysisRequest {
  workflow: WorkflowType;
  text: string;
  /** File names (actual files sent as FormData) */
  fileNames?: string[];
}

export interface SourceEvidence {
  id: string;
  source: string;
  url?: string;
  retrievedAt: string;
  status: "verified" | "partially_verified" | "unverified" | "conflicting" | "source_unavailable";
  excerpt: string;
}

export interface ActionItem {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  category: string;
}

export interface AnalysisResult {
  id: string;
  workflow: WorkflowType;
  createdAt: string;
  title: string;
  summary: string;
  extractedFacts: string[];
  unknowns: string[];
  actions: ActionItem[];
  evidence: SourceEvidence[];
}

export interface CaseRecord {
  id: string;
  workflow: WorkflowType;
  title: string;
  createdAt: string;
  status: "completed" | "in_progress" | "error";
}
