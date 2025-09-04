import React from "react";
import { Ritual, Section } from "../data/stockRituals";
import { ProgressRing } from "./ProgressRing";
import { useAudio } from "../hooks/useAudio";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getBreathState, BreathType } from "../data/breathLibrary";

type Props = {
  ritual: Ritual;
  onExit: () => void;
  onCompleteJournal?: (entry: JournalEntry) => void;
};
type JournalEntry = { id: string; ritualId: string; ritualName: string; endedAt: number; note?: string };

const JOURNAL_KEY = "qf_journal_v1";

export const TimerScreen: React.FC<Props> = ({ ritual, onExit, onCompleteJournal }) => {
  const total = ritual.totalSeconds;

  const [elapsed, setElapsed] = React.useState(0);
  const [fineElapsed, setFineElapsed] = React.useState(0);
  const [running, setRunning] = React.useState(false);

  const [, setJournal] = useLocalStorage<JournalEntry[]>(JOURNAL_KEY, []);
  const [soundEnabled] = useLocalStorage<boolean>("qf_sound_enabled", true);

  const rafRef = React.useRef<number | null>(null);
  const startAtRef = React.useRef<number | null>(null);
  const pausedAtRef = React.useRef<number | null>(null);

  const { woodblock, gong, setEnabled } = useAudio();
  React.useEffect(() => { setEnabled(soundEnabled); }, [soundEnabled, setEnabled]);

  const cancel = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };

  const tick = (now: number) => {
    if (!startAtRef.current) return;
    const secsFloat = (now - startAtRef.current) / 1000;
    const secsInt = Math.floor(secsFloat);

    const e  = Math.min(total, secsInt);
    const ef = Math.min(total, secsFloat);

    setElapsed(e);
    setFineElapsed(ef);

    if (e >= total) {
      cancel(); setRunning(false);
      gong();
      finalize();
      return;
    }
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

  const pause = () => { if (!running) return; cancel(); pausedAtRef.current = performance.now(); setRunning(false); };
  const exit  = () => { cancel(); setRunning(false); onExit(); };
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
  const sectionElapsedInt  = elapsed      - sectionOffsets[sectionIndex];
  const sectionElapsedFine = fineElapsed  - sectionOffsets[sectionIndex];

  const remaining = total - elapsed;
  const progress  = elapsed / total;

  // Breathing (via library)
  const isBreathSection = current.kind === "breath";
  const breathType: BreathType | null = isBreathSection ? current.breathType : null;

  // only activate breathing visuals once we're actually running
  const breathActive = isBreathSection && running && sectionElapsedFine > 0.05;

  // Compute base breath state
  const baseBreath = React.useMemo(() => {
    if (!breathActive || !breathType)
      return { phase: null as null | "Inhale" | "Hold" | "Exhale", scale: 0, glowOpacity: 0, cycleLength: 0 };
    return getBreathState(breathType, sectionElapsedFine);
  }, [breathActive, breathType, sectionElapsedFine]);

  // Handle limited cycles (e.g., physioSigh ×3 then idle shimmer)
  const breath = React.useMemo(() => {
    if (!breathActive || !breathType) return baseBreath;

    // if the section specifies exact cycles, respect them, then idle
    const cycles = (current as any).cycles as number | undefined;
    if (cycles && breathType === "physioSigh" && baseBreath.cycleLength > 0) {
      const limit = cycles * baseBreath.cycleLength;
      if (sectionElapsedFine >= limit) {
        // idle shimmer: tiny, subtle pulse, no label
        const t = sectionElapsedFine - limit;
        const pulse = 0.02 * Math.sin((t / 1.2) * Math.PI * 2);
        return {
          phase: null,
          scale: Math.max(0.10, 0.12 + pulse),
          glowOpacity: 0.60 + 0.05 * Math.sin((t / 1.2) * Math.PI * 2),
          cycleLength: baseBreath.cycleLength
        };
      }
    }
    return baseBreath;
  }, [breathActive, breathType, baseBreath, current, sectionElapsedFine]);

  const displayPhase = breath.phase; // null during pauses/idle

  // Word cross-fades (1.6s) and pause fade (3.2s)
  const [topText, setTopText]       = React.useState<string | null>(null);
  const [bottomText, setBottomText] = React.useState<string | null>(null);
  const [showTop, setShowTop]       = React.useState(true);
  const [fadeOutText, setFadeOutText] = React.useState<string | null>(null);
  const [fadeOutActive, setFadeOutActive] = React.useState(false);
  const fadeTimeout = React.useRef<number | null>(null);
  const prevDisplay  = React.useRef<string | null>(null);

  // When breath toggles on/off (start/pause), reset text layers
  React.useEffect(() => {
    if (!breathActive) {
      setTopText(null); setBottomText(null); setShowTop(true);
      setFadeOutText(null); setFadeOutActive(false);
      if (fadeTimeout.current) { window.clearTimeout(fadeTimeout.current); fadeTimeout.current = null; }
      prevDisplay.current = null;
    }
  }, [breathActive]);

  React.useEffect(() => {
    if (!breathActive) return;

    if (!displayPhase) {
      const last = prevDisplay.current;
      if (last) {
        setFadeOutText(last);
        setFadeOutActive(false);
        requestAnimationFrame(() => setFadeOutActive(true));
        if (fadeTimeout.current) window.clearTimeout(fadeTimeout.current);
        fadeTimeout.current = window.setTimeout(() => {
          setFadeOutText(null); setFadeOutActive(false); fadeTimeout.current = null;
        }, 3300);
      }
      setTopText(null); setBottomText(null); setShowTop(true);
      prevDisplay.current = null;
      return;
    }

    if (prevDisplay.current === displayPhase) return;

    if (showTop) setBottomText(displayPhase);
    else         setTopText(displayPhase);
    const id = setTimeout(() => setShowTop(!showTop), 20);
    prevDisplay.current = displayPhase;
    return () => clearTimeout(id);
  }, [displayPhase, showTop, breathActive]);

  // Completion -> Journal Editor
  const finalize = () => {
    const entry: JournalEntry = {
      id: `${Date.now()}`,
      ritualId: ritual.id,
      ritualName: ritual.name,
      endedAt: Date.now()
    };
    if (onCompleteJournal) { onCompleteJournal(entry); return; }
    try {
      const raw = localStorage.getItem(JOURNAL_KEY);
      const list: JournalEntry[] = raw ? JSON.parse(raw) : [];
      const next = [entry, ...list];
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(next));
      setJournal(next);
    } catch { /* ignore */ }
    onExit();
  };

  // Sizes
  const ringSize  = 260;
  const ringStroke= 12;
  const innerPad  = 16;
  const inner     = ringSize - ringStroke * 2 - innerPad;
  const phaseFontSize = Math.floor(inner * 0.16);
  const phaseMaxWidth = Math.floor(inner * 0.60);

  return (
    <div className="card fade-in relative overflow-hidden">
      {/* Header */}
      <div className="mb-3">
        <div className="text-xs text-slate-300">{ritual.guided ? "Guided" : "Instant"}</div>
        <div className="text-2xl font-semibold tracking-tight">{ritual.name}</div>
      </div>

      {/* Ring / Inner */}
      <div className="relative flex flex-col items-center justify-center">
        <ProgressRing progress={progress} size={ringSize} stroke={ringStroke} />

        <div
          className="absolute rounded-full overflow-hidden"
          style={{ width: inner, height: inner, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          aria-hidden
        >
          <div className="w-full h-full number-plate" />

          {/* Glow: only active when running */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: inner, height: inner, pointerEvents: "none" }}
          >
            <div
              className="absolute inset-0 rounded-full breath-core"
              style={{
                transform: `scale(${breathActive ? breath.scale : 0})`,
                opacity: breathActive ? breath.glowOpacity : 0,
                transition: "transform 200ms ease, opacity 240ms ease"
              }}
            />
            <div
              className="absolute inset-0 rounded-full breath-halo"
              style={{
                transform: `scale(${breathActive ? breath.scale : 0})`,
                opacity: breathActive ? Math.min(1, breath.glowOpacity + 0.05) : 0,
                transition: "transform 200ms ease, opacity 240ms ease"
              }}
            />
          </div>

          {/* Phase words (only when running) */}
          {breathActive && (topText || bottomText) && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              {topText && (
                <span
                  className="phase-layer font-semibold drop-shadow-sm text-center"
                  style={{
                    fontSize: `${phaseFontSize}px`,
                    maxWidth: `${phaseMaxWidth}px`,
                    lineHeight: 1.1,
                    letterSpacing: "0.02em",
                    ...(showTop ? { opacity: 1, transform: "translateY(0)" } : { opacity: 0, transform: "translateY(-4px)" })
                  }}
                >
                  {topText}
                </span>
              )}
              {bottomText && (
                <span
                  className="phase-layer font-semibold drop-shadow-sm text-center"
                  style={{
                    fontSize: `${phaseFontSize}px`,
                    maxWidth: `${phaseMaxWidth}px`,
                    lineHeight: 1.1,
                    letterSpacing: "0.02em",
                    ...(!showTop ? { opacity: 1, transform: "translateY(0)" } : { opacity: 0, transform: "translateY(-4px)" })
                  }}
                >
                  {bottomText}
                </span>
              )}
            </div>
          )}

          {/* Word → nothing during pauses / idle shimmer (only when running) */}
          {breathActive && !displayPhase && (prevDisplay.current || fadeOutText) && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span
                className={`phase-to-null ${fadeOutActive ? "phase-to-null-active" : ""} font-semibold drop-shadow-sm text-center`}
                style={{
                  fontSize: `${phaseFontSize}px`,
                  maxWidth: `${phaseMaxWidth}px`,
                  lineHeight: 1.1,
                  letterSpacing: "0.02em"
                }}
              >
                {fadeOutText}
              </span>
            </div>
          )}
        </div>

        {/* Time: center before start; glide to top-right only when breathActive */}
        <div
          className={`absolute z-10 transition-all duration-[1400ms] ease-out
                      ${breathActive
                        ? "top-3 right-4 text-2xl opacity-80"
                        : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl opacity-100"}`}
        >
          <div
            className="font-semibold tabular-nums drop-shadow-sm tracking-[.05em]"
            style={{ minWidth: "4ch", textAlign: breathActive ? ("right" as const) : ("center" as const) }}
          >
            {formatTime(remaining)}
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="mt-4 text-center">
        <div className="text-base">Now: <span className="font-semibold">{current.label}</span></div>
        <div className="mt-1 text-[13px] text-slate-300">
          {current.kind === "breath"
            ? current.label
            : current.kind === "intention"
            ? "Set one clear intention for your day."
            : current.kind === "posture"
            ? "Stack posture: feet, hips, ribs, head."
            : "Settle your attention and breathe softly."}
        </div>
        <div className="mt-1 text-[12px] opacity-80">
          Section remaining: {formatTime(Math.max(0, current.seconds - sectionElapsedInt))}
        </div>
      </div>

      {/* Controls */}
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
