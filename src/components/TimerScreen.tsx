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
  const [soundEnabled] = useLocalStorage<boolean>("qf_sound_enabled", true);

  const rafRef = React.useRef<number | null>(null);
  const startAtRef = React.useRef<number | null>(null);
  const pausedAtRef = React.useRef<number | null>(null);

  const { woodblock, gong, setEnabled } = useAudio();

  React.useEffect(() => { setEnabled(soundEnabled); }, [soundEnabled, setEnabled]);

  const cancel = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };

  const tick = (now: number) => {
    if (!startAtRef.current) return;
    const t = Math.floor((now - startAtRef.current) / 1000);
    const e = Math.min(total, t);
    setElapsed(e);
    if (e >= total) {
      cancel(); setRunning(false);
      gong();
      promptJournalAndExit();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    const now = performance.now();
    if (!startAtRef.current) startAtRef.current = now;
    if (pausedAtRef.current) { const pauseDur = now - pausedAtRef.current; startAtRef.current += pauseDur; pausedAtRef.current = null; }
    rafRef.current = requestAnimationFrame(tick);
    setRunning(true);
  };

  const pause = () => { if (!running) return; cancel(); pausedAtRef.current = performance.now(); setRunning(false); };
  const exit = () => { cancel(); setRunning(false); onExit(); };
  React.useEffect(() => () => cancel(), []);

  // Sections
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
    if (idx !== sectionIndex) { if (elapsed > 0) woodblock(); setSectionIndex(idx); }
  }, [elapsed, ritual.sections, sectionOffsets, sectionIndex, woodblock]);

  const current: Section = ritual.sections[sectionIndex];
  const sectionElapsed = elapsed - sectionOffsets[sectionIndex];
  const sectionRemaining = Math.max(0, current.seconds - sectionElapsed);

  const remaining = total - elapsed;
  const progress = elapsed / total;

  // Complete → (optional) note → save → return to home
  const promptJournalAndExit = () => {
    const note = window.prompt("Ritual complete. Add a reflection? (optional)") ?? undefined;
    const entry: JournalEntry = {
      id: `${Date.now()}`, ritualId: ritual.id, ritualName: ritual.name, endedAt: Date.now(),
      note: note && note.trim().length ? note : undefined
    };
    setJournal([entry, ...journal]);
    onExit();
  };

  // Visual sizing
  const ringSize = 260;
  const ringStroke = 12;
  const innerPad = 16;
  const inner = ringSize - ringStroke * 2 - innerPad;
  const isBreath = current.kind === "breath";

  return (
    <div className="card">
      <div className="mb-3">
        <div className="text-xs text-slate-300">{ritual.guided ? "Guided" : "Instant"}</div>
        <div className="text-2xl font-semibold tracking-tight">{ritual.name}</div>
      </div>

      <div className="relative flex flex-col items-center justify-center">
        <ProgressRing progress={progress} size={ringSize} stroke={ringStroke} />

        {/* Centred inner disc (clip) */}
        <div className="absolute rounded-full overflow-hidden"
             style={{ width: inner, height: inner, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
             aria-hidden>
          <div className="w-full h-full number-plate" />

          {/* Breath wrapper (translate keeps it centred; children animate scale only) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
               style={{ width: inner, height: inner, pointerEvents: "none" }}>
            <div className={`absolute inset-0 rounded-full breath-core ${isBreath ? "breath-anim" : ""}`} />
            <div className={`absolute inset-0 rounded-full breath-halo ${isBreath ? "breath-anim" : ""}`} />
          </div>
        </div>

        <div className="absolute text-center z-10">
          <div className="text-5xl font-semibold tabular-nums drop-shadow-sm">{formatTime(remaining)}</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="text-base">Now: <span className="font-semibold">{current.label}</span></div>
        <div className="mt-1 text-[13px] text-slate-300">
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

      <div className="mt-6 flex justify-center gap-2">
        {!running ? <button className="btn" onClick={start}>Start</button> : <button className="btn" onClick={pause}>Pause</button>}
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
