import type { BreathType } from "./breathLibrary";

export type Section =
  | { kind: "breath"; label: string; seconds: number; breathType: BreathType; cycles?: number; prompts?: string[] }
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
  journalPrompt?: string;
};

const min = (n: number) => n * 60;

// ─────────────────────────────────────────────────────────────────────────────
// QUIET FORGE — RITUALS (with upgraded rotating texts)
// ─────────────────────────────────────────────────────────────────────────────

export const stockRituals: Ritual[] = [
  // 🌄 Morning Alignment — 7 min (420s)
  {
    id: "morning_alignment",
    name: "Morning Alignment",
    guided: true,
    description:
      "Begin the day grounded. Gentle breathwork followed by intent-setting to align mind and body.",
    totalSeconds: 7 * 60,
    sections: [
      {
        kind: "intention",
        label: "Intention",
        seconds: 60,
        prompts: [
          "Let your attention land on the breath. Nothing else is required right now.",
          "Notice your body. Where does it feel ready? Where does it resist?",
          "Choose one simple intent: something you can actually honour today."
        ]
      },
      {
        kind: "breath",
        label: "Breathing",
        seconds: 300,
        breathType: "fourFourSix_paused",
        prompts: [
          "4-4-6: inhale soft for four, hold for four, exhale for six.",
          "Let the breath open gently. Let the exhale lengthen you.",
          "Each pause is a quiet gap — no tension, no rush.",
          "Keep it simple. Four in, four still, six out."
        ]
      },
      {
        kind: "presence",
        label: "Settle",
        seconds: 60,
        prompts: [
          "Let attention rest lightly on your breath.",
          "Find ease, even if it’s small. Stay there.",
          "Nothing to fix—just breathe, and arrive."
        ]
      }
    ],
    journalPrompt: "What intention feels most alive now?"
  },

  // 🌞 Midday Reset — 5 min (300s)
  {
    id: "midday_reset",
    name: "Midday Reset",
    guided: true,
    description: "Decompress, re-centre, and align posture and breath midway through the day.",
    totalSeconds: min(5),
    sections: [
      {
        kind: "breath",
        label: "Grounding Breath",
        seconds: 60,
        breathType: "physioSigh",
        cycles: 3,
        prompts: [
          "Double inhale. Let it lift you. Long exhale, let it clear space.",
          "Breathe in once, then again; release fully.",
          "You are resetting in three breaths."
        ]
      },
      {
        kind: "breath",
        label: "Regulate",
        seconds: 120,
        breathType: "fourFourSix_paused",
        prompts: [
          "4-4-6: inhale soft for four, hold for four, exhale for six.",
          "Let each exhale clear a little more noise.",
          "Rest in the pauses. Don’t fill them.",
          "Breath sets the pace; follow gently."
        ]
      },
      {
        kind: "posture",
        label: "Alignment",
        seconds: 60,
        prompts: [
          "Feet grounded. Hips loose. Knees soft.",
          "Spine long. Let the breath rise up through it.",
          "Lift your chin slowly as you inhale. Find where the airway opens.",
          "Soften your jaw. Let the exhale drop naturally."
        ]
      },
      {
        kind: "intention",
        label: "Reset Focus",
        seconds: 60,
        prompts: [
          "What deserves your focus now?",
          "What’s ready to be re-entered with calm?",
          "If urgency wasn’t in charge, what would you choose next?"
        ]
      }
    ],
    journalPrompt: "One thing now feels lighter?"
  },

  // 🔻 Stress Reset — 3 min (180s)
  {
    id: "stress_reset",
    name: "Stress Reset",
    guided: true,
    description: "Fast nervous system reset for moments of overwhelm or tension spike.",
    totalSeconds: 3 * 60,
    sections: [
      {
        kind: "breath",
        label: "Exhale Focus",
        seconds: 30,
        breathType: "physioSigh",
        prompts: [
          "Each exhale lets go a little more.",
          "Empty fully; clear space for calm."
        ]
      },
      {
        kind: "breath",
        label: "Cycle Release",
        seconds: 60,
        breathType: "physioSigh",
        prompts: [
          "Inhale twice, release once. Let the system reset.",
          "Double in, long out. Keep it simple."
        ]
      },
      {
        kind: "posture",
        label: "Discharge",
        seconds: 30,
        prompts: [
          "Tense every muscle in your arms. Then let them fall limp.",
          "Shrug your shoulders high. Exhale. Drop them heavily.",
          "Press your tongue to the roof of your mouth. Hold. Let it relax."
        ]
      },
      {
        kind: "presence",
        label: "Centring",
        seconds: 60,
        prompts: [
          "Feel your feet pressing into the floor.",
          "Track your next exhale all the way to the bottom.",
          "You don’t need to fix anything. Just be here."
        ]
      }
    ],
    journalPrompt: "What shifted after the reset?"
  },

  // 🌙 Evening Integration — 7 min (420s)
  {
    id: "evening_integration",
    name: "Evening Integration",
    guided: true,
    description: "Close the day with intention, breath, and reflection. Wind down the nervous system.",
    totalSeconds: min(7),
    sections: [
      {
        kind: "intention",
        label: "Review",
        seconds: 60,
        prompts: ["What mattered today?", "One win, one lesson."]
      },
      {
        kind: "breath",
        label: "Downshift",
        seconds: 180,
        breathType: "fourSevenEight_pausedEnd",
        prompts: [
          "4-7-8: inhale four, hold seven, exhale eight, pause.",
          "Let the exhale slow everything down.",
          "Pause after the exhale. Let the day end there."
        ]
      },
      {
        kind: "presence",
        label: "Soft Close",
        seconds: 180,
        prompts: [
          "Drop the day. There’s nothing left to fix.",
          "Inhale calm. Exhale control.",
          "Let the breath slow. That’s enough."
        ]
      }
    ],
    journalPrompt: "One win, one lesson, and one thing to improve tomorrow."
  },

  // ⚡ Flow Trigger — 5 min (300s)
  {
    id: "flow_trigger",
    name: "Flow Trigger",
    guided: true,
    description: "Activate clear focus, deep breath, and deliberate action. Enter with intention.",
    totalSeconds: min(5),
    sections: [
      {
        kind: "intention",
        label: "Ground Focus",
        seconds: 60,
        prompts: ["One task. One breath.", "What matters most right now?"]
      },
      {
        kind: "breath",
        label: "Resonant Breathing",
        seconds: 120,
        breathType: "resonant_5_5",
        prompts: [
          "Resonant: five and a half in, five and a half out.",
          "Even breath, even focus.",
          "Balance comes with rhythm."
        ]
      },
      {
        kind: "posture",
        label: "Ready Stance",
        seconds: 60,
        prompts: [
          "Stack your spine. Widen your stance. Let stillness sharpen you.",
          "Lift your chin as you breathe. Find where the air moves freely.",
          "Drop your shoulders, not your intent."
        ]
      },
      {
        kind: "presence",
        label: "Widen Awareness",
        seconds: 60,
        prompts: [
          "Widen your field of attention. Let background noise become atmosphere.",
          "Feel your surroundings without naming them.",
          "Don’t think. Just enter."
        ]
      }
    ],
    journalPrompt: "What’s the one clear next step?"
  },

  // 🛠️ Tactical Reset — 90s
  {
    id: "tactical_reset",
    name: "Tactical Reset",
    guided: true,
    description: "For quick redirection during distraction or mental clutter.",
    totalSeconds: 90,
    sections: [
      {
        kind: "breath",
        label: "Reset Breaths",
        seconds: 25,
        breathType: "physioSigh",
        prompts: ["Three breaths can reset the system.", "Double inhale, long exhale."]
      },
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
        prompts: ["Let the breath bring you back.", "No resistance. Just start.", "You’re already returning."]
      }
    ],
    journalPrompt: "One sentence: what matters now?"
  },

  // 🔁 Impulse Redirect — 1 min (60s)
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
        prompts: [
          "This is a rep. Every return is a rep.",
          "The craving has a voice — but not authority.",
          "You chose to come back. That matters."
        ]
      }
    ],
    journalPrompt: "What did you notice, and how did you redirect?"
  },

  // 🚪 Threshold Reset — 3 min (180s)
  {
    id: "threshold_reset",
    name: "Threshold Reset",
    guided: true,
    description: "Use this when shifting environments, roles, or internal states.",
    totalSeconds: 180,
    sections: [
      {
        kind: "breath",
        label: "Resonant Breathing",
        seconds: 60,
        breathType: "resonant_5_5",
        prompts: ["Resonant: five and a half in, five and a half out.", "Breath steadies the shift."]
      },
      {
        kind: "posture",
        label: "Alignment Check",
        seconds: 60,
        prompts: [
          "Adjust your stance. Let breath guide alignment.",
          "Feel where you’re tight. Let it go. Prepare to arrive.",
          "You’re not carrying the last scene into this one."
        ]
      },
      {
        kind: "intention",
        label: "Role Shift",
        seconds: 60,
        prompts: [
          "Who do you need to be next?",
          "What can be left behind now — thought, posture, tone?",
          "Step forward. Don’t drag the past with you."
        ]
      }
    ],
    journalPrompt: "What role am I stepping into, and what did I leave behind?"
  },

  // 🔥 Rage Ritual — 5 min (300s)
  {
    id: "rage_ritual",
    name: "Rage Ritual",
    guided: true,
    description: "Use anger. Don’t waste it. Turn heat into fuel.",
    totalSeconds: min(5),
    sections: [
      {
        kind: "breath",
        label: "Controlled Exhale",
        seconds: 60,
        breathType: "fourEight_continuous",
        prompts: [
          "Four in, eight out. Long exhale is the vent.",
          "Don’t suppress the heat. Just slow the flow."
        ]
      },
      {
        kind: "posture",
        label: "Discharge",
        seconds: 90,
        prompts: ["Tense fists. Hold. Release.", "Shrug shoulders high. Drop.", "Clench jaw. Then soften."]
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
        prompts: [
          "You’re still in control. Even with the fire.",
          "Let it move through — then direct it forward.",
          "You don’t have to calm down. Just focus it."
        ]
      }
    ],
    journalPrompt: "What did the anger reveal? What can I build with this energy?"
  },

  // 🧭 Return to Centre — 9 min (540s)
  {
    id: "return_to_centre",
    name: "Return to Centre",
    guided: true,
    description: "A full recalibration. For days that fractured you or spirals you escaped.",
    totalSeconds: 9 * 60,
    sections: [
      {
        kind: "breath",
        label: "Grounding Breath",
        seconds: 90,
        breathType: "fourFourSix_paused",
        prompts: ["4-4-6: soft in, hold, long out.", "Each cycle is a return."]
      },
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
          "Breathe into the soft space behind the heart.",
          "Stillness isn’t absence. It’s presence without tension.",
          "Find the shape of calm in your body and rest inside it."
        ]
      },
      {
        kind: "presence",
        label: "Vision Hold",
        seconds: 150,
        prompts: [
          "See yourself in movement, not perfection.",
          "Picture how you’ll return — tone, posture, pace.",
          "Don’t rush clarity. Let it emerge."
        ]
      },
      {
        kind: "presence",
        label: "Soft Close",
        seconds: 120,
        prompts: [
          "The return has already begun.",
          "Leave striving. Keep presence.",
          "Let it be simple. Just begin."
        ]
      }
    ],
    journalPrompt: "What needs reclaiming right now?"
  }
];
