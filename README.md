# MyMomentous

**"Money is grown, not given."**

A kids' money app built on one metaphor — growth — that visually ages with the child across five eras, from a toy (Sprout, ages 3–5) to a ceremony (Harvest, age 18).

Stack: React, TypeScript, Vite. This repository contains the design system (Phase 1) and the component library (Phase 2).

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
  era.tsx            EraProvider / useEra: sets data-era on the root, swaps fonts
  components/        Button, Card, Sheet, NavBar, AmountText, LeafCoin,
                     GrowthRing, AvatarRings, QuestCard, StoreItem,
                     ScoreDial, Sparkline — all read only from tokens
  dev/DevGallery.tsx Hidden dev screen: every component, all five eras
demo/
  index.html         Static era-switching demo (no build needed)
```

## How era switching works

Every era file defines the **same semantic token names** with different values (the contract is documented at the top of `tokens/base.css`). Switching eras is one attribute swap on the root element:

```html
<html data-era="sprout">  →  <html data-era="grove">
```

`EraProvider` owns that attribute and loads the era's fonts. Components read only from tokens. If a component needs a color that is not a token, the design is wrong, not the token file.

## Run it

```
npm install
npm run dev      # opens the hidden component gallery (or visit /#dev in any build)
npm run build    # typecheck + production build
```

The static `demo/index.html` still works standalone in a browser with no build.

## The one-sentence test

If someone sees any screen with the logo removed, they should still say: *"that's the money app that grows up with your kid."* Every screen review ends with that question.
