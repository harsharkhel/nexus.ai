import React from "react";
import {
  CheckCircle,
  AlertCircle,
  HelpCircle,
  XCircle,
  MinusCircle,
} from "lucide-react";

/* ──────────────────────────────────────────
   StatusBadge — verification status indicator
   ────────────────────────────────────────── */

export type VerificationStatus =
  | "verified"
  | "partially_verified"
  | "unverified"
  | "conflicting"
  | "source_unavailable";

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<
  VerificationStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: React.FC<{ size?: number; style?: React.CSSProperties }>;
  }
> = {
  verified: {
    label: "Verified",
    color: "var(--status-verified)",
    bg: "var(--status-verified-bg)",
    icon: CheckCircle,
  },
  partially_verified: {
    label: "Partially Verified",
    color: "var(--status-partial)",
    bg: "var(--status-partial-bg)",
    icon: AlertCircle,
  },
  unverified: {
    label: "Unverified",
    color: "var(--status-unverified)",
    bg: "var(--status-unverified-bg)",
    icon: HelpCircle,
  },
  conflicting: {
    label: "Conflicting",
    color: "var(--status-conflicting)",
    bg: "var(--status-conflicting-bg)",
    icon: XCircle,
  },
  source_unavailable: {
    label: "Source Unavailable",
    color: "var(--status-unavailable)",
    bg: "var(--status-unavailable-bg)",
    icon: MinusCircle,
  },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const IconComp = config.icon;
  const iconSize = size === "sm" ? 12 : 14;
  const fontSize = size === "sm" ? "0.6875rem" : "0.75rem";
  const padding = size === "sm" ? "3px 8px" : "4px 12px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding,
        borderRadius: "var(--radius-full)",
        background: config.bg,
        color: config.color,
        fontSize,
        fontWeight: 500,
        fontFamily: "var(--font-body)",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      <IconComp size={iconSize} />
      {config.label}
    </span>
  );
}
