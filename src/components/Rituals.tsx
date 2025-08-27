import React from "react";
import { stockRituals, minutesLabel, Ritual } from "../data/stockRituals";
import { TimerScreen } from "./TimerScreen";

export const Rituals: React.FC = () => {
  const [active, setActive] = React.useState<Ritual | null>(null);

  if (active) {
    return <TimerScreen ritual={active} onExit={()=>setActive(null)} />;
  }

  return (
    <div className="space-y-3">
      {stockRituals.map(r => (
        <button key={r.id} className="card w-full text-left"
          onClick={()=>setActive(r)}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-slate-300">
                Guided · {minutesLabel(r.totalSeconds)}
              </div>
            </div>
            <div className="text-xs opacity-80">Tap to begin</div>
          </div>
        </button>
      ))}
    </div>
  );
};
