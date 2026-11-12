/** Saved progress. One small JSON blob in localStorage; the app works without it if storage is blocked. */
export interface TopicProgress {
  xp: number;
  answered: number;
  firstTry: number;
  bestRound: number;
}
interface Save {
  v: 1;
  topics: Record<string, TopicProgress>;
  /** How far along each question set's non-repeating sequence this device is. Counters, not questions. */
  seq?: Record<string, number>;
  salt?: number;
}

const KEY = "science-quest-v1";
export const LEVEL_XP = 150;
const EMPTY: TopicProgress = Object.freeze({ xp: 0, answered: 0, firstTry: 0, bestRound: 0 });

function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw) as Save;
      if (data && data.v === 1 && data.topics && typeof data.topics === "object") {
        const topics: Record<string, TopicProgress> = {};
        for (const [id, p] of Object.entries(data.topics)) {
          const n = (x: unknown) => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? Math.floor(x) : 0);
          topics[id] = { xp: n(p?.xp), answered: n(p?.answered), firstTry: n(p?.firstTry), bestRound: n(p?.bestRound) };
        }
        const seq: Record<string, number> = {};
        if (data.seq && typeof data.seq === "object") for (const [k, v] of Object.entries(data.seq)) if (Number.isSafeInteger(v) && v >= 0) seq[k] = v;
        return { v: 1, topics, seq, salt: Number.isSafeInteger(data.salt) ? data.salt : undefined };
      }
    }
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return { v: 1, topics: {} };
}

let state = load();
const listeners = new Set<() => void>();

function commit(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* progress simply will not persist */
  }
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

export const progressOf = (id: string): TopicProgress => state.topics[id] ?? EMPTY;
export const totalXp = (): number => Object.values(state.topics).reduce((s, p) => s + p.xp, 0);
export const levelOf = (xp: number) => ({ level: 1 + Math.floor(xp / LEVEL_XP), into: xp % LEVEL_XP });

export function award(id: string, xp: number, firstTry: boolean, counted: boolean): void {
  const p = { ...progressOf(id) };
  p.xp += xp;
  if (counted) {
    p.answered += 1;
    if (firstTry) p.firstTry += 1;
  }
  state = { ...state, topics: { ...state.topics, [id]: p } };
  commit();
}

export function recordRound(id: string, roundXp: number): void {
  const p = progressOf(id);
  if (roundXp <= p.bestRound) return;
  state = { ...state, topics: { ...state.topics, [id]: { ...p, bestRound: roundXp } } };
  commit();
}

/** Clears XP and levels. The question counters are kept on purpose, so a reset never brings old questions back. */
export function resetAll(): void {
  state = { ...state, topics: {} };
  commit();
}

/** The live counter table for every question set. Call saveSequence() after a question has been drawn from it. */
export function sequence(): { counters: Record<string, number>; salt: number } {
  if (!state.seq) state.seq = {};
  if (state.salt === undefined) state.salt = Math.floor(Math.random() * 2 ** 31);
  return { counters: state.seq, salt: state.salt };
}
export function saveSequence(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* not persisted: repeats can then only happen after a restart */
  }
}

const RANKS: readonly [number, string][] = [[0, "Curious Starter"], [200, "Explorer"], [600, "Investigator"], [1200, "Experimenter"], [2000, "Lab Leader"], [3500, "Chief Scientist"]];
export function rankOf(total: number): { name: string; next: number | null; from: number } {
  let i = 0;
  while (i + 1 < RANKS.length && total >= RANKS[i + 1][0]) i++;
  return { name: RANKS[i][1], from: RANKS[i][0], next: i + 1 < RANKS.length ? RANKS[i + 1][0] : null };
}
