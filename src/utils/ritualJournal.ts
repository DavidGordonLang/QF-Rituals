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

  // 2) ALSO append to the shared Echo Suite log (critical)
  appendEchoSuiteEntry(note);
}
