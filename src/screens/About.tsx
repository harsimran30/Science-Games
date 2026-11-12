import { TOPICS } from "../engine/topics";

/** Notes for the adult: what each topic covers, where it sits in the curriculum, and which facts are simplified. */
export function About() {
  return (
    <section class="about">
      <a class="back" href="#">Home</a>
      <header class="hero">
        <h1>For grown-ups</h1>
        <p class="lede">
          Topics follow the Australian Curriculum: Science (version 9) for Years 2 to 4, with a stretch level in each. Nothing is timed, nothing is lost for a
          wrong answer, and every question shows a short explanation. Progress is saved only on this device.
        </p>
      </header>
      <h2>What each topic covers</h2>
      <ul class="plain">
        {TOPICS.map((t) => (
          <li key={t.id}>
            <b>{t.name}.</b> {t.tiers.join(" · ")}. <span class="note">{t.curriculum}. {t.bank.reduce((n, b) => n + b.length, 0)} written questions{t.gens.some((g) => g.length) ? " plus number questions that change each time" : ""}.</span>
          </li>
        ))}
      </ul>
      <h2>Facts that are simplified or worth checking together</h2>
      <p class="note">These answers are right at primary-school level, but the full story has more to it.</p>
      <ul class="plain">
        {TOPICS.flatMap((t) => t.bank.flatMap((level, i) => level.filter((e) => e[6]).map((e) => (
          <li key={e[0]}>
            <b>{e[0]}</b> {e[1]}. <span class="note">{e[6]} ({t.name}, level {i + 1})</span>
          </li>
        ))))}
      </ul>
    </section>
  );
}
