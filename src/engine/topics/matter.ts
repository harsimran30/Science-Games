import { dec, mcq, mode, whole } from "../num";
import type { Topic } from "../types";
import { L1, L2, L3 } from "../bank/matter";

const TEMPS: number[] = [];
for (let t = -30; t <= 150; t++) if (t !== 0 && t !== 100) TEMPS.push(t);
const STATES = ["Solid (ice)", "Liquid (water)", "Gas (water vapour)"];

/** State of water at a temperature. The fourth option is the belief that the amount of water matters. */
const state = mode("m1state", [TEMPS.length], ([i], r) => {
  const t = TEMPS[i], s = t < 0 ? 0 : t < 100 ? 1 : 2;
  return mcq(r, `Water is at ${dec(t, 0)} °C. Which state is it in?`, STATES[s],
    [...STATES.filter((_, k) => k !== s), "It depends on how much water there is"],
    `At sea level water is solid below 0 °C, liquid between 0 °C and 100 °C, and a gas above 100 °C. ${dec(t, 0)} °C is ${["below 0", "between the two", "above 100"][s]}.`);
});

/** Litres and millilitres. Wrong options: added, used 100 mL in a litre, did not convert at all. */
const evap = mode("m2evap", [5, 19], ([i, j], r) => {
  const l = i + 1, e = 50 * (j + 1), left = l * 1000 - e;
  const u = (n: number) => `${whole(n)} mL`;
  return mcq(r, `A bucket holds ${l} L of water. On a hot day ${e} mL evaporates. How much water is left?`, u(left),
    [u(l * 1000 + e), l * 100 - e > 0 ? u(l * 100 - e) : u(l * 10000 - e), u(e - l), u(l * 1000)],
    `Change litres to millilitres first: ${l} L = ${whole(l * 1000)} mL. Then ${whole(l * 1000)} − ${e} = ${whole(left)} mL.`);
});

/** Density decides floating, not mass. Wrong options: right density wrong conclusion, divided the wrong way, multiplied. */
const VOLS = [10, 20, 50, 100, 200];
const TENTHS = [2, 4, 5, 8, 20, 25, 40, 50];
const density = mode("m3dens", [5, 8], ([i, j], r) => {
  const v = VOLS[i], dT = TENTHS[j], m = (v * dT) / 10, inv = 1000 / dT;
  const say = (text: string, floats: boolean) => `${text} g per cm³, so it ${floats ? "floats" : "sinks"}`;
  const d = dec(dT, 1), floats = dT < 10;
  return mcq(r, `A block has a mass of ${whole(m)} g and a volume of ${v} cm³. Water is 1 g per cm³. What is the block's density, and will it float in water?`, say(d, floats),
    [say(d, !floats), say(dec(inv, 2), inv < 100), say(whole(m * v), false), say(dec(inv, 2), inv >= 100)],
    `Density is mass ÷ volume: ${whole(m)} ÷ ${v} = ${d} g per cm³. That is ${floats ? "less than water, so it floats" : "more than water, so it sinks"}.`);
});

export const matter: Topic = {
  id: "matter", name: "Matter and materials", blurb: "Solids, liquids, gases and what things are made of", ink: "area",
  curriculum: "AC9S2U03 (Year 2), AC9S3U04 (Year 3), AC9S4U04 (Year 4)",
  tiers: ["Solids, liquids and gases", "Melting, freezing and evaporating", "Materials and their uses"],
  bank: [L1, L2, L3],
  gens: [[state], [evap], [density]],
};
