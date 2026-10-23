import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  Stethoscope,
  Building2,
  Search,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

/* ──────────────────────────────────────────
   Landing Page — NEXUS AI
   Premium editorial design, warm ivory bg,
   dark forest green text, serif headings
   ────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* ─── Hero ─── */}
      <section
        className="paper-texture"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px var(--space-xl) var(--space-4xl)",
          overflow: "hidden",
        }}
      >
        {/* Decorative organic shapes */}
        <div
          className="organic-blob"
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, var(--accent-green-subtle) 0%, transparent 70%)",
            opacity: 0.6,
          }}
        />
        <div
          className="organic-blob"
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -100,
            left: -60,
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle, var(--accent-orange-subtle) 0%, transparent 70%)",
            opacity: 0.4,
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <div
            className="animate-fade-in-up"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              padding: "6px 16px",
              borderRadius: "var(--radius-full)",
              background: "var(--accent-green-subtle)",
              color: "var(--accent-green)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              marginBottom: "var(--space-xl)",
              letterSpacing: "0.02em",
            }}
          >
            <Sparkles size={14} />
            Powered by Gemini
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up stagger-1"
            style={{
              marginBottom: "var(--space-lg)",
              fontWeight: 400,
            }}
          >
            Turn complexity
            <br />
            into clarity.
          </h1>

          {/* Subheading */}
          <p
            className="animate-fade-in-up stagger-2"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              lineHeight: 1.7,
              maxWidth: 580,
              margin: "0 auto var(--space-2xl)",
              color: "var(--text-secondary)",
            }}
          >
            NEXUS AI converts messy real-world information — documents, reports,
            images, field data — into verified, evidence-backed next steps.
          </p>

          {/* CTA */}
          <div
            className="animate-fade-in-up stagger-3"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "var(--space-md)",
            }}
          >
            <Link
              href="/dashboard"
              id="cta-start-case"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                padding: "16px 36px",
                borderRadius: "var(--radius-full)",
                background: "var(--accent-green)",
                color: "white",
                fontSize: "1rem",
                fontWeight: 500,
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                transition: "all var(--duration-normal) var(--ease-out)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              Start a case
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/#how-it-works"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                padding: "16px 36px",
                borderRadius: "var(--radius-full)",
                background: "transparent",
                color: "var(--text-primary)",
                fontSize: "1rem",
                fontWeight: 500,
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                border: "1px solid var(--border-medium)",
                transition: "all var(--duration-normal) var(--ease-out)",
              }}
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Workflow Cards ─── */}
      <section
        id="workflows"
        style={{
          padding: "var(--space-4xl) var(--space-xl)",
          background: "var(--bg-secondary)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
            <p
              style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent-green)",
                marginBottom: "var(--space-sm)",
                fontFamily: "var(--font-body)",
              }}
            >
              Workflows
            </p>
            <h2 style={{ margin: 0 }}>Three paths to clarity</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--space-xl)",
            }}
          >
            {/* Emergency Intelligence */}
            <WorkflowCard
              icon={<AlertTriangle size={24} />}
              title="Emergency Intelligence"
              description="Analyze disaster reports, field communications, and situational data to extract actionable intelligence for rapid response coordination."
              tag="Urgent response"
              tagColor="orange"
              href="/dashboard?workflow=emergency"
            />

            {/* Healthcare Navigator */}
            <WorkflowCard
              icon={<Stethoscope size={24} />}
              title="Healthcare Navigator"
              description="Parse medical documentation, insurance policies, and treatment options to help patients navigate complex healthcare decisions."
              tag="Patient empowerment"
              tagColor="green"
              href="/dashboard?workflow=healthcare"
            />

            {/* Civic Issue Resolver */}
            <WorkflowCard
              icon={<Building2 size={24} />}
              title="Civic Issue Resolver"
              description="Break down policy documents, community reports, and regulatory information into clear, actionable guidance for civic engagement."
              tag="Community impact"
              tagColor="green"
              href="/dashboard?workflow=civic"
            />
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section
        id="how-it-works"
        style={{
          padding: "var(--space-4xl) var(--space-xl)",
          background: "var(--bg-primary)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
            <p
              style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent-green)",
                marginBottom: "var(--space-sm)",
                fontFamily: "var(--font-body)",
              }}
            >
              Process
            </p>
            <h2 style={{ margin: 0 }}>Analyze → Verify → Act</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--space-2xl)",
            }}
          >
            <ProcessStep
              number="01"
              icon={<Search size={22} />}
              title="Analyze"
              description="Upload documents, images, or text. NEXUS AI uses Gemini to extract structured facts, identify unknowns, and surface patterns humans might miss."
            />
            <ProcessStep
              number="02"
              icon={<ShieldCheck size={22} />}
              title="Verify"
              description="Every claim is tagged with a verification status — verified, partially verified, unverified, conflicting, or source unavailable — so you always know what to trust."
            />
            <ProcessStep
              number="03"
              icon={<Zap size={22} />}
              title="Act"
              description="Receive prioritized action items with clear evidence links. Download a reviewed report or share findings with your team."
            />
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        style={{
          padding: "var(--space-3xl) var(--space-xl)",
          background: "var(--bg-sidebar)",
          color: "var(--text-on-dark)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--space-lg)",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.2rem",
                fontWeight: 500,
                margin: "0 0 4px",
              }}
            >
              NEXUS AI
            </p>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-on-dark-muted)",
                margin: 0,
              }}
            >
              Turning complexity into clarity. Powered by Gemini.
            </p>
          </div>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-on-dark-muted)",
              margin: 0,
            }}
          >
            © 2026 NEXUS AI. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

/* ─── Sub-components ─── */

function WorkflowCard({
  icon,
  title,
  description,
  tag,
  tagColor,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
  tagColor: "green" | "orange";
  href: string;
}) {
  const tagBg =
    tagColor === "orange"
      ? "var(--accent-orange-subtle)"
      : "var(--accent-green-subtle)";
  const tagText =
    tagColor === "orange" ? "var(--accent-orange)" : "var(--accent-green)";

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        padding: "var(--space-2xl)",
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-lg)",
        textDecoration: "none",
        color: "inherit",
        transition: "all var(--duration-normal) var(--ease-out)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "var(--radius-md)",
          background: "var(--accent-green-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent-green)",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.25rem",
          fontWeight: 500,
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.9rem",
          lineHeight: 1.65,
          color: "var(--text-secondary)",
          margin: 0,
        }}
      >
        {description}
      </p>
      <span
        style={{
          display: "inline-block",
          padding: "4px 14px",
          borderRadius: "var(--radius-full)",
          background: tagBg,
          color: tagText,
          fontSize: "0.75rem",
          fontWeight: 500,
          fontFamily: "var(--font-body)",
          alignSelf: "flex-start",
        }}
      >
        {tag}
      </span>
    </Link>
  );
}

function ProcessStep({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-md)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--border-strong)",
            lineHeight: 1,
          }}
        >
          {number}
        </span>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-md)",
            background: "var(--accent-green-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-green)",
          }}
        >
          {icon}
        </div>
      </div>
      <h3
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.25rem",
          fontWeight: 500,
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.9rem",
          lineHeight: 1.65,
          color: "var(--text-secondary)",
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}
