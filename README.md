# MyMomentous

**"Money is grown, not given."**

A kids' money app built on one metaphor — growth — that visually ages with the child across five eras, from a toy (Sprout, ages 3–5) to a ceremony (Harvest, age 18).

This repository currently contains the design system foundation: the spec, the era token files, motion presets, and a living demo.

## Layout

```
DESIGN_SYSTEM.md     The design source of truth (v1.0)
tokens/
  base.css           The constants (§2): mint greens, leaf-coin golds,
                     the money font, ring gap, reduced-motion floor
  sprout.css         Era 1 (3–5)  · a toy            · radius 28 · bouncy
  sapling.css        Era 2 (6–9)  · a storybook game · radius 20 · springy
  grove.css          Era 3 (10–13)· a game terminal  · radius 14 · crisp
  canopy.css         Era 4 (14–17)· clean fintech    · radius 10 · purposeful
  harvest.css        Era 5 (18)   · a ceremony       · radius 8  · cinematic
src/
  motion.ts          Framer Motion spring presets per era + reduced-motion fallback
  fonts.ts           Per-era Google Fonts loading (never all at once)
demo/
  index.html         Era-switching demo: same components, five skins
```

## How era switching works

Every era file defines the **same semantic token names** with different values (the contract is documented at the top of `tokens/base.css`). Switching eras is one class swap on the root element:

```html
<html class="era-sprout">  →  <html class="era-grove">
```

Components read only from tokens. If a component needs a color that is not a token, the design is wrong, not the token file.

## Try the demo

Open `demo/index.html` in a browser (or serve the repo root with any static server) and click through the five eras. Fonts load from Google Fonts.

## The one-sentence test

If someone sees any screen with the logo removed, they should still say: *"that's the money app that grows up with your kid."* Every screen review ends with that question.
