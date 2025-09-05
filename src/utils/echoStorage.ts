// src/utils/echoStorage.ts
export function appendEchoSuiteEntry(content: string) {
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
      content
    };

    const raw = localStorage.getItem("echo_suite_data");
    const arr = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(arr) ? arr : [];

    list.push(entry);
    localStorage.setItem("echo_suite_data", JSON.stringify(list));
  } catch (err) {
    console.error("echo_suite_data append failed:", err);
  }
}
