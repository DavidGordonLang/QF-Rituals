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
          <div>
            <div className="text-xs opacity-80">{r.guided ? "Guided" : "Instant"}</div>
            <div className="text-xl font-semibold">{r.name}</div>
            {r.description && <div className="text-sm text-slate-300">{r.description}</div>}
          </div>
          <button className="btn" onClick={() => onStart(r)}>Start</button>
        </div>
      ))}
    </div>
  );
};
