import { useState } from "preact/hooks";
import { Seg, Sheet, Slider } from "../ui/controls";

const STEPS = [["0", "Evaporation"], ["1", "Condensation"], ["2", "Precipitation"], ["3", "Run-off"]] as const;
const DROP = [[92, 150], [262, 64], [318, 116], [236, 196]];
const SAY = [
  "The Sun warms the sea. Water at the surface turns into invisible water vapour and rises into the air. The salt stays behind.",
  "High up, the air is cold. The water vapour cools and turns back into tiny drops of liquid water. Billions of drops together make a cloud.",
  "The tiny drops join up. When they are too heavy to float, they fall as rain. If it is cold enough, they fall as hail or snow.",
  "Rain runs downhill into creeks and rivers, and some soaks into the ground. In the end it flows back to the sea, ready to go round again.",
];

/** Follow one drop of water around the water cycle, one step at a time. */
export function LearnEarth() {
  const [step, setStep] = useState(0);
  const [heat, setHeat] = useState(3);
  const [x, y] = DROP[step];
  const cloud = 0.7 + heat * 0.12;
  return (
    <Sheet stage={<>
      <svg viewBox="0 0 420 250" role="img" aria-label={`Water cycle: ${STEPS[step][1]}`}>
        <circle cx="52" cy="46" r={18 + heat * 2} class="sun" />
        <path d="M0 196 H212 L330 84 L420 150 V250 H0 Z" class="land" />
        <path d="M0 196 H212 L222 250 H0 Z" class="sea" />
        <path d="M322 96 C300 130 280 150 262 170 S228 192 214 198" class={"river" + (step === 3 ? " live" : "")} />
        <g style={{ transform: `translate(268px, 58px) scale(${cloud})` }} class={"cloud" + (step === 1 ? " live" : "")}>
          <ellipse cx="-26" cy="6" rx="26" ry="16" /><ellipse cx="4" cy="-6" rx="30" ry="22" /><ellipse cx="34" cy="8" rx="24" ry="15" />
        </g>
        {step === 0 && Array.from({ length: heat }, (_, i) => <path key={i} d={`M${40 + i * 34} 186 q8 -14 0 -28 t0 -28`} class="vapour" />)}
        {step === 2 && Array.from({ length: 6 }, (_, i) => <line key={i} x1={286 + i * 12} y1={84 + (i % 2) * 6} x2={280 + i * 12} y2={100 + (i % 2) * 6} class="rain" />)}
        <g class="drop" style={{ transform: `translate(${x}px, ${y}px)` }}>
          <path d="M0 -13 C8 -3 10 2 10 6 A10 10 0 0 1 -10 6 C-10 2 -8 -3 0 -13 Z" />
        </g>
        <text x="100" y="232" class="lbl">Sea</text>
        <text x="340" y="212" class="lbl">Land</text>
      </svg>
      <p class="sum"><b>{STEPS[step][1]}.</b> {SAY[step]}</p>
    </>}>
      <div><span class="lab">Where is the drop?</span><Seg options={STEPS} value={String(step) as "0"} onChange={(v) => setStep(Number(v))} /></div>
      <div class="row">
        <button class="btn" onClick={() => setStep((step + 1) % 4)}>{step === 3 ? "Go round again" : "Next step"}</button>
      </div>
      <Slider label="The Sun's heat" value={heat} min={1} max={5} onChange={setHeat} />
      <p class="sum">{heat <= 2 ? "A cool day: water evaporates slowly, so clouds build slowly." : heat === 3 ? "A warm day: steady evaporation." : "A hot day: water evaporates quickly, so more vapour rises and bigger clouds can form."}</p>
      <p class="note">There is no first step and no last step. The same water has been going round for billions of years. No new water is made when it rains.</p>
    </Sheet>
  );
}
