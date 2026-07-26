import { useId } from "react";
import type { Era } from "../motion";
import { useEra } from "../era";

/* §4.6 The leaf across eras: seedling → four leaves → full sprig →
 * branching plant → plant bearing a coin as fruit. Same coin, older leaf. */
const LEAF_PATHS: Record<Era, string> = {
  sprout:
    "M32 44 V30 M32 34 C26 32 24 26 25 22 C30 23 32 27 32 32 M32 34 C38 32 40 26 39 22 C34 23 32 27 32 32",
  sapling:
    "M32 46 V22 M32 38 C26 37 23 33 24 29 M32 38 C38 37 41 33 40 29 M32 30 C27 29 25 25 26 21 M32 30 C37 29 39 25 38 21",
  grove:
    "M32 47 V19 M32 41 C25 40 22 35 23 31 M32 41 C39 40 42 35 41 31 M32 33 C26 32 24 27 25 24 M32 33 C38 32 40 27 39 24 M32 25 C29 23 28 20 29 17 M32 25 C35 23 36 20 35 17",
  canopy:
    "M32 47 V18 M32 40 C25 40 21 36 21 31 M32 40 L26 33 M32 32 C39 32 43 28 43 23 M32 32 L38 25 M32 24 C28 23 26 20 27 16",
  harvest:
    "M32 47 V20 M32 40 C25 40 21 36 21 31 M32 32 C39 32 43 28 43 23",
};

export interface LeafCoinProps {
  size?: number;
  /** Leaf maturity; defaults to the current era from context. */
  era?: Era;
}

/* §2.1: warm gold radial gradient, highlight at 35% 30%, rim at 8% of
 * diameter, one mint leaf embossed in #B07A16. Colors are the brand
 * constants from tokens/base.css — fixed, not semantic. */
export function LeafCoin({ size = 48, era }: LeafCoinProps) {
  const { era: contextEra } = useEra();
  const leafEra = era ?? contextEra;
  const gradientId = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Mint coin" role="img">
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="var(--coin-highlight)" />
          <stop offset="70%" stopColor="var(--coin-body)" />
        </radialGradient>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="29.5"
        fill={`url(#${gradientId})`}
        stroke="var(--coin-rim)"
        strokeWidth="5"
      />
      <g fill="none" stroke="var(--coin-emboss)" strokeWidth="3" strokeLinecap="round">
        <path d={LEAF_PATHS[leafEra]} />
        {leafEra === "harvest" && (
          <circle cx="32" cy="17" r="4.5" fill="var(--coin-highlight)" strokeWidth="2" />
        )}
      </g>
    </svg>
  );
}
