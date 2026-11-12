import { dec, mcq, mode, whole } from "../num";
import type { Topic } from "../types";
import { L1, L2, L3 } from "../bank/earth";

/** Rain gauge totals. Wrong options: gave the biggest reading, or left a day out. */
const rain = mode("w1rain", [11, 10, 13], ([i, j, k], r) => {
  const a = i + 2, b = j + 1, c = k + 3, t = a + b + c;
  const u = (n: number) => `${n} mm`;
  return mcq(r, `A school rain gauge collected ${a} mm on Monday, ${b} mm on Tuesday and ${c} mm on Wednesday. How much rain fell altogether?`, u(t),
    [u(Math.max(a, b, c)), u(a + c), u(a + b), u(b + c), u(t + 10), u(t + 1)],
    `Add the three days: ${a} + ${b} + ${c} = ${t} mm.`);
});

/** A dripping tap, with a unit change. Wrong options: forgot to convert, divided by 100, added. */
const DRIPS = [100, 200, 250, 500];
const HOURS = [2, 4, 6, 8, 10, 12, 20, 24];
const tap = mode("w2tap", [4, 8], ([i, j], r) => {
  const d = DRIPS[i], h = HOURS[j], ml = d * h;
  return mcq(r, `A dripping tap wastes ${d} mL of water every hour. How much is wasted in ${h} hours?`, `${dec(ml, 3)} L`,
    [`${whole(ml)} L`, `${dec(ml, 2)} L`, `${d + h} mL`, `${dec(ml, 4)} L`],
    `${d} × ${h} = ${whole(ml)} mL. There are 1000 mL in a litre, so that is ${dec(ml, 3)} L.`);
});

/** 1 mm of rain on 1 m² of roof is 1 litre. Wrong options: added, ignored the rain depth, place-value slip. */
const roof = mode("w3roof", [15, 11], ([i, j], r) => {
  const a = i + 6, mm = j + 2;
  const u = (n: number) => `${whole(n)} litres`;
  return mcq(r, `1 mm of rain on 1 square metre of roof gives 1 litre of water. A shed roof is ${a} square metres and ${mm} mm of rain falls. How many litres can run into the tank?`, u(a * mm),
    [u(a + mm), u(a), u(a * mm * 10), u(mm), u(a * mm + a)],
    `Each square metre collects ${mm} litres, and there are ${a} square metres: ${a} × ${mm} = ${a * mm} litres.`);
});

export const earth: Topic = {
  id: "earth", name: "Water and rocks", blurb: "The water cycle, soils, rocks and minerals", ink: "sun",
  curriculum: "AC9S3U02 (Year 3), AC9S4U02 (Year 4)",
  tiers: ["Water and the water cycle", "Rocks, soils and minerals", "Weather and Earth's resources"],
  bank: [L1, L2, L3],
  gens: [[rain], [tap], [roof]],
};
