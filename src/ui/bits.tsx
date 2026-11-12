import { useEffect, useState } from "preact/hooks";
import { subscribe } from "../state/progress";

/** Re-renders the caller whenever saved progress changes. Unsubscribes on unmount. */
export function useProgress(): void {
  const [, bump] = useState(0);
  useEffect(() => subscribe(() => bump((n) => n + 1)), []);
}

const FRACTION = /\{([^{}/]+)\/([^{}/]+)\}/g;

/** Draws {n/d} as a stacked fraction; everything else is plain text. */
export function Rich({ text }: { text: string }) {
  const out: preact.ComponentChildren[] = [];
  let last = 0;
  for (const m of text.matchAll(FRACTION)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    out.push(
      <span class="frac" role="img" aria-label={`${m[1]} over ${m[2]}`}>
        <span>{m[1]}</span>
        <span>{m[2]}</span>
      </span>,
    );
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

export function Bar({ value, max, ink }: { value: number; max: number; ink: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <span class="bar" role="img" aria-label={`${value} of ${max}`}>
      <b style={{ width: pct + "%", background: `var(--${ink})` }} />
    </span>
  );
}
