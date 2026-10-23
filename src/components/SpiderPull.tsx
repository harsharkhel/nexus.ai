"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const RESTING_LENGTH = 82; // Base silk length from ceiling (px)
const PULL_THRESHOLD = 55; // Required pull down beyond rest to toggle (px)
const MAX_PULL = 175; // Maximum pull down distance (px)

export default function SpiderPull() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [pullY, setPullY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpringing, setIsSpringing] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const startYRef = useRef(0);
  const currentPullRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef(0);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexus_theme");
      if (stored === "dark" || stored === "light") {
        applyTheme(stored);
      } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        applyTheme("dark");
      } else {
        applyTheme("light");
      }
    } catch {
      applyTheme("light");
    }
  }, []);

  function applyTheme(newTheme: "light" | "dark") {
    setTheme(newTheme);
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    try {
      localStorage.setItem("nexus_theme", newTheme);
    } catch {
      // localStorage may be unavailable
    }
  }

  // Synthesize pleasant acoustic web pluck sound with Web Audio API
  const playWebPluck = useCallback((toDark: boolean) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Primary string oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const startPitch = toDark ? 440 : 620;
      const endPitch = toDark ? 220 : 380;

      osc.frequency.setValueAtTime(startPitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        endPitch,
        ctx.currentTime + 0.16
      );

      // Fast tactile pluck decay envelope
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.21);
    } catch {
      // Audio playback safely ignored if blocked by browser policy
    }
  }, []);

  const triggerToggle = useCallback(
    (forcedNextTheme?: "light" | "dark") => {
      const nextTheme =
        forcedNextTheme ?? (theme === "dark" ? "light" : "dark");
      playWebPluck(nextTheme === "dark");

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(28);
        } catch {
          // ignore
        }
      }

      applyTheme(nextTheme);
      setHasInteracted(true);
    },
    [theme, playWebPluck]
  );

  // Programmatic tap-to-pull animation for quick clicks
  const animateQuickPull = useCallback(() => {
    if (isDraggingRef.current || isSpringing) return;
    setIsSpringing(true);

    const pullTarget = PULL_THRESHOLD + 20;
    const duration = 280;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      if (elapsed < duration) {
        // Ease down to target
        const progress = elapsed / duration;
        const eased = Math.sin((progress * Math.PI) / 2);
        setPullY(pullTarget * eased);
        requestAnimationFrame(step);
      } else {
        // Trigger toggle at apex
        triggerToggle();
        // Spring snap back up
        setPullY(0);
        setTimeout(() => {
          setIsSpringing(false);
        }, 450);
      }
    }

    requestAnimationFrame(step);
  }, [isSpringing, triggerToggle]);

  // Pointer drag handling (mouse & touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    isDraggingRef.current = true;
    setIsDragging(true);
    setIsSpringing(false);
    startYRef.current = e.clientY;
    currentPullRef.current = 0;
    dragStartTimeRef.current = performance.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientY - startYRef.current;

    // Resistance easing past threshold
    let newPull = 0;
    if (delta > 0) {
      if (delta <= PULL_THRESHOLD) {
        newPull = delta;
      } else {
        const excess = delta - PULL_THRESHOLD;
        newPull = PULL_THRESHOLD + Math.min(excess * 0.6, MAX_PULL - PULL_THRESHOLD);
      }
    } else {
      // Slight upward resistance
      newPull = Math.max(delta * 0.25, -20);
    }

    currentPullRef.current = newPull;
    setPullY(newPull);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const dragTime = performance.now() - dragStartTimeRef.current;
    const finalPull = currentPullRef.current;

    // Check if it was a quick click or drag past threshold
    if (finalPull >= PULL_THRESHOLD) {
      triggerToggle();
    } else if (Math.abs(finalPull) < 6 && dragTime < 300) {
      // Clicked without dragging: play quick pull animation
      animateQuickPull();
      return;
    }

    // Spring release bounce back to resting position
    setIsSpringing(true);
    setPullY(0);
    setTimeout(() => {
      setIsSpringing(false);
    }, 550);
  };

  const currentLength = RESTING_LENGTH + pullY;
  const isArmed = pullY >= PULL_THRESHOLD;
  const legCurl = Math.min(pullY / PULL_THRESHOLD, 1.4);

  return (
    <aside
      aria-label="Theme toggle spider"
      style={{
        position: "fixed",
        top: 0,
        right: "clamp(24px, 4.5vw, 64px)",
        zIndex: 9999,
        pointerEvents: "none",
        userSelect: "none",
        width: "90px",
        height: `${Math.max(currentLength + 60, 160)}px`,
      }}
    >
      <svg
        width="90"
        height={Math.max(currentLength + 60, 160)}
        viewBox={`0 0 90 ${Math.max(currentLength + 60, 160)}`}
        style={{
          overflow: "visible",
          display: "block",
        }}
      >
        <defs>
          {/* Subtle silk gradient */}
          <linearGradient id="silkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={theme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(30,46,32,0.4)"}
            />
            <stop
              offset="100%"
              stopColor={theme === "dark" ? "rgba(220,240,230,0.85)" : "rgba(30,46,32,0.6)"}
            />
          </linearGradient>

          {/* Spider body glossy black gradient */}
          <radialGradient id="spiderGloss" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#3a3d3a" />
            <stop offset="45%" stopColor="#1a1c1a" />
            <stop offset="100%" stopColor="#080a08" />
          </radialGradient>

          {/* Spider eye glow */}
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff7b39" />
            <stop offset="100%" stopColor="#c4432a" />
          </radialGradient>
        </defs>

        {/* ── Top Ceiling Anchor Cobweb ── */}
        <g opacity={theme === "dark" ? 0.6 : 0.45}>
          {/* Anchor radial threads */}
          <path
            d="M 15 0 Q 30 14 45 0 M 25 0 Q 45 22 65 0 M 35 0 Q 45 12 55 0"
            fill="none"
            stroke={theme === "dark" ? "rgba(220,240,230,0.5)" : "rgba(30,46,32,0.35)"}
            strokeWidth="0.75"
          />
          <line
            x1="45"
            y1="0"
            x2="45"
            y2="10"
            stroke={theme === "dark" ? "rgba(220,240,230,0.6)" : "rgba(30,46,32,0.4)"}
            strokeWidth="1"
          />
        </g>

        {/* ── The Silk Thread ── */}
        <line
          x1="45"
          y1="0"
          x2="45"
          y2={currentLength}
          stroke="url(#silkGrad)"
          strokeWidth={Math.max(1.8 - (pullY / MAX_PULL) * 0.7, 1.1)}
          strokeDasharray={isDragging ? "none" : undefined}
          style={{
            transition: isSpringing
              ? "all 550ms cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              : "none",
          }}
        />

        {/* ── The Spider (Interactive Drag Target) ── */}
        <g
          transform={`translate(45, ${currentLength})`}
          className={!isDragging && !isSpringing ? "spider-sway" : undefined}
          style={{
            pointerEvents: "auto",
            cursor: isDragging ? "grabbing" : "grab",
            transition: isSpringing
              ? "transform 550ms cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              : "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => {
            setIsHovered(true);
            setShowTooltip(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            if (!isDragging) setShowTooltip(false);
          }}
          aria-label={theme === "dark" ? "Pull down to activate Light Mode" : "Pull down to activate Dark Mode"}
          role="button"
          tabIndex={0}
        >
          <title>{theme === "dark" ? "Pull down to activate Light Mode" : "Pull down to activate Dark Mode"}</title>
          {/* Invisible larger hit area for easy grabbing */}
          <circle cx="0" cy="10" r="26" fill="transparent" />

          {/* ── Spider Legs (8 articulated legs) ── */}
          <g
            className={!isDragging ? "spider-legs-twitch" : undefined}
            stroke="#121412"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{
              transition: "transform 150ms ease",
              transform: `scale(${1 - legCurl * 0.08}, ${1 + legCurl * 0.1})`,
            }}
          >
            {/* Left Legs (Front to Back) */}
            {/* Leg L1 (Front) */}
            <path d={`M -3 3 Q -14 -6 -20 ${-14 - legCurl * 6} Q -24 ${-18 - legCurl * 8} -22 ${-24 - legCurl * 10}`} />
            {/* Leg L2 */}
            <path d={`M -4 6 Q -18 2 -25 ${-4 - legCurl * 4} Q -30 ${-6 - legCurl * 6} -32 ${-10 - legCurl * 8}`} />
            {/* Leg L3 */}
            <path d={`M -4 10 Q -20 14 -27 ${18 + legCurl * 4} Q -32 ${22 + legCurl * 6} -30 ${30 + legCurl * 8}`} />
            {/* Leg L4 (Back) */}
            <path d={`M -3 14 Q -16 22 -20 ${32 + legCurl * 6} Q -22 ${38 + legCurl * 8} -18 ${44 + legCurl * 10}`} />

            {/* Right Legs (Front to Back) */}
            {/* Leg R1 (Front) */}
            <path d={`M 3 3 Q 14 -6 20 ${-14 - legCurl * 6} Q 24 ${-18 - legCurl * 8} 22 ${-24 - legCurl * 10}`} />
            {/* Leg R2 */}
            <path d={`M 4 6 Q 18 2 25 ${-4 - legCurl * 4} Q 30 ${-6 - legCurl * 6} 32 ${-10 - legCurl * 8}`} />
            {/* Leg R3 */}
            <path d={`M 4 10 Q 20 14 27 ${18 + legCurl * 4} Q 32 ${22 + legCurl * 6} 30 ${30 + legCurl * 8}`} />
            {/* Leg R4 (Back) */}
            <path d={`M 3 14 Q 16 22 20 ${32 + legCurl * 6} Q 22 ${38 + legCurl * 8} 18 ${44 + legCurl * 10}`} />
          </g>

          {/* ── Spider Pedipalps (Front feelers) ── */}
          <path
            d="M -2 0 Q -5 -5 -4 -8 M 2 0 Q 5 -5 4 -8"
            stroke="#161816"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />

          {/* ── Spider Abdomen (Back Body) ── */}
          <ellipse
            cx="0"
            cy="14"
            rx="7.5"
            ry="9.5"
            fill="url(#spiderGloss)"
            stroke={theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.5)"}
            strokeWidth="0.6"
          />

          {/* Abdomen highlight sheen */}
          <ellipse cx="-2.2" cy="11.5" rx="2.5" ry="4" fill="rgba(255,255,255,0.22)" />

          {/* Hourglass / Dorsal Mark: glowing burnt orange */}
          <path
            d="M -1.8 11 L 1.8 11 L 0 14 L 2.2 17 L -2.2 17 L 0 14 Z"
            fill={isArmed ? "#ff4d2e" : theme === "dark" ? "#e67e38" : "#c4652a"}
            opacity={isArmed ? 1 : 0.85}
            style={{
              filter: isArmed
                ? "drop-shadow(0 0 4px rgba(255,77,46,0.9))"
                : "drop-shadow(0 0 1.5px rgba(230,126,56,0.5))",
              transition: "all 150ms ease",
            }}
          />

          {/* ── Spider Cephalothorax (Head) ── */}
          <ellipse
            cx="0"
            cy="3"
            rx="5.5"
            ry="4.5"
            fill="url(#spiderGloss)"
            stroke={theme === "dark" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.6)"}
            strokeWidth="0.6"
          />

          {/* ── Glowing Spider Eyes ── */}
          {/* Main front eyes */}
          <circle
            cx="-1.6"
            cy="1.2"
            r="1"
            fill="url(#eyeGlow)"
            style={{
              filter: isArmed
                ? "drop-shadow(0 0 3px #ff5722)"
                : "drop-shadow(0 0 1px #ff7b39)",
            }}
          />
          <circle
            cx="1.6"
            cy="1.2"
            r="1"
            fill="url(#eyeGlow)"
            style={{
              filter: isArmed
                ? "drop-shadow(0 0 3px #ff5722)"
                : "drop-shadow(0 0 1px #ff7b39)",
            }}
          />
          {/* Secondary tiny lateral eyes */}
          <circle cx="-3" cy="2" r="0.6" fill="#e67e38" opacity="0.8" />
          <circle cx="3" cy="2" r="0.6" fill="#e67e38" opacity="0.8" />
        </g>
      </svg>

      {/* ── Vintage Editorial Pull Prompt / Tooltip ── */}
      <div
        style={{
          position: "absolute",
          top: `${currentLength + 32}px`,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          transition: "opacity 200ms ease, transform 200ms ease",
          opacity: showTooltip || isHovered || isDragging || !hasInteracted ? 1 : 0,
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            background: isArmed
              ? "var(--accent-orange)"
              : theme === "dark"
              ? "#162319"
              : "#FFFDF7",
            color: isArmed
              ? "#FFFDF7"
              : theme === "dark"
              ? "#FAF6EE"
              : "#1B2E20",
            border: `1px solid ${
              isArmed
                ? "var(--accent-orange)"
                : theme === "dark"
                ? "rgba(255,255,255,0.18)"
                : "rgba(27,46,32,0.2)"
            }`,
            padding: "3px 9px",
            borderRadius: "9999px",
            fontSize: "0.68rem",
            fontWeight: 500,
            letterSpacing: "0.02em",
            boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transform: isArmed ? "scale(1.08)" : "scale(1)",
            transition: "all 150ms ease",
          }}
        >
          {isArmed ? (
            <span>Release for {theme === "dark" ? "Day ☀️" : "Night 🌙"}</span>
          ) : isDragging ? (
            <span>Pull down further...</span>
          ) : (
            <span>
              {theme === "dark" ? "Pull down for Day ☀️" : "Pull down for Night 🌙"}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
