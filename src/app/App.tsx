import React from "react";
import { Rituals } from "../components/Rituals";
import { JournalList } from "../components/JournalList";
import { SettingsPanel } from "../components/SettingsPanel";

type Tab = "rituals" | "journal" | "settings";

export const App: React.FC = () => {
  const [tab, setTab] = React.useState<Tab>("rituals");

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Quiet Forge</h1>
        <p className="text-sm text-slate-300">Rituals for calm, focus, and intent.</p>
      </header>

      <nav className="grid grid-cols-3 gap-2 mb-6">
        <button className={`tab ${tab==="rituals"?"tab-active":""}`} onClick={()=>setTab("rituals")}>Rituals</button>
        <button className={`tab ${tab==="journal"?"tab-active":""}`} onClick={()=>setTab("journal")}>Journal</button>
        <button className={`tab ${tab==="settings"?"tab-active":""}`} onClick={()=>setTab("settings")}>Settings</button>
      </nav>

      {tab==="rituals" && <Rituals />}
      {tab==="journal" && <JournalList />}
      {tab==="settings" && <SettingsPanel />}
    </div>
  );
};
