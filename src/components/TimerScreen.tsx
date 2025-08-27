import React from "react";
import { Ritual } from "../data/stockRituals";
import { ProgressRing } from "./ProgressRing";

type Props = { ritual: Ritual; onExit: () => void };

export const TimerScreen: React.FC<Props> = ({ ritual, onExit }) => {
  const total = ritual.totalSeconds;

  const [running, setRunning] = React.useState(false);
  const [remaining, setRemaining] = React.useState(total);
  const rafRef = React.useRef<number | null>(null);
  const endAtRef = React.useRef<number | null>(null);
  const lastTickRef = React.useRef<number | null>(null);

  const cancel = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };

  const tick = (now: number) => {
    if (!endAtRef.current) return;
    const secs = Math.max(0, Math.ceil((endAtRef.current - now) / 1000));
    setRemaining(secs);
    if (secs <= 0) { cancel(); setRunning(false); return; }
    rafRef.current = requestAnimationFrame(tick);
    lastTickRef.current = now;
  };

  const start = () => {
    if (running) return;
    const now = performance.now();
    endAtRef.current = now + remaining * 1000;
    rafRef.current = requestAnimationFrame(tick);
    setRunning(true);
  };

  const pause = () => {
    if (!running) return;
    cancel();
    const now = performance.now();
    if (endAtRef.current) {
      const left = Math.max(0, Math.ceil((endAtRef.current - now) / 1000));
      setRemaining(left);
    }
    setRunning(false);
  };

  const exit = () => {
    cancel();
    setRunning(false);
    onExit();
  };

  React.useEffect(()=>() => cancel(), []);

  const progress = 1 - remaining / total;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-medium">{ritual.name}</div>
          <div className="text-xs text-slate-300">{Math.round(total/60)} Minutes</div>
        </div>
        <button className="btn" onClick={exit}>Exit</button>
      </div>

      <div className="flex flex-col items-center">
        <ProgressRing progress={progress} />
        <div className="-mt-40 text-center">
          <div className="text-5xl font-semibold tabular-nums">{formatTime(remaining)}</div>
          <div className="text-xs text-slate-300 mt-1">Remaining</div>
        </div>

        <div className="mt-6 flex gap-2">
          {!running ? (
            <button className="btn" onClick={start}>Start</button>
          ) : (
            <button className="btn" onClick={pause}>Pause</button>
          )}
        </div>
      </div>
    </div>
  );
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, "0")}`;
}
