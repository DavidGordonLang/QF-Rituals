import * as React from "react";
import { Ritual } from "../data/stockRituals";

export const Rituals: React.FC<{ rituals: Ritual[]; onStart: (r: Ritual) => void }> = ({
  rituals,
  onStart
}) => {
  return (
    <div className="space-y-3">
      {rituals.map((r) => (
        <button
          key={r.id}
          className="card card-tappable w-full text-left relative"
          onClick={() => onStart(r)}
          aria-label={`Start ${r.name} (${formatMinutes(r.totalSeconds)})`}
        >
          {/* Duration pill */}
          {typeof r.totalSeconds === "number" && r.totalSeconds > 0 && (
            <span className="badge absolute top-3 right-3">{formatMinutes(r.totalSeconds)}</span>
          )}

          {/* Text content */}
          <div className="pr-24"> {/* reserve space so text doesn't collide with the badge */}
            <div className="text-xs opacity-80">{r.guided ? "Guided" : "Instant"}</div>
            <div className="text-2xl font-semibold tracking-tight leading-snug mt-0.5">
              {r.name}
            </div>
            {r.description && (
              <p
                className="text-sm text-slate-300 mt-1"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
              >
                {r.description}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

function formatMinutes(totalSeconds: number) {
  const mins = Math.max(1, Math.round(totalSeconds / 60));
  return mins === 1 ? "1 min" : `${mins} min`;
}
