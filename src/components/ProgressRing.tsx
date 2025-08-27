import React from "react";

export const ProgressRing: React.FC<{ progress: number; size?: number; stroke?: number }> = ({
  progress,
  size = 260,         // a touch larger for presence
  stroke = 12         // slightly thicker, like the older UI
}) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circ * (1 - clamped);

  return (
    <svg width={size} height={size} className="block">
      <defs>
        <linearGradient id="qfRingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.85" />
          <stop offset="100%" stopColor="white" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={stroke}
        fill="none"
      />

      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#qfRingGrad)"
        strokeLinecap="round"
        strokeWidth={stroke}
        fill="none"
        style={{
          strokeDasharray: circ,
          strokeDashoffset: offset,
          transition: "stroke-dashoffset 0s" // rAF drives it; no easing delay
        }}
      />
    </svg>
  );
};
