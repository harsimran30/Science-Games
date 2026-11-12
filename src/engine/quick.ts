import type { Rng } from "./rng";
import type { Question } from "./types";

/** Quick-fire shows a question with ONE suggested answer. The player says whether the suggestion is right. */
export interface QuickItem {
  q: Question;
  shown: string;
  truth: boolean;
}

/** Half the time the right answer is shown; otherwise one of the wrong options (a real misconception). */
export function quickItem(q: Question, r: Rng): QuickItem {
  if (r() < 0.5) return { q, shown: q.answer, truth: true };
  const wrong = q.options.filter((o) => o !== q.answer);
  return { q, shown: wrong[Math.floor(r() * wrong.length)], truth: false };
}
