import * as React from "react";
import { Ritual } from "../data/stockRituals";

export const Rituals: React.FC<{ rituals: Ritual[]; onStart: (r: Ritual) => void }> = ({
  rituals,
  onStart
}) => {
  return (
    <div className="space-y-3">
      {rituals.map((r) => (
        <div key={r.id} className="card flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-xs opacity-80">{r.guided ? "Guided" : "Instant"}</div>
            <div className="text-xl font-semibold">{r.name}</div>

            {/* Description + duration */}
            <div className="text-sm text-slate-300">
              {r.description}
              {typeof r.totalSeconds === "number" && r.totalSeconds > 0 && (
                <span className="ml-2 text-slate-200/80">• {formatMinutes(r.totalSeconds)}</span>
              )}
            </div>
          </div>

          <button className="btn ml-4 shrink-0" onClick={() => onStart(r)}>
            Start
          </button>
        </div>
      ))}
    </div>
  );
};

function formatMinutes(totalSeconds: number) {
  const mins = Math.round(totalSeconds / 60);
  if (mins <= 1) return "1 minute";
  return `${mins} minutes`;
}
