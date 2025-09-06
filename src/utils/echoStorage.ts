// src/utils/echoStorage.ts
export function appendEchoSuiteEntry(content: string, ritualName?: string) {
  try {
    const now = new Date();
    const iso = now.toISOString(); // e.g. 2025-09-05T08:45:00.000Z

    // id must be ritual_ + ISO up to minutes
    const idMinutes = iso.slice(0, 16); // "YYYY-MM-DDTHH:mm"

    const entry = {
      id: `ritual_${idMinutes}`,
      app: "rituals",
      type: "journal",
      timestamp: iso,
      content,
      ritual: ritualName || "Unknown"
    };

    // --- Existing Echo storage (unchanged) ---
    const raw = localStorage.getItem("echo_suite_data");
    const arr = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(arr) ? arr : [];
    list.push(entry);
    localStorage.setItem("echo_suite_data", JSON.stringify(list));

    // --- NEW: Suite integration for Morning Alignment ---
    if (ritualName === "Morning Alignment") {
      console.log("⚡ Suite bridge triggered for Morning Alignment");

      const suiteEntry = {
        id: crypto.randomUUID(),
        at: iso,
        text: content,
        ritual: ritualName,
        source: "rituals",
      };

      // Current intention
      localStorage.setItem("suite.currentIntention", JSON.stringify(suiteEntry));

      // Intention history
      const rawInt = localStorage.getItem("suite.intentions");
      const intList = rawInt ? JSON.parse(rawInt) : [];
      intList.push(suiteEntry);
      localStorage.setItem("suite.intentions", JSON.stringify(intList));

      // Add as a Focus task
      const task = {
        id: crypto.randomUUID(),
        title: content,
        estimate: 1,
        createdAt: iso,
        source: "rituals",
      };
      const rawTasks = localStorage.getItem("suite.tasks");
      const tasks = rawTasks ? JSON.parse(rawTasks) : [];
      tasks.push(task);
      localStorage.setItem("suite.tasks", JSON.stringify(tasks));
    }
  } catch (err) {
    console.error("echo_suite_data append failed:", err);
  }
}
