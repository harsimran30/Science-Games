/** A straight arrow from (x1,y1) to (x2,y2). Drawn with a class so the ink colour follows the theme. */
export function Arrow({ x1, y1, x2, y2, cls, w = 5 }: { x1: number; y1: number; x2: number; y2: number; cls: string; w?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 6 + w * 1.6;
  const bx = x2 - Math.cos(a) * h, by = y2 - Math.sin(a) * h;
  const px = Math.sin(a) * h * 0.6, py = -Math.cos(a) * h * 0.6;
  return (
    <g class={"arrow " + cls}>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke-width={w} />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} />
    </g>
  );
}
