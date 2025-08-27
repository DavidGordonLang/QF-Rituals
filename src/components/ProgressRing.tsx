import React from "react";

export const ProgressRing: React.FC<{progress: number}> = ({ progress }) => {
  const size = 220, stroke = 10;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - Math.min(Math.max(progress,0),1));

  return (
    <svg width={size} height={size} className="block">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="white" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={radius}
        stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} fill="none"/>
      <circle cx={size/2} cy={size/2} r={radius}
        stroke="url(#grad)" strokeLinecap="round"
        strokeWidth={stroke} fill="none"
        style={{ strokeDasharray: circ, strokeDashoffset: offset, transition: "stroke-dashoffset 0s" }}
      />
    </svg>
  );
};
