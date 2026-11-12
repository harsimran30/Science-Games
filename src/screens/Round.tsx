import { useEffect, useRef, useState } from "preact/hooks";
import { nextQuestion } from "../engine/topics";
import type { Question, Tier, Topic } from "../engine/types";
import { XP_PER_TIER } from "../engine/types";
import { award, levelOf, progressOf, recordRound, saveSequence, sequence } from "../state/progress";
import { rng } from "../rng-instance";
import { Rich } from "../ui/bits";

const LENGTH = 10;

export interface RoundItem {
  q: Question;
  tries: number;
  solved: boolean;
}
export interface RoundResult {
  xp: number;
  items: RoundItem[];
  levelledUp: boolean;
}
interface State {
  q: Question;
  index: number;
  wrong: string[];
  status: "asking" | "right" | "shown";
  gained: number;
  xp: number;
  items: RoundItem[];
}

/** Draws the next unseen question and saves the counter straight away, so closing the app never brings it back. */
function draw(topic: Topic, tier: Tier): Question {
  const { counters, salt } = sequence();
  const q = nextQuestion(topic, tier, counters, salt, rng);
  saveSequence();
  return q;
}

export function Round({ topic, tier, onDone, onQuit }: { topic: Topic; tier: Tier; onDone: (r: RoundResult) => void; onQuit: () => void }) {
  const startLevel = useRef(levelOf(progressOf(topic.id).xp).level);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const [s, setS] = useState<State>(() => ({ q: draw(topic, tier), index: 0, wrong: [], status: "asking", gained: 0, xp: 0, items: [] }));

  function choose(option: string) {
    if (s.status !== "asking" || s.wrong.includes(option)) return;
    if (option === s.q.answer) {
      const first = s.wrong.length === 0;
      const gained = first ? XP_PER_TIER[tier] : Math.ceil(XP_PER_TIER[tier] / 2);
      award(topic.id, gained, first, true);
      setS({ ...s, status: "right", gained, xp: s.xp + gained, items: [...s.items, { q: s.q, tries: s.wrong.length, solved: true }] });
    } else if (s.wrong.length === 0) {
      setS({ ...s, wrong: [option] });
    } else {
      award(topic.id, 0, false, true);
      setS({ ...s, wrong: [...s.wrong, option], status: "shown", gained: 0, items: [...s.items, { q: s.q, tries: 2, solved: false }] });
    }
  }

  function advance() {
    if (s.status === "asking") return;
    if (s.index + 1 >= LENGTH) {
      recordRound(topic.id, s.xp);
      onDone({ xp: s.xp, items: s.items, levelledUp: levelOf(progressOf(topic.id).xp).level > startLevel.current });
      return;
    }
    setS({ ...s, q: draw(topic, tier), index: s.index + 1, wrong: [], status: "asking", gained: 0 });
  }

  // Keyboard for desktop: 1-4 picks an option, Enter moves on. One listener for the life of the round.
  const keys = useRef({ choose, advance, s });
  keys.current = { choose, advance, s };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = keys.current;
      if (e.key >= "1" && e.key <= "4") {
        const opt = k.s.q.options[Number(e.key) - 1];
        if (opt) k.choose(opt);
      } else if (e.key === "Enter" && k.s.status !== "asking") {
        e.preventDefault(); // we handle it here, so a focused button does not fire a second time
        k.advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (s.status !== "asking") nextBtn.current?.focus({ preventScroll: true });
  }, [s.status, s.index]);

  const done = s.status !== "asking";
  return (
    <section class="round">
      <div class="roundbar">
        <button class="back" onClick={onQuit}>Leave round</button>
        <span class="where">{topic.name} · {topic.tiers[tier - 1]}</span>
        <span class={"roundxp c-" + topic.ink}>+{s.xp} XP</span>
      </div>
      <ol class="dots" aria-label={`Question ${s.index + 1} of ${LENGTH}`}>
        {Array.from({ length: LENGTH }, (_, i) => {
          const it = s.items[i];
          return <li key={i} class={it ? (it.solved && it.tries === 0 ? "ok" : "look") : i === s.index ? "now" : ""} />;
        })}
      </ol>

      <p class="prompt wordy"><span><Rich text={s.q.prompt} /></span></p>

      <div class="opts">
        {s.q.options.map((o, i) => {
          const isAnswer = o === s.q.answer;
          const cls = done && isAnswer ? "right" : s.wrong.includes(o) ? "picked" : "";
          return (
            <button key={s.index + ":" + i} class={cls} disabled={done || s.wrong.includes(o)} onClick={() => choose(o)}>
              <kbd>{i + 1}</kbd>
              <span><Rich text={o} /></span>
            </button>
          );
        })}
      </div>

      <div class={"msg " + (s.status === "right" ? "yes" : s.status === "shown" || s.wrong.length ? "try" : "calm")} aria-live="polite">
        {s.status === "asking" && (s.wrong.length ? "Not that one. Have another go." : "Pick an answer. There is no timer.")}
        {s.status === "right" && (
          <span>
            <b>Yes. +{s.gained} XP.</b> <Rich text={s.q.explain} />
          </span>
        )}
        {s.status === "shown" && (
          <span>
            <b>The answer is: <Rich text={s.q.answer} />.</b> <Rich text={s.q.explain} />
          </span>
        )}
      </div>

      <div class="row">
        <button class="btn" ref={nextBtn} hidden={!done} onClick={advance}>
          {s.index + 1 >= LENGTH ? "Finish round" : "Next question"}
        </button>
      </div>
    </section>
  );
}
