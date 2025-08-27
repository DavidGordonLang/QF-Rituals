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
    const base = startAtRef.current;
    const pausedDelta = pausedAtRef.current ? (pausedAtRef.current - base) : 0;
    const t = Math.floor((now - base) / 1000);
    const e = Math.min(total, t);
    setElapsed(e);
    if (e >= total) { cancel(); setRunning(false); gong(); promptJournal(); return; }
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    const now = performance.now();
    if (!startAtRef.current) { startAtRef.current = now; }
    if (pausedAtRef.current) {
      // adjust start so elapsed stays consistent
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

  // SECTION LOGIC
  const [sectionIndex, setSectionIndex] = React.useState(0);
  const sectionOffsets = React.useMemo(() => {
    const arr: number[] = []; let acc = 0;
    ritual.sections.forEach(s => { arr.push(acc); acc += s.seconds; });
    return arr; // start times
  }, [ritual.sections]);

  React.useEffect(() => {
    // determine current section by elapsed
    let idx = ritual.sections.length - 1;
    for (let i = 0; i < ritual.sections.length; i++) {
      if (elapsed < sectionOffsets[i] + ritual.sections[i].seconds) { idx = i; break; }
    }
    if (idx !== sectionIndex) {
      if (elapsed > 0) woodblock(); // chime on change (not at t0)
      setSectionIndex(idx);
    }
  }, [elapsed, ritual.sections, sectionOffsets, sectionIndex, woodblock]);

  const currentSection: Section = ritual.sections[sectionIndex];
  const sectionElapsed = elapsed - sectionOffsets[sectionIndex];
  const sectionRemaining = Math.max(0, currentSection.seconds - sectionElapsed);

  const remaining = total - elapsed;
  const progress = elapsed / total;

  // JOURNAL
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

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs opacity-80">{ritual.guided ? "Guided" : "Instant"}</div>
          <div className="text-xl font-semibold">{ritual.name}</div>
        </div>
        <button className="btn" onClick={exit}>Exit</button>
      </div>

      <div className="relative flex flex-col items-center">
        {/* PROGRESS RING */}
        <ProgressRing progress={progress} />

        {/* BREATH GLOW */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-white/10 breath-glow"
          style={{ animation: currentSection.kind === "breath" ? chooseBreathAnimation() : undefined }}
          aria-hidden
        />

        {/* TIMER TEXT */}
        <div className="-mt-40 text-center">
          <div className="text-5xl font-semibold tabular-nums">{formatTime(remaining)}</div>
        </div>
      </div>

      {/* SECTION LABEL & DESCRIPTION */}
      <div className="mt-4 text-center">
        <div className="text-sm">Now: <span className="font-semibold">{currentSection.label}</span></div>
        {currentSection.kind === "breath" ? (
          <p className="text-sm text-slate-300 mt-1">
            4–4–6 rhythm. Follow the soft glow to pace inhale, hold, exhale.
          </p>
        ) : currentSection.kind === "intention" ? (
          <p className="text-sm text-slate-300 mt-1">Set one clear intention for your day.</p>
        ) : currentSection.kind === "posture" ? (
          <p className="text-sm text-slate-300 mt-1">Stack posture: feet, hips, ribs, head.</p>
        ) : (
          <p className="text-sm text-slate-300 mt-1">Settle your attention and breathe softly.</p>
        )}
        <div className="text-xs opacity-80 mt-1">Section remaining: {formatTime(sectionRemaining)}</div>
      </div>

      {/* CONTROLS */}
      <div className="mt-5 flex justify-center gap-2">
        {!running ? (
          <button className="btn" onClick={start}>Start</button>
        ) : (
          <button className="btn" onClick={pause}>Pause</button>
        )}
      </div>
    </div>
  );
};

function chooseBreathAnimation() {
  // smoother loop using the 14s cycle defined in tailwind.css
  return "breathCycle14 14s linear infinite";
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${m}:${ss.toString().padStart(2, "0")}`;
}
