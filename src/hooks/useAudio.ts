import * as React from "react";

type Sounds = { woodblock: () => void; gong: () => void; setEnabled: (b: boolean) => void };

export function useAudio(): Sounds {
  const ctxRef = React.useRef<AudioContext | null>(null);
  const enabledRef = React.useRef(true);
  const buffersRef = React.useRef<Record<string, AudioBuffer>>({});

  const getCtx = () => (ctxRef.current ??= new (window.AudioContext || (window as any).webkitAudioContext)());

  // Preload function
  const loadBuffer = async (url: string) => {
    const ctx = getCtx();
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  };

  // Kick off preload on mount
  React.useEffect(() => {
    (async () => {
      buffersRef.current["woodblock"] = await loadBuffer("/audio/woodblock.mp3");
      buffersRef.current["gong"] = await loadBuffer("/audio/gong.mp3");
    })();

    // Unlock AudioContext on first tap
    const onDown = () => {
      try {
        getCtx().resume();
      } catch {}
      window.removeEventListener("pointerdown", onDown);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  const playBuffer = (name: "woodblock" | "gong") => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    const buffer = buffersRef.current[name];
    if (!buffer) return; // still loading
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  const woodblock = () => playBuffer("woodblock");
  const gong = () => playBuffer("gong");
  const setEnabled = (b: boolean) => {
    enabledRef.current = b;
  };

  return { woodblock, gong, setEnabled };
}