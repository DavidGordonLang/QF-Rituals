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

// Shared posture lines (can be reused ad hoc)
const SHARED_POSTURE = [
  "Lift chin slowly on inhale. Stop where breath opens.",
  "Soften jaw. Let the exhale fall naturally."
];

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
  // Midday Reset (5 min) — Redesigned
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "midday_reset",
    name: "Midday Reset",
    guided: true,
    description: "Decompress, re-centre, and align posture and breath midway through the day.",
    totalSeconds: min(5),
    sections: [
      // 1 min grounding breath (physio sigh ×3, then settle)
      { kind: "breath", label: "Grounding Breath", seconds: 60, breathType: "physioSigh", cycles: 3 },
      // 2 mins 4-4-6
      { kind: "breath", label: "Regulate", seconds: 120, breathType: "fourFourSix_paused" },
      // 1 min posture alignment
      {
        kind: "posture",
        label: "Alignment",
        seconds: 60,
        prompts: [
          "Feet grounded.",
          "Spine long.",
          "Lift chin slowly on inhale. Find where breath opens.",
          "Soften jaw. Let the breath fall out."
        ]
      },
      // 1 min reset focus (intention)
      {
        kind: "intention",
        label: "Reset Focus",
        seconds: 60,
        prompts: [
          "What are you returning to?",
          "How do you want to show up next?"
        ]
      }
    ],
    journalPrompt: "One thing now feels lighter?"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Stress Reset (3 min) — Redesigned
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "stress_reset",
    name: "Stress Reset",
    guided: true,
    description: "Fast nervous system reset for moments of overwhelm or tension spike.",
    totalSeconds: 3 * 60,
    sections: [
      // 30 sec exhale-focus (mini physiological sigh loop)
      { kind: "breath", label: "Exhale Focus", seconds: 30, breathType: "physioSigh" },
      // 1 min physiological sigh cycles
      { kind: "breath", label: "Cycle Release", seconds: 60, breathType: "physioSigh" },
      // 30s posture discharge
      {
        kind: "posture",
        label: "Discharge",
        seconds: 30,
        prompts: [
          "Shrug shoulders high. Drop.",
          "Tense fists. Release."
        ]
      },
      // 60s centring
      {
        kind: "presence",
        label: "Centring",
        seconds: 60,
        prompts: [
          "Where are your feet?",
          "Where is your breath?",
          "Let the tension drain."
        ]
      }
    ],
    journalPrompt: "What shifted after the reset?"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Evening Integration (7 min) — Redesigned
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "evening_integration",
    name: "Evening Integration",
    guided: true,
    description: "Close the day with intention, breath, and reflection. Wind down the nervous system.",
    totalSeconds: min(7), // 420s
    sections: [
      // 1 min intention review
      {
        kind: "intention",
        label: "Review",
        seconds: 60,
        prompts: ["What mattered today?", "One win, one lesson."]
      },
      // 3 mins 4-7-8 (with pause after exhale)
      { kind: "breath", label: "Downshift", seconds: 180, breathType: "fourSevenEight_pausedEnd" },
      // 2 mins journaling prompt (gentle fade text)
      {
        kind: "presence",
        label: "Journal Reflection",
        seconds: 120,
        prompts: ["If it helps: one win, one lesson, one thing for tomorrow."]
      },
      // 1 min soft close
      {
        kind: "presence",
        label: "Soft Close",
        seconds: 60,
        prompts: ["Let the day soften. Breathe slowly."]
      }
    ],
    journalPrompt: "One win, one lesson, and one thing to improve tomorrow."
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Flow Trigger (5 min) — Redesigned
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "flow_trigger",
    name: "Flow Trigger",
    guided: true,
    description: "Activate clear focus, deep breath, and deliberate action. Enter with intention.",
    totalSeconds: min(5),
    sections: [
      // 1 min grounding intention
      {
        kind: "intention",
        label: "Ground Focus",
        seconds: 60,
        prompts: ["One task. One breath.", "What matters most right now?"]
      },
      // 2 mins resonant breathing (5.5 / 5.5)
      { kind: "breath", label: "Resonant Breathing", seconds: 120, breathType: "resonant_5_5" },
      // 1 min ready stance
      {
        kind: "posture",
        label: "Ready Stance",
        seconds: 60,
        prompts: [
          "Lift spine. Widen breath.",
          "Lift chin as you breathe in. Find ease."
        ]
      },
      // 1 min widen awareness
      {
        kind: "presence",
        label: "Widen Awareness",
        seconds: 60,
        prompts: ["Open your field. Let action emerge."]
      }
    ],
    journalPrompt: "What’s the one clear next step?"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Tactical Reset (90 sec) — Renamed & Refined (was Micro Check-ins)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "tactical_reset",
    name: "Tactical Reset",
    guided: true,
    description: "For quick redirection during distraction or mental clutter.",
    totalSeconds: 90,
    sections: [
      { kind: "breath", label: "Reset Breaths", seconds: 25, breathType: "physioSigh" },
      {
        kind: "intention",
        label: "Refocus",
        seconds: 35,
        prompts: ["What is the one thing that matters now?"]
      },
      {
        kind: "presence",
        label: "Return",
        seconds: 30,
        prompts: ["Breathe softly. Begin again."]
      }
    ],
    journalPrompt: "One sentence: what matters now?"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Impulse Redirect (1 min) — Renamed & Refined
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "impulse_redirect",
    name: "Impulse Redirect",
    guided: true,
    description: "Intercept compulsive urges. Choose to return on your own terms.",
    totalSeconds: 60,
    sections: [
      {
        kind: "intention",
        label: "Notice",
        seconds: 20,
        prompts: ["What’s the surface desire?", "Name it plainly."]
      },
      {
        kind: "intention",
        label: "Redirect",
        seconds: 20,
        prompts: ["What deeper goal does this connect to?", "Choose to return."]
      },
      {
        kind: "presence",
        label: "Return",
        seconds: 20,
        prompts: ["Let the pull fade. Come back by choice."]
      }
    ],
    journalPrompt: "What did you notice, and how did you redirect?"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Threshold Reset (3 min) — New
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "threshold_reset",
    name: "Threshold Reset",
    guided: true,
    description: "Use this when shifting environments, roles, or internal states.",
    totalSeconds: 180,
    sections: [
      { kind: "breath", label: "Resonant Breathing", seconds: 60, breathType: "resonant_5_5" },
      {
        kind: "posture",
        label: "Alignment Check",
        seconds: 60,
        prompts: [
          "Feet grounded.",
          "Lift chin slowly. Find where breath opens.",
          "Soften jaw. Let the exhale fall."
        ]
      },
      {
        kind: "intention",
        label: "Role Shift",
        seconds: 60,
        prompts: ["What role are you stepping into?", "What needs to be left behind?"]
      }
    ],
    journalPrompt: "What role am I stepping into, and what did I leave behind?"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Rage Ritual (5 min) — New
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "rage_ritual",
    name: "Rage Ritual",
    guided: true,
    description: "Use anger. Don’t waste it. Turn heat into fuel.",
    totalSeconds: min(5),
    sections: [
      { kind: "breath", label: "Controlled Exhale", seconds: 60, breathType: "fourEight_continuous" },
      {
        kind: "posture",
        label: "Discharge",
        seconds: 90,
        prompts: [
          "Tense fists. Hold. Release.",
          "Shrug shoulders high. Drop.",
          "Clench jaw. Then soften."
        ]
      },
      {
        kind: "intention",
        label: "Signal Reframe",
        seconds: 60,
        prompts: ["What is this anger protecting?", "What does it need from me?"]
      },
      {
        kind: "presence",
        label: "Return to Purpose",
        seconds: 90,
        prompts: ["Breathe deep. Anchor the energy."]
      }
    ],
    journalPrompt: "What did the anger reveal? What can I build with this energy?"
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // Return to Centre (9 min) — New
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: "return_to_centre",
    name: "Return to Centre",
    guided: true,
    description: "A full recalibration. For days that fractured you or spirals you escaped.",
    totalSeconds: 9 * 60, // 540s
    sections: [
      { kind: "breath", label: "Grounding Breath", seconds: 90, breathType: "fourFourSix_paused" },
      {
        kind: "intention",
        label: "Self-Check",
        seconds: 90,
        prompts: ["Where are you right now?", "What’s been pulling you off track?"]
      },
      {
        kind: "posture",
        label: "Stillness Reset",
        seconds: 90,
        prompts: [
          "Lift crown. Spine soft.",
          "Find the breath’s open point."
        ]
      },
      {
        kind: "presence",
        label: "Vision Hold",
        seconds: 150,
        prompts: ["Visualise your return.", "Feel the next action without forcing it."]
      },
      {
        kind: "presence",
        label: "Soft Close",
        seconds: 120,
        prompts: ["Let clarity return. Begin gently."]
      }
    ],
    journalPrompt: "What needs reclaiming right now?"
  }
];
