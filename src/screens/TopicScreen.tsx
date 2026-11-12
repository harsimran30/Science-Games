import { useState } from "preact/hooks";
import type { Tier, Topic } from "../engine/types";
import { XP_PER_TIER } from "../engine/types";
import { LEVEL_XP, levelOf, progressOf } from "../state/progress";
import { Bar, Rich, useProgress } from "../ui/bits";
import { Icon } from "../ui/Icon";
import { Round, type RoundResult } from "./Round";

type Phase = { k: "lobby" } | { k: "round"; tier: Tier; n: number } | { k: "summary"; tier: Tier; n: number; result: RoundResult };

export function TopicScreen({ topic }: { topic: Topic }) {
  const [phase, setPhase] = useState<Phase>({ k: "lobby" });
  useProgress();
  const p = progressOf(topic.id);
  const lv = levelOf(p.xp);

  if (phase.k === "round") {
    return (
      <Round
        key={phase.n}
        topic={topic}
        tier={phase.tier}
        onQuit={() => setPhase({ k: "lobby" })}
        onDone={(result) => setPhase({ k: "summary", tier: phase.tier, n: phase.n, result })}
      />
    );
  }

  if (phase.k === "summary") {
    const { result, tier, n } = phase;
    const first = result.items.filter((i) => i.tries === 0 && i.solved).length;
    return (
      <section class="summary">
        <a class="back" href="#">Home</a>
        <h1>Round finished</h1>
        <div class="pair">
          <div><span class="lab">XP this round</span><span class={"big c-" + topic.ink}>+{result.xp}</span></div>
          <div><span class="lab">Right first try</span><span class="big">{first} of {result.items.length}</span></div>
          <div><span class="lab">{topic.name}</span><span class="big">Level {lv.level}</span></div>
        </div>
        {result.levelledUp && <p class="msg yes">You reached level {lv.level} in {topic.name}.</p>}
        <p class="next"><Bar value={lv.into} max={LEVEL_XP} ink={topic.ink} /><span>{LEVEL_XP - lv.into} XP to level {lv.level + 1}</span></p>
        <div class="row">
          <button class="btn" onClick={() => setPhase({ k: "round", tier, n: n + 1 })}>Play again</button>
          <button class="btn ghost" onClick={() => setPhase({ k: "lobby" })}>Choose a level</button>
          <a class="btn ghost" href={"#" + topic.id + "-learn"}>Learn this topic</a>
          <a class="btn ghost" href="#">Home</a>
        </div>
        <h2>What you answered</h2>
        <ol class="review">
          {result.items.map((it, i) => (
            <li key={i} class={it.solved && it.tries === 0 ? "ok" : "look"}>
              <div class="rq"><Rich text={it.q.prompt} /></div>
              <div class="ra"><b><Rich text={it.q.answer} /></b><span>{it.solved ? (it.tries === 0 ? "first try" : "second try") : "shown"}</span></div>
              {!(it.solved && it.tries === 0) && <p class="note"><Rich text={it.q.explain} /></p>}
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section class="lobby">
      <a class="back" href="#">Home</a>
      <header class="hero">
        <span class={"sigil big c-" + topic.ink}><Icon id={topic.id} /></span>
        <h1>{topic.name}</h1>
        <p class="lede">{topic.blurb}. Choose how hard, then answer 10 questions.</p>
        <p class="next"><b>Level {lv.level}</b><Bar value={lv.into} max={LEVEL_XP} ink={topic.ink} /><span>{p.xp} XP{p.bestRound ? ` · best round ${p.bestRound}` : ""}</span></p>
      </header>
      <div class="levels">
        {([1, 2, 3] as Tier[]).map((tier) => (
          <button class="level" key={tier} onClick={() => setPhase({ k: "round", tier, n: 0 })}>
            <span class={"num c-" + topic.ink}>{tier}</span>
            <span class="lname">{topic.tiers[tier - 1]}</span>
            <span class="lxp">{XP_PER_TIER[tier]} XP each</span>
          </button>
        ))}
      </div>
      <a class="tile wide" href={"#" + topic.id + "-learn"}>
        <span class="tname">Learn it first</span>
        <span class="tblurb">Not sure how this works? Play with the model until it makes sense, then come back and practise.</span>
      </a>
    </section>
  );
}
