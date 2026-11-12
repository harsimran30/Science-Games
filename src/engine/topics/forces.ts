import { mcq, mode, whole } from "../num";
import type { Topic } from "../types";
import { L1, L2, L3 } from "../bank/forces";

const MOVERS = ["A skateboard", "A billycart", "A scooter", "A remote-control car", "A cyclist"];

/** Speed = distance ÷ time. Wrong options: multiplied, subtracted, added, or gave the time back. */
const speed = mode("f2speed", [11, 9], ([si, ti], r) => {
  const s = si + 2, t = ti + 2, d = s * t;
  const u = (n: number) => `${whole(n)} metres each second`;
  return mcq(r, `${MOVERS[(si + ti) % MOVERS.length]} travels ${d} metres in ${t} seconds at a steady speed. How far does it go each second?`, u(s),
    [u(d * t), u(d - t), u(d + t), u(t), u(s + 1)],
    `Speed is distance shared out over time: ${d} ÷ ${t} = ${s} metres each second.`);
});

/** Distance = speed × time. Wrong options: added, one second too many or too few, place-value slip. */
const distance = mode("f3dist", [10, 10], ([si, ti], r) => {
  const s = si + 3, t = ti + 3;
  const u = (n: number) => `${whole(n)} metres`;
  return mcq(r, `A kangaroo hops at a steady ${s} metres each second. How far does it go in ${t} seconds?`, u(s * t),
    [u(s + t), u(s * t + s), u(s * (t - 1)), u(s * t * 10)],
    `Each second it covers ${s} metres, so in ${t} seconds it covers ${s} × ${t} = ${s * t} metres.`);
});

/** Unbalanced forces. Wrong options: added the pulls, wrong direction, "they cancel", only the winner counts. */
const net = mode("f3net", [16, 8, 2], ([i, j, side], r) => {
  const a = 200 + 10 * i, d = 10 * (j + 1), b = side ? a - d : a + d;
  const dir = b > a ? "right" : "left", other = b > a ? "left" : "right";
  return mcq(r, `Tug of war. Team Emu pulls left with ${a} newtons. Team Wombat pulls right with ${b} newtons. What is the overall force on the rope?`, `${d} newtons to the ${dir}`,
    [`${a + b} newtons to the ${dir}`, `${d} newtons to the ${other}`, "0 newtons, the pulls cancel", `${Math.max(a, b)} newtons to the ${dir}`],
    `The pulls are in opposite directions, so take the smaller from the bigger: ${Math.max(a, b)} − ${Math.min(a, b)} = ${d} newtons, towards the stronger team.`);
});

export const forces: Topic = {
  id: "forces", name: "Forces and motion", blurb: "Pushes, pulls, friction, gravity and magnets", ink: "peri",
  curriculum: "AC9S4U03 (Year 4)",
  tiers: ["Pushes and pulls", "Friction, gravity and magnets", "Balanced forces and machines"],
  bank: [L1, L2, L3],
  gens: [[], [speed], [distance, net]],
};
