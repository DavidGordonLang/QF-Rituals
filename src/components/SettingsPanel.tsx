import React from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const SettingsPanel: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>("qf_sound_enabled", true);

  return (
    <div className="card">
      <div className="font-medium mb-2">Settings</div>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Sound</div>
          <div className="text-sm text-slate-300">Play chimes between sections and a soft gong at the end.</div>
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
          <span>{soundEnabled ? "On" : "Off"}</span>
        </label>
      </div>
    </div>
  );
};
