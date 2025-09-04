import { useCallback, useState } from "react";

export function useAudio() {
  const [enabled, setEnabled] = useState(true);

  const play = useCallback(
    (src: string) => {
      if (!enabled) return;
      const audio = new Audio(src);
      audio.volume = 0.9; // adjust if needed
      audio.play().catch(() => {});
    },
    [enabled]
  );

  const woodblock = useCallback(() => play("/audio/woodblock.mp3"), [play]);
  const gong = useCallback(() => play("/audio/gong.mp3"), [play]);

  return { woodblock, gong, setEnabled };
}