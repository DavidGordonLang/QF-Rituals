// Rituals — Suite Bridge (Phase 1, TypeScript)
// Same API as JS versions, typed minimally.

type Insight = { id?: string; at?: string; content: string; meta?: Record<string, any>; source?: string };
type Intention = { id?: string; at?: string; text: string; meta?: Record<string, any>; source?: string };
type Journal = { id?: string; at?: string; ritualId?: string; ritualName?: string; note?: string; source?: string };
type Task = { id?: string; title: string; estimate?: number; createdAt?: string; source?: string };
type TaskOutcome = { id?: string; title: string; success: boolean; notes?: string; duration?: number; at?: string; source?: string };

(function initSuiteBridge() {
  if ((window as any).SUITE) return;

  const BUS = {
    version: "v1",
    keys: {
      intentions: "suite.intentions",
      currentIntention: "suite.currentIntention",
      suggestedRitual: "suite.suggestedRitual",
      journals: "suite.journals",
      tasks: "suite.tasks",
      taskOutcomes: "suite.taskOutcomes",
      insights: "suite.insights",
    },
  };

  function read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return structuredClone(fallback);
      const parsed = JSON.parse(raw);
      return (parsed ?? structuredClone(fallback)) as T;
    } catch {
      return structuredClone(fallback);
    }
  }

  function write(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(value) }));
    } catch (e) {
      console.error("[SuiteBridge] write failed", key, e);
    }
  }

  function append<T extends object>(key: string, entry: T) {
    const list = read<any[]>(key, []);
    list.push(entry);
    write(key, list);
  }

  (window as any).SUITE = {
    BUS,
    addInsight(content: string, meta: Record<string, any> = {}) {
      append<Insight>(BUS.keys.insights, {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        content,
        meta,
        source: "rituals",
      });
    },
    setSuggestedRitual(ritualId: string, reason?: string) {
      write(BUS.keys.suggestedRitual, {
        ritualId,
        reason,
        at: new Date().toISOString(),
        source: "rituals",
      });
    },
    setCurrentIntention(text: string, meta: Record<string, any> = {}) {
      write(BUS.keys.currentIntention, {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        text,
        meta,
        source: meta.source || "rituals",
      });
      append<Intention>(BUS.keys.intentions, { at: new Date().toISOString(), text, meta, source: "rituals" });
    },
    addJournal(entry: Journal) {
      append<Journal>(BUS.keys.journals, { ...entry, id: crypto.randomUUID(), at: new Date().toISOString() });
    },
    addTask(task: Task) {
      append<Task>(BUS.keys.tasks, { ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    },
    addTaskOutcome(outcome: TaskOutcome) {
      append<TaskOutcome>(BUS.keys.taskOutcomes, { ...outcome, id: crypto.randomUUID(), at: new Date().toISOString() });
    },
    getSuggestedRitual() {
      return read(BUS.keys.suggestedRitual, null as any);
    },
    getCurrentIntention() {
      return read(BUS.keys.currentIntention, null as any);
    },
  };
})();
