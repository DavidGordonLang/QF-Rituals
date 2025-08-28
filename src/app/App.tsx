import React from "react";
import { stockRituals, Ritual } from "../data/stockRituals";
import { TimerScreen } from "../components/TimerScreen";
import { JournalList, JournalEntry as JL } from "../components/JournalList";
import { SettingsPanel } from "../components/SettingsPanel";
import JournalEditor, { JournalEntry } from "../components/JournalEditor";

type Tab = "rituals" | "journal" | "settings" | "timer" | "journalEditor";

type EditorState = {
  entry: JournalEntry;
  mode: "new" | "edit";
};

export default function App() {
  const [tab, setTab] = React.useState<Tab>("rituals");
  const [activeRitual, setActiveRitual] = React.useState<Ritual | null>(null);
  const [editor, setEditor] = React.useState<EditorState | null>(null);

  const startRitual = (r: Ritual) => {
    setActiveRitual(r);
    setTab("timer");
  };

  const exitTimer = () => {
    setActiveRitual(null);
    setTab("rituals");
  };

  // Called by TimerScreen when a ritual finishes
  const handleCompleteToJournal = (entry: JournalEntry) => {
    setEditor({ entry, mode: "new" });
    setTab("journalEditor");
  };

  // Editing from the journal list
  const handleEditFromList = (entry: JL) => {
    setEditor({ entry, mode: "edit" });
    setTab("journalEditor");
  };

  const finishEditor = () => {
    // After new: go home. After edit: stay in journal.
    if (editor?.mode === "edit") {
      setEditor(null);
      setTab("journal");
    } else {
      setEditor(null);
      setActiveRitual(null);
      setTab("rituals");
    }
  };

  const cancelEditor = () => {
    // Same navigation as save
    finishEditor();
  };

  const promptFor = (ritualId: string | undefined) =>
    stockRituals.find((r) => r.id === ritualId)?.journalPrompt ||
    (editor?.mode === "edit" ? "Edit your reflection." : "Add a short reflection (optional).");

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <div className="text-3xl font-bold">Quiet Forge</div>
        <div className="text-sm opacity-80">Rituals for calm, focus, and intent.</div>
      </div>

      {/* Tabs (hide during timer/editor) */}
      {tab !== "timer" && tab !== "journalEditor" && (
        <div className="flex gap-3">
          <button className={`tab ${tab === "rituals" ? "tab-active" : ""}`} onClick={() => setTab("rituals")}>
            Rituals
          </button>
          <button className={`tab ${tab === "journal" ? "tab-active" : ""}`} onClick={() => setTab("journal")}>
            Journal
          </button>
          <button className={`tab ${tab === "settings" ? "tab-active" : ""}`} onClick={() => setTab("settings")}>
            Settings
          </button>
        </div>
      )}

      {/* Views */}
      {tab === "rituals" && (
        <div className="space-y-3">
          {stockRituals.map((r) => (
            <button key={r.id} className="card card-tappable" onClick={() => startRitual(r)}>
              <div className="text-xs text-slate-300">{r.guided ? "Guided" : "Instant"}</div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">{r.name}</div>
                <span className="badge">{Math.round(r.totalSeconds / 60)} min</span>
              </div>
              <div className="opacity-90 mt-1 text-sm">{r.description}</div>
            </button>
          ))}
        </div>
      )}

      {tab === "journal" && <JournalList onEdit={handleEditFromList} />}

      {tab === "settings" && <SettingsPanel />}

      {tab === "timer" && activeRitual && (
        <TimerScreen ritual={activeRitual} onExit={exitTimer} onCompleteJournal={handleCompleteToJournal} />
      )}

      {tab === "journalEditor" && editor && (
        <JournalEditor
          entry={editor.entry}
          mode={editor.mode}
          prompt={promptFor(editor.entry.ritualId)}
          onSave={finishEditor}
          onCancel={cancelEditor}
        />
      )}
    </div>
  );
}
