import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type JournalEntry = { id: string; ritualId: string; ritualName: string; endedAt: number; note?: string };

type Props = {
  entry: JournalEntry;
  prompt?: string;
  onSave: () => void;
  onCancel: () => void;
};

const KEY = "qf_journal_v1";

export default function JournalEditor({ entry, prompt, onSave, onCancel }: Props) {
  const [list, setList] = useLocalStorage<JournalEntry[]>(KEY, []);
  const [note, setNote] = React.useState(entry.note ?? "");

  const save = () => {
    const updated = { ...entry, note: note.trim() ? note.trim() : undefined };
    try {
      const raw = localStorage.getItem(KEY);
      const cur: JournalEntry[] = raw ? JSON.parse(raw) : [];
      const next = [updated, ...cur];
      localStorage.setItem(KEY, JSON.stringify(next));
      setList(next);
    } catch {
      setList(prev => [updated, ...prev]);
    }
    onSave();
  };

  return (
    <div className="card fade-in">
      <div className="mb-2 text-xs text-slate-300">Journal</div>
      <div className="text-xl font-semibold">{entry.ritualName}</div>
      <div className="mt-2 text-sm opacity-80">{prompt ?? "How did that feel?"}</div>

      <textarea
        className="mt-4 w-full h-40 rounded-xl bg-white/10 border border-white/10 p-3 outline-none focus:border-white/20"
        placeholder="Write a few lines (optional)…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="mt-4 flex gap-2 justify-end">
        <button className="btn" onClick={onCancel}>Skip</button>
        <button className="btn" onClick={save}>Save</button>
      </div>
    </div>
  );
}
