export type ExperiencePhase = "calm" | "annoyed" | "unstable" | "aware" | "hostile";

export interface PersistedState {
  version: 1;
  anonymousId: string;
  clicks: number;
  visits: number;
  firstSeenAt: number;
  lastSeenAt: number;
  lastShape: number;
  discoveries: string[];
}

const STORAGE_KEY = "dont-press-it:v1";

function anonymousId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function loadState(): PersistedState {
  const now = Date.now();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (parsed.version === 1 && typeof parsed.clicks === "number") {
        const next: PersistedState = {
          version: 1,
          anonymousId: parsed.anonymousId ?? anonymousId(),
          clicks: Math.max(0, parsed.clicks),
          visits: Math.max(0, parsed.visits ?? 0) + 1,
          firstSeenAt: parsed.firstSeenAt ?? now,
          lastSeenAt: now,
          lastShape: Math.max(0, parsed.lastShape ?? 0),
          discoveries: Array.isArray(parsed.discoveries) ? parsed.discoveries : [],
        };
        saveState(next);
        return next;
      }
    }
  } catch {
    // Broken local data should never break the experience.
  }

  const fresh: PersistedState = {
    version: 1,
    anonymousId: anonymousId(),
    clicks: 0,
    visits: 1,
    firstSeenAt: now,
    lastSeenAt: now,
    lastShape: 0,
    discoveries: [],
  };
  saveState(fresh);
  return fresh;
}

export function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in hardened/private contexts.
  }
}

export function phaseFor(clicks: number): ExperiencePhase {
  if (clicks < 7) return "calm";
  if (clicks < 18) return "annoyed";
  if (clicks < 34) return "unstable";
  if (clicks < 60) return "aware";
  return "hostile";
}

export function remember(state: PersistedState, key: string): void {
  if (!state.discoveries.includes(key)) {
    state.discoveries.push(key);
    saveState(state);
  }
}
