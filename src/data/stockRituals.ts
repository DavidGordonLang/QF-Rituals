import type { BreathType } from "./breathLibrary";

export type Section =
  | { kind: "breath"; label: string; seconds: number; breathType: BreathType; cycles?: number }
  | { kind: "intention"; label: string; seconds: number; prompts?: string[] }
  | { kind: "posture"; label: string; seconds: number; prompts?: string[] }
  | { kind: "presence"; label: string; seconds: number; prompts?: string[] };

export type Ritual = {
  id: string;
  name: string;
  guided: boolean;
  description: string;
  totalSeconds: number;
  sections: Section[];
  journalPrompt?: string; // optional prompt shown on the Journal screen after completion
};

const min = (n: number) => n * 60;

export const stockRituals: Ritual[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // Morning Alignment (7 min)
  // ─────────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Midday Reset (5 min)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "midday_reset",
    name: "Midday Reset",
    guided: true,
    description: "Release tension and recenter halfway through the day.",
    totalSeconds: min(5),
    sections: [
      // 1 min grounding breath (physio sigh ×3, then settle)
      { kind: "breath", label: "Grounding breath", seconds: 60, breathType: "physioSigh", cycles: 3 },
      // 2 mins 4-4-6 breathing (paused variant you liked)
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Stress Reset (3 min)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "stress_reset",
    name: "Stress Reset",
    guided: true,
    description: "Rapid downshift and recenter.",
    totalSeconds: 3 * 60,
    sections: [
      // 30 sec exhale-focus (mini physiological sigh loop)
      { kind: "breath", label: "Release", seconds: 30, breathType: "physioSigh" },
      // 1 min physiological sigh cycles
      { kind: "breath", label: "Physiological Sigh", seconds: 60, breathType: "physioSigh" },
      // 90 sec centring prompts
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
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Evening Integration (7 min)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "evening_integration",
    name: "Evening Integration",
    guided: true,
    description: "Reflect on the day, release tension, and prepare the mind for deep rest.",
    totalSeconds: min(7), // 420s
    sections: [
      // 1 min intention review
      {
        kind: "intention",
        label: "Review",
        seconds: 60,
        prompts: ["What mattered today? One win, one lesson."]
      },
      // 3 mins 4-7-8 (with pause after exhale)
      { kind: "breath", label: "4-7-8 Breathing", seconds: 180, breathType: "fourSevenEight_pausedEnd" },
      // 2 mins journaling prompt (within the ritual flow — gentle fade text)
      {
        kind: "presence",
        label: "Optional journal",
        seconds: 120,
        prompts: ["If you like: one win, one lesson, one thing for tomorrow."]
      },
      // 1 min soft reset reflection
      {
        kind: "presence",
        label: "Reset",
        seconds: 60,
        prompts: ["Let the day soften. Breathe slowly."]
      }
    ],
    journalPrompt: "One win, one lesson, and one thing you’ll improve tomorrow."
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Flow Trigger (5 min)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "flow_trigger",
    name: "Flow Trigger",
    guided: true,
    description: "Prime deep focus: one task, one breath.",
    totalSeconds: min(5),
    sections: [
      // 1 min grounding intention
      {
        kind: "intention",
        label: "Grounding intention",
        seconds: 60,
        prompts: ["One task, one breath."]
      },
      // 2 mins resonant breathing (5.5 / 5.5)
      { kind: "breath", label: "Resonant breathing", seconds: 120, breathType: "resonant_5_5" },
      // 2 mins soft focus + open awareness visualisation
      {
        kind: "presence",
        label: "Open awareness",
        seconds: 120,
        prompts: ["Widen attention. Keep the breath easy. Begin gently."]
      }
    ],
    journalPrompt: "What’s the one clear next step?"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Micro Check-ins (90 sec)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "micro_checkins",
    name: "Micro Check-ins",
    guided: true,
    description: "Quick reset to realign and return to work.",
    totalSeconds: 90,
    sections: [
      // physiological sigh ×2 (approx)
      { kind: "breath", label: "Reset breaths", seconds: 25, breathType: "physioSigh" },
      // prompt: what matters now?
      {
        kind: "intention",
        label: "Refocus",
        seconds: 35,
        prompts: ["What is the one thing that matters now?"]
      },
      // 30-sec gentle re-centre
      {
        kind: "presence",
        label: "Re-centre",
        seconds: 30,
        prompts: ["Breathe softly. Begin."]
      }
    ],
    journalPrompt: "One sentence: what matters now?"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Surface Desire → Redirect (variable – default 60s)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "desire_redirect",
    name: "Surface Desire → Redirect",
    guided: true,
    description: "Notice the pull, link it to a deep goal, and return by choice.",
    totalSeconds: 60, // default; we can make this configurable later
    sections: [
      {
        kind: "intention",
        label: "Notice",
        seconds: 20,
        prompts: ["What’s the surface desire? Name it plainly."]
      },
      {
        kind: "intention",
        label: "Redirect",
        seconds: 20,
        prompts: ["What deeper goal does this link to? Choose the path back."]
      },
      {
        kind: "presence",
        label: "Return",
        seconds: 20,
        prompts: ["Soft fade: return to what you chose."]
      }
    ],
    journalPrompt: "What did you notice, and how did you redirect?"
  }
];
