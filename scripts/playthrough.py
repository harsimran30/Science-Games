"""Browser play-through. Opens the built single file in Chrome, visits every screen, plays rounds and quick-fire,
uses every learn model, reloads to check progress was saved, and fails on any page error.
Needs: pip install playwright, and Chrome. Usage: python3 scripts/playthrough.py [folder for screenshots]"""
import asyncio, json, pathlib, sys
from playwright.async_api import async_playwright

APP = pathlib.Path(__file__).resolve().parent.parent / "release" / "ScienceQuest" / "ScienceQuest.html"
SHOTS = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else None
IDS = ["living", "forces", "matter", "earth", "space", "energy", "electricity"]

PLAY = r"""
async ([id, tier, rounds]) => {
  const tick = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
  const prompts = []; let firstTry = 0, secondTry = 0, shown = 0;
  location.hash = id; await tick();
  for (let n = 0; n < rounds; n++) {
    if (n === 0) document.querySelectorAll('.level')[tier - 1].click();
    else [...document.querySelectorAll('.summary .btn')].find(b => b.textContent === 'Play again').click();
    await tick();
    for (let q = 0; q < 10; q++) {
      prompts.push(document.querySelector('.prompt').textContent);
      const opts = document.querySelectorAll('.opts button');
      if (opts.length !== 4) throw new Error('expected 4 options, saw ' + opts.length);
      if (new Set([...opts].map(o => o.textContent)).size !== 4) throw new Error('options not distinct');
      let clicks = 0;
      while (!document.querySelector('.round .btn:not([hidden])')) {
        const open = [...document.querySelectorAll('.opts button:not(:disabled)')];
        open[Math.floor(Math.random() * open.length)].click(); clicks++; await tick();
        if (clicks > 2) throw new Error('more than two tries were allowed');
      }
      const msg = document.querySelector('.round .msg');
      if (msg.textContent.length < 30) throw new Error('no explanation shown: ' + msg.textContent);
      if (document.querySelectorAll('.opts button.right').length !== 1) throw new Error('right answer not marked');
      if (msg.classList.contains('yes')) (clicks === 1 ? firstTry++ : secondTry++); else shown++;
      document.querySelector('.round .btn:not([hidden])').click(); await tick();
    }
    if (!document.querySelector('.summary')) throw new Error('no summary after round in ' + id);
    if (document.querySelectorAll('.review li').length !== 10) throw new Error('summary does not list 10 questions');
  }
  location.hash = ''; await tick();
  return { prompts, firstTry, secondTry, shown };
}
"""

LEARN = r"""
async (id) => {
  const tick = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
  location.hash = id + '-learn'; await tick();
  if (!document.querySelector('.learn h1')) throw new Error('learn screen missing for ' + id);
  let actions = 0;
  const tabs = [...document.querySelectorAll('.learn > .seg button')];
  for (let t = 0; t < Math.max(1, tabs.length); t++) {
    if (tabs.length) { [...document.querySelectorAll('.learn > .seg button')][t].click(); await tick(); actions++; }
    for (const r of [...document.querySelectorAll('.learn input[type=range]')]) for (const v of [r.min, r.max, String(Math.round((+r.min + +r.max) / 2))]) { r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); await tick(); actions++; }
    for (let pass = 0; pass < 3; pass++) for (const b of [...document.querySelectorAll('.learn .sheet button:not(:disabled)')]) { if (document.contains(b)) { b.click(); await tick(); actions++; } }
    if (!document.querySelector('.learn svg, .learn .chain')) throw new Error('no model drawn for ' + id);
  }
  const text = document.querySelector('.learn').textContent;
  if (/NaN|undefined|\[object/.test(text)) throw new Error('bad text on learn screen ' + id);
  return actions;
}
"""

CHAIN = r"""
async () => {
  const tick = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
  location.hash = 'living-learn'; await tick();
  const order = ['Grass', 'Grasshopper', 'Frog', 'Snake', 'Kookaburra'];
  [...document.querySelectorAll('.pickme')].find(b => b.textContent === 'Frog').click(); await tick();
  if (!document.querySelector('.learn .msg.try')) throw new Error('wrong first link was accepted');
  for (const name of order) { [...document.querySelectorAll('.pickme')].find(b => b.textContent === name).click(); await tick(); }
  if (document.querySelectorAll('.chain button.link').length !== 5) throw new Error('chain not complete');
  document.querySelectorAll('.chain button.link')[2].click(); await tick();
  const msg = document.querySelector('.learn .msg').textContent;
  if (!/No frog/.test(msg)) throw new Error('removing a link did nothing: ' + msg);
  return msg;
}
"""

QUICK = r"""
async (n) => {
  const tick = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
  location.hash = 'quick'; await tick();
  const seen = []; let right = 0, miss = 0, skipped = 0;
  for (let i = 0; i < n; i++) {
    seen.push(document.querySelector('.quickq').textContent);
    const find = (t) => [...document.querySelectorAll('.quick .btn')].find(b => b.textContent === t);
    if (i % 6 === 5) { find('Skip').click(); await tick(); skipped++; continue; }
    find(Math.random() < 0.5 ? 'Right' : 'Not right').click(); await tick();
    const msg = document.querySelector('.quick .msg');
    if (msg.classList.contains('yes')) right++; else if (msg.classList.contains('try')) miss++; else throw new Error('no verdict');
    if (msg.textContent.length < 30) throw new Error('no explanation in quick-fire');
    find('Next one').click(); await tick();
  }
  const canvas = document.querySelector('canvas.confetti');
  location.hash = ''; await tick();
  return { seen, right, miss, skipped, canvas: !!canvas };
}
"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--no-sandbox"])
        for name, vp in (("phone", {"width": 390, "height": 844}), ("desktop", {"width": 1100, "height": 820})):
            ctx = await b.new_context(viewport=vp)
            page = await ctx.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("console", lambda m: errors.append(m.text) if m.type in ("error", "warning") else None)
            await page.goto(APP.as_uri())
            assert await page.locator(".tile").count() == 8, "home should show 7 topics and quick-fire"
            async def shot(tag):
                if SHOTS: SHOTS.mkdir(parents=True, exist_ok=True); await page.screenshot(path=str(SHOTS / f"{name}-{tag}.png"), full_page=True)
            await shot("home")
            totals = {"firstTry": 0, "secondTry": 0, "shown": 0, "questions": 0}
            for i, tid in enumerate(IDS):
                for tier in (1, 2, 3):
                    res = await page.evaluate(PLAY, [tid, tier, 3 if tier == 1 else 1])
                    prompts = res["prompts"]
                    assert len(set(prompts)) == len(prompts), f"repeat within a session in {tid} level {tier}"
                    totals["questions"] += len(prompts)
                    for k in ("firstTry", "secondTry", "shown"): totals[k] += res[k]
                acts = await page.evaluate(LEARN, tid)
                assert acts >= 6, f"learn model for {tid} had too few controls ({acts})"
                await shot("learn-" + tid)
            print(name, "chain model:", await page.evaluate(CHAIN))
            await page.evaluate("location.hash = 'forces'"); await page.wait_for_timeout(50); await shot("lobby")
            await page.locator(".level").first.click(); await page.wait_for_timeout(50)
            await page.locator(".opts button").first.click(); await page.wait_for_timeout(50); await shot("round")
            q = await page.evaluate(QUICK, 60)
            assert len(set(q["seen"])) == len(q["seen"]), "repeat in quick-fire"
            assert q["canvas"] and q["right"] > 5 and q["miss"] > 5
            await page.evaluate("location.hash = 'quick'"); await page.wait_for_timeout(50); await shot("quick")
            await page.evaluate("location.hash = 'about'"); await page.wait_for_timeout(50); await shot("about")
            xp_before = await page.locator(".rank b").text_content()
            saved = await page.evaluate("localStorage.getItem('science-quest-v1')")
            data = json.loads(saved)
            assert set(data.keys()) <= {"v", "topics", "seq", "salt"}, data.keys()
            assert all(isinstance(v, int) for v in data["seq"].values()), "counters must be whole numbers"
            assert "?" not in saved and len(saved) < 4000, "storage should hold counters only, not questions"
            await page.reload()
            assert await page.locator(".rank b").text_content() == xp_before and xp_before != "0 XP", "XP was not kept after reload"
            await page.evaluate("location.hash = ''"); await page.wait_for_timeout(50); await shot("home-after")
            print(name, "played", totals, "| quick-fire", {k: q[k] for k in ("right", "miss", "skipped")}, "| XP kept:", xp_before, "| storage bytes:", len(saved))
            print(name, "page errors:", errors or "none")
            assert not errors
            await ctx.close()
        await b.close()
    print("PLAY-THROUGH PASSED")

asyncio.run(main())
