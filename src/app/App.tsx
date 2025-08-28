import React from "react";
import { stockRituals, Ritual } from "../data/stockRituals";
import { TimerScreen } from "../components/TimerScreen";
import JournalList from "../components/JournalList";
import SettingsPanel from "../components/SettingsPanel";
import JournalEditor from "../components/JournalEditor";

type Tab = "rituals" | "journal" | "settings" | "timer" | "journalEditor";

export default function App() {
  const [tab, setTab] = React.useState<Tab>("rituals");
  const [activeRitual, setActiveRitual] = React.useState<Ritual | null>(null);

  // Pending journal entry (when a ritual completes)
  const [pendingEntry, setPendingEntry] = React.useState<{
    id: string; ritualId: string; ritualName: string; endedAt: number;
  } | null>(null);

  const startRitual = (r: Ritual) => { setActiveRitual(r); setTab("timer"); };
  const exitTimer = () => { setActiveRitual(null); setTab("rituals"); };

  const onCompleteJournal = (entry: { id: string; ritualId: string; ritualName: string; endedAt: number }) => {
    setPendingEntry(entry);
    setTab("journalEditor");
  };

  const completeJournalAndReturn = () => {
    setPendingEntry(null);
    setActiveRitual(null);
    setTab("rituals");
  };
  const skipJournal = () => completeJournalAndReturn();

  return (
    <div className="p-4 space-y-4">
      {/* App header */}
      <div>
        <div className="text-3xl font-bold">Quiet Forge</div>
        <div className="text-sm opacity-80">Rituals for calm, focus, and intent.</div>
      </div>

      {/* Tabs */}
      {tab !== "timer" && tab !== "journalEditor" && (
        <div className="flex gap-3">
          <button className={`tab ${tab === "rituals" ? "tab-active" : ""}`} onClick={() => setTab("rituals")}>Rituals</button>
          <button className={`tab ${tab === "journal" ? "tab-active" : ""}`} onClick={() => setTab("journal")}>Journal</button>
          <button className={`tab ${tab === "settings" ? "tab-active" : ""}`} onClick={() => setTab("settings")}>Settings</button>
        </div>
      )}

      {/* Views */}
      {tab === "rituals" && (
        <div className="space-y-3">
          {stockRituals.map(r => (
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

      {tab === "journal" && <JournalList />}

      {tab === "settings" && <SettingsPanel />}

      {tab === "timer" && activeRitual && (
        <TimerScreen
          ritual={activeRitual}
          onExit={exitTimer}
          onCompleteJournal={(e) => onCompleteJournal(e)}
        />
      )}

      {tab === "journalEditor" && pendingEntry && (
        <JournalEditor
          entry={pendingEntry}
          prompt={
            stockRituals.find(r => r.id === pendingEntry.ritualId)?.journalPrompt ||
            "Add a short reflection (optional)."
          }
          onSave={completeJournalAndReturn}
          onCancel={skipJournal}
        />
      )}
    </div>
  );
}
