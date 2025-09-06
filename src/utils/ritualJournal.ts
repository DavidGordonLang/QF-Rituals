import { appendEchoSuiteEntry } from "./echoStorage";

export type RitualJournalItem = {
  id: string;
  ritual: string;
  note: string;
  dateISO: string;
};

const RITUALS_LOCAL_KEY = "rituals_journal";

export function saveRitualJournal(ritualName: string, note: string) {
  const now = new Date().toISOString();

  // 1) Save locally (Rituals journal)
  const raw = localStorage.getItem(RITUALS_LOCAL_KEY);
  const arr = raw ? (JSON.parse(raw) as unknown) : [];
  const list: RitualJournalItem[] = Array.isArray(arr) ? (arr as RitualJournalItem[]) : [];

  list.push({
    id: `local_${now}`,
    ritual: ritualName,
    note,
    dateISO: now,
  });

  localStorage.setItem(RITUALS_LOCAL_KEY, JSON.stringify(list));

  // 2) Append to Echo Suite journaling
  appendEchoSuiteEntry(note);

  // 3) SPECIAL CASE: Morning Alignment → feed Focus Forge
  try {
    if (ritualName === "Morning Alignment") {
      console.log("⚡ Suite bridge triggered for Morning Alignment");

      const entry = {
        id: crypto.randomUUID(),
        at: now,
        text: note,
        ritual: ritualName,
        source: "rituals",
      };

      console.log("⚡ Writing suite.currentIntention", entry);
      localStorage.setItem("suite.currentIntention", JSON.stringify(entry));

      const rawInt = localStorage.getItem("suite.intentions");
      const intList = rawInt ? JSON.parse(rawInt) : [];
      intList.push(entry);
      console.log("⚡ Writing suite.intentions", intList);
      localStorage.setItem("suite.intentions", JSON.stringify(intList));

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
      console.log("⚡ Writing suite.tasks", tasks);
      localStorage.setItem("suite.tasks", JSON.stringify(tasks));
    }
  } catch (err) {
    console.error("🚨 Suite bridge write failed from Rituals:", err);
  }
}
