# Science Quest

Science practice for a Year 4 student, built on the same architecture and visual style as Maths Quest
(`harsimran30/Math-Games`). TypeScript + Preact + Vite, built to a single HTML file, hash routing.

Calm by design: no timers, no lives, nothing goes down. XP and levels are saved on the device only.

## Topics and curriculum (Australian Curriculum: Science v9)

| Topic | Level 1 | Level 2 | Level 3 (stretch) | Curriculum |
|---|---|---|---|---|
| Living things | Living or not, life cycles | Food chains and habitats | Food webs, animal groups | AC9S3U01, AC9S4U01 |
| Forces and motion | Pushes and pulls | Friction, gravity, magnets | Balanced forces, machines | AC9S4U03 |
| Matter and materials | Solids, liquids, gases | Melting, freezing, evaporating | Materials and their uses | AC9S2U03, AC9S3U04, AC9S4U04 |
| Water and rocks | Water cycle | Rocks, soils, minerals | Weather and resources | AC9S3U02, AC9S4U02 |
| Earth and space | Sun, Earth, Moon | Planets and the night sky | Seasons, eclipses | AC9S2U01 + stretch |
| Energy | Sound | Heat | Light and energy changes | AC9S2U02, AC9S3U03, AC9S5U03 |
| Electricity | Using it safely | Circuits, conductors | Series, parallel, power | AC9S6U03 (Year 6: extension) |

Electricity is not in the Year 2 to 4 curriculum. It is included as an extension topic.

## What is in it

- **Practice**: rounds of 10, four options, two tries, an explanation after every answer.
- **Learn**: one interactive model per topic (push and friction, food chain builder, particles and temperature,
  water cycle, day/night and Moon shapes, sound and heat, circuit builder).
- **Quick-fire**: a question with one suggested answer. Right or not right? Skip any time. Confetti on correct.
- **For grown-ups** (`#about`): curriculum mapping and the list of facts that are simplified.

## Questions

- 840 written questions: 40 per topic per level, in `src/engine/bank/`. Each is
  `[question, answer, wrong, wrong, wrong, explanation, note?]`. The optional note flags a simplified or
  check-worthy fact and is shown on the grown-ups page.
- 21 numeric generators in `src/engine/topics/` (speed, density, unit conversions, circuits, temperature, echoes…).
  Wrong options are computed from named slips (added instead of multiplied, forgot to convert, and so on).
- No repeats and no history: each question set is walked in a scrambled order (`src/engine/seq.ts`), so the only
  thing stored is one counter per set. A question can come round again only after its whole set has been used.

## Commands

```
npm ci
npm run dev        # local dev server
npm test           # unit tests: every bank entry, every question of every generator
npm run build      # type-check, build dist/index.html, package release/ScienceQuest/
python3 scripts/playthrough.py [screenshot-folder]   # browser play-through (needs playwright + Chrome)
python3 scripts/memtest.py [cycles]                   # leak check
```

## Deploy

`.github/workflows/deploy.yml` tests, builds and publishes `dist/` to GitHub Pages on every push to `main`.
Pages must be enabled once: Settings → Pages → Source: **GitHub Actions**.
