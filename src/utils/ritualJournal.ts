// src/utils/ritualJournal.ts
import { appendEchoSuiteEntry } from "./echoStorage";

export type RitualJournalItem = {
  id: string;                 // local id for Rituals’ own list (not the suite id)
  ritual: string;             // ritual name
  note: string;               // user text
  dateISO: string;            // timestamp
};

const RITUALS_LOCAL_KEY = "rituals_journal";

export function saveRitualJournal(ritualName: string, note: string) {
  const now = new Date().toISOString();

  // 1) Save to Rituals’ own journal list (unchanged behavior)
  const raw = localStorage.getItem(RITUALS_LOCAL_KEY);
  const arr = raw ? (JSON.parse(raw) as unknown) : [];
  const list: RitualJournalItem[] = Array.isArray(arr) ? (arr as RitualJournalItem[]) : [];

  list.push({
    id: `local_${now}`,  // local-only id
    ritual: ritualName,
    note,
    dateISO: now
  });

  localStorage.setItem(RITUALS_LOCAL_KEY, JSON.stringify(list));

  // 2) ALSO append to the shared Echo Suite log (critical for journaling continuity)
  appendEchoSuiteEntry(note);

  // 3) SPECIAL CASE: Morning Ritual → also feed Focus Forge
  try {
    if (ritualName.toLowerCase().includes("morning")) {
      const entry = {
        id: crypto.randomUUID(),
        at: now,
        text: note,
        ritual: ritualName,
        source: "rituals",
      };

      // Current intention (single)
      localStorage.setItem(
        "suite.currentIntention",
        JSON.stringify(entry)
      );

      // Intention history
      const rawInt = localStorage.getItem("suite.intentions");
      const intList = rawInt ? JSON.parse(rawInt) : [];
      intList.push(entry);
      localStorage.setItem("suite.intentions", JSON.stringify(intList));

      // Add as a Focus task
      const task = {
        id: crypto.randomUUID(),
        title: note,
        estimate: 1,
        createdAt: now,
        source: "rituals",
      };
      const rawTasks = localStorage.getItem("suite.tasks");
      const tasks = rawTasks ? JSON.parse(rawTasks) : [];
      tasks.push(task);
      localStorage.setItem("suite.tasks", JSON.stringify(tasks));
    }
  } catch (err) {
    console.error("Suite bridge write failed from Rituals:", err);
  }
}
