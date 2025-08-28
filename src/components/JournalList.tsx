import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type JournalEntry = {
  id: string;
  ritualId: string;
  ritualName: string;
  endedAt: number;
  note?: string;
};

type Props = {
  onEdit?: (entry: JournalEntry) => void; // open editor instead of prompt()
};

const KEY = "qf_journal_v1";

export const JournalList: React.FC<Props> = ({ onEdit }) => {
  const [list, setList] = useLocalStorage<JournalEntry[]>(KEY, []);

  const formatWhen = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this journal entry?")) return;
    const next = list.filter((e) => e.id !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
    setList(next);
  };

  const handleClearAll = () => {
    if (!window.confirm("Delete ALL journal entries?")) return;
    localStorage.setItem(KEY, JSON.stringify([]));
    setList([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Journal</div>
        {list.length > 0 && (
          <button className="btn" onClick={handleClearAll}>
            Clear all
          </button>
        )}
      </div>

      {list.length === 0 && (
        <div className="card text-sm opacity-90">
          No entries yet. Notes you add after a ritual will appear here.
        </div>
      )}

      {list.map((e) => (
        <div key={e.id} className="card">
          <div className="text-xs text-slate-300">{formatWhen(e.endedAt)}</div>
          <div className="mt-1 text-lg font-semibold">{e.ritualName}</div>
          <div className="mt-1 text-sm opacity-90 whitespace-pre-wrap">
            {e.note ?? <span className="opacity-60">No note.</span>}
          </div>

          <div className="mt-3 flex gap-2 justify-end">
            {onEdit && (
              <button className="btn" onClick={() => onEdit(e)}>
                Edit
              </button>
            )}
            <button className="btn" onClick={() => handleDelete(e.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
