/* ──────────────────────────────────────────
   Workflow metadata — labels, descriptions, icons
   ────────────────────────────────────────── */

import type { WorkflowType } from "./types";

export interface WorkflowMeta {
  id: WorkflowType;
  title: string;
  shortTitle: string;
  description: string;
  tag: string;
  tagColor: "green" | "orange";
  prompt: string;
}

export const workflows: WorkflowMeta[] = [
  {
    id: "emergency",
    title: "Emergency Intelligence",
    shortTitle: "Emergency",
    description:
      "Analyze disaster reports, field communications, and situational data to extract actionable intelligence for rapid response coordination.",
    tag: "Urgent response",
    tagColor: "orange",
    prompt:
      "You are an emergency intelligence analyst. Analyze the following information and extract: 1) A structured summary 2) Key facts and verified data points 3) Unknown or unconfirmed information 4) Prioritized action items with urgency levels 5) Source evidence with verification status. Be thorough but concise. Flag any conflicting information.",
  },
  {
    id: "healthcare",
    title: "Healthcare Navigator",
    shortTitle: "Healthcare",
    description:
      "Parse medical documentation, insurance policies, and treatment options to help patients navigate complex healthcare decisions with clarity.",
    tag: "Patient empowerment",
    tagColor: "green",
    prompt:
      "You are a healthcare navigation assistant. Analyze the following information and provide: 1) A clear summary in plain language 2) Key facts extracted from the documentation 3) Information gaps or unknowns 4) Recommended next steps prioritized by importance 5) Source references with verification notes. Never provide medical diagnoses. Focus on helping users understand and navigate the healthcare system.",
  },
  {
    id: "civic",
    title: "Civic Issue Resolver",
    shortTitle: "Civic",
    description:
      "Break down policy documents, community reports, and regulatory information into clear, actionable guidance for civic engagement.",
    tag: "Community impact",
    tagColor: "green",
    prompt:
      "You are a civic engagement analyst. Analyze the following information and provide: 1) A structured summary of the civic issue 2) Key facts and relevant regulations or policies 3) Unknown factors or pending decisions 4) Actionable steps citizens can take, prioritized by impact 5) Source evidence with verification status. Focus on empowering informed civic participation.",
  },
];

export function getWorkflow(id: WorkflowType): WorkflowMeta {
  return workflows.find((w) => w.id === id) ?? workflows[0];
}
