import type { Rng } from "./rng";
import { mcq } from "./num";
import { hash, scramble } from "./seq";
import type { Mode, Question, Tier, Topic } from "./types";
import { forces } from "./topics/forces";
import { living } from "./topics/living";
import { matter } from "./topics/matter";
import { space } from "./topics/space";
import { earth } from "./topics/earth";
import { energy } from "./topics/energy";
import { electricity } from "./topics/electricity";

export const TOPICS: readonly Topic[] = [living, forces, matter, earth, space, energy, electricity];
export const topicById = (id: string): Topic | undefined => TOPICS.find((t) => t.id === id);

/** At most how often a level with number generators asks a generated question instead of a fact from its bank. */
export const GEN_SHARE = 0.3;

const bankModes = new Map<string, Mode>();
/** The written fact bank for one level, as a countable set. Options are shuffled each time it is asked. */
export function bankMode(topic: Topic, tier: Tier): Mode {
  const key = `${topic.id}${tier}b`;
  let m = bankModes.get(key);
  if (!m) {
    const entries = topic.bank[tier - 1];
    m = { key, size: entries.length, at: (k, r) => { const e = entries[k]; return mcq(r, e[0], e[1], [e[2], e[3], e[4]], e[5]); } };
    bankModes.set(key, m);
  }
  return m;
}
export const modesOf = (topic: Topic, tier: Tier): Mode[] => [bankMode(topic, tier), ...topic.gens[tier - 1]];

/**
 * The next question for a level. Nothing about past questions is stored: `counters` holds how many questions
 * each set has issued (the chosen set's count goes up by one) and the scrambled walk does the rest.
 * @param ns  prefix so Quick-fire keeps its own place and does not use up the practice rounds' questions
 */
export function nextQuestion(topic: Topic, tier: Tier, counters: Record<string, number>, salt: number, r: Rng, ns = ""): Question {
  const gens = topic.gens[tier - 1];
  const bank = bankMode(topic, tier);
  // Small generator sets get a smaller share, so they do not come round again long before the bank does.
  const weights = gens.map((g) => Math.min(g.size, bank.size));
  const total = weights.reduce((x, y) => x + y, 0);
  let m = bank;
  if (total && r() < Math.min(GEN_SHARE, total / (total + bank.size))) {
    let pick = r() * total;
    m = gens[gens.length - 1];
    for (let i = 0; i < gens.length; i++) if ((pick -= weights[i]) < 0) { m = gens[i]; break; }
  }
  const key = ns + m.key;
  const i = counters[key] ?? 0;
  counters[key] = i + 1;
  return m.at(scramble(i, m.size, salt + (hash(key) % 100003)), r);
}
