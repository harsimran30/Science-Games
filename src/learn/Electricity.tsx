import { useState } from "preact/hooks";
import { Seg, Sheet, Stepper } from "../ui/controls";

const ITEMS = [["wire", "Copper wire"], ["key", "Steel key"], ["pencil", "Pencil lead"], ["ruler", "Plastic ruler"], ["band", "Rubber band"], ["peg", "Wooden peg"]] as const;
type Item = (typeof ITEMS)[number][0];
const CONDUCTS: Record<Item, boolean> = { wire: true, key: true, pencil: true, ruler: false, band: false, peg: false };
const WHY: Record<Item, string> = {
  wire: "Copper is a metal, and metals are conductors.", key: "Steel is a metal, and metals are conductors.",
  pencil: "Pencil lead is graphite, one of the few non-metals that conducts.", ruler: "Plastic is an insulator. Electricity cannot cross it.",
  band: "Rubber is an insulator. Electricity cannot cross it.", peg: "Dry timber is an insulator. Electricity cannot cross it.",
};

/** Build a loop: batteries, globes, a switch and a gap to test materials in. Break the loop anywhere and everything stops. */
export function LearnElectricity() {
  const [cells, setCells] = useState(1);
  const [globes, setGlobes] = useState(1);
  const [closed, setClosed] = useState(true);
  const [item, setItem] = useState<Item>("wire");
  const on = closed && CONDUCTS[item];
  const level = on ? cells / globes : 0;
  const glow = on ? Math.min(1, 0.2 + level * 0.4) : 0;
  const label = ITEMS.find((i) => i[0] === item)![1];
  return (
    <Sheet stage={<>
      <svg viewBox="0 0 420 250" role="img" aria-label={on ? "The circuit is complete and the globes are lit" : "The circuit is broken and the globes are dark"}>
        <path d="M60 50 H360 V200 H60 Z" class={"wire" + (on ? " on" : "")} />
        {/* batteries on the left side */}
        <rect x="40" y={125 - cells * 14 - 4} width="40" height={cells * 28 + 8} class="mask" />
        {Array.from({ length: cells }, (_, i) => {
          const y = 125 - cells * 14 + i * 28 + 8;
          return <g key={i} class="cell"><line x1="40" y1={y} x2="80" y2={y} class="plus" /><line x1="50" y1={y + 12} x2="70" y2={y + 12} class="minus" /></g>;
        })}
        <text x="90" y="129" class="lbl start">{cells} × 1.5 V</text>
        {/* globes along the top */}
        {Array.from({ length: globes }, (_, i) => {
          const x = 210 + (i - (globes - 1) / 2) * 76;
          return (
            <g key={i} transform={`translate(${x} 50)`}>
              <circle r={22 + glow * 10} class="halo" style={{ opacity: glow * 0.5 }} />
              <circle r="18" class="mask" /><circle r="18" class="globe" style={{ fillOpacity: glow }} />
              <path d="M-12 -12 L12 12 M12 -12 L-12 12" class="cross" />
            </g>
          );
        })}
        {/* switch on the bottom */}
        <rect x="180" y="190" width="60" height="20" class="mask" />
        <circle cx="182" cy="200" r="4" class="dot" /><circle cx="238" cy="200" r="4" class="dot" />
        <line x1="182" y1="200" x2={closed ? 238 : 230} y2={closed ? 200 : 172} class="lever" />
        <text x="210" y="228" class="lbl">Switch {closed ? "closed" : "open"}</text>
        {/* test gap on the right side */}
        <rect x="350" y="100" width="20" height="50" class="mask" />
        <rect x="353" y="100" width="14" height="50" rx="4" class={"test " + (CONDUCTS[item] ? "yes" : "no")} />
        <text x="344" y="129" class="lbl end">{label}</text>
      </svg>
      <p class="sum">
        {!closed ? <>The switch is open, so there is a <b>gap in the loop</b>. Nothing flows anywhere, not even near the battery.</>
          : !CONDUCTS[item] ? <>{WHY[item]} The loop is <b>broken</b>, so the globe stays dark.</>
          : <>{WHY[item]} The loop is <b>complete</b>, so current flows all the way round. {level >= 2 ? "The globe is very bright. In real life, too many batteries can blow a small globe." : level < 0.6 ? "The globes are dim, because they share the push of the battery." : ""}</>}
      </p>
    </>}>
      <Stepper label="Batteries in a row" value={cells} min={1} max={3} onChange={setCells} />
      <Stepper label="Globes in the loop" value={globes} min={1} max={3} onChange={setGlobes} />
      <div class="row">
        <button class="chip" aria-pressed={closed} onClick={() => setClosed(!closed)}>Switch: {closed ? "closed" : "open"}</button>
      </div>
      <div><span class="lab">Put this in the gap</span><Seg options={ITEMS} value={item} onChange={setItem} /></div>
      <ul class="goals">
        <li>Open the switch. Every globe goes out at once.</li>
        <li>Add globes: each one gets dimmer. Add batteries: they get brighter.</li>
        <li>Test each object in the gap. Which ones are conductors?</li>
      </ul>
      <p class="note">This is a safe model of a torch-battery circuit. Never experiment with power points or anything plugged into the wall.</p>
    </Sheet>
  );
}
