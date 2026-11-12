"""Leak check. Plays many full rounds, quick-fire and every learn model in a real browser, then compares heap,
DOM node and event-listener counts after a warm-up against the counts after heavy use.
Needs: pip install playwright, and Chrome. Usage: python3 scripts/memtest.py [cycles]"""
import asyncio, pathlib, sys
from playwright.async_api import async_playwright

APP = pathlib.Path(__file__).resolve().parent.parent / "release" / "ScienceQuest" / "ScienceQuest.html"
CYCLES = int(sys.argv[1]) if len(sys.argv) > 1 else 12

DRIVER = r"""
async (cycles) => {
  const tick = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
  const ids = ['living','forces','matter','earth','space','energy','electricity'];
  let questions = 0, quick = 0, learnActions = 0;
  async function round(id, tier) {
    location.hash = id; await tick();
    document.querySelectorAll('.level')[tier - 1].click(); await tick();
    for (let q = 0; q < 10; q++) {
      for (let g = 0; g < 4 && !document.querySelector('.round .btn:not([hidden])'); g++) {
        const o = [...document.querySelectorAll('.opts button:not(:disabled)')];
        o[Math.floor(Math.random() * o.length)].click(); await tick();
      }
      document.querySelector('.round .btn:not([hidden])').click(); await tick(); questions++;
    }
    if (!document.querySelector('.summary')) throw new Error('no summary after round in ' + id);
    location.hash = ''; await tick();
  }
  async function fire(n) {
    location.hash = 'quick'; await tick();
    const find = (t) => [...document.querySelectorAll('.quick .btn')].find(b => b.textContent === t);
    for (let i = 0; i < n; i++) {
      if (i % 5 === 4) { find('Skip').click(); await tick(); continue; }
      find(i % 2 ? 'Right' : 'Not right').click(); await tick();
      find('Next one').click(); await tick(); quick++;
    }
    location.hash = ''; await tick();
  }
  async function learn() {
    for (const id of ids) {
      location.hash = id + '-learn'; await tick();
      const tabs = document.querySelectorAll('.learn > .seg button').length;
      for (let t = 0; t < Math.max(1, tabs); t++) {
        if (tabs) { document.querySelectorAll('.learn > .seg button')[t].click(); await tick(); }
        for (const r of [...document.querySelectorAll('.learn input[type=range]')]) for (const v of [r.min, r.max]) { r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); await tick(); learnActions++; }
        for (const b of [...document.querySelectorAll('.learn .sheet button:not(:disabled)')]) { if (document.contains(b)) { b.click(); await tick(); learnActions++; } }
      }
    }
    location.hash = ''; await tick();
  }
  for (let c = 0; c < cycles; c++) {
    await fire(20); await learn();
    for (const id of ids) await round(id, 1 + (c % 3));
    for (let i = 0; i < 20; i++) { location.hash = ids[i % 7]; await tick(); location.hash = i % 2 ? 'about' : ''; await tick(); }
  }
  return { questions, quick, learnActions };
}
"""

async def metrics(cdp):
    await cdp.send("HeapProfiler.collectGarbage"); await cdp.send("HeapProfiler.collectGarbage")
    m = {x["name"]: x["value"] for x in (await cdp.send("Performance.getMetrics"))["metrics"]}
    return {"heap_kb": round(m["JSHeapUsedSize"] / 1024), "dom_nodes": int(m["Nodes"]), "listeners": int(m["JSEventListeners"]), "audio_contexts": int(m.get("AudioHandlers", 0))}

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--no-sandbox", "--js-flags=--expose-gc", "--autoplay-policy=no-user-gesture-required"])
        page = await b.new_page(viewport={"width": 1100, "height": 820})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        await page.goto(APP.as_uri())
        cdp = await page.context.new_cdp_session(page)
        await cdp.send("Performance.enable")
        await page.evaluate(DRIVER, 2)                      # warm-up: every screen seen, JIT settled
        await page.wait_for_timeout(2500)                   # let the last celebration finish
        before = await metrics(cdp)
        did = await page.evaluate(DRIVER, CYCLES)
        await page.wait_for_timeout(2500)
        after = await metrics(cdp)
        growth = {k: after[k] - before[k] for k in before}
        print("played:", did)
        print("after warm-up:", before)
        print("after heavy use:", after)
        print("growth:", growth)
        print("page errors:", errors or "none")
        await b.close()
        ok = not errors and growth["listeners"] <= 2 and growth["dom_nodes"] <= 50 and growth["heap_kb"] < 1500
        print("MEMORY TEST", "PASSED" if ok else "FAILED")
        sys.exit(0 if ok else 1)

asyncio.run(main())
