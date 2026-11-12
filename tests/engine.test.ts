import { describe, expect, it } from "vitest";
import { mulberry32 } from "../src/engine/rng";
import { TOPICS, bankMode, modesOf, nextQuestion } from "../src/engine/topics";
import { scramble } from "../src/engine/seq";
import { dec } from "../src/engine/num";
import { quickItem } from "../src/engine/quick";
import type { Question, Tier } from "../src/engine/types";

const TIERS = [1, 2, 3] as Tier[];
const clean = (s: string) => s.replace(/ /g, "").replace(/−/g, "-");
const nums = (s: string) => (clean(s).match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
const first = (s: string) => nums(s)[0];
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

function wellFormed(q: Question) {
  const blob = JSON.stringify(q);
  expect(q.options.length, blob).toBe(4);
  expect(new Set(q.options.map(norm)).size, blob).toBe(4);
  expect(q.options.includes(q.answer), blob).toBe(true);
  expect(/NaN|undefined|Infinity|\[object|\d\.\d{5,}|false|null/.test(blob), blob).toBe(false);
  expect(q.explain.length > 12, blob).toBe(true);
}

describe("number formatting", () => {
  it("renders decimals without float error", () => {
    expect(dec(1615, 2)).toBe("16.15");
    expect(dec(5, 3)).toBe("0.005");
    expect(dec(1200, 3)).toBe("1.2");
    expect(dec(-5, 0)).toBe("−5");
    expect(dec(12000, 0)).toBe("12 000");
  });
});

describe("the scrambled walk", () => {
  it("visits every slot exactly once per lap, for many sizes and salts", () => {
    for (const size of [1, 2, 5, 7, 11, 16, 25, 40, 41, 64, 95, 179, 192, 256, 440, 1430]) {
      for (const salt of [0, 1, 12345, 2 ** 31 - 1]) {
        for (const lap of [0, 1, 5]) {
          const seen = new Set<number>();
          for (let i = 0; i < size; i++) seen.add(scramble(lap * size + i, size, salt));
          expect(seen.size, `size ${size} salt ${salt} lap ${lap}`).toBe(size);
          expect(Math.min(...seen)).toBe(0);
          expect(Math.max(...seen)).toBe(size - 1);
        }
      }
    }
  });
});

const US = /\b(colors?|colored|liters?|milliliters?|kilometers?|centimeters?|millimeters?|center|fibers?|gray|aluminum|vapor|mold|sulfur|favorite|traveled|traveling|neighbor|plow|tire|tires|math)\b/i;

describe("fact banks: every entry", () => {
  const allPrompts = new Map<string, string>();
  for (const topic of TOPICS) {
    for (const tier of TIERS) {
      const entries = topic.bank[tier - 1];
      it(`${topic.id} level ${tier}: at least 40 entries`, () => {
        expect(entries.length).toBeGreaterThanOrEqual(40);
      });
      it(`${topic.id} level ${tier}: every entry is complete, with four distinct options and a one-line explanation`, () => {
        entries.forEach((e, n) => {
          const where = `${topic.id} L${tier} #${n + 1}: ${e[0]}`;
          expect(e.length === 6 || e.length === 7, where).toBe(true);
          for (const part of e) {
            expect(typeof part, where).toBe("string");
            expect((part as string).trim().length, where).toBeGreaterThan(0);
            expect(part, where).toBe((part as string).trim());
            expect(/\s{2,}|\n/.test(part as string), where).toBe(false);
          }
          const [prompt, answer, w1, w2, w3, explain] = e;
          expect(new Set([answer, w1, w2, w3].map(norm)).size, where).toBe(4);
          expect(/[?…]$/.test(prompt), where).toBe(true);
          expect(/[.!]$/.test(explain), where).toBe(true);
          expect(explain.length, where).toBeGreaterThanOrEqual(20);
          expect(explain.length, where).toBeLessThanOrEqual(210);
          expect(prompt.length, where).toBeLessThanOrEqual(190);
          for (const o of [answer, w1, w2, w3]) {
            expect(o.length, where + " / " + o).toBeLessThanOrEqual(90);
            expect(/all of the above|none of the above|both of these/i.test(o), where).toBe(false);
            expect(/[.]$/.test(o), where + " / " + o).toBe(false);
          }
          expect(US.test(e.join(" ")), where + " (US spelling)").toBe(false);
          const key = norm(prompt);
          expect(allPrompts.get(key), where + " (duplicate prompt)").toBeUndefined();
          allPrompts.set(key, where);
        });
      });
      it(`${topic.id} level ${tier}: the bank as a question set gives well-formed questions with the listed answer`, () => {
        const m = bankMode(topic, tier);
        const r = mulberry32(tier * 31 + topic.id.length);
        expect(m.size).toBe(entries.length);
        for (let k = 0; k < m.size; k++) {
          const q = m.at(k, r);
          wellFormed(q);
          expect(q.prompt).toBe(entries[k][0]);
          expect(q.answer).toBe(entries[k][1]);
          expect(q.explain).toBe(entries[k][5]);
        }
      });
    }
  }
});

/** Each numeric generator's answer is recomputed here by a different route from the one the generator used. */
const count = (times: number, each: number) => { let t = 0; for (let i = 0; i < times; i++) t += each; return t; };
const VERIFY: Record<string, (q: Question) => void> = {
  f2speed(q) { const [d, t] = nums(q.prompt); let rem = d, steps = 0; while (rem > 0) { rem -= first(q.answer); steps++; } expect(rem).toBe(0); expect(steps).toBe(t); },
  f3dist(q) { const [s, t] = nums(q.prompt); expect(first(q.answer)).toBe(count(t, s)); },
  f3net(q) { const [a, b] = nums(q.prompt); const sign = q.answer.endsWith("right") ? 1 : -1; expect(a + sign * first(q.answer)).toBe(b); expect(first(q.answer)).toBeGreaterThan(0); },
  l1cycle(q) { const [a, b, c] = nums(q.prompt); expect(first(q.answer) - c - b).toBe(a); },
  l2legs(q) { const [a, b] = nums(q.prompt); expect(first(q.answer)).toBe(count(a, 6) + count(b, 8)); },
  l3owls(q) { const [m, o, n] = nums(q.prompt); expect(first(q.answer)).toBe(count(n, count(o, m))); },
  m1state(q) { const [t] = nums(q.prompt); expect(q.answer).toBe(["Solid (ice)", "Liquid (water)", "Gas (water vapour)"][Number(t > 0) + Number(t > 100)]); },
  m2evap(q) { const [l, e] = nums(q.prompt); expect((first(q.answer) + e) / 1000).toBe(l); },
  m3dens(q) { const [m, v] = nums(q.prompt); expect(Math.abs(first(q.answer) * v - m)).toBeLessThan(1e-9); expect(q.answer.endsWith("floats")).toBe(m < v); expect(q.answer.endsWith("sinks")).toBe(m > v); },
  w1rain(q) { const [a, b, c] = nums(q.prompt); expect(first(q.answer) - c - b).toBe(a); },
  w2tap(q) { const [d, h] = nums(q.prompt); expect(q.answer.endsWith(" L")).toBe(true); expect(Math.abs((first(q.answer) * 1000) / h - d)).toBeLessThan(1e-9); },
  w3roof(q) { const n = nums(q.prompt); const [a, mm] = n.slice(-2); expect(n.length).toBe(5); expect(first(q.answer) / mm).toBe(a); },
  e2spin(q) { const [day, n] = nums(q.prompt); expect(first(q.answer) / day).toBe(n); },
  e2week(q) { const [w] = nums(q.prompt); expect(first(q.answer) / 7).toBe(w); },
  e3day(q) {
    const m = q.prompt.match(/(\d+):(\d\d) am and sets at (\d+):(\d\d) pm/)!;
    let h = Number(m[1]), min = Number(m[2]), pm = false, ticks = 0; // walk a clock forward one minute at a time
    while (!(pm && h === Number(m[3]) && min === Number(m[4]))) {
      min++; ticks++;
      if (min === 60) { min = 0; h++; if (h === 12) pm = true; if (h === 13) h = 1; }
      if (ticks > 2000) throw new Error("clock never reached sunset");
    }
    const a = nums(q.answer);
    expect(a[0] * 60 + (a[1] ?? 0)).toBe(ticks);
  },
  n2warm(q) { const n = nums(q.prompt); expect(n[1] + first(q.answer)).toBe(n[3]); },
  n2cool(q) { const [s, rate, m] = nums(q.prompt); let t = s; for (let i = 0; i < m; i++) t -= rate; expect(first(q.answer)).toBe(t); expect(t).toBeGreaterThanOrEqual(20); },
  n3thunder(q) { const [v, t] = nums(q.prompt); expect(first(q.answer) / t).toBe(v); },
  n3echo(q) { const [t, v] = nums(q.prompt); expect((2 * first(q.answer)) / t).toBe(v); },
  x2volt(q) { const [n, each] = nums(q.prompt); expect(Math.abs(first(q.answer) / n - each)).toBeLessThan(1e-9); },
  x3share(q) { const [n, v] = nums(q.prompt); expect(count(n, first(q.answer))).toBe(v); },
};

describe("numeric generators: every question each one can produce", () => {
  const keys = new Set<string>();
  for (const topic of TOPICS) {
    for (const tier of TIERS) {
      for (const g of topic.gens[tier - 1]) {
        it(`${g.key} (${topic.id} level ${tier}): ${g.size} questions, all distinct, well-formed, and right when recomputed`, () => {
          expect(keys.has(g.key), "duplicate generator key").toBe(false);
          keys.add(g.key);
          expect(VERIFY[g.key], "no second-way check written for " + g.key).toBeTypeOf("function");
          const r = mulberry32(g.size * 13 + tier);
          const prompts = new Set<string>();
          for (let k = 0; k < g.size; k++) {
            const q = g.at(k, r);
            wellFormed(q);
            VERIFY[g.key](q);
            prompts.add(q.prompt);
          }
          expect(prompts.size).toBe(g.size);
        });
      }
    }
  }
  it("has a check for every generator and no stray checks", () => {
    const all = TOPICS.flatMap((t) => t.gens.flatMap((g) => g.map((m) => m.key))).sort();
    expect(Object.keys(VERIFY).sort()).toEqual(all);
  });
});

describe("no repeats, counters only", () => {
  for (const topic of TOPICS) {
    for (const tier of TIERS) {
      it(`${topic.id} level ${tier}: no question repeats until its set has been used up`, () => {
        const counters: Record<string, number> = {};
        const r = mulberry32(99 + tier);
        const sizes = Object.fromEntries(modesOf(topic, tier).map((m) => [m.key, m.size]));
        const smallest = Math.min(...Object.values(sizes));
        const seen = new Set<string>();
        let asked = 0;
        while (Math.max(...Object.entries(counters).map(([k, v]) => v / sizes[k]), 0) < 1 && asked < 5000) {
          const before = { ...counters };
          const q = nextQuestion(topic, tier, counters, 777, r);
          const key = Object.keys(counters).find((k) => counters[k] !== before[k])!;
          if (counters[key] > sizes[key]) break; // that set has started its second lap
          expect(seen.has(q.prompt), "repeat: " + q.prompt).toBe(false);
          seen.add(q.prompt);
          asked++;
        }
        expect(asked).toBeGreaterThanOrEqual(smallest);
        for (const v of Object.values(counters)) expect(Number.isSafeInteger(v)).toBe(true); // the only state is whole-number counters
      });
    }
  }
  it("practice and quick-fire keep separate places", () => {
    const counters: Record<string, number> = {};
    const r = mulberry32(5);
    nextQuestion(TOPICS[0], 1, counters, 1, r);
    nextQuestion(TOPICS[0], 1, counters, 1, r, "q:");
    expect(Object.keys(counters).some((k) => k.startsWith("q:"))).toBe(true);
    expect(Object.keys(counters).some((k) => !k.startsWith("q:"))).toBe(true);
  });
  it("different devices (salts) walk in different orders", () => {
    const order = (salt: number) => { const c = {}; const r = () => 0.99; return Array.from({ length: 10 }, () => nextQuestion(TOPICS[0], 1, c, salt, r).prompt).join("|"); };
    expect(order(1)).not.toBe(order(2));
  });
});

describe("quick-fire", () => {
  it("shows the right answer about half the time, and says so truthfully", () => {
    const r = mulberry32(8);
    let yes = 0;
    for (let i = 0; i < 4000; i++) {
      const topic = TOPICS[i % TOPICS.length];
      const item = quickItem(nextQuestion(topic, (1 + (i % 3)) as Tier, {}, i, r), r);
      expect(item.truth).toBe(item.shown === item.q.answer);
      expect(item.q.options.includes(item.shown)).toBe(true);
      if (item.truth) yes++;
    }
    expect(yes).toBeGreaterThan(1800);
    expect(yes).toBeLessThan(2200);
  });
});
