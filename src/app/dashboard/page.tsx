"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Clock,
  Settings,
  AlertTriangle,
  Stethoscope,
  Building2,
  ChevronRight,
  FileText,
  Inbox,
} from "lucide-react";
import { EditorialCard } from "@/components/EditorialCard";
import { FileUpload, UploadedFile } from "@/components/FileUpload";
import { Button } from "@/components/Button";
import type { WorkflowType, CaseRecord } from "@/lib/types";

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWorkflow = searchParams.get("workflow") as WorkflowType | null;

  const [selectedWorkflow, setSelectedWorkflow] =
    React.useState<WorkflowType | null>(initialWorkflow);
  const [textInput, setTextInput] = React.useState("");
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [cases, setCases] = React.useState<CaseRecord[]>([]);
  const [loadingCases, setLoadingCases] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/cases")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCases(data);
        }
      })
      .catch((err) => console.warn("Failed to load live cases:", err))
      .finally(() => setLoadingCases(false));
  }, []);

  const canSubmit =
    selectedWorkflow && (textInput.trim().length > 0 || files.length > 0);

  function handleStartAnalysis() {
    if (!canSubmit) return;

    // Store input data in sessionStorage for the analysis page
    const analysisData = {
      workflow: selectedWorkflow,
      text: textInput,
      fileNames: files.map((f) => f.file.name),
    };
    sessionStorage.setItem("nexus-analysis-input", JSON.stringify(analysisData));

    // Store files in a temporary way (file names for reference)
    // The analysis page will submit the actual form
    if (files.length > 0) {
      // We'll pass files via a different mechanism since sessionStorage can't hold File objects
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f.file));
      sessionStorage.setItem(
        "nexus-analysis-files-count",
        String(files.length)
      );
    }

    router.push(
      `/analyze?workflow=${selectedWorkflow}&text=${encodeURIComponent(textInput)}`
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      {/* ─── Sidebar ─── */}
      <aside
        className={sidebarOpen ? "sidebar-open" : ""}
        style={{
          width: 260,
          background: "var(--bg-sidebar)",
          color: "var(--text-on-dark)",
          padding: "var(--space-xl) 0",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 40,
          transition: "transform var(--duration-normal) var(--ease-out)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "0 var(--space-xl) var(--space-xl)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              textDecoration: "none",
              color: "var(--text-on-dark)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                background:
                  "linear-gradient(135deg, var(--accent-green-light) 0%, var(--accent-green) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
              }}
            >
              N
            </div>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.1rem",
                fontWeight: 500,
              }}
            >
              NEXUS AI
            </span>
          </Link>
        </div>

        {/* Nav items */}
        <nav
          aria-label="Dashboard navigation"
          style={{
            padding: "var(--space-lg) 0",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: 1,
          }}
        >
          <SidebarLink
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active
          />
          <SidebarLink
            icon={<PlusCircle size={18} />}
            label="New Case"
            onClick={() => {
              setSelectedWorkflow(null);
              setTextInput("");
              setFiles([]);
            }}
          />
          <SidebarLink icon={<Clock size={18} />} label="History" />
          <SidebarLink icon={<Settings size={18} />} label="Settings" />
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: "var(--space-lg) var(--space-xl)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            style={{
              fontSize: "0.6875rem",
              color: "var(--text-on-dark-muted)",
              margin: 0,
            }}
          >
            Powered by Gemini
          </p>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 50,
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          background: "var(--bg-sidebar)",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
        }}
      >
        ☰
      </button>

      {/* ─── Main Content ─── */}
      <main
        style={{
          flex: 1,
          marginLeft: 260,
          padding: "var(--space-3xl) var(--space-2xl)",
          maxWidth: 900,
        }}
      >
        {/* Welcome */}
        <div style={{ marginBottom: "var(--space-3xl)" }}>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 400,
              marginBottom: "var(--space-sm)",
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            Start a new case or continue an existing analysis.
          </p>
        </div>

        {/* ─── Input Panel ─── */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-2xl)",
            marginBottom: "var(--space-2xl)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2
            style={{
              fontSize: "1.15rem",
              fontWeight: 500,
              marginBottom: "var(--space-xs)",
              fontFamily: "var(--font-heading)",
            }}
          >
            New Analysis
          </h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-tertiary)",
              marginBottom: "var(--space-xl)",
              marginTop: 0,
            }}
          >
            Paste text, upload files, or both. Choose a workflow, then analyze.
          </p>

          {/* Text input */}
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <label
              htmlFor="analysis-input"
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: "var(--space-sm)",
                fontFamily: "var(--font-body)",
              }}
            >
              Describe the situation or paste content
            </label>
            <textarea
              id="analysis-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter details about the case you want to analyze..."
              rows={5}
              style={{
                width: "100%",
                padding: "var(--space-md)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-medium)",
                background: "var(--bg-primary)",
                color: "var(--text-primary)",
                fontSize: "0.9375rem",
                fontFamily: "var(--font-body)",
                lineHeight: 1.6,
                resize: "vertical",
                outline: "none",
                transition: "border-color var(--duration-fast) var(--ease-out)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-green)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-medium)";
              }}
            />
          </div>

          {/* File upload */}
          <div style={{ marginBottom: "var(--space-xl)" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: "var(--space-sm)",
                fontFamily: "var(--font-body)",
              }}
            >
              Attach files (optional)
            </label>
            <FileUpload files={files} onFilesChange={setFiles} />
          </div>

          {/* Workflow selection */}
          <div style={{ marginBottom: "var(--space-xl)" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--text-primary)",
                marginBottom: "var(--space-md)",
                fontFamily: "var(--font-body)",
              }}
            >
              Choose a workflow
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "var(--space-md)",
              }}
            >
              <EditorialCard
                icon={AlertTriangle}
                title="Emergency Intelligence"
                description="Rapid disaster and crisis analysis"
                tag="Urgent response"
                tagColor="orange"
                selected={selectedWorkflow === "emergency"}
                onClick={() => setSelectedWorkflow("emergency")}
              />
              <EditorialCard
                icon={Stethoscope}
                title="Healthcare Navigator"
                description="Medical documentation clarity"
                tag="Patient empowerment"
                tagColor="green"
                selected={selectedWorkflow === "healthcare"}
                onClick={() => setSelectedWorkflow("healthcare")}
              />
              <EditorialCard
                icon={Building2}
                title="Civic Issue Resolver"
                description="Policy and community analysis"
                tag="Community impact"
                tagColor="green"
                selected={selectedWorkflow === "civic"}
                onClick={() => setSelectedWorkflow("civic")}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            id="btn-analyze"
            size="lg"
            disabled={!canSubmit}
            onClick={handleStartAnalysis}
            iconRight={<ChevronRight size={18} />}
            fullWidth
          >
            Analyze with NEXUS AI
          </Button>

          {!canSubmit && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-tertiary)",
                textAlign: "center",
                marginTop: "var(--space-sm)",
                marginBottom: 0,
              }}
            >
              Enter text or upload files, then select a workflow to begin.
            </p>
          )}
        </div>

        {/* ─── Recent Cases ─── */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-2xl)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-lg)",
            }}
          >
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 500,
                margin: 0,
                fontFamily: "var(--font-heading)",
              }}
            >
              Recent Cases
            </h2>
            {cases.length > 0 && (
              <Link
                href="/history"
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--accent-green)",
                  textDecoration: "none",
                  fontFamily: "var(--font-body)",
                }}
              >
                View all
              </Link>
            )}
          </div>

          {loadingCases ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm)",
              }}
            >
              <div className="skeleton" style={{ height: 64, width: "100%" }} />
              <div className="skeleton" style={{ height: 64, width: "100%" }} />
            </div>
          ) : cases.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "var(--space-3xl) var(--space-xl)",
                color: "var(--text-tertiary)",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "var(--space-md)",
                }}
              >
                <Inbox size={24} />
              </div>
              <p
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  margin: "0 0 4px",
                }}
              >
                No cases yet
              </p>
              <p style={{ fontSize: "0.8125rem", margin: 0, textAlign: "center" }}>
                Your completed analyses will appear here. Start your first case above.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm)",
              }}
            >
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/results?id=${c.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-md)",
                    padding: "var(--space-md)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-light)",
                    textDecoration: "none",
                    color: "inherit",
                    transition:
                      "background var(--duration-fast) var(--ease-out)",
                  }}
                >
                  <FileText
                    size={18}
                    style={{ color: "var(--text-tertiary)", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        margin: 0,
                        color: "var(--text-primary)",
                      }}
                    >
                      {c.title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        margin: 0,
                      }}
                    >
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--bg-overlay)",
            zIndex: 35,
          }}
          aria-hidden
        />
      )}

      {/* Responsive sidebar styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          aside {
            transform: translateX(-100%);
          }
          aside.sidebar-open {
            transform: translateX(0);
          }
          main {
            margin-left: 0 !important;
            padding: var(--space-2xl) var(--space-lg) !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Sidebar link ─── */

function SidebarLink({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-md)",
        padding: "10px var(--space-xl)",
        background: active ? "var(--bg-sidebar-hover)" : "transparent",
        color: active ? "var(--text-on-dark)" : "var(--text-on-dark-muted)",
        border: "none",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontFamily: "var(--font-body)",
        textAlign: "left",
        width: "100%",
        borderRadius: 0,
        transition: "all var(--duration-fast) var(--ease-out)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ─── Wrap in Suspense for useSearchParams ─── */

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-body)",
          }}
        >
          Loading dashboard...
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
