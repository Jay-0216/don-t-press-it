export interface CounterStore {
  get(): Promise<number>;
  increment(): Promise<number>;
}

const STORAGE_KEY = "dont-press-it:demo-count";
const START_COUNT = 18_392;

class LocalCounterStore implements CounterStore {
  private value: number;

  constructor() {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    this.value = Number.isFinite(stored) && stored >= START_COUNT ? stored : START_COUNT;
  }

  async get(): Promise<number> {
    return this.value;
  }

  async increment(): Promise<number> {
    this.value += 1;
    try {
      localStorage.setItem(STORAGE_KEY, String(this.value));
    } catch {
      // The interaction remains usable if storage is unavailable.
    }
    return this.value;
  }
}

// Kept behind an interface so a server-authoritative realtime implementation
// can replace this without touching the interaction/effect engine.
export function createCounterStore(): CounterStore {
  return new LocalCounterStore();
}
