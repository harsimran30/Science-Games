import { mulberry32 } from "./engine/rng";

/** The one random source the running app draws from. Tests build their own seeded ones. */
export const rng = mulberry32((Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0);
