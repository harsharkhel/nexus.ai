import React from "react";
import { LucideIcon } from "lucide-react";

/* ──────────────────────────────────────────
   Editorial Card
   Used for workflow cards on landing & dashboard
   ────────────────────────────────────────── */

interface EditorialCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tag?: string;
  tagColor?: "green" | "orange";
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function EditorialCard({
  icon: Icon,
  title,
  description,
  tag,
  tagColor = "green",
  onClick,
  selected = false,
  className = "",
}: EditorialCardProps) {
  const tagBg =
    tagColor === "orange"
      ? "var(--accent-orange-subtle)"
      : "var(--accent-green-subtle)";
  const tagText =
    tagColor === "orange" ? "var(--accent-orange)" : "var(--accent-green)";

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-pressed={selected}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--space-md)",
        padding: "var(--space-xl)",
        background: selected ? "var(--accent-green-subtle)" : "var(--bg-card)",
        border: selected
          ? "1.5px solid var(--accent-green)"
          : "1px solid var(--border-light)",
        borderRadius: "var(--radius-lg)",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        width: "100%",
        transition: "all var(--duration-normal) var(--ease-out)",
        boxShadow: selected ? "var(--shadow-md)" : "var(--shadow-sm)",
        fontFamily: "var(--font-body)",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = "var(--border-medium)";
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = "var(--border-light)";
          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-md)",
          background: selected
            ? "var(--accent-green)"
            : "var(--accent-green-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all var(--duration-normal) var(--ease-out)",
        }}
      >
        <Icon
          size={20}
          style={{
            color: selected ? "white" : "var(--accent-green)",
          }}
        />
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.15rem",
            fontWeight: 500,
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      {/* Tag */}
      {tag && (
        <span
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "var(--radius-full)",
            background: tagBg,
            color: tagText,
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.02em",
            marginTop: "var(--space-xs)",
          }}
        >
          {tag}
        </span>
      )}
    </button>
  );
}
