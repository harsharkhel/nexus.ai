"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header
      role="banner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(255, 253, 247, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <nav
        aria-label="Main navigation"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 var(--space-xl)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            textDecoration: "none",
            color: "var(--text-primary)",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background:
                "linear-gradient(135deg, var(--accent-green) 0%, var(--accent-green-light) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              letterSpacing: "0.05em",
            }}
          >
            N
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.2rem",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            NEXUS AI
          </span>
        </Link>

        {/* Desktop links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2xl)",
          }}
          className="hidden md:flex"
        >
          <NavLink href="/#how-it-works">Process</NavLink>
          <NavLink href="/#workflows">Workflows</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              padding: "10px 22px",
              borderRadius: "var(--radius-full)",
              background: "var(--accent-green)",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all var(--duration-normal) var(--ease-out)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-green-light)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent-green)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Start a case
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "var(--space-sm)",
            color: "var(--text-primary)",
          }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            padding: "var(--space-lg) var(--space-xl) var(--space-2xl)",
            borderTop: "1px solid var(--border-light)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-lg)",
            background: "var(--bg-primary)",
          }}
        >
          <Link
            href="/#how-it-works"
            onClick={() => setMenuOpen(false)}
            style={mobileNavLinkStyle}
          >
            Process
          </Link>
          <Link
            href="/#workflows"
            onClick={() => setMenuOpen(false)}
            style={mobileNavLinkStyle}
          >
            Workflows
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            style={mobileNavLinkStyle}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-sm)",
              padding: "12px 24px",
              borderRadius: "var(--radius-full)",
              background: "var(--accent-green)",
              color: "white",
              fontSize: "0.95rem",
              fontWeight: 500,
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              marginTop: "var(--space-sm)",
            }}
          >
            Start a case
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        color: "var(--text-secondary)",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: 400,
        fontFamily: "var(--font-body)",
        transition: "color var(--duration-fast) var(--ease-out)",
        letterSpacing: "0.01em",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {children}
    </Link>
  );
}

const mobileNavLinkStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  textDecoration: "none",
  fontSize: "1rem",
  fontFamily: "var(--font-body)",
  padding: "var(--space-sm) 0",
  borderBottom: "1px solid var(--border-light)",
};
