/**
 * MyMomentous — fonts.ts
 *
 * §9: Fonts load per era, not all at once. Spline Sans Mono (the Money
 * Font, §2.2) loads in every era — the numbers never age.
 *
 * All families are on Google Fonts.
 */

import type { Era } from "./motion";

/** The Money Font: every era, weights 500 and 600, tabular figures. */
const MONEY = "family=Spline+Sans+Mono:wght@500;600";

const ERA_FAMILIES: Record<Era, string[]> = {
  //           display                      body
  sprout:  ["family=Fredoka:wght@500;600", "family=Nunito+Sans:wght@700;800"],
  sapling: ["family=Fredoka:wght@500;600", "family=Nunito+Sans:wght@700;800"],
  grove:   ["family=Sora:wght@600",        "family=Inter:wght@400;500;600"],
  canopy:  ["family=Sora:wght@600",        "family=Inter:wght@400;500;600"],
  harvest: ["family=Fraunces:wght@500",    "family=Inter:wght@400;500"],
};

/** Google Fonts stylesheet URL for one era (display + body + money). */
export function fontUrlForEra(era: Era): string {
  const families = [...ERA_FAMILIES[era], MONEY].join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/**
 * Swap the era font stylesheet on the document. Idempotent; call it
 * alongside swapping the `era-*` class on the root element.
 */
export function loadEraFonts(era: Era, doc: Document = document): void {
  const id = "mm-era-fonts";
  let link = doc.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = doc.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    doc.head.appendChild(link);
  }
  const href = fontUrlForEra(era);
  if (link.href !== href) link.href = href;
}
