import * as React from "react";

type Sounds = { woodblock: () => void; gong: () => void; setEnabled: (b: boolean)=>void };

export function useAudio(): Sounds {
  const ctxRef = React.useRef<AudioContext | null>(null);
  const enabledRef = React.useRef(true);

  const getCtx = () => (ctxRef.current ??= new (window.AudioContext || (window as any).webkitAudioContext)());

  const woodblock = () => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "square"; o.frequency.setValueAtTime(800, ctx.currentTime);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.14);
  };

  const gong = () => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(440, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 1.2);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 2.3);
  };

  const setEnabled = (b: boolean) => { enabledRef.current = b; };

  React.useEffect(() => {
    const onDown = () => { try { getCtx().resume(); } catch {} window.removeEventListener("pointerdown", onDown); };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return { woodblock, gong, setEnabled };
}
