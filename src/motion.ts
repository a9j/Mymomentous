/**
 * MyMomentous — motion.ts
 *
 * Framer Motion spring presets per era (Design System §9).
 * These are the canonical values; the CSS custom properties
 * --spring-stiffness / --spring-damping in tokens/*.css mirror them
 * for CSS-only consumers.
 *
 * §8 Accessibility floor: every spring and drop animation must have a
 * fade-only fallback under prefers-reduced-motion. Use `withReducedMotion`
 * so the fallback is impossible to forget.
 */

export type Era = "sprout" | "sapling" | "grove" | "canopy" | "harvest";

export interface SpringPreset {
  type: "spring";
  stiffness: number;
  damping: number;
}

/** §4.1–4.5: bouncy → springy → crisp → purposeful → cinematic */
export const springs: Record<Era, SpringPreset> = {
  sprout:  { type: "spring", stiffness: 220, damping: 12 }, // overshoots, wobbles, delights
  sapling: { type: "spring", stiffness: 260, damping: 16 }, // springy but composed
  grove:   { type: "spring", stiffness: 320, damping: 22 }, // crisp, quick, no wobble
  canopy:  { type: "spring", stiffness: 380, damping: 28 }, // motion exists only to explain
  harvest: { type: "spring", stiffness: 380, damping: 30 }, // cinematic, deliberate
};

/**
 * Stagger between sequential reveals, in seconds.
 * Harvest reveals stats one at a time like film credits, 350ms apart (§4.5).
 */
export const revealStagger: Record<Era, number> = {
  sprout: 0.08,
  sapling: 0.07,
  grove: 0.05,
  canopy: 0.04,
  harvest: 0.35,
};

/**
 * §4.3: red events (missed payment, fund drop) get a single 200ms shake,
 * never more. Losses sting once.
 */
export const lossShake = {
  keyframes: { x: [0, -6, 5, -3, 0] },
  transition: { duration: 0.2, ease: "easeOut" as const },
};

/** §8: fade-only fallback for prefers-reduced-motion. */
export const reducedMotionFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.15 },
};

/**
 * Returns the era's spring, or the fade fallback when the user prefers
 * reduced motion. Pass the result of `useReducedMotion()` (Framer Motion)
 * or a `matchMedia("(prefers-reduced-motion: reduce)")` check.
 */
export function withReducedMotion(
  era: Era,
  prefersReducedMotion: boolean,
): SpringPreset | typeof reducedMotionFade.transition {
  return prefersReducedMotion ? reducedMotionFade.transition : springs[era];
}
