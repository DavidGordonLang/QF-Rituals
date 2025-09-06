import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { appendEchoSuiteEntry } from "../utils/echoStorage";

export type JournalEntry = {
  id: string;
  ritualId: string;
  ritualName: string;
  endedAt: number;
  note?: string;
};

type Props = {
  entry: JournalEntry;
  prompt?: string;
  mode: "new" | "edit";
  onSave: () => void;
  onCancel: () => void;
};

const KEY = "qf_journal_v1";

export default function JournalEditor({ entry, prompt, mode, onSave, onCancel }: Props) {
  const [list, setList] = useLocalStorage<JournalEntry[]>(KEY, []);
  const [note, setNote] = React.useState(entry.note ?? "");

  const save = () => {
    const trimmed = note.trim();
    const updated: JournalEntry = { ...entry, note: trimmed ? trimmed : undefined };

    try {
      const raw = localStorage.getItem(KEY);
      const cur: JournalEntry[] = raw ? JSON.parse(raw) : [];

      let next: JournalEntry[];
      if (mode === "edit") {
        // replace in-place by id
        next = cur.map((it) => (it.id === updated.id ? updated : it));
      } else {
        // prepend new
        next = [updated, ...cur];
      }

      localStorage.setItem(KEY, JSON.stringify(next));
      setList(next);

      // 🔗 Append to Echo + Suite log (note + ritualName)
      if (updated.note) {
        appendEchoSuiteEntry(updated.note, updated.ritualName);
      }
    } catch {
      // Local fallback
      setList((prev) =>
        mode === "edit" ? prev.map((it) => (it.id === updated.id ? updated : it)) : [updated, ...prev]
      );

      if (updated.note) {
        appendEchoSuiteEntry(updated.note, updated.ritualName);
      }
    }

    onSave();
  };

  return (
    <div className="card fade-in">
      <div className="mb-2 text-xs text-slate-300">{mode === "edit" ? "Edit entry" : "Journal"}</div>
      <div className="text-xl font-semibold">{entry.ritualName}</div>
      <div className="mt-2 text-sm opacity-80">
        {prompt ?? (mode === "edit" ? "Edit your reflection." : "How did that feel?")}
      </div>

      <textarea
        className="mt-4 w-full h-44 rounded-xl bg-white/10 border border-white/10 p-3 outline-none focus:border-white/20"
        placeholder="Write a few lines (optional)…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="mt-4 flex gap-2 justify-end">
        <button className="btn" onClick={onCancel}>
          {mode === "edit" ? "Back" : "Skip"}
        </button>
        <button className="btn" onClick={save}>
          Save
        </button>
      </div>
    </div>
  );
}
