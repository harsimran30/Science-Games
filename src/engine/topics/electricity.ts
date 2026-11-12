import { dec, mcq, mode } from "../num";
import type { Topic } from "../types";
import { L1, L2, L3 } from "../bank/electricity";

/** Batteries in a row add their volts. Wrong options: stays 1.5, counted batteries, added instead of multiplying, lost the decimal point. */
const volts = mode("x2volt", [7], ([i], r) => {
  const n = i + 2;
  return mcq(r, `A torch has ${n} batteries in a row. Each battery is 1.5 volts. How many volts is that altogether?`, `${dec(15 * n, 1)} V`,
    ["1.5 V", `${n} V`, `${dec(15 + 10 * n, 1)} V`, `${15 * n} V`],
    `Batteries in a row add up: ${n} × 1.5 = ${dec(15 * n, 1)} volts.`);
});

/** Globes in one loop share the battery's push. The key wrong option gives every globe the full voltage. */
const EACH = [1, 2, 3, 4, 6];
const share = mode("x3share", [5, 5], ([i, j], r) => {
  const n = i + 2, each = EACH[j], v = n * each;
  return mcq(r, `${n} identical globes are joined in one loop to a ${v}-volt battery. How many volts does each globe get?`, `${each} V`,
    [`${v} V`, `${v * n} V`, `${v - n} V`, `${v + n} V`, `${each + 1} V`],
    `In one loop the globes share the push equally: ${v} ÷ ${n} = ${each} volts each.`);
});

export const electricity: Topic = {
  id: "electricity", name: "Electricity", blurb: "Circuits, conductors and staying safe", ink: "area",
  curriculum: "AC9S6U03 (Year 6): an extension topic, ahead of Year 4",
  tiers: ["Using electricity safely", "Circuits, conductors and insulators", "Series, parallel and power"],
  bank: [L1, L2, L3],
  gens: [[], [volts], [share]],
};
