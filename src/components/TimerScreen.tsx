import React from "react";
import { Ritual, Section } from "../data/stockRituals";
import { ProgressRing } from "./ProgressRing";
import { useAudio } from "../hooks/useAudio";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Props = { ritual: Ritual; onExit: () => void };
type JournalEntry = { id: string; ritualId: string; ritualName: string; endedAt: number; note?: string };

export const TimerScreen: React.FC<Props> = ({ ritual, onExit }) => {
  const total = ritual.totalSeconds;

  const [running, setRunning] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [journal, setJournal] = useLocalStorage<JournalEntry[]>("qf_journal_v1", []);

  const rafRef = React.useRef<number | null>(null);
  const startAtRef = React.useRef<number | null>(null);
  const pausedAtRef = React.useRef<number | null>(null);

  const { woodblock, gong } = useAudio();

  const cancel = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };

  const tick = (now: number) => {
    if (!startAtRef.current) return;
    const t = Math.floor((now - startAtRef.current) / 1000);
    const e = Math.min(total, t);
    setElapsed(e);
    if (e >= total) { cancel(); setRunning(false); gong(); promptJournal(); return; }
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    const now = performance.now();
    if (!startAtRef.current) startAtRef.current = now;
    if (pausedAtRef.current) {
      const pauseDur = now - pausedAtRef.current;
      startAtRef.current += pauseDur;
      pausedAtRef.current = null;
    }
    rafRef.current = requestAnimationFrame(tick);
    setRunning(true);
  };

  const pause = () => {
    if (!running) return;
    cancel();
    pausedAtRef.current = performance.now();
    setRunning(false);
  };

  const exit = () => { cancel(); setRunning(false); onExit(); };
  React.useEffect(() => () => cancel(), []);

  /* --- Sections (1/2/2/2) --- */
  const [sectionIndex, setSectionIndex] = React.useState(0);
  const sectionOffsets = React.useMemo(() => {
    const arr: number[] = []; let acc = 0;
    ritual.sections.forEach(s => { arr.push(acc); acc += s.seconds; });
    return arr;
  }, [ritual.sections]);

  React.useEffect(() => {
    let idx = ritual.sections.length - 1;
    for (let i = 0; i < ritual.sections.length; i++) {
      if (elapsed < sectionOffsets[i] + ritual.sections[i].seconds) { idx = i; break; }
    }
    if (idx !== sectionIndex) {
      if (elapsed > 0) woodblock();
      setSectionIndex(idx);
    }
  }, [elapsed, ritual.sections, sectionOffsets, sectionIndex, woodblock]);

  const current: Section = ritual.sections[sectionIndex];
  const sectionElapsed = elapsed - sectionOffsets[sectionIndex];
  const sectionRemaining = Math.max(0, current.seconds - sectionElapsed);

  const remaining = total - elapsed;
  const progress = elapsed / total;

  const promptJournal = () => {
    const note = window.prompt("Ritual complete. Add a reflection? (optional)");
    const entry: JournalEntry = {
      id: `${Date.now()}`,
      ritualId: ritual.id,
      ritualName: ritual.name,
      endedAt: Date.now(),
      note: note || undefined
    };
    setJournal([entry, ...journal]);
  };

  /* --- Visual sizing --- */
  const ringSize = 260;
  const ringStroke = 12;
  const innerPad = 16;
  const inner = ringSize - ringStroke * 2 - innerPad; // inner disc area

  const isBreath = current.kind === "breath";

  return (
    <div className="card">
      {/* Header */}
      <div className="mb-3">
        <div className="text-xs subtle">Guided</div>
        <div className="text-2xl h-soft">{ritual.name}</div>
      </div>

      {/* Ring + inner animation */}
      <div className="relative flex flex-col items-center justify-center">
        <ProgressRing progress={progress} size={ringSize} stroke={ringStroke} />

        {/* EXACTLY CENTRED clip area so visuals stay inside the ring */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            width: inner,
            height: inner,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
          }}
          aria-hidden
        >
          {/* Centre-balanced glass plate */}
          <div
            className="w-full h-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.14), rgba(255,255,255,0.06) 62%, rgba(0,0,0,0) 100%)",
              boxShadow: "inset 0 0 26px rgba(0,0,0,0.38), inset 0 0 140px rgba(0,0,0,0.25)"
            }}
          />

          {/* BREATH WRAP: handles centering via translate; children animate ONLY scale */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: inner, height: inner, pointerEvents: "none" }}
          >
            {/* CORE */}
            <div
              className={`absolute inset-0 rounded-full breath-core ${isBreath ? "breath-anim" : ""}`}
            />
            {/* HALO */}
            <div
              className={`absolute inset-0 rounded-full breath-halo ${isBreath ? "breath-anim" : ""}`}
            />
          </div>
        </div>

        {/* Time (above the layers) */}
        <div className="absolute text-center z-10">
          <div className="text-5xl font-semibold tabular-nums drop-shadow-sm">{formatTime(remaining)}</div>
        </div>
      </div>

      {/* Copy under the ring */}
      <div className="mt-4 text-center">
        <div className="text-base">Now: <span className="font-semibold">{current.label}</span></div>
        <div className="mt-1 text-[13px] subtle">
          {current.kind === "breath"
            ? "4–4–6 rhythm. Follow the soft glow to pace inhale, hold, exhale."
            : current.kind === "intention"
            ? "Set one clear intention for your day."
            : current.kind === "posture"
            ? "Stack posture: feet, hips, ribs, head."
            : "Settle your attention and breathe softly."}
        </div>
        <div className="mt-1 text-[12px] opacity-80">Section remaining: {formatTime(sectionRemaining)}</div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex justify-center gap-2">
        {!running ? (
          <button className="btn" onClick={start}>Start</button>
        ) : (
          <button className="btn" onClick={pause}>Pause</button>
        )}
        <button className="btn" onClick={exit}>Exit</button>
      </div>
    </div>
  );
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}
