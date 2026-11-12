import { Fragment } from "preact";
import { useState } from "preact/hooks";
import { Seg } from "../ui/controls";

const CHAINS = {
  bush: ["Grass", "Grasshopper", "Frog", "Snake", "Kookaburra"],
  pond: ["Algae", "Tadpole", "Fish", "Pelican"],
  reef: ["Algae", "Parrotfish", "Reef shark"],
  desert: ["Spinifex grass", "Hopping mouse", "Desert snake", "Wedge-tailed eagle"],
} as const;
type Habitat = keyof typeof CHAINS;
const TABS = [["bush", "Bush"], ["pond", "Pond"], ["reef", "Reef"], ["desert", "Desert"]] as const;
const low = (s: string) => s.toLowerCase();

/** Build a food chain link by link, then take a link away and see who is affected. */
export function LearnLiving() {
  const [hab, setHab] = useState<Habitat>("bush");
  const [built, setBuilt] = useState(0);
  const [gone, setGone] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ kind: string; text: string }>({ kind: "calm", text: "Start with the producer: the living thing that makes its own food from sunlight." });
  const links: readonly string[] = CHAINS[hab];
  const complete = built === links.length;
  const left = links.slice(built).slice().sort();

  function reset(h: Habitat) {
    setHab(h); setBuilt(0); setGone(null);
    setMsg({ kind: "calm", text: "Start with the producer: the living thing that makes its own food from sunlight." });
  }
  function pick(name: string) {
    if (name !== links[built]) {
      setMsg({ kind: "try", text: built === 0 ? `Not that one. The ${low(name)} has to eat. Which one makes its own food from sunlight?` : `Not that one. Which of these eats the ${low(links[built - 1])}?` });
      return;
    }
    const n = built + 1;
    setBuilt(n);
    setMsg({ kind: "yes", text: n === 1 ? `${name} is the producer. It makes its own food from sunlight.`
      : n === links.length ? `Yes. The ${low(name)} eats the ${low(links[built - 1])}. The chain is complete. Now tap any link to see what happens if it disappears.`
      : `Yes. The ${low(name)} eats the ${low(links[built - 1])}. What eats the ${low(name)}?` });
  }
  function remove(i: number) {
    if (!complete) return;
    setGone(i);
    const prev = links[i - 1], next = links[i + 1];
    setMsg({ kind: "calm", text: `No ${low(links[i])}. ` + (i === 0 ? "Without the producer, every animal in the chain runs short of food, one after another."
      : `${next ? `The ${low(next)} loses its food, so its numbers drop. ` : ""}Nothing is eating the ${low(prev)}, so its numbers go up${i > 1 ? `, and it eats more ${low(links[i - 2])}` : ""}.`) });
  }
  const role = (i: number) => (i === 0 ? "producer" : i === links.length - 1 ? "top consumer" : "consumer");

  return (
    <>
      <Seg options={TABS} value={hab} onChange={reset} />
      <div class="sheet one">
        <div class="chain" aria-label="Food chain so far">
          <span class="link sun"><b>Sun</b><small>energy</small></span>
          {links.slice(0, built).map((name, i) => (
            <Fragment key={name}>
              <span class="arrowtxt" aria-label="is eaten by">→</span>
              <button class={"link" + (gone === i ? " gone" : "")} disabled={!complete} onClick={() => remove(i)}><b>{name}</b><small>{role(i)}</small></button>
            </Fragment>
          ))}
          {!complete && <><span class="arrowtxt">→</span><span class="link empty"><b>?</b><small>{built === 0 ? "producer" : "eats it"}</small></span></>}
        </div>
        <p class={"msg " + msg.kind} aria-live="polite">{msg.text}</p>
        {!complete && (
          <div class="row">
            {left.map((name) => <button key={name} class="btn ghost pickme" onClick={() => pick(name)}>{name}</button>)}
          </div>
        )}
        <div class="row">
          <button class="btn ghost" onClick={() => reset(hab)}>Start this chain again</button>
        </div>
        <p class="note">The arrow means "is eaten by". It points the way the energy goes: from the Sun, to the plant, to the animal that eats the plant, and on up the chain.</p>
      </div>
    </>
  );
}
