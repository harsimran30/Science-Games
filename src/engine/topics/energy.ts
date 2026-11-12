import { mcq, mode, whole } from "../num";
import type { Topic } from "../types";
import { L1, L2, L3 } from "../bank/energy";

/** Temperature rise. Wrong options: added the readings, or gave one of the readings back. */
const warm = mode("n2warm", [13, 13], ([i, j], r) => {
  const a = i + 8, d = j + 3, b = a + d;
  const u = (n: number) => `${n} °C`;
  return mcq(r, `At 9 am the playground is ${a} °C. At 2 pm it is ${b} °C. By how many degrees did it warm up?`, u(d),
    [u(a + b), u(b), u(a), u(d + 10), u(d + 1)],
    `Find the difference: ${b} − ${a} = ${d} °C.`);
});

/** Cooling at a steady rate. Wrong options: one minute only, ignored the rate, gave just the drop, heated instead. */
const START = [60, 65, 70, 75, 80];
const cool = mode("n2cool", [5, 4, 7], ([i, j, k], r) => {
  const s = START[i], rate = j + 2, m = k + 2, t = s - rate * m;
  const u = (n: number) => `${n} °C`;
  return mcq(r, `A cup of hot chocolate is ${s} °C. It cools by ${rate} °C every minute. What is its temperature after ${m} minutes?`, u(t),
    [u(s - rate), u(s - m), u(rate * m), u(s + rate * m), u(s - rate * (m - 1))],
    `It loses ${rate} × ${m} = ${rate * m} °C, so ${s} − ${rate * m} = ${t} °C.`);
});

/** Thunder distance. Wrong options: added, thought the distance is always 340, place-value slips. */
const thunder = mode("n3thunder", [11], ([i], r) => {
  const t = i + 2;
  const u = (n: number) => `${whole(n)} metres`;
  return mcq(r, `Sound travels about 340 metres each second in air. You see lightning and hear the thunder ${t} seconds later. About how far away was the lightning?`, u(340 * t),
    [u(340 + t), u(340), u(34 * t), u(3400 * t)],
    `The sound travelled for ${t} seconds at 340 metres each second: ${t} × 340 = ${whole(340 * t)} metres.`);
});

/** Echo distance. The key wrong option forgets the sound goes there AND back. */
const echo = mode("n3echo", [5], ([i], r) => {
  const t = 2 * (i + 1);
  const u = (n: number) => `${whole(n)} metres`;
  return mcq(r, `You shout towards a cliff and hear the echo ${t} seconds later. Sound travels about 340 metres each second. How far away is the cliff?`, u(170 * t),
    [u(340 * t), u(340), u(680 * t), u(85 * t)],
    `In ${t} seconds the sound went ${whole(340 * t)} metres, but that is there and back. Halve it: ${whole(170 * t)} metres.`);
});

export const energy: Topic = {
  id: "energy", name: "Energy", blurb: "Sound, heat, light and how energy changes", ink: "peri",
  curriculum: "AC9S2U02 (Year 2), AC9S3U03 (Year 3), AC9S5U03 (Year 5, stretch)",
  tiers: ["Sound", "Heat", "Light and energy changes"],
  bank: [L1, L2, L3],
  gens: [[], [warm, cool], [thunder, echo]],
};
