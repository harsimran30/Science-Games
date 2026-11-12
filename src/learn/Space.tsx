import { useState } from "preact/hooks";
import { Seg, Sheet, Slider } from "../ui/controls";

const TABS = [["day", "Day and night"], ["moon", "Moon shapes"]] as const;
const hourName = (h: number) => (h === 0 ? "midnight" : h === 12 ? "midday" : h < 12 ? `${h} am` : `${h - 12} pm`);

function DayNight() {
  const [h, setH] = useState(9);
  const a = ((h - 12) / 24) * 2 * Math.PI;
  const x = 250 - Math.cos(a) * 62, y = 120 - Math.sin(a) * 62;
  const what = h === 12 ? "Midday. Your spot faces the Sun, which is at its highest in your sky."
    : h === 0 ? "Midnight. Your spot faces straight away from the Sun."
    : h === 6 ? "Sunrise. Your spot is just turning into the light. The Sun seems to come up in the east."
    : h === 18 ? "Sunset. Your spot is turning out of the light. The Sun seems to go down in the west."
    : h > 6 && h < 18 ? "Daytime. Your spot is on the sunlit half of the Earth." : "Night. Your spot is on the dark half, facing away from the Sun.";
  return (
    <Sheet stage={<>
      <svg viewBox="0 0 360 240" role="img" aria-label={`The Earth seen from above at ${hourName(h)}`}>
        <rect width="360" height="240" rx="12" class="spacebg" />
        <circle cx="20" cy="120" r="46" class="sun" />
        {[70, 95, 120, 145, 170].map((yy) => <line key={yy} x1="76" y1={yy} x2="170" y2={yy} class="ray" />)}
        <circle cx="250" cy="120" r="62" class="e-night" />
        <path d="M250 58 A62 62 0 0 0 250 182 Z" class="e-day" />
        <circle cx="250" cy="120" r="62" class="e-rim" />
        <g class="spot" style={{ transform: `translate(${x}px, ${y}px)` }}><circle r="9" /></g>
        <text x="250" y="124" class="lbl on-earth">Earth</text>
        <text x="22" y="124" class="lbl on-sun">Sun</text>
      </svg>
      <p class="sum"><b>{hourName(h)}.</b> {what}</p>
    </>}>
      <div><span class="lab">Time where you are</span><div class="big">{hourName(h)}</div></div>
      <Slider label="Spin the Earth" value={h} min={0} max={23} fmt={hourName} onChange={setH} />
      <div class="row">
        <button class="btn ghost" onClick={() => setH((h + 1) % 24)}>One hour later</button>
      </div>
      <p class="note">The red dot is you. Watch it: the Sun never moves in this picture. You are carried round by the spinning Earth, into the light and out again. One full turn is one day.</p>
    </Sheet>
  );
}

const PHASES = ["New Moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full Moon", "Waning gibbous", "Last quarter", "Waning crescent"];
function phaseName(d: number): string {
  if (d < 1 || d > 28.5) return PHASES[0];
  if (d < 6.5) return PHASES[1];
  if (d < 8.5) return PHASES[2];
  if (d < 14) return PHASES[3];
  if (d < 16) return PHASES[4];
  if (d < 21.5) return PHASES[5];
  if (d < 23.5) return PHASES[6];
  return PHASES[7];
}

function MoonShapes() {
  const [d, setD] = useState(4);
  const a = (d / 29.5) * 2 * Math.PI;
  const mx = 150 - Math.cos(a) * 78, my = 112 + Math.sin(a) * 78;
  const lit = (1 - Math.cos(a)) / 2;
  const waxing = d < 14.75;
  const rx = Math.abs(Math.cos(a)) * 40;
  // Seen from Australia a growing Moon is lit on the left. Outer edge is a half circle; the inner edge is half an ellipse.
  const shape = `M0 -40 A40 40 0 0 0 0 40 A${rx.toFixed(1)} 40 0 0 ${lit < 0.5 ? 1 : 0} 0 -40 Z`;
  return (
    <Sheet stage={<>
      <svg viewBox="0 0 360 230" role="img" aria-label={`Day ${d} of the Moon's cycle: ${phaseName(d)}`}>
        <rect width="360" height="230" rx="12" class="spacebg" />
        {[62, 87, 112, 137, 162].map((yy) => <line key={yy} x1="6" y1={yy} x2="40" y2={yy} class="ray" />)}
        <text x="8" y="196" class="lbl on-space start">Sunlight</text>
        <circle cx="150" cy="112" r="78" class="orbit" />
        <circle cx="150" cy="112" r="20" class="e-night" /><path d="M150 92 A20 20 0 0 0 150 132 Z" class="e-day" />
        <g style={{ transform: `translate(${mx}px, ${my}px)` }} class="moon">
          <circle r="11" class="m-dark" /><path d="M0 -11 A11 11 0 0 0 0 11 Z" class="m-lit" />
        </g>
        <g transform="translate(300 112)">
          <circle r="40" class="m-dark" />
          {lit > 0.01 && <path d={shape} class="m-lit" transform={waxing ? undefined : "scale(-1 1)"} />}
          <circle r="40" class="m-rim" />
        </g>
        <text x="300" y="176" class="lbl on-space">What you see</text>
      </svg>
      <p class="sum"><b>{phaseName(d)}.</b> You can see about {Math.round(lit * 100)}% of the Moon's sunlit half.</p>
    </>}>
      <div><span class="lab">Day of the Moon's cycle</span><div class="big">Day {d}</div></div>
      <Slider label="Move the Moon around the Earth" value={d} min={0} max={29} onChange={setD} />
      <div class="row">
        <button class="btn ghost" onClick={() => setD((d + 1) % 30)}>One day later</button>
      </div>
      <p class="note">Look at the small Moon on its path: the half facing the Sun is always lit. The Moon never changes shape. As it travels round the Earth, we just see more or less of its sunlit half. Seen from Australia, the growing Moon is lit on the left.</p>
    </Sheet>
  );
}

export function LearnSpace() {
  const [tab, setTab] = useState<"day" | "moon">("day");
  return (
    <>
      <Seg options={TABS} value={tab} onChange={setTab} />
      {tab === "day" ? <DayNight /> : <MoonShapes />}
    </>
  );
}
