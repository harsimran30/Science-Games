import { useState } from "preact/hooks";
import { Seg, Sheet, Slider, Stepper } from "../ui/controls";
import { Arrow } from "./svg";

const SURFACES = [["ice", "Wet ice"], ["timber", "Timber floor"], ["carpet", "Carpet"], ["grass", "Long grass"]] as const;
type Surface = (typeof SURFACES)[number][0];
const GRIP: Record<Surface, number> = { ice: 0.3, timber: 1, carpet: 2.5, grass: 4 };

/** Give a crate one push and see where friction stops it. Same push, different surface, different distance. */
export function LearnForces() {
  const [push, setPush] = useState(5);
  const [surface, setSurface] = useState<Surface>("timber");
  const [crates, setCrates] = useState(1);
  const grip = GRIP[surface];
  const speed = push / crates;
  const raw = (1.5 * speed * speed) / grip;
  const d = Math.min(100, Math.round(raw));
  const h = 22 * crates;
  return (
    <Sheet stage={<>
      <svg viewBox="0 0 420 190" role="img" aria-label={`A crate pushed along ${surface}. It slides ${d} units.`}>
        <Arrow x1={24} y1={30} x2={24 + push * 13} y2={30} cls="f-push" w={7} />
        <text x={24} y={16} class="lbl f-peri">Your push</text>
        <Arrow x1={396} y1={62} x2={396 - Math.min(170, grip * crates * 22 + 10)} y2={62} cls="f-fric" w={7} />
        <text x={396} y={48} class="lbl f-area end">Friction pushing back</text>
        <line x1="20" y1="140" x2="400" y2="140" class={"ground g-" + surface} />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={40 + i * 32} y1="140" x2={40 + i * 32} y2="148" class="nl-tick" />
            <text x={40 + i * 32} y="164" class="nl-t">{i * 10}</text>
          </g>
        ))}
        <rect x="22" y={138 - h} width="36" height={h} class="b-ghost" rx="3" />
        <g class="slide" style={{ transform: `translateX(${d * 3.2}px)` }}>
          {Array.from({ length: crates }, (_, i) => <rect key={i} x="22" y={138 - 22 * (i + 1)} width="36" height="21" rx="3" class="crate" />)}
        </g>
      </svg>
      <p class="sum">
        {raw > 100 ? <>It slides <b>right off the end</b> of the track.</> : d < 2 ? <>It <b>hardly moves</b>.</> : <>It slides <b>{d} units</b>, then friction stops it.</>}
      </p>
    </>}>
      <div><span class="lab">Surface</span><Seg options={SURFACES} value={surface} onChange={setSurface} /></div>
      <Slider label="How hard you push" value={push} min={1} max={10} onChange={setPush} />
      <Stepper label="Crates in the stack" value={crates} min={1} max={3} onChange={setCrates} />
      <ul class="goals">
        <li>Keep the push the same and change the surface. Rougher surface, shorter slide.</li>
        <li>Stack more crates. More mass is harder to get moving.</li>
        <li>Try wet ice with a big push.</li>
      </ul>
      <p class="note">The crate does not stop because it runs out of push. It stops because friction pushes against it the whole way. With no friction at all, it would keep sliding.</p>
    </Sheet>
  );
}
