// src/utils/echoStorage.ts
/**
 * Append a journal entry from the Rituals app to the shared Echo Suite log.
 * Schema (MUST match exactly):
 * {
 *   "id": "ritual_2025-09-05T08:45",
 *   "app": "rituals",
 *   "type": "journal",
 *   "timestamp": "2025-09-05T08:45:00Z",
 *   "content": "User’s journal text goes here"
 * }
 */
export function appendEchoSuiteEntry(content: string): void {
  try {
    const now = new Date();
    const iso = now.toISOString(); // e.g. 2025-09-05T08:45:00.000Z

    // id must be ritual_ + ISO up to minutes (no seconds/millis)
    const idMinutes = iso.slice(0, 16); // "YYYY-MM-DDTHH:mm"
    const entry = {
      id: `ritual_${idMinutes}`,
      app: "rituals",
      type: "journal",
      timestamp: iso, // full ISO with seconds+Z
      content
    };

    const raw = localStorage.getItem("echo_suite_data");
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    const list = Array.isArray(arr) ? arr : [];

    list.push(entry);

    localStorage.setItem("echo_suite_data", JSON.stringify(list));
  } catch (err) {
    // Never throw—suite logging is non-blocking.
    console.error("echo_suite_data append failed:", err);
  }
}
