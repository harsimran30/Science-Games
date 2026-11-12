import { mcq, mode } from "../num";
import type { Topic } from "../types";
import { L1, L2, L3 } from "../bank/space";

/** Spins and hours. Wrong options: added, used a 12-hour day, one spin per hour. */
const spin = mode("e2spin", [8], ([i], r) => {
  const n = i + 2;
  const u = (x: number) => `${x} hours`;
  return mcq(r, `The Earth spins once every 24 hours. How many hours does it take to spin ${n} times?`, u(24 * n),
    [u(24 + n), u(12 * n), u(n), u(24 * n + 24)],
    `One spin is 24 hours, so ${n} spins take ${n} × 24 = ${24 * n} hours.`);
});

/** Spins and weeks. Wrong options: one spin a week, mixed up hours and days, counted school days. */
const week = mode("e2week", [11], ([i], r) => {
  const w = i + 2;
  const u = (x: number) => `${x} times`;
  return mcq(r, `The Earth spins once each day. How many times does it spin in ${w} weeks?`, u(7 * w),
    [u(w), u(24 * w), u(5 * w), u(30 * w)],
    `One spin is one day, and a week has 7 days: ${w} × 7 = ${7 * w} spins.`);
});

const dur = (m: number) => `${Math.floor(m / 60)} hours${m % 60 ? ` ${m % 60} minutes` : ""}`;
const clock = (h: number, m: number, half: string) => `${h}:${String(m).padStart(2, "0")} ${half}`;

/** Length of daylight. Wrong options: gave the night instead, subtracted minutes without regrouping, an hour out. */
const daylight = mode("e3day", [3, 4, 4, 4], ([i, j, k, l], r) => {
  const rh = 5 + i, rm = 15 * j, sh = 5 + k, sm = 15 * l;
  const rise = rh * 60 + rm, set = (sh + 12) * 60 + sm, mins = set - rise;
  return mcq(r, `One day the Sun rises at ${clock(rh, rm, "am")} and sets at ${clock(sh, sm, "pm")}. How long is the daylight?`, dur(mins),
    [dur(1440 - mins), sm < rm && `${sh + 12 - rh} hours ${rm - sm} minutes`, dur(mins + 60), dur(mins - 60), dur(mins + 30)],
    `Sunrise to midday is ${dur(720 - rise)}. Midday to sunset is ${dur(set - 720)}. Together that is ${dur(mins)}.`);
});

export const space: Topic = {
  id: "space", name: "Earth and space", blurb: "The Sun, the Moon, planets and the night sky", ink: "vol",
  curriculum: "AC9S2U01 (Year 2), with stretch content from later years",
  tiers: ["Sun, Earth and Moon", "Planets and the night sky", "Seasons, eclipses and beyond"],
  bank: [L1, L2, L3],
  gens: [[], [spin, week], [daylight]],
};
