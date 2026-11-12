import type { ComponentChildren } from "preact";

export function Stepper(p: { label: string; value: number; min: number; max: number; step?: number; dot?: string; fmt?: (v: number) => string; onChange: (v: number) => void }) {
  const step = p.step ?? 1;
  return (
    <div class="stepper">
      <span class="nm">{p.dot && <i style={{ background: p.dot }} />}{p.label}</span>
      <span class="pm">
        <button type="button" aria-label={`Less: ${p.label}`} disabled={p.value - step < p.min} onClick={() => p.onChange(p.value - step)}>−</button>
        <output>{p.fmt ? p.fmt(p.value) : p.value}</output>
        <button type="button" aria-label={`More: ${p.label}`} disabled={p.value + step > p.max} onClick={() => p.onChange(p.value + step)}>+</button>
      </span>
    </div>
  );
}

export function Slider(p: { label: string; value: number; min: number; max: number; fmt?: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <label class="ctl">
      <span>{p.label}</span>
      <output>{p.fmt ? p.fmt(p.value) : p.value}</output>
      <input type="range" min={p.min} max={p.max} value={p.value} onInput={(e) => p.onChange(Number((e.currentTarget as HTMLInputElement).value))} />
    </label>
  );
}

export function Seg<T extends string>(p: { options: readonly (readonly [T, string])[]; value: T; onChange: (v: T) => void }) {
  return (
    <div class="seg">
      {p.options.map(([id, label]) => (
        <button type="button" key={id} aria-pressed={p.value === id} onClick={() => p.onChange(id)}>{label}</button>
      ))}
    </div>
  );
}

export function Sheet({ stage, children }: { stage: ComponentChildren; children: ComponentChildren }) {
  return (
    <div class="sheet">
      <div class="stage">{stage}</div>
      <div class="side">{children}</div>
    </div>
  );
}
