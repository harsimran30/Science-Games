import { useEffect, useRef, useState } from "preact/hooks";
import { TOPICS, nextQuestion } from "../engine/topics";
import { type QuickItem, quickItem } from "../engine/quick";
import type { Tier } from "../engine/types";
import { award, saveSequence, sequence } from "../state/progress";
import { rng } from "../rng-instance";
import { Confetti } from "../ui/Confetti";
import { Stepper } from "../ui/controls";

const PREFS = "science-quest-quick";
const CHEERS = ["Yes!", "Spot on.", "Correct!", "You got it.", "Nice thinking.", "That is it."];
const XP: Record<Tier, number> = { 1: 5, 2: 8, 3: 10 };
const ASK = "Is the answer in the box right? There is no timer.";

interface Config {
  topics: string[];
  tier: Tier;
}
function loadPrefs(): Config {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS) ?? "null");
    if (p && Array.isArray(p.topics)) {
      const topics = TOPICS.map((t) => t.id).filter((id) => p.topics.includes(id));
      const tier = Math.max(1, Math.min(3, Number(p.tier) || 1)) as Tier;
      if (topics.length) return { topics, tier };
    }
  } catch {
    /* fall through to defaults */
  }
  return { topics: TOPICS.map((t) => t.id), tier: 1 };
}

/** Quick-fire keeps its own counters (prefix "q:"), so it never uses up or repeats the practice rounds' questions. */
function draw(cfg: Config): QuickItem {
  const { counters, salt } = sequence();
  const pool = TOPICS.filter((t) => cfg.topics.includes(t.id));
  const topic = pool[Math.floor(rng() * pool.length)] ?? TOPICS[0];
  const item = quickItem(nextQuestion(topic, cfg.tier, counters, salt, rng, "q:"), rng);
  saveSequence();
  return item;
}

interface State {
  cfg: Config;
  item: QuickItem;
  status: "asking" | "right" | "miss";
  msg: { kind: "calm" | "yes" | "try"; text: string };
  solved: number;
  burst: number;
}

export function Quick() {
  const [s, setS] = useState<State>(() => {
    const cfg = loadPrefs();
    return { cfg, item: draw(cfg), status: "asking", msg: { kind: "calm", text: ASK }, solved: 0, burst: 0 };
  });

  function reconfigure(cfg: Config) {
    try {
      localStorage.setItem(PREFS, JSON.stringify(cfg));
    } catch {
      /* settings just will not be remembered */
    }
    setS({ ...s, cfg, item: draw(cfg), status: "asking", msg: { kind: "calm", text: "New settings, new question." } });
  }
  function answer(saysRight: boolean) {
    if (s.status !== "asking") return;
    const { q, truth } = s.item;
    const fact = truth ? q.explain : `The answer is: ${q.answer}. ${q.explain}`;
    if (saysRight === truth) {
      const gained = XP[s.cfg.tier];
      award("quick", gained, true, true);
      setS({ ...s, status: "right", solved: s.solved + 1, burst: s.burst + 1, msg: { kind: "yes", text: `${CHEERS[s.burst % CHEERS.length]} +${gained} XP. ${fact}` } });
    } else {
      award("quick", 0, false, true);
      setS({ ...s, status: "miss", msg: { kind: "try", text: `Not this time. ${fact}` } });
    }
  }
  function next() {
    setS({ ...s, item: draw(s.cfg), status: "asking", msg: { kind: "calm", text: ASK } });
  }
  function skip() {
    if (s.status !== "asking") return next();
    setS({ ...s, item: draw(s.cfg), msg: { kind: "calm", text: `Skipped. The answer to the last one was: ${s.item.q.answer}.` } });
  }
  function toggleTopic(id: string) {
    const has = s.cfg.topics.includes(id);
    if (has && s.cfg.topics.length === 1) return; // keep at least one
    reconfigure({ ...s.cfg, topics: TOPICS.map((t) => t.id).filter((t) => (t === id ? !has : s.cfg.topics.includes(t))) });
  }

  const act = useRef({ answer, next, skip, s });
  act.current = { answer, next, skip, s };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const a = act.current;
      const k = e.key.toLowerCase();
      if (k === "y") a.answer(true);
      else if (k === "n") a.answer(false);
      else if (e.key === "Enter" && a.s.status !== "asking") { e.preventDefault(); a.next(); }
      else if (e.key === "Escape") a.skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const asking = s.status === "asking";
  const { q, shown, truth } = s.item;
  return (
    <section class="fun quick">
      <Confetti burst={s.burst} />
      <a class="back" href="#">Home</a>
      <header class="hero">
        <h1>Quick-fire</h1>
        <p class="lede">Read the question and the answer in the box. Is that answer right, or not right? Skip any you like.</p>
      </header>

      <div class="funset">
        <div class="row" role="group" aria-label="Topics to include">
          {TOPICS.map((t) => (
            <button key={t.id} class="chip" aria-pressed={s.cfg.topics.includes(t.id)} onClick={() => toggleTopic(t.id)}>{t.name}</button>
          ))}
        </div>
        <Stepper label="Level" value={s.cfg.tier} min={1} max={3} onChange={(tier) => reconfigure({ ...s.cfg, tier: tier as Tier })} />
      </div>

      <div class="funmain">
        <p class="prompt wordy quickq"><span>{q.prompt}</span></p>
        <div class={"answer claim" + (asking ? "" : truth ? " won" : " not")} aria-live="polite">
          <span class="lab">{asking ? "Is this right?" : truth ? "This was right" : "This was not right"}</span>
          <span class="typed">{shown}</span>
        </div>
        <p class={"msg " + s.msg.kind} aria-live="polite">{s.msg.text}</p>
        {asking ? (
          <div class="yn">
            <button class="btn yes" onClick={() => answer(true)}>Right</button>
            <button class="btn no" onClick={() => answer(false)}>Not right</button>
            <button class="btn ghost" onClick={skip}>Skip</button>
          </div>
        ) : (
          <div class="row">
            <button class="btn" onClick={next}>Next one</button>
          </div>
        )}
        {s.solved > 0 && <p class="count">Solved: {s.solved}</p>}
      </div>
    </section>
  );
}
