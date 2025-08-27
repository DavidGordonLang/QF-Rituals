import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type JournalEntry = { id: string; ritualId: string; ritualName: string; endedAt: number; note?: string };

export const JournalList: React.FC = () => {
  const [journal, setJournal] = useLocalStorage<JournalEntry[]>("qf_journal_v1", []);

  if (!journal.length) {
    return (
      <div className="card">
        <div className="font-medium mb-2">Journal</div>
        <p className="text-sm text-slate-300">Entries will appear here after you complete a ritual.</p>
      </div>
    );
  }

  const editEntry = (id: string) => {
    const idx = journal.findIndex(j => j.id === id);
    if (idx < 0) return;
    const current = journal[idx];
    const next = window.prompt("Edit note:", current.note ?? "") ?? null;
    if (next === null) return;
    const updated: JournalEntry = { ...current, note: next.trim().length ? next : undefined };
    const copy = [...journal]; copy[idx] = updated; setJournal(copy);
  };

  return (
    <div className="space-y-3">
      {journal.map(j => (
        <div key={j.id} className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs opacity-80">{new Date(j.endedAt).toLocaleString()}</div>
              <div className="font-medium">{j.ritualName}</div>
              {j.note ? <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{j.note}</p> :
                        <p className="text-sm text-slate-400 mt-1">No note.</p>}
            </div>
            <button className="btn whitespace-nowrap h-8 px-3" onClick={() => editEntry(j.id)}>Edit</button>
          </div>
        </div>
      ))}
    </div>
  );
};
