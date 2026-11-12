import { useState } from "preact/hooks";
import { Sheet, Slider } from "../ui/controls";

const N = 16;
/** Fixed particle positions for each state, so the picture is the same every time. */
const SOLID = Array.from({ length: N }, (_, i) => [136 + (i % 4) * 26, 122 + Math.floor(i / 4) * 26]);
const LIQUID = Array.from({ length: N }, (_, i) => [66 + (i % 8) * 31 + ((i * 7) % 5) * 2, 176 + Math.floor(i / 8) * 25 + ((i * 3) % 4) * 2]);
const GAS = Array.from({ length: N }, (_, i) => [50 + ((i * 97) % 260), 36 + ((i * 61 + 23) % 170)]);
const NAMES = ["Solid: ice", "Liquid: water", "Gas: water vapour"];
const SAY = [
  "The particles are packed in neat rows and held in place. They only jiggle, so ice keeps its shape.",
  "The particles are still close together, but they can slide past each other. That is why water flows and takes the shape of its container.",
  "The particles have broken free. They fly about with big gaps between them and spread out to fill all the space.",
];

/** Heat or cool some water and watch what its particles do. The same 16 particles are there the whole time. */
export function LearnMatter() {
  const [t, setT] = useState(20);
  const s = t < 0 ? 0 : t < 100 ? 1 : 2;
  const pos = [SOLID, LIQUID, GAS][s];
  const dur = (1.7 - ((t + 20) / 140) * 1.35).toFixed(2);
  return (
    <Sheet stage={<>
      <svg viewBox="0 0 360 240" class={"particles st" + s} role="img" aria-label={`${NAMES[s]} at ${t} degrees Celsius`}>
        <rect x="30" y="18" width="300" height="206" rx="10" class="jar" />
        {pos.map(([x, y], i) => (
          <g key={i} class="pt" style={{ transform: `translate(${x}px, ${y}px)` }}>
            <circle r="10" class="jig" style={{ animationDuration: dur + "s", animationDelay: -(i * 0.13) + "s" }} />
          </g>
        ))}
      </svg>
      <p class="sum">{SAY[s]}</p>
    </>}>
      <div><span class="lab">Water at</span><div class="big">{t < 0 ? "−" + -t : t} °C</div><div class="big c-area">{NAMES[s]}</div></div>
      <Slider label="Temperature" value={t} min={-20} max={120} fmt={(v) => `${v < 0 ? "−" + -v : v} °C`} onChange={setT} />
      <div class="row">
        <button class="btn ghost" disabled={t - 10 < -20} onClick={() => setT(t - 10)}>Take heat away</button>
        <button class="btn ghost" disabled={t + 10 > 120} onClick={() => setT(t + 10)}>Add heat</button>
      </div>
      <p class="sum">
        {t === 0 ? <>0 °C is where ice <b>melts</b> and water <b>freezes</b>.</> : t === 100 ? <>100 °C is where water <b>boils</b> into a gas.</> : s === 0 ? <>Add heat until it passes <b>0 °C</b> and the ice melts.</> : s === 1 ? <>Cool it below <b>0 °C</b> to freeze it, or heat it to <b>100 °C</b> to boil it.</> : <>Cool it below <b>100 °C</b> and the vapour condenses back into liquid.</>}
      </p>
      <p class="note">Count the particles: there are always 16. Melting and boiling do not make or lose any water. Heat only changes how fast the particles move and how they are arranged.</p>
    </Sheet>
  );
}
