import { NextRequest, NextResponse } from "next/server";
import { getFirestore, type QueryDocumentSnapshot } from "@/lib/firebaseAdmin";
import type { AnalysisResult } from "@/lib/types";
import { caseCache } from "@/lib/caseStore";

// Pre-seeded cases so dashboard is never empty on first launch
const SEED_CASES: AnalysisResult[] = [
  {
    id: "case-emergency-seed-01",
    workflow: "emergency",
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    title: "Regional Flash Flood Alert & Low-Lying Bridge Breach",
    summary:
      "Rapid water level surge along Riverdale Basin resulted in structural compromise of the lower bridge and localized vehicle stranding. Coordinated emergency evacuation and road cordons deployed.",
    extractedFacts: [
      "River level exceeded flood threshold by 1.8 meters within 45 minutes",
      "Two passenger vehicles immobilized on the northern approach span",
      "Perimeter road power grid de-energized to prevent submerged line arcing",
    ],
    unknowns: [
      "Current structural load capacity of the central bridge support pillars",
      "Hydrostatic pressure against downstream retaining levee walls",
    ],
    actions: [
      {
        id: "act-1",
        priority: "critical",
        title: "Deploy Aquatic Search & Rescue Unit",
        description: "Dispatch Zodiac inflatable crafts to secure occupants of trapped vehicles.",
        category: "Rescue",
      },
      {
        id: "act-2",
        priority: "high",
        title: "Broadcast Geofenced Evacuation Warning",
        description: "Send emergency alert to all cellular devices within 2km downstream perimeter.",
        category: "Communications",
      },
    ],
    evidence: [
      {
        id: "ev-1",
        source: "USGS Streamflow Sensor #01438000",
        retrievedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        status: "verified",
        excerpt: "Discharge spiked to 8,200 cfs, exceeding 25-year flood recurrence interval.",
      },
      {
        id: "ev-2",
        source: "County Emergency Operations Center CAD Feed",
        retrievedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        status: "verified",
        excerpt: "First response units on scene confirmed vehicular containment.",
      },
    ],
  },
  {
    id: "case-healthcare-seed-02",
    workflow: "healthcare",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    title: "Acute Pediatric Respiratory Distress Triage",
    summary:
      "Triage evaluation for 6-year-old presenting with acute inspiratory stridor, subcostal retractions, and low oxygen saturation following sudden onset symptoms.",
    extractedFacts: [
      "Patient displays audible stridor at rest and intercostal retractions",
      "Pulse oximetry shows SpO2 of 92% on room air",
      "No known history of reactive airway disease or food allergies",
    ],
    unknowns: [
      "Prior exposure to viral pathogens in preschool cohort",
      "Immunization currency for Haemophilus influenzae type b (Hib)",
    ],
    actions: [
      {
        id: "act-1",
        priority: "critical",
        title: "Administer Nebulized Epinephrine & Supplemental O2",
        description: "Deliver humidified oxygen blow-by and racemic epinephrine under clinical supervision.",
        category: "Clinical Care",
      },
      {
        id: "act-2",
        priority: "high",
        title: "Prepare Pediatric Intensive Care Transfer",
        description: "Alert regional pediatric hospital transport team for expedited transfer.",
        category: "Logistics",
      },
    ],
    evidence: [
      {
        id: "ev-1",
        source: "Emergency Medicine Clinical Practice Guideline",
        retrievedAt: new Date(Date.now() - 1000 * 60 * 175).toISOString(),
        status: "verified",
        excerpt: "Recommended clinical protocol for severe croup/epiglottitis differential.",
      },
    ],
  },
  {
    id: "case-civic-seed-03",
    workflow: "civic",
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    title: "Main Street Municipal Water Pipe Rupture",
    summary:
      "Catastrophic subterranean water main rupture causing severe pavement buckling, loss of municipal drinking water pressure, and localized flooding in commercial district.",
    extractedFacts: [
      "16-inch cast iron main fractured under 4th & Main Street intersection",
      "Roadway surface destabilized across two primary traffic lanes",
      "Water pressure dropped below 20 PSI in five adjacent blocks",
    ],
    unknowns: [
      "Potential contamination ingress into potable water loop requiring boil water advisory",
      "Structural undermine depth beneath adjacent historic brick building foundations",
    ],
    actions: [
      {
        id: "act-1",
        priority: "high",
        title: "Isolate Section Isolation Gate Valves",
        description: "Crew dispatched to manually turn valves 4A and 4B to halt municipal main loss.",
        category: "Public Works",
      },
      {
        id: "act-2",
        priority: "medium",
        title: "Issue Precautionary Boil Water Notice",
        description: "Release advisory to 34 commercial and residential properties in sector.",
        category: "Health & Safety",
      },
    ],
    evidence: [
      {
        id: "ev-1",
        source: "Municipal SCADA Water Pressure Telemetry",
        retrievedAt: new Date(Date.now() - 1000 * 60 * 350).toISOString(),
        status: "verified",
        excerpt: "Pressure transient recorded at 08:14 AM followed by abrupt pressure depletion.",
      },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const db = getFirestore();

    if (id) {
      // 1. Check in-memory cache first
      if (caseCache.has(id)) {
        return NextResponse.json(caseCache.get(id), { status: 200 });
      }

      // 2. Query Firestore
      if (db) {
        try {
          const doc = await db.collection("cases").doc(id).get();
          if (doc.exists) {
            return NextResponse.json(doc.data(), { status: 200 });
          }
        } catch (dbErr) {
          console.warn("Firestore fetch case error:", dbErr);
        }
      }

      // 3. Check seed cases fallback
      const found = SEED_CASES.find((c) => c.id === id);
      if (found) {
        return NextResponse.json(found, { status: 200 });
      }

      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // List all cases: gather from cache, Firestore, and seeds
    const cachedList = Array.from(caseCache.values());
    let firestoreList: AnalysisResult[] = [];

    if (db) {
      try {
        const snap = await db
          .collection("cases")
          .orderBy("createdAt", "desc")
          .limit(50)
          .get();

        if (!snap.empty) {
          firestoreList = snap.docs.map(
            (d: QueryDocumentSnapshot) => d.data() as AnalysisResult
          );
        }
      } catch (dbErr) {
        console.warn("Firestore list cases error:", dbErr);
      }
    }

    // Deduplicate by case ID and sort descending by creation time
    const caseMap = new Map<string, AnalysisResult>();
    [...cachedList, ...firestoreList, ...SEED_CASES].forEach((c) => {
      if (!caseMap.has(c.id)) {
        caseMap.set(c.id, c);
      }
    });

    const allCases = Array.from(caseMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(allCases, { status: 200 });
  } catch (err) {
    console.error("Cases API error:", err);
    return NextResponse.json(SEED_CASES, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalysisResult;
    if (!body || !body.id) {
      return NextResponse.json({ error: "Invalid case data" }, { status: 400 });
    }

    // Save to cache
    caseCache.set(body.id, body);

    // Save to Firestore
    const db = getFirestore();
    if (db) {
      try {
        await db.collection("cases").doc(body.id).set(body, { merge: true });
      } catch (dbErr) {
        console.warn("Firestore write error on POST:", dbErr);
      }
    }

    return NextResponse.json({ success: true, case: body }, { status: 201 });
  } catch (err) {
    console.error("Save case error:", err);
    return NextResponse.json({ error: "Failed to save case" }, { status: 500 });
  }
}
