export type Section = { id: string; label: string; seconds: number; kind: "settle"|"breath"|"posture"|"intention" };
export type RitualType = "guided" | "instant";
export type Ritual = {
  id: string; name: string; guided: boolean; type: RitualType;
  totalSeconds: number; sections: Section[]; description?: string; instructions?: string[];
};

const MA_SECTIONS: Section[] = [
  { id: "settle",    label: "Settle",    seconds: 60,  kind: "settle" },
  { id: "breathing", label: "Breathing", seconds: 120, kind: "breath" },
  { id: "posture",   label: "Posture",   seconds: 120, kind: "posture" },
  { id: "intention", label: "Intention", seconds: 120, kind: "intention" }
];

export const stockRituals: Ritual[] = [
  {
    id: "morning_alignment",
    name: "Morning Alignment",
    guided: true,
    type: "guided",
    totalSeconds: MA_SECTIONS.reduce((s,x)=>s+x.seconds,0),
    sections: MA_SECTIONS,
    description: "Begin the day grounded. Gentle breathwork followed by intent-setting to align mind and body.",
    instructions: [
      "Sit comfortably. Close your eyes.",
      "Inhale 4s · Hold 4s · Exhale 6s. Follow the glow.",
      "Stack posture: feet, hips, ribs, head.",
      "Set one clear intention for the day ahead."
    ]
  },
  {
    id: "midday_reset",
    name: "Midday Reset",
    guided: true,
    type: "guided",
    totalSeconds: 300,
    sections: [{id:"mid",label:"Reset",seconds:300,kind:"settle"}],
    description: "Release tension and recenter halfway through the day."
  },
  // (we can add the rest later)
];

export const minutesLabel = (totalSeconds: number) => `${Math.round(totalSeconds/60)} Minutes`;
