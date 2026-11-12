import { useEffect, useRef, useState } from "preact/hooks";
import { Seg, Sheet, Slider } from "../ui/controls";

const TABS = [["sound", "Sound"], ["heat", "Heat"]] as const;
const three = (v: number, words: [string, string, string]) => (v <= 3 ? words[0] : v <= 7 ? words[1] : words[2]);

function Sound() {
  const [size, setSize] = useState(5);
  const [fast, setFast] = useState(4);
  const audio = useRef<AudioContext | null>(null);
  // The sound engine is only made if "Hear it" is pressed, and it is shut down when this screen closes.
  useEffect(() => () => { void audio.current?.close().catch(() => undefined); audio.current = null; }, []);

  function hear() {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = (audio.current ??= new Ctx());
    void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.frequency.value = 130 * 2 ** (fast / 3);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.012 * size, now + 0.03);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    osc.start(now);
    osc.stop(now + 0.55);
  }

  let path = "";
  for (let x = 0; x <= 340; x += 2) path += `${x === 0 ? "M" : "L"}${10 + x} ${(90 - Math.sin((x / 340) * 2 * Math.PI * fast) * size * 7).toFixed(1)}`;
  return (
    <Sheet stage={<>
      <svg viewBox="0 0 360 180" role="img" aria-label={`A ${three(size, ["small", "medium", "big"])} vibration, ${three(fast, ["slow", "medium", "fast"])}`}>
        <line x1="10" y1="90" x2="350" y2="90" class="g-line" />
        <path d={path} class="wave" />
      </svg>
      <p class="sum">This sound is <b>{three(size, ["quiet", "medium loud", "loud"])}</b> and <b>{three(fast, ["low", "in the middle", "high"])}</b>.</p>
    </>}>
      <Slider label="Size of the vibrations" value={size} min={1} max={10} fmt={(v) => three(v, ["small", "medium", "big"])} onChange={setSize} />
      <Slider label="Speed of the vibrations" value={fast} min={1} max={10} fmt={(v) => three(v, ["slow", "medium", "fast"])} onChange={setFast} />
      <div class="row">
        <button class="btn ghost" onClick={hear}>Hear it (plays a short, soft sound)</button>
      </div>
      <ul class="goals">
        <li>Bigger vibrations make a louder sound. The pitch stays the same.</li>
        <li>Faster vibrations make a higher sound. The loudness stays the same.</li>
      </ul>
      <p class="note">Every sound starts with something vibrating: a string, a drum skin, your vocal cords. The wavy line is a picture of that back-and-forth movement.</p>
    </Sheet>
  );
}

const tint = (t: number) => `hsl(${Math.round(215 - t * 2.05)} 70% ${Math.round(58 - t * 0.1)}%)`;
function Heat() {
  const [a, setA] = useState(80);
  const [b, setB] = useState(20);
  const diff = a - b;
  function wait() {
    const mean = (a + b) / 2;
    if (Math.abs(diff) <= 3) { setA(Math.round(mean)); setB(Math.round(mean)); return; }
    setA(Math.round(a + (mean - a) * 0.4));
    setB(Math.round(b + (mean - b) * 0.4));
  }
  const w = Math.min(12, 3 + Math.abs(diff) / 8);
  return (
    <Sheet stage={<>
      <svg viewBox="0 0 360 170" role="img" aria-label={`Block A is ${a} degrees and block B is ${b} degrees`}>
        <rect x="40" y="40" width="130" height="100" rx="8" class="block" style={{ fill: tint(a) }} />
        <rect x="190" y="40" width="130" height="100" rx="8" class="block" style={{ fill: tint(b) }} />
        <text x="105" y="96" class="temp">{a} °C</text>
        <text x="255" y="96" class="temp">{b} °C</text>
        <text x="105" y="160" class="lbl">Block A</text>
        <text x="255" y="160" class="lbl">Block B</text>
        {diff !== 0 && (
          <g class="arrow f-push">
            <line x1={diff > 0 ? 140 : 220} y1="22" x2={diff > 0 ? 206 : 154} y2="22" stroke-width={w} />
            <polygon points={diff > 0 ? "226,22 204,10 204,34" : "134,22 156,10 156,34"} />
          </g>
        )}
      </svg>
      <p class="sum">{diff === 0 ? <>Both blocks are the same temperature, so <b>no heat flows</b>.</> : <>Heat flows from <b>block {diff > 0 ? "A" : "B"}</b> (hotter) to <b>block {diff > 0 ? "B" : "A"}</b> (cooler).</>}</p>
    </>}>
      <Slider label="Block A" value={a} min={0} max={100} fmt={(v) => v + " °C"} onChange={setA} />
      <Slider label="Block B" value={b} min={0} max={100} fmt={(v) => v + " °C"} onChange={setB} />
      <div class="row">
        <button class="btn" onClick={wait}>Wait a minute</button>
      </div>
      <ul class="goals">
        <li>Keep pressing Wait. The hot block cools, the cool block warms, and they meet in the middle.</li>
        <li>Make block B the hot one. The arrow turns round.</li>
      </ul>
      <p class="note">Cold is not a thing that flows. A cold drink warms up because heat moves into it. An ice block cools your drink because heat moves out of the drink and into the ice.</p>
    </Sheet>
  );
}

export function LearnEnergy() {
  const [tab, setTab] = useState<"sound" | "heat">("sound");
  return (
    <>
      <Seg options={TABS} value={tab} onChange={setTab} />
      {tab === "sound" ? <Sound /> : <Heat />}
    </>
  );
}
