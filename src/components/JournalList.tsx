import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type JournalEntry = { id: string; ritualId: string; ritualName: string; endedAt: number; note?: string };

export const JournalList: React.FC = () => {
  const [journal, setJournal] = useLocalStorage<JournalEntry[]>("qf_journal_v1", []);

  const editEntry = (id: string) => {
    const idx = journal.findIndex(j => j.id === id);
    if (idx < 0) return;
    const current = journal[idx];
    const next = window.prompt("Edit note:", current.note ?? "") ?? null;
    if (next === null) return; // cancelled
    const updated: JournalEntry = { ...current, note: next.trim().length ? next : undefined };
    const copy = [...journal]; copy[idx] = updated; setJournal(copy);
  };

  const deleteEntry = (id: string) => {
    const target = journal.find(j => j.id === id);
    if (!target) return;
    const ok = window.confirm(
      `Delete this entry?\n\n${new Date(target.endedAt).toLocaleString()} – ${target.ritualName}${
        target.note ? `\n\nNote:\n${target.note}` : ""
      }`
    );
    if (!ok) return;
    setJournal(journal.filter(j => j.id !== id));
  };

  const clearAll = () => {
    if (!journal.length) return;
    const ok = window.confirm(
      `Delete ALL ${journal.length} journal ${journal.length === 1 ? "entry" : "entries"}?\nThis cannot be undone.`
    );
    if (!ok) return;
    setJournal([]);
  };

  if (!journal.length) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">Journal</div>
        </div>
        <p className="text-sm text-slate-300">Entries will appear here after you complete a ritual.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with Clear All */}
      <div className="card flex items-center justify-between">
        <div className="font-medium">Journal</div>
        <button className="btn h-8 px-3" onClick={clearAll}>Clear all</button>
      </div>

      {journal.map(j => (
        <div key={j.id} className="card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs opacity-80">{new Date(j.endedAt).toLocaleString()}</div>
              <div className="font-medium">{j.ritualName}</div>
              {j.note ? (
                <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{j.note}</p>
              ) : (
                <p className="text-sm text-slate-400 mt-1">No note.</p>
              )}
            </div>

            <div className="flex gap-2 shrink-0">
              <button className="btn h-8 px-3" onClick={() => editEntry(j.id)}>Edit</button>
              <button className="btn h-8 px-3" onClick={() => deleteEntry(j.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
