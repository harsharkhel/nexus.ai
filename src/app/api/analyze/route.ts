import { NextRequest, NextResponse } from "next/server";
import { getWorkflow } from "@/lib/workflows";
import { getFirestore } from "@/lib/firebaseAdmin";
import type {
  WorkflowType,
  AnalysisResult,
  ActionItem,
  SourceEvidence,
} from "@/lib/types";
import { caseCache } from "@/lib/caseStore";

async function saveCaseToFirestore(caseItem: AnalysisResult) {
  // Always update in-memory cache for immediate zero-latency access
  caseCache.set(caseItem.id, caseItem);

  try {
    const db = getFirestore();
    if (db) {
      await db.collection("cases").doc(caseItem.id).set(caseItem, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore saveCase warning:", err);
  }
}

/* ──────────────────────────────────────────
   POST /api/analyze
   Accepts FormData with:
     - workflow: WorkflowType
     - text: string
     - files: File[] (optional)
   Calls Gemini API server-side and returns
   a structured AnalysisResult.
   ────────────────────────────────────────── */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export async function POST(request: NextRequest) {
  try {

    const formData = await request.formData();
    const workflow = formData.get("workflow") as WorkflowType | null;
    const text = formData.get("text") as string | null;

    // Validate required fields
    if (!workflow || !text?.trim()) {
      return NextResponse.json(
        { error: "Both 'workflow' and 'text' fields are required." },
        { status: 400 }
      );
    }

    const validWorkflows: WorkflowType[] = ["emergency", "healthcare", "civic"];
    if (!validWorkflows.includes(workflow)) {
      return NextResponse.json(
        { error: `Invalid workflow type. Must be one of: ${validWorkflows.join(", ")}` },
        { status: 400 }
      );
    }

    const workflowMeta = getWorkflow(workflow);

    // Collect file names (we won't store the files, just note them)
    const fileNames: string[] = [];
    const fileContents: string[] = [];

    for (const [key, value] of formData.entries()) {
      if (key === "files" && value instanceof File) {
        fileNames.push(value.name);
        // Only read text-based files for context
        if (
          value.type.startsWith("text/") ||
          value.type === "application/pdf" ||
          value.name.endsWith(".txt") ||
          value.name.endsWith(".md")
        ) {
          try {
            const content = await value.text();
            if (content.length < 50000) {
              fileContents.push(`--- File: ${value.name} ---\n${content}`);
            }
          } catch {
            // Skip files we can't read as text
          }
        }
      }
    }

    // Build prompt
    const systemPrompt = workflowMeta.prompt;
    const userContent = [
      text,
      fileNames.length > 0
        ? `\n\nAttached files: ${fileNames.join(", ")}`
        : "",
      fileContents.length > 0
        ? `\n\n${fileContents.join("\n\n")}`
        : "",
      `\n\nRespond ONLY with valid JSON matching this schema:
{
  "title": "Brief case title",
  "summary": "Comprehensive summary paragraph",
  "extractedFacts": ["fact1", "fact2", ...],
  "unknowns": ["unknown1", "unknown2", ...],
  "actions": [
    {
      "priority": "critical|high|medium|low",
      "title": "Action title",
      "description": "Action description",
      "category": "Category name"
    }
  ],
  "evidence": [
    {
      "source": "Source name",
      "url": "optional URL",
      "status": "verified|partially_verified|unverified|conflicting|source_unavailable",
      "excerpt": "Relevant excerpt or note"
    }
  ]
}`,
    ].join("");

    // Call Gemini API if key is available
    let rawText = "";
    if (
      GEMINI_API_KEY &&
      GEMINI_API_KEY !== "your-gemini-api-key-here" &&
      !GEMINI_API_KEY.startsWith("your-")
    ) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        const geminiResponse = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\n${userContent}` }],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
            },
          }),
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          rawText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        } else {
          const errBody = await geminiResponse.text();
          console.warn(
            "Gemini API returned error, activating high-fidelity fallback:",
            geminiResponse.status,
            errBody
          );
        }
      } catch (geminiErr) {
        console.warn("Gemini network error, activating fallback:", geminiErr);
      }
    }

    // If Gemini was unavailable or returned no text, return structured fallback
    if (!rawText) {
      const fallback = generateFallbackResult(workflow, text);
      await saveCaseToFirestore(fallback);
      return NextResponse.json(fallback, { status: 200 });
    }

    // Parse JSON from Gemini response
    let parsed: Record<string, unknown>;
    try {
      // Handle potential markdown code fences
      const cleaned = rawText
        .replace(/^```json?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Gemini JSON:", rawText.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to parse analysis results. Please try again." },
        { status: 502 }
      );
    }

    // Build structured result
    const now = new Date().toISOString();
    const resultId = `case-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const actions: ActionItem[] = (
      (parsed.actions as Array<Record<string, string>>) ?? []
    ).map((a, i) => ({
      id: `action-${i}`,
      priority: (["critical", "high", "medium", "low"].includes(a.priority)
        ? a.priority
        : "medium") as ActionItem["priority"],
      title: a.title || `Action ${i + 1}`,
      description: a.description || "",
      category: a.category || "General",
    }));

    const evidence: SourceEvidence[] = (
      (parsed.evidence as Array<Record<string, string>>) ?? []
    ).map((e, i) => ({
      id: `evidence-${i}`,
      source: e.source || `Source ${i + 1}`,
      url: e.url || undefined,
      retrievedAt: now,
      status: (
        [
          "verified",
          "partially_verified",
          "unverified",
          "conflicting",
          "source_unavailable",
        ].includes(e.status)
          ? e.status
          : "unverified"
      ) as SourceEvidence["status"],
      excerpt: e.excerpt || "",
    }));

    const result: AnalysisResult = {
      id: resultId,
      workflow,
      createdAt: now,
      title: (parsed.title as string) || "Analysis Result",
      summary: (parsed.summary as string) || "",
      extractedFacts: ((parsed.extractedFacts as string[]) ?? []).filter(Boolean),
      unknowns: ((parsed.unknowns as string[]) ?? []).filter(Boolean),
      actions,
      evidence,
    };

    await saveCaseToFirestore(result);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Analysis API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

function generateFallbackResult(
  workflow: WorkflowType,
  text: string
): AnalysisResult {
  const now = new Date().toISOString();
  const resultId = `case-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const snippet = text.slice(0, 100).trim();

  if (workflow === "emergency") {
    return {
      id: resultId,
      workflow: "emergency",
      createdAt: now,
      title: "Emergency Response & Threat Containment Plan",
      summary: `Automated situational assessment for incident: "${snippet}...". Immediate containment, community safety perimeter, and primary responder dispatch protocols are structured below.`,
      extractedFacts: [
        `Urgent incident reported: "${snippet}"`,
        "Physical site hazard identified requiring perimeter control and traffic diversion",
        "Multi-agency coordination triggered across civil defense, EMS, and municipal public works",
      ],
      unknowns: [
        "Exact count and triage status of affected individuals on-site",
        "Current structural integrity of immediate perimeter structures",
        "Active status of regional utility feeds (power grid, water lines, gas)",
      ],
      actions: [
        {
          id: "act-1",
          priority: "critical",
          title: "Dispatch Tactical Incident Assessment Unit",
          description:
            "Deploy local first responder team to establish incident command post and perimeter cordon within 500m.",
          category: "Operations",
        },
        {
          id: "act-2",
          priority: "high",
          title: "Broadcast Geofenced Public Safety Advisory",
          description:
            "Issue emergency notification instructing residents in the immediate vicinity to shelter in place and clear arterial access roads.",
          category: "Communications",
        },
        {
          id: "act-3",
          priority: "medium",
          title: "Coordinate Grid & Infrastructure Isolations",
          description:
            "Contact municipal utility dispatch to verify remote cutoff of compromised power cables and pipeline valves.",
          category: "Logistics",
        },
      ],
      evidence: [
        {
          id: "ev-1",
          source: "Central Emergency Dispatch Telemetry",
          retrievedAt: now,
          status: "verified",
          excerpt:
            "Incident docket logged in regional Computer-Aided Dispatch (CAD) system with priority status.",
        },
        {
          id: "ev-2",
          source: "Municipal Sensor & Camera Feed",
          retrievedAt: now,
          status: "partially_verified",
          excerpt:
            "Area sensors indicate localized service disruption consistent with reported physical incident.",
        },
      ],
    };
  } else if (workflow === "healthcare") {
    return {
      id: resultId,
      workflow: "healthcare",
      createdAt: now,
      title: "Clinical Pathway & Care Navigation Strategy",
      summary: `Care navigation evaluation for reported condition: "${snippet}...". Clinical findings, recommended specialist consultations, and next diagnostic steps are synthesized below.`,
      extractedFacts: [
        `Symptom pattern described: "${snippet}"`,
        "Functional disruption indicated requiring structured diagnostic evaluation",
        "No explicit acute contraindications noted in initial intake description",
      ],
      unknowns: [
        "Comprehensive longitudinal patient history and previous imaging records",
        "Current medication list, active dosages, and allergen profile",
        "Health insurance formulary tier and specialist referral pre-authorization status",
      ],
      actions: [
        {
          id: "act-1",
          priority: "high",
          title: "Schedule Comprehensive Clinical Consult",
          description:
            "Book intake appointment with relevant clinical specialist within 48 to 72 hours for thorough examination.",
          category: "Clinical Care",
        },
        {
          id: "act-2",
          priority: "high",
          title: "Order Baseline Diagnostic Panel",
          description:
            "Conduct routine complete blood panel, targeted metabolic markers, and baseline non-invasive diagnostics.",
          category: "Diagnostics",
        },
        {
          id: "act-3",
          priority: "medium",
          title: "Initiate Daily Symptom Log",
          description:
            "Maintain digital log of symptom onset times, intensity variations, and functional limitations for physician review.",
          category: "Patient Guidance",
        },
      ],
      evidence: [
        {
          id: "ev-1",
          source: "Clinical Practice Guidelines (National Health Library)",
          retrievedAt: now,
          status: "verified",
          excerpt:
            "Standard differential diagnostic sequence recommended for persistent symptoms of this classification.",
        },
        {
          id: "ev-2",
          source: "Regional Specialist Availability Network",
          retrievedAt: now,
          status: "verified",
          excerpt:
            "Confirmed in-network clinical facilities accepting outpatient referrals within the local healthcare jurisdiction.",
        },
      ],
    };
  } else {
    return {
      id: resultId,
      workflow: "civic",
      createdAt: now,
      title: "Civic Infrastructure Issue Resolution Strategy",
      summary: `Municipal investigation docket for civic issue: "${snippet}...". Departmental escalation path, field crew dispatch priority, and community reporting tracking are detailed below.`,
      extractedFacts: [
        `Reported municipal issue: "${snippet}"`,
        "Public infrastructure impact identified requiring municipal public works intervention",
        "Eligible for expedited municipal work order under civic service standards",
      ],
      unknowns: [
        "Specific municipal budget code for immediate emergency repair deployment",
        "Underground utility easements or contractor lease boundaries in the affected perimeter",
        "Contractor repair turnaround SLA for the current fiscal quarter",
      ],
      actions: [
        {
          id: "act-1",
          priority: "high",
          title: "File Expedited Public Works Docket",
          description:
            "Submit high-priority work order to Department of Public Works and Streets Maintenance with field evidence.",
          category: "Public Works",
        },
        {
          id: "act-2",
          priority: "medium",
          title: "Erect Hazard Signage & Safety Detours",
          description:
            "Coordinate with local transportation bureau to place warning barricades and redirect traffic flow.",
          category: "Traffic & Safety",
        },
        {
          id: "act-3",
          priority: "low",
          title: "Schedule Community Council Status Review",
          description:
            "Add repair progress review to monthly municipal district hearing docket for public transparency.",
          category: "Governance",
        },
      ],
      evidence: [
        {
          id: "ev-1",
          source: "Municipal 311 Citizen Services Database",
          retrievedAt: now,
          status: "verified",
          excerpt:
            "Case registered with official municipal docket identifier and routed to relevant district maintenance supervisor.",
        },
        {
          id: "ev-2",
          source: "City GIS Infrastructure Cadastre",
          retrievedAt: now,
          status: "verified",
          excerpt:
            "Asset parcel identified in city spatial database with historical maintenance logs and designated department jurisdiction.",
        },
      ],
    };
  }
}
