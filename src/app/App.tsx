import * as React from "react";

type Category = "Work" | "Personal";

export const App: React.FC = () => {
  const [running, setRunning] = React.useState(false);
  const [startAt, setStartAt] = React.useState<number | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [category, setCategory] = React.useState<Category>("Personal");
  const rafRef = React.useRef<number | null>(null);

  /* Simple always-running ticker when active */
  const tick = (now: number) => {
    if (!startAt) return;
    setElapsed(now - startAt);
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    const now = performance.now();
    setStartAt(now - elapsed); // resume from elapsed
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const pause = () => {
    if (!running) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setRunning(false);
  };

  React.useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const ms = Math.max(0, Math.floor(elapsed));
  const hh = Math.floor(ms / 3600000);
  const mm = Math.floor((ms % 3600000) / 60000);
  const ss = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  const timeText = `${pad(hh)}:${pad(mm)}:${pad(ss)}.${pad(cs)}`;

  /* Progress ring demo (fills over 60 minutes, wraps) */
  const minute = 60_000;
  const progress = ((ms % (60 * minute)) / (60 * minute));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Echo Timer</h1>
        <p className="text-sm text-slate-200/80">Lap mode · Always running · Local only</p>
      </header>

      {/* Current lap card */}
      <section className="card mb-4">
        <div className="text-xs text-slate-300 mb-2">Current Lap</div>
        <div className="rounded-2xl number-plate p-6 flex items-center justify-center">
          <TimerDisplay text={timeText} />
        </div>
      </section>

      {/* Controls card */}
      <section className="card mb-6">
        {/* Category pills */}
        <div className="flex gap-2 mb-4">
          {(["Work", "Personal"] as Category[]).map((c) => (
            <button
              key={c}
              className={`pill ${category === c ? "pill-active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Project dropdown (placeholder) */}
        <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-3">
          <span className="text-sm text-slate-200/90">Project</span>
          <button className="btn btn-teal h-8 px-3">Select</button>
        </div>
      </section>

      {/* Big round Start / Pause */}
      <div className="flex items-center justify-center my-10">
        {!running ? (
          <button className="big-round btn-teal" onClick={start}>Start</button>
        ) : (
          <div className="flex gap-3">
            <button className="big-round btn-teal" onClick={pause}>Pause</button>
            <button className="big-round btn-teal" onClick={() => { setElapsed(0); setStartAt(null); setRunning(false); }}>
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Progress ring */}
      <div className="card">
        <Ring progress={progress} />
      </div>
    </div>
  );
};

/* ---------- bits ---------- */

const TimerDisplay: React.FC<{ text: string }> = ({ text }) => (
  <div className="text-4xl sm:text-5xl font-semibold tabular-nums tracking-wider">{text}</div>
);

const Ring: React.FC<{ progress: number }> = ({ progress }) => {
  const size = 220;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circ * (1 - clamped);

  return (
    <svg width={size} height={size} className="mx-auto my-6 block">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1FA2A6"/>
          <stop offset="100%" stopColor="#2072A6"/>
        </linearGradient>
      </defs>

      {/* track */}
      <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} fill="none" />
      {/* progress */}
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        className="ring-grad"
        strokeLinecap="round"
        strokeWidth={stroke}
        fill="none"
        style={{ strokeDasharray: circ, strokeDashoffset: offset, transition: "stroke-dashoffset 0s" }}
      />
      {/* label */}
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="rgba(255,255,255,.85)">
        60-min cycle demo
      </text>
    </svg>
  );
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
