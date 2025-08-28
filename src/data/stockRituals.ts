export type Section =
  | { kind: "breath"; label: string; seconds: number; breathType: import("./breathLibrary").BreathType; cycles?: number }
  | { kind: "intention"; label: string; seconds: number }
  | { kind: "posture"; label: string; seconds: number; prompts?: string[] }
  | { kind: "presence"; label: string; seconds: number; prompts?: string[] };

export type Ritual = {
  id: string;
  name: string;
  guided: boolean;
  description: string;
  totalSeconds: number;
  sections: Section[];
  journalPrompt?: string; // optional prompt at end
};

const min = (n: number) => n * 60;

export const stockRituals: Ritual[] = [
  {
    id: "morning_alignment",
    name: "Morning Alignment",
    guided: true,
    description:
      "Begin the day grounded. Gentle breathwork followed by intent-setting to align mind and body.",
    totalSeconds: 7 * 60,
    sections: [
      { kind: "intention", label: "Intention", seconds: 60 },
      { kind: "breath", label: "Breathing", seconds: 300, breathType: "fourFourSix_paused" },
      { kind: "presence", label: "Settle", seconds: 60, prompts: ["Settle your attention and breathe softly."] }
    ],
    journalPrompt: "What intention feels most alive now?"
  },

  // ======== NEW ========

  {
    id: "midday_reset",
    name: "Midday Reset",
    guided: true,
    description: "Release tension and recenter halfway through the day.",
    totalSeconds: min(5),
    sections: [
      // 1 min grounding breath (physio sigh ×3, then settle)
      { kind: "breath", label: "Grounding breath", seconds: 60, breathType: "physioSigh", cycles: 3 },
      // 2 mins 4-4-6
      { kind: "breath", label: "Breathing", seconds: 120, breathType: "fourFourSix_paused" },
      // 2 mins posture + presence scan
      {
        kind: "posture",
        label: "Posture & Presence",
        seconds: 120,
        prompts: [
          "Feet grounded.",
          "Spine long.",
          "Ribs soft.",
          "Jaw relaxed.",
          "Widen attention.",
          "Breathe gently."
        ]
      }
    ],
    journalPrompt: "One thing now feels lighter?"
  },

  {
    id: "stress_reset",
    name: "Stress Reset",
    guided: true,
    description: "Rapid downshift and recentre.",
    totalSeconds: 3 * 60,
    sections: [
      // 30 sec exhale-focus (mini physio loop)
      { kind: "breath", label: "Release", seconds: 30, breathType: "physioSigh" },
      // 1 min physio cycles
      { kind: "breath", label: "Physiological sigh", seconds: 60, breathType: "physioSigh" },
      // 90 sec centring
      {
        kind: "presence",
        label: "Centre",
        seconds: 90,
        prompts: [
          "Where are my feet?",
          "Where is my breath?",
          "Where is my focus?",
          "Allow the jaw to soften.",
          "Let the shoulders drop."
        ]
      }
    ],
    journalPrompt: "What shifted after the reset?"
  }
];
