import { useState } from "preact/hooks";
import { TOPICS } from "../engine/topics";
import { LEVEL_XP, levelOf, progressOf, rankOf, resetAll, totalXp } from "../state/progress";
import { Bar } from "../ui/bits";
import { Icon } from "../ui/Icon";

export function Home() {
  const [confirming, setConfirming] = useState(false);
  const total = totalXp();
  const rank = rankOf(total);
  const quick = levelOf(progressOf("quick").xp);

  return (
    <section class="home">
      <header class="hero">
        <h1>Pick something to explore</h1>
        <p class="lede">Rounds of 10 questions. No timer. XP only ever goes up.</p>
        {rank.next !== null && (
          <p class="next">
            <Bar value={total - rank.from} max={rank.next - rank.from} ink="ink" />
            <span>{rank.next - total} XP to reach the next rank</span>
          </p>
        )}
      </header>

      <div class="tiles">
        {TOPICS.map((t) => {
          const p = progressOf(t.id);
          const lv = levelOf(p.xp);
          return (
            <a class="tile" href={"#" + t.id} key={t.id}>
              <span class={"sigil c-" + t.ink}><Icon id={t.id} /></span>
              <span class="tname">{t.name}</span>
              <span class="tblurb">{t.blurb}</span>
              <span class="tlevel">
                <b>Level {lv.level}</b>
                <Bar value={lv.into} max={LEVEL_XP} ink={t.ink} />
                <span>{p.xp} XP</span>
              </span>
            </a>
          );
        })}
        <a class="tile fun-tile" href="#quick">
          <span class="sigil c-sun"><Icon id="quick" /></span>
          <span class="tname">Quick-fire</span>
          <span class="tblurb">Right or not right? One tap each, skip any time</span>
          <span class="tlevel">
            <b>Level {quick.level}</b>
            <Bar value={quick.into} max={LEVEL_XP} ink="ink" />
            <span>{progressOf("quick").xp} XP</span>
          </span>
        </a>
      </div>

      <footer class="foot row">
        <a class="linkish" href="#about">For grown-ups</a>
        {total > 0 &&
          (confirming ? (
            <span class="row">
              <span>Wipe all XP and levels?</span>
              <button class="btn ghost" onClick={() => { resetAll(); setConfirming(false); }}>Yes, start again</button>
              <button class="btn ghost" onClick={() => setConfirming(false)}>Keep my progress</button>
            </span>
          ) : (
            <button class="linkish" onClick={() => setConfirming(true)}>Reset progress</button>
          ))}
      </footer>
    </section>
  );
}
