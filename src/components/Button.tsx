"use client";

import React from "react";

/* ──────────────────────────────────────────
   Button — Primary CTA component
   ────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--accent-green)",
    color: "white",
    border: "none",
  },
  secondary: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border-medium)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "none",
  },
  danger: {
    background: "var(--status-conflicting)",
    color: "white",
    border: "none",
  },
};

const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--accent-green-light)",
    boxShadow: "var(--shadow-md)",
    transform: "translateY(-1px)",
  },
  secondary: {
    background: "var(--accent-green-subtle)",
    borderColor: "var(--accent-green)",
  },
  ghost: {
    background: "var(--accent-green-subtle)",
    color: "var(--text-primary)",
  },
  danger: {
    background: "#d94f38",
    boxShadow: "var(--shadow-md)",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: "8px 16px", fontSize: "0.8125rem" },
  md: { padding: "12px 24px", fontSize: "0.875rem" },
  lg: { padding: "16px 32px", fontSize: "1rem" },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      disabled={disabled || loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-sm)",
        borderRadius: "var(--radius-full)",
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all var(--duration-normal) var(--ease-out)",
        width: fullWidth ? "100%" : "auto",
        whiteSpace: "nowrap",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...(hovered && !disabled && !loading ? hoverStyles[variant] : {}),
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: 16,
            height: 16,
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "white",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </button>
  );
}
