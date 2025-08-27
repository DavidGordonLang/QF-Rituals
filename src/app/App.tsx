import * as React from "react";
import { stockRituals, Ritual } from "../data/stockRituals";
import { Rituals } from "../components/Rituals";
import { TimerScreen } from "../components/TimerScreen";
import { JournalList } from "../components/JournalList";
import { SettingsPanel } from "../components/SettingsPanel";

type Tab = "rituals" | "journal" | "settings";

export const App: React.FC = () => {
  const [tab, setTab] = React.useState<Tab>("rituals");
  const [active, setActive] = React.useState<Ritual | null>(null);

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-3xl font-semibold tracking-tight">Quiet Forge</h1>
        <p className="text-sm text-slate-200/85">Rituals for calm, focus, and intent.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-3 mb-4">
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

      {/* Body */}
      {tab === "rituals" && (
        <div className="space-y-4">
          {active ? (
            <TimerScreen ritual={active} onExit={() => setActive(null)} />
          ) : (
            <Rituals rituals={stockRituals} onStart={(r) => setActive(r)} />
          )}
        </div>
      )}
      {tab === "journal" && <JournalList />}
      {tab === "settings" && <SettingsPanel />}
    </div>
  );
};
