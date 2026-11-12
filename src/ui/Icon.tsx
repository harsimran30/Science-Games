const PATHS: Record<string, preact.ComponentChildren> = {
  living: <><path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z" /><path d="M5 19l8-8" /></>,
  forces: <><path d="M2 12h11" /><path d="M9 7l5 5-5 5" /><rect x="16" y="6" width="5" height="12" rx="1" /></>,
  matter: <path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" />,
  earth: <><path d="M2 20l7-12 4 7 2-3 7 8z" /><path d="M17 3c1.3 1.6 2 2.7 2 3.6a2 2 0 0 1-4 0c0-.9.7-2 2-3.6z" /></>,
  space: <><circle cx="12" cy="12" r="5" /><ellipse cx="12" cy="12" rx="10.5" ry="3.4" transform="rotate(-20 12 12)" /></>,
  energy: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
  electricity: <path d="M13 2L5 14h6l-1 8 8-12h-6z" />,
  quick: <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />,
};

/** Line icons drawn with the current text colour, so they follow each topic's ink in light and dark mode. */
export function Icon({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      {PATHS[id] ?? PATHS.quick}
    </svg>
  );
}
