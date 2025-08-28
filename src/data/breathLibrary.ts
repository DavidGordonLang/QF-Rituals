export type BreathType =
  | "fourFourSix_paused"        // 4-4-6 with short pauses after inhale/exhale
  | "fourFourSix_continuous"    // 4-4-6 continuous (no extra pauses)
  | "box_4_4_4_4"               // 4-4-4-4 box breathing
  | "fourSevenEight_pausedEnd"  // 4-7-8 with a pause after exhale
  | "resonant_5_5"              // 5.5/5.5 continuous
  | "physioSigh";               // physiological sigh loop (double inhale + long exhale)

export type BreathState = {
  phase: null | "Inhale" | "Hold" | "Exhale";
  scale: number;       // 0..1 for inner glow
  glowOpacity: number; // 0..1 visual brightness
  cycleLength: number; // seconds for one full cycle (for reference)
};

/**
 * Core helper — returns the visual state (scale/opacity) and label for a given technique.
 * `t` is the fine-grained seconds elapsed within the enclosing section.
 */
export function getBreathState(
  type: BreathType,
  t: number
): BreathState {
  // Shared visual tuning
  const MIN = 0.06; // tiny but visible
  const MAX = 1.00;

  const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
  const pulse = (amt: number, time: number, dur: number) =>
    amt * Math.sin((time / dur) * Math.PI * 2);

  switch (type) {
    case "fourFourSix_paused": {
      const IN = 4, P1 = 0.75, HD = 4, EX = 6, P2 = 0.75;
      const C = IN + P1 + HD + EX + P2;
      t = ((t % C) + C) % C;

      if (t < IN) {
        const p = t / IN;
        return { phase: "Inhale", scale: lerp(MIN, MAX, p), glowOpacity: 0.85, cycleLength: C };
      }
      t -= IN;

      if (t < P1) {
        return {
          phase: null,
          scale: MAX,
          glowOpacity: 0.72 + pulse(0.06, t, P1),
          cycleLength: C
        };
      }
      t -= P1;

      if (t < HD) {
        return { phase: "Hold", scale: MAX, glowOpacity: 0.85, cycleLength: C };
      }
      t -= HD;

      if (t < EX) {
        const p = t / EX;
        return { phase: "Exhale", scale: lerp(MAX, MIN, p), glowOpacity: 0.85, cycleLength: C };
      }
      t -= EX;

      return {
        phase: null,
        scale: Math.max(MIN, MIN + pulse(0.10, t, P2)),
        glowOpacity: 0.72 + pulse(0.036, t, P2),
        cycleLength: C
      };
    }

    case "fourFourSix_continuous": {
      const IN = 4, HD = 4, EX = 6;
      const C = IN + HD + EX;
      t = ((t % C) + C) % C;

      if (t < IN) {
        const p = t / IN;
        return { phase: "Inhale", scale: lerp(MIN, MAX, p), glowOpacity: 0.85, cycleLength: C };
      }
      t -= IN;

      if (t < HD) {
        return { phase: "Hold", scale: MAX, glowOpacity: 0.85, cycleLength: C };
      }
      t -= HD;

      const p = t / EX;
      return { phase: "Exhale", scale: lerp(MAX, MIN, p), glowOpacity: 0.85, cycleLength: C };
    }

    case "box_4_4_4_4": {
      const L = 4, C = L * 4;
      t = ((t % C) + C) % C;

      if (t < L) {
        return { phase: "Inhale", scale: lerp(MIN, MAX, t / L), glowOpacity: 0.85, cycleLength: C };
      }
      t -= L;
      if (t < L) return { phase: "Hold", scale: MAX, glowOpacity: 0.85, cycleLength: C };
      t -= L;
      if (t < L) return { phase: "Exhale", scale: lerp(MAX, MIN, t / L), glowOpacity: 0.85, cycleLength: C };
      // final hold
      return { phase: "Hold", scale: MIN, glowOpacity: 0.85, cycleLength: C };
    }

    case "fourSevenEight_pausedEnd": {
      const IN = 4, HD = 7, EX = 8, P = 0.75;
      const C = IN + HD + EX + P;
      t = ((t % C) + C) % C;

      if (t < IN) {
        return { phase: "Inhale", scale: lerp(MIN, MAX, t / IN), glowOpacity: 0.85, cycleLength: C };
      }
      t -= IN;
      if (t < HD) return { phase: "Hold", scale: MAX, glowOpacity: 0.85, cycleLength: C };
      t -= HD;
      if (t < EX) return { phase: "Exhale", scale: lerp(MAX, MIN, t / EX), glowOpacity: 0.85, cycleLength: C };
      t -= EX;

      return {
        phase: null,
        scale: Math.max(MIN, MIN + pulse(0.08, t, P)),
        glowOpacity: 0.72 + pulse(0.04, t, P),
        cycleLength: C
      };
    }

    case "resonant_5_5": {
      const IN = 5.5, EX = 5.5, C = IN + EX;
      t = ((t % C) + C) % C;

      if (t < IN) return { phase: "Inhale", scale: lerp(MIN, MAX, t / IN), glowOpacity: 0.85, cycleLength: C };
      t -= IN;
      return { phase: "Exhale", scale: lerp(MAX, MIN, t / EX), glowOpacity: 0.85, cycleLength: C };
    }

    case "physioSigh": {
      // Approximation for visuals: inhale 2.5s, top-up 1s, long exhale 6s
      const IN1 = 2.5, IN2 = 1.0, EX = 6.0;
      const C = IN1 + IN2 + EX;
      t = ((t % C) + C) % C;

      if (t < IN1) return { phase: "Inhale", scale: lerp(MIN, MAX * 0.8, t / IN1), glowOpacity: 0.85, cycleLength: C };
      t -= IN1;
      if (t < IN2) return { phase: "Inhale", scale: lerp(MAX * 0.8, MAX, t / IN2), glowOpacity: 0.9, cycleLength: C };
      t -= IN2;
      return { phase: "Exhale", scale: lerp(MAX, MIN, t / EX), glowOpacity: 0.85, cycleLength: C };
    }
  }
}
