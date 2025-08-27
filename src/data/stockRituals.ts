export type Section = { id: string; label: string; seconds: number; kind: "settle"|"breath"|"posture"|"intention" };
export type Ritual = { id: string; name: string; guided: boolean; totalSeconds: number; sections: Section[]; description?: string; };

const MA_SECTIONS: Section[] = [
  { id: "settle",   label: "Settle",    seconds: 60,  kind: "settle" },
  { id: "breath",   label: "Breathing", seconds: 120, kind: "breath" },
  { id: "posture",  label: "Posture",   seconds: 120, kind: "posture" },
  { id: "intention",label: "Intention", seconds: 120, kind: "intention" }
];

export const stockRituals: Ritual[] = [
  {
    id: "morning-alignment",
    name: "Morning Alignment",
    guided: true,
    totalSeconds: MA_SECTIONS.reduce((s,x)=>s+x.seconds,0),
    sections: MA_SECTIONS,
    description: "A seven-minute alignment: settle, breathe (4-4-6), posture, and set intention."
  }
];

export const minutesLabel = (totalSeconds: number) =>
  `${Math.round(totalSeconds/60)} Minutes`;
