import { useEffect, useRef } from "preact/hooks";

interface Bit {
  x: number; y: number; vx: number; vy: number; rot: number; spin: number; size: number; life: number; ttl: number; color: string; glyph: string;
}
const GLYPHS = ["★", "●", "▲", "■", "◆", "✦", "+"];
const INKS = ["--peri", "--area", "--vol", "--good", "--sun"];
const MAX_BITS = 320;

/**
 * Celebration overlay. Each change of `burst` throws shapes across the screen in one of three patterns.
 * The animation loop only runs while something is on screen and is cancelled on unmount, so it holds nothing
 * once it has finished. Skipped entirely when the device asks for reduced motion.
 */
export function Confetti({ burst }: { burst: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sim = useRef<{ bits: Bit[]; raf: number; last: number }>({ bits: [], raf: 0, last: 0 });

  useEffect(() => {
    const s = sim.current;
    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.bits.length = 0;
    };
  }, []);

  useEffect(() => {
    const cv = canvas.current;
    if (!burst || !cv) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const s = sim.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    const css = getComputedStyle(document.documentElement);
    const colors = INKS.map((v) => css.getPropertyValue(v).trim() || "#888");
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const add = (x: number, y: number, vx: number, vy: number) => {
      if (s.bits.length >= MAX_BITS) return;
      const ttl = rnd(1.1, 1.9);
      s.bits.push({ x, y, vx, vy, rot: rnd(0, 6.28), spin: rnd(-7, 7), size: rnd(18, 38), life: ttl, ttl, color: colors[(Math.random() * colors.length) | 0], glyph: GLYPHS[(Math.random() * GLYPHS.length) | 0] });
    };
    const pattern = burst % 3;
    if (pattern === 1) {
      for (let i = 0; i < 90; i++) { const a = rnd(0, 6.28); const v = rnd(250, 780); add(W / 2, H * 0.42, Math.cos(a) * v, Math.sin(a) * v - 220); } // firework
    } else if (pattern === 2) {
      for (let i = 0; i < 100; i++) { const left = i % 2 === 0; add(left ? 0 : W, H, (left ? 1 : -1) * rnd(180, 620), -rnd(650, 1250)); } // two fountains
    } else {
      for (let i = 0; i < 110; i++) add(rnd(0, W), rnd(-H * 0.5, -20), rnd(-70, 70), rnd(140, 480)); // rain
    }

    const frame = (now: number) => {
      const dt = Math.min(0.04, (now - (s.last || now)) / 1000);
      s.last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let alive = 0;
      for (const b of s.bits) {
        b.life -= dt;
        if (b.life <= 0) continue;
        b.vy += 1500 * dt;
        b.vx *= 1 - 0.9 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.spin * dt;
        if (b.y > H + 60) { b.life = 0; continue; }
        s.bits[alive++] = b;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.globalAlpha = Math.min(1, b.life / (b.ttl * 0.35));
        ctx.fillStyle = b.color;
        ctx.font = `800 ${b.size}px "Lexend Variable", system-ui, sans-serif`;
        ctx.fillText(b.glyph, 0, 0);
        ctx.restore();
      }
      s.bits.length = alive;
      if (alive) {
        s.raf = requestAnimationFrame(frame);
      } else {
        s.raf = 0;
        s.last = 0;
        ctx.clearRect(0, 0, W, H);
      }
    };
    if (!s.raf) {
      s.last = 0;
      s.raf = requestAnimationFrame(frame);
    }
  }, [burst]);

  return <canvas ref={canvas} class="confetti" aria-hidden="true" />;
}
