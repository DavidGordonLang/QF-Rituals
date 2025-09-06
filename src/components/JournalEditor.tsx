import React from "react";
import { appendEchoSuiteEntry } from "../utils/echoStorage";

export type JournalEntry = {
  id: string;
  ritualId?: string;
  ritualName?: string;
  note: string;
  createdAt?: number;   // 🔑 made optional so it won’t break other imports
};

type Props = {
  entry: JournalEntry;
  mode: "new" | "edit";
  prompt: string;
  onSave: () => void;
  onCancel: () => void;
};

export default function JournalEditor({ entry, mode, prompt, onSave, onCancel }: Props) {
  const [note, setNote] = React.useState(entry.note || "");

  const handleSave = () => {
    try {
      const updated: JournalEntry = {
        ...entry,
        note,
        createdAt: Date.now(),  // still populates it on save
      };

      // Save to Echo + Suite (with ritual name if available)
      appendEchoSuiteEntry(updated.note, updated.ritualName);

      // Call back to parent
      onSave();
    } catch (err) {
      console.error("Journal save failed:", err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">
        {mode === "new" ? "New Reflection" : "Edit Reflection"}
      </div>
      <div className="text-sm text-slate-300">{prompt}</div>

      <textarea
        className="w-full min-h-[120px] p-3 border border-slate-600 rounded-lg bg-slate-900/40 text-slate-100"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your reflection here..."
      />

      <div className="flex gap-3 justify-end">
        <button
          className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
