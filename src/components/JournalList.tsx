import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type JournalEntry = { id: string; ritualId: string; ritualName: string; endedAt: number; note?: string };

export const JournalList: React.FC = () => {
  const [journal] = useLocalStorage<JournalEntry[]>("qf_journal_v1", []);
  if (!journal.length) {
    return <div className="card"><div className="font-medium mb-2">Journal</div>
      <p className="text-sm text-slate-300">Entries will appear here after you complete a ritual.</p></div>;
  }
  return (
    <div className="space-y-3">
      {journal.map(j => (
        <div key={j.id} className="card">
          <div className="text-sm opacity-80">{new Date(j.endedAt).toLocaleString()}</div>
          <div className="font-medium">{j.ritualName}</div>
          {j.note ? <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{j.note}</p> :
            <p className="text-sm text-slate-400 mt-1">No note.</p>}
        </div>
      ))}
    </div>
  );
};
