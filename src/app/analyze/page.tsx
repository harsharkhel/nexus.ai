"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Stethoscope,
  Building2,
  Send,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/Button";
import { FileUpload, UploadedFile } from "@/components/FileUpload";
import type { WorkflowType, AnalysisResult } from "@/lib/types";
import { getWorkflow } from "@/lib/workflows";

const workflowIcons: Record<WorkflowType, React.ReactNode> = {
  emergency: <AlertTriangle size={20} />,
  healthcare: <Stethoscope size={20} />,
  civic: <Building2 size={20} />,
};

function AnalyzeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workflowParam = searchParams.get("workflow") as WorkflowType | null;
  const textParam = searchParams.get("text") || "";

  const [workflow] = React.useState<WorkflowType>(workflowParam || "emergency");
  const [text, setText] = React.useState(textParam);
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const workflowMeta = getWorkflow(workflow);
  const canAnalyze = text.trim().length > 0 || files.length > 0;

  async function handleAnalyze() {
    if (!canAnalyze || loading) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("workflow", workflow);
      formData.append("text", text);

      files.forEach((f) => {
        formData.append("files", f.file);
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        return;
      }

      // Store result and navigate to results page
      const result = data as AnalysisResult;
      sessionStorage.setItem("nexus-result", JSON.stringify(result));
      router.push(`/results?id=${result.id}`);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(255, 253, 247, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-light)",
          padding: "0 var(--space-xl)",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              background: "var(--accent-green-subtle)",
              color: "var(--accent-green)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              fontFamily: "var(--font-body)",
            }}
          >
            {workflowIcons[workflow]}
            {workflowMeta.shortTitle}
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "var(--space-3xl) var(--space-xl)",
        }}
      >
        <div className="animate-fade-in-up">
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 400,
              marginBottom: "var(--space-sm)",
            }}
          >
            Analysis Workspace
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              marginBottom: "var(--space-2xl)",
              marginTop: 0,
            }}
          >
            Provide your information below. NEXUS AI will analyze, verify, and
            generate actionable insights using the{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {workflowMeta.title}
            </strong>{" "}
            workflow.
          </p>
        </div>

        {/* ─── Text input area ─── */}
        <div
          className="animate-fade-in-up stagger-1"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-xl)",
            marginBottom: "var(--space-lg)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <label
            htmlFor="analyze-text"
            style={{
              display: "block",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: "var(--space-sm)",
              fontFamily: "var(--font-body)",
            }}
          >
            Case information
          </label>
          <textarea
            id="analyze-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Describe the ${workflowMeta.shortTitle.toLowerCase()} situation in detail. Include all relevant facts, observations, and questions...`}
            rows={8}
            disabled={loading}
            style={{
              width: "100%",
              padding: "var(--space-md)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-medium)",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              fontSize: "0.9375rem",
              fontFamily: "var(--font-body)",
              lineHeight: 1.65,
              resize: "vertical",
              outline: "none",
              transition: "border-color var(--duration-fast) var(--ease-out)",
              opacity: loading ? 0.6 : 1,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-green)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-medium)";
            }}
          />
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
              margin: "var(--space-sm) 0 0",
            }}
          >
            {text.length} characters
          </p>
        </div>

        {/* ─── File uploads ─── */}
        <div
          className="animate-fade-in-up stagger-2"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-xl)",
            marginBottom: "var(--space-xl)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
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
            Supporting documents
          </label>
          <FileUpload
            files={files}
            onFilesChange={setFiles}
          />
        </div>

        {/* ─── Error state ─── */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-md)",
              padding: "var(--space-lg)",
              borderRadius: "var(--radius-md)",
              background: "var(--status-conflicting-bg)",
              border: "1px solid rgba(196, 67, 42, 0.2)",
              marginBottom: "var(--space-lg)",
            }}
          >
            <AlertCircle
              size={18}
              style={{ color: "var(--status-conflicting)", flexShrink: 0, marginTop: 2 }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--status-conflicting)",
                  margin: "0 0 4px",
                }}
              >
                Analysis failed
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                padding: 2,
              }}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ─── Analyze button ─── */}
        <div
          className="animate-fade-in-up stagger-3"
          style={{
            display: "flex",
            gap: "var(--space-md)",
            flexWrap: "wrap",
          }}
        >
          <Button
            id="btn-run-analysis"
            size="lg"
            disabled={!canAnalyze}
            loading={loading}
            onClick={handleAnalyze}
            icon={loading ? undefined : <Send size={18} />}
            style={{ flex: 1, minWidth: 200 }}
          >
            {loading ? "Analyzing..." : "Run Analysis"}
          </Button>

          {error && (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleAnalyze}
              icon={<RefreshCw size={16} />}
            >
              Retry
            </Button>
          )}
        </div>

        {/* ─── Loading state ─── */}
        {loading && (
          <div
            className="animate-fade-in"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "var(--space-3xl) var(--space-xl)",
              marginTop: "var(--space-xl)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid var(--border-light)",
                borderTopColor: "var(--accent-green)",
                animation: "spin 0.8s linear infinite",
                marginBottom: "var(--space-lg)",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.1rem",
                color: "var(--text-primary)",
                margin: "0 0 var(--space-sm)",
              }}
            >
              Analyzing your case...
            </p>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-tertiary)",
                margin: 0,
                textAlign: "center",
              }}
            >
              NEXUS AI is extracting facts, verifying sources, and prioritizing
              actions. This typically takes 10–30 seconds.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AnalyzePage() {
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
          Loading workspace...
        </div>
      }
    >
      <AnalyzeInner />
    </Suspense>
  );
}
