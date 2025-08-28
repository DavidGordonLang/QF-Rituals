import React from "react";
import { Ritual, Section } from "../data/stockRituals";
import { ProgressRing } from "./ProgressRing";
import { useAudio } from "../hooks/useAudio";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Props = { ritual: Ritual; onExit: () => void };
type JournalEntry = { id: string; ritualId: string; ritualName: string; endedAt: number; note?: string };

export const TimerScreen: React.FC<Props> = ({ ritual, onExit }) => {
  const total = ritual.totalSeconds;

  // coarse integer seconds for counters, fine float seconds for smooth timing
  const [elapsed, setElapsed] = React.useState(0);
  const [fineElapsed, setFineElapsed] = React.useState(0);
  const [running, setRunning] = React.useState(false);

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
    const secsFloat = (now - startAtRef.current) / 1000;
    const secsInt = Math.floor(secsFloat);

    const e  = Math.min(total, secsInt);
    const ef = Math.min(total, secsFloat);

    setElapsed(e);
    setFineElapsed(ef);

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
  const sectionRemaining   = Math.max(0, current.seconds - sectionElapsedInt);

  const remaining = total - elapsed;
  const progress  = elapsed / total;

  // ——— New breathing cycle with pauses ———
  const isBreath = current.kind === "breath";

  // Phase durations (seconds)
  const INHALE = 4.0;
  const PAUSE1 = 0.75;   // after inhale
  const HOLD   = 4.0;
  const EXHALE = 6.0;
  const PAUSE2 = 0.75;   // after exhale
  const CYCLE  = INHALE + PAUSE1 + HOLD + EXHALE + PAUSE2; // 15.5

  const breath = React.useMemo(() => {
    if (!isBreath) return { phase: null as null | "Inhale" | "Hold" | "Exhale", scale: 0, glowOpacity: 1 };
    let t = sectionElapsedFine % CYCLE; if (t < 0) t += CYCLE;

    /* Visibility and motion tuning */
    const MIN = 0.06;      // slightly larger “point” so it remains visible
    const MAX = 1.00;      // full
    const EXHALE_PULSE = 0.10; // stronger micro-breath when tiny
    const PAUSE_PULSE  = 0.06; // subtle pulse when large

    const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

    if (t < INHALE) {
      const p = t / INHALE;                       // expand 0 -> 1
      return { phase: "Inhale" as const, scale: lerp(MIN, MAX, p), glowOpacity: 0.85 };
    }
    t -= INHALE;

    if (t < PAUSE1) {
      // full size, dim + gentle pulse
      const pulse = PAUSE_PULSE * Math.sin((t / PAUSE1) * Math.PI * 2);
      return { phase: null, scale: MAX, glowOpacity: 0.72 + pulse };
    }
    t -= PAUSE1;

    if (t < HOLD) {
      return { phase: "Hold" as const, scale: MAX, glowOpacity: 0.85 };
    }
    t -= HOLD;

    if (t < EXHALE) {
      const p = t / EXHALE;                       // contract 1 -> 0
      return { phase: "Exhale" as const, scale: lerp(MAX, MIN, p), glowOpacity: 0.85 };
    }
    t -= EXHALE;

    // pause after exhale: tiny but visibly “breathes” a bit
    const pulse = EXHALE_PULSE * Math.sin((t / PAUSE2) * Math.PI * 2);
    const pulseScale = Math.max(MIN, MIN + pulse);
    return { phase: null, scale: pulseScale, glowOpacity: 0.72 + (PAUSE_PULSE * 0.6) * Math.sin((t / PAUSE2) * Math.PI * 2) };
  }, [isBreath, sectionElapsedFine]);

  const displayPhase = breath.phase; // null during pauses

  // —— Cross-fade label state ——
  const [topText, setTopText]       = React.useState<string | null>(displayPhase);
  const [bottomText, setBottomText] = React.useState<string | null>(null);
  const [showTop, setShowTop]       = React.useState(true);

  // Long fade-to-null controller
  const [fadeOutText, setFadeOutText] = React.useState<string | null>(null);
  const [fadeOutActive, setFadeOutActive] = React.useState(false);
  const fadeTimeout = React.useRef<number | null>(null);

  const prevIsBreath = React.useRef(isBreath);
  const prevDisplay  = React.useRef<string | null>(displayPhase);

  React.useEffect(() => {
    if (!isBreath && prevIsBreath.current) {
      // leaving breath entirely
      setTopText("Inhale");
      setBottomText(null);
      setShowTop(true);
      setFadeOutText(null);
      setFadeOutActive(false);
      if (fadeTimeout.current) { window.clearTimeout(fadeTimeout.current); fadeTimeout.current = null; }
    }
    prevIsBreath.current = isBreath;
  }, [isBreath]);

  React.useEffect(() => {
    // If now pausing (no label), mount a visible span and then activate the fade class next frame
    if (!displayPhase) {
      const last = prevDisplay.current;
      if (last) {
        setFadeOutText(last);
        setFadeOutActive(false);
        // trigger transition on next frame so it animates
        requestAnimationFrame(() => setFadeOutActive(true));
        if (fadeTimeout.current) window.clearTimeout(fadeTimeout.current);
        fadeTimeout.current = window.setTimeout(() => {
          setFadeOutText(null);
          setFadeOutActive(false);
          fadeTimeout.current = null;
        }, 3300); // a hair over 3.2s to ensure completion
      }
      // clear layered words
      setTopText(null);
      setBottomText(null);
      setShowTop(true);
      prevDisplay.current = null;
      return;
    }

    // Have a label (Inhale/Hold/Exhale)
    if (prevDisplay.current === displayPhase) return;

    if (showTop) setBottomText(displayPhase);
    else         setTopText(displayPhase);

    const id = setTimeout(() => setShowTop(!showTop), 20);
    prevDisplay.current = displayPhase;
    return () => clearTimeout(id);
  }, [displayPhase, showTop]);

  // Complete → (optional) note → save → return to home
  const promptJournalAndExit = () => {
    const note = window.prompt("Ritual complete. Add a reflection? (optional)") ?? undefined;
    const entry: JournalEntry = {
      id: `${Date.now()}`,
      ritualId: ritual.id,
      ritualName: ritual.name,
      endedAt: Date.now(),
      note: note && note.trim().length ? note : undefined
    };
    setJournal(prev => [entry, ...prev]); // functional update for reliability
    onExit();
  };

  // Visual sizing
  const ringSize  = 260;
  const ringStroke= 12;
  const innerPad  = 16;
  const inner     = ringSize - ringStroke * 2 - innerPad;

  // (We’re keeping your existing big type; no size tweaks yet)
  const phaseFontSize = Math.floor(inner * 0.30);
  const phaseMaxWidth = Math.floor(inner * 0.75);

  return (
    <div className="card fade-in relative overflow-hidden">
      {/* Header */}
      <div className="mb-3">
        <div className="text-xs text-slate-300">{ritual.guided ? "Guided" : "Instant"}</div>
        <div className="text-2xl font-semibold tracking-tight">{ritual.name}</div>
      </div>

      {/* Ring + inner animation */}
      <div className="relative flex flex-col items-center justify-center">
        <ProgressRing progress={progress} size={ringSize} stroke={ringStroke} />

        <div
          className="absolute rounded-full overflow-hidden"
          style={{ width: inner, height: inner, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          aria-hidden
        >
          <div className="w-full h-full number-plate" />

          {/* Glow: React-driven scale + opacity (with micro-breath during pauses) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: inner, height: inner, pointerEvents: "none" }}
          >
            <div
              className="absolute inset-0 rounded-full breath-core"
              style={{
                transform: `scale(${breath.scale})`,
                opacity: breath.glowOpacity,
                transition: "transform 90ms linear, opacity 120ms ease"
              }}
            />
            <div
              className="absolute inset-0 rounded-full breath-halo"
              style={{
                transform: `scale(${breath.scale})`,
                opacity: Math.min(1, breath.glowOpacity + 0.05),
                transition: "transform 90ms linear, opacity 120ms ease"
              }}
            />
          </div>

          {/* Word↔word cross-fade */}
          {isBreath && (topText || bottomText) && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              {topText && (
                <span
                  className="phase-layer font-semibold drop-shadow-sm text-center"
                  style={{
                    fontSize: `${phaseFontSize}px`,
                    maxWidth: `${phaseMaxWidth}px`,
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                    ...(showTop
                      ? { opacity: 1, transform: "translateY(0)" }
                      : { opacity: 0, transform: "translateY(-4px)" })
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
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                    ...(!showTop
                      ? { opacity: 1, transform: "translateY(0)" }
                      : { opacity: 0, transform: "translateY(-4px)" })
                  }}
                >
                  {bottomText}
                </span>
              )}
            </div>
          )}

          {/* Word → nothing (pause) long fade (now truly animated) */}
          {isBreath && !displayPhase && fadeOutText && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span
                className={`phase-to-null ${fadeOutActive ? "phase-to-null-active" : ""} font-semibold drop-shadow-sm text-center`}
                style={{
                  fontSize: `${phaseFontSize}px`,
                  maxWidth: `${phaseMaxWidth}px`,
                  lineHeight: 1,
                  letterSpacing: "0.02em"
                }}
              >
                {fadeOutText}
              </span>
            </div>
          )}
        </div>

        {/* Countdown time: glide up only during breath (1.4s) — stable width box */}
        <div
          className={`absolute z-10 transition-all duration-[1400ms] ease-out
                      ${isBreath
                        ? "top-3 right-4 text-2xl opacity-80"
                        : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl opacity-100"}`}
        >
          <div
            className="font-semibold tabular-nums drop-shadow-sm tracking-[.05em]"
            style={{ minWidth: "4ch", textAlign: isBreath ? ("right" as const) : ("center" as const) }}
          >
            {formatTime(remaining)}
          </div>
        </div>
      </div>

      {/* Copy under the ring */}
      <div className="mt-4 text-center">
        <div className="text-base">
          Now: <span className="font-semibold">{current.label}</span>
        </div>
        <div className="mt-1 text-[13px] text-slate-300">
          {current.kind === "breath"
            ? "4–4–6 rhythm with calm pauses. Follow the glow."
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
