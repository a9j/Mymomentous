# MyMomentous Design System
### "Money is grown, not given."
Version 1.0. The design source of truth for MyMomentous.

---

## 1. The Thesis

Every kids' money app looks like a bank painted in cartoon colors. MyMomentous is built on one metaphor instead: **growth**. Money here is a living thing. You plant it, tend it, wait on it, and harvest it.

The word Mint carries the whole brand. A mint is where money is made. Mint is a plant. Mint green is a color. "Mint condition" means brand new. Every design decision below grows out of that one word.

The second rule: **the app ages with the child.** It sheds its baby fat. Corners sharpen, colors quiet down, motion calms, type matures. A 16 year old should be able to show this app to a friend without embarrassment. A 4 year old should want to hug it.

---

## 2. The Constants (never change, any age)

These five things are the brand. They are identical at age 3 and age 18. Everything else is allowed to grow up around them.

### 2.1 The Leaf Coin
The currency mark is a gold coin stamped with a single mint leaf. Not a dollar sign, not a generic star.

- Base: circle, warm gold radial gradient, `#FFE9A8` highlight at 35% 30%, body `#F2B33C`, rim stroke `#DC9E2C` at 8% of diameter
- Emboss: one mint leaf glyph, centered, `#B07A16`, simple two-lobe leaf with center vein
- The leaf on the coin matures with the child's era (see 4.6). Same coin, older leaf.
- Text fallback symbol: `ⓜ` until the custom glyph ships in the icon font

### 2.2 The Money Font
All numbers that represent Mints, prices, balances, interest, or scores are set in one typeface across every era:

- **Spline Sans Mono**, weights 500 and 600, tabular figures
- This is the voice of the ledger. The world around the numbers grows up. The numbers never do.
- Practical bonus: columns always align, balances never jitter when digits change.

### 2.3 Mint Green
One brand green, present in every era, even if only as a 2px detail:

- `--mint-500: #46C48A` (primary brand green)
- `--mint-700: #1E5B3F` (evergreen, dark contexts)
- `--mint-300: #9FE8C4` (tint, backgrounds and glows)

### 2.4 Growth Rings
The signature visual device. Progress in MyMomentous is never a straight bar. It is a **ring**, like a tree ring.

- Savings goal: the goal image sits in a circle, a ring fills clockwise around it as Mints accumulate
- Tenure: the kid's profile avatar gains one thin concentric ring per year in the economy. A 6 year veteran has 6 rings. This becomes a quiet badge of honor and is unique to us.
- Streaks, vault lock timers, and level progress all use ring geometry
- Construction: SVG stroke with `stroke-dasharray`, ring gap 3px, ring weight 5px (Sprout era: 8px)

### 2.5 The Voice
All copy at an 8th grade reading level or below. Active voice. The app never scolds and never baby-talks. It states what happened and what the kid can do next. Money outcomes are described as facts, not judgments: "Rocket Fund dropped 8% this week" not "Uh oh! Bad news!"

---

## 3. The Aging System

Five visual eras. Parents unlock the next era manually (readiness, not birthday). Each era is a token override file. Same components underneath, different skin.

| Era | Ages | Name | Feel | Radius | Motion |
|---|---|---|---|---|---|
| 1 | 3 to 5 | **Sprout** | A toy | 28px | Bouncy |
| 2 | 6 to 9 | **Sapling** | A storybook game | 20px | Springy |
| 3 | 10 to 13 | **Grove** | A game terminal | 14px | Crisp |
| 4 | 14 to 17 | **Canopy** | Clean fintech | 10px | Purposeful |
| 5 | 18 | **Harvest** | A ceremony | 8px | Cinematic |

The rule of thumb for any new screen: could this screen exist in the era before it? If yes, it is not aging enough.

---

## 4. Era Specifications

### 4.1 SPROUT (3 to 5): The Toy

The screen is a toy, not an interface. One object per screen, two actions max, zero navigation.

**Palette**
```css
--bg:        #FFF6E5;  /* warm cream, like construction paper */
--surface:   #FFFDF7;
--ink:       #4A3B22;  /* warm brown. Black is too harsh here */
--sun:       #FFC93C;  /* primary action, joy */
--sky:       #7DCBFF;  /* secondary action */
--sprout:    #6FD08C;  /* success, growth */
--coin-gold: #F2B33C;
```

**Type**
- Display: **Fredoka** 600, sizes huge, 34 to 48px
- Body: **Nunito Sans** 800, minimum 18px
- Numbers: Spline Sans Mono 600, up to 56px for the balance

**Shape and texture**
- Radius 28px everywhere. Nothing has a sharp corner. Buttons look like river stones.
- Chunky 5 to 6px borders in a darker shade of the fill, giving everything a sticker or toy-block look
- Buttons have a solid bottom shadow (offset 6px, darker shade, no blur) so they look physically pressable
- Subtle paper grain on the background (2% noise) so it feels like craft paper, not a screen

**Motion**
- Spring: stiffness 220, damping 12 (overshoots, wobbles, delights)
- Coins obey cartoon physics: drop, bounce twice, settle with a wiggle
- Every earn event: coin drop, soft clink sound, `+5` floats up and fades
- Idle life: the jar sprout sways gently every 20 seconds so the screen feels alive

**Signature moment**
The jar has a tiny mint sprout growing from its lid soil. It gains a leaf at savings milestones.

---

### 4.2 SAPLING (6 to 9): The Storybook Game

The economy opens: two-pocket money, goals, the family store, first jobs board. The world is a town.

**Palette**
```css
--bg:        #F5F0E1;  /* parchment */
--surface:   #FCFAF3;
--ink:       #2E4636;
--evergreen: #1E5B3F;  /* primary, headers, nav */
--gold:      #E3B34C;  /* prices, rewards */
--berry:     #E4657A;  /* goals and wishes */
--line:      #DCD3BC;  /* card borders */
```

**Type**
- Display: Fredoka 500 (slimmer than Sprout, the type literally loses baby weight)
- Body: Nunito Sans 700, minimum 15px
- Numbers: Spline Sans Mono 600

**Shape and texture**
- Radius 20px. Borders slim to 2px.
- Store items sit on drawn "shelves": a 3px evergreen line under each store row, tiny bracket feet, so the House Store reads as an actual storefront
- Job cards look like quest cards: left color spine (4px) coded by job type, chore vs pitched
- The kid's savings goal is a real photo of the thing, masked in a circle, with a Growth Ring filling around it

**Motion**
- Spring: stiffness 260, damping 16 (springy but composed)
- Interest day is an event: a small envelope slides in, opens, coins hop into the balance, ring ticks forward
- Buying from the store: the item card flips to reveal a "ticket" the kid shows the parent

**Signature moment**
The pitch-a-job card. Dashed border, lightbulb, "Name your price." It should look different from every other card in the app because it is the most important behavior we teach.

---

### 4.3 GROVE (10 to 13): The Game Terminal

Bills, credit, fictional funds. Dark mode unlocks here and it is presented as a rite of passage, not a settings toggle. The vibe: a strategy game command center, slightly serious, slightly dangerous.

**Palette (dark, default for this era)**
```css
--bg:        #10151C;  /* midnight soil */
--surface:   #161D27;
--raised:    #1C2531;
--ink:       #E8ECF4;
--muted:     #6B7484;
--mint-neon: #52E8A4;  /* the brand green goes neon in the dark */
--signal-up: #52E8A4;
--signal-dn: #FF6B6B;  /* losses must look like losses */
--credit:    #8B7BFF;  /* violet owns everything credit and loans */
--line:      #232E3E;
```

**Type**
- Display: **Sora** 600, tight letter spacing (-0.5px)
- Body: Inter 500
- Numbers: Spline Sans Mono, now the dominant voice of the UI

**Shape and texture**
- Radius 14px. Borders 1px. Cards separate by tone, not shadow.
- Data becomes decoration: sparklines, dials, tickers. The Rocket Fund sparkline animates live so volatility is felt, not read.
- The credit score is a half-arc dial, needle sweep animated with spring on every change
- Loan offers are styled as compact term sheets: label column, value column, two buttons. Serious on purpose.

**Motion**
- Spring: stiffness 320, damping 22 (crisp, quick, no wobble)
- Numbers tick, they do not fade: balance changes count up or down digit by digit
- Red events (missed payment, fund drop) get a single 200ms shake, never more. Losses sting once.

**Signature moment**
First dark mode boot: the screen "powers on" with a one-time animation and the line "Welcome to Money HQ." Kids will screenshot this.

---

### 4.4 CANOPY (14 to 17): Clean Fintech

Taxes, insurance, compound interest, shadow portfolio, first real dollars. The app now looks like a banking product a young adult would choose, with one twist of personality left.

**Palette (light default, dark available)**
```css
--bg:        #F4F2ED;  /* warm paper, not sterile white */
--surface:   #FFFFFF;
--ink:       #14171A;
--muted:     #6E7278;
--mint-500:  #2FA876;  /* brand green, desaturated to adult strength */
--signal-dn: #D64545;
--line:      #E3E0D8;
```

**Type**
- Display: Sora 600
- Body: Inter 400 and 500
- Numbers: Spline Sans Mono (unchanged, forever)

**Shape and texture**
- Radius 10px. Whitespace does the work. Illustration almost fully retired.
- The tax breakdown is the one rich visual: a flowing split of gross pay into streams (family fund, vacation, charity), each stream tappable
- Compound interest screen: a projection curve the kid scrubs with a thumb, watching the age-45 number swing. This is the era's only "wow" and it earns it.

**Motion**
- Spring: stiffness 380, damping 28. Motion exists only to explain: a stream splitting, a curve responding to a scrub.

**Signature moment**
Shadow portfolio rows show real tickers with real live prices, marked with a small ghost icon. Real market, zero risk. Side by side with the real custodial account when parents enable it.

---

### 4.5 HARVEST (18): The Ceremony

One flow, experienced once. Design it like the last scene of a film.

**Palette**
```css
--bg:        #0A0A0A;
--ink:       #F4F2ED;
--harvest:   #C9A24B;  /* gold, earned */
--mint-500:  #46C48A;  /* the constant, one last time */
```

**Type**
- Display: **Fraunces** 500, the only serif in the entire system, appearing exactly once in the product's life. The diploma face.
- Numbers: Spline Sans Mono

**Motion**
- Stats reveal one at a time like film credits, 350ms apart
- The final act: the kid's savings ring unwinds, travels across the screen, and re-forms as the logo of the real account it just became. Simulation becomes reality in one continuous shape.

**Design target: this screen gets screenshotted and posted by the parent.** That is its KPI.

---

### 4.6 The Leaf Across Eras
The leaf on the coin and in the logo matures with the child:

- Sprout: a two-leaf seedling
- Sapling: a stem with four leaves
- Grove: a full mint sprig
- Canopy: a branching plant
- Harvest: the plant bearing a single gold coin as fruit

Same silhouette family, five ages. This is the brand's growth chart.

---

## 5. Iconography and Illustration

- Icons: rounded, 2px stroke at Sprout and Sapling, thinning to 1.5px at Grove and Canopy. Filled versions only for active nav states.
- Illustration exists in Sprout and Sapling only: flat shapes, chunky outlines matching the border weight, paper-craft feel, no gradients except on coins
- No mascot character. The jar, the coin, and the plant are the characters. A mascot would cap the ceiling of how old this app can feel.
- Emoji are allowed in Sapling store items and quest cards only. Zero emoji from Grove onward.

---

## 6. Sound (small but ownable)

- One coin clink, pitch rises slightly with each earn in the same session (Sprout and Sapling only)
- Interest day: soft chime
- Grove onward: sound off by default except two moments, loan payoff and era graduation
- All sounds respect the mute switch, always

---

## 7. Copy Voice by Era

| Era | Rule | Example |
|---|---|---|
| Sprout | 5 words or fewer per line | "You earned 5 Mints!" |
| Sapling | Short sentences, kid is "you" | "12 more Mints to your goal." |
| Grove | Straight facts, light edge | "Rocket Fund fell 8%. That is what high risk means." |
| Canopy | Adult, plain, no hype | "Gross pay 100. Family tax 10. Net 90." |
| Harvest | Earned warmth | "You are ready for the real one." |

Never: exclamation points on losses, shame words (wasted, bad choice), or fake urgency. The Spender money style gets strengths listed first, same as every style.

---

## 8. Accessibility Floor (non negotiable)

- Touch targets: 64px minimum in Sprout, 48px Sapling, 44px Grove onward
- Contrast: 4.5:1 minimum for all text, checked per era palette, including gold on parchment (use `#8A6A1B` for gold text on light backgrounds, never raw `#E3B34C`)
- Reduced motion: every spring and drop animation has a fade-only fallback via `prefers-reduced-motion`
- Color never carries meaning alone: gains and losses also get arrows and signs
- Dynamic Type respected up through 2 size steps without layout breakage

---

## 9. Implementation Notes

- One `tokens.css` per era: `sprout.css`, `sapling.css`, `grove.css`, `canopy.css`, `harvest.css`. Identical variable names, different values. Era switch = swap one stylesheet class on the root.
- Components read only from tokens. If a component needs a color that is not a token, the design is wrong, not the token file.
- Framer Motion spring presets exported per era as `motion.ts`: `{ sprout: {stiffness:220, damping:12}, ... }`
- Fonts: Fredoka, Nunito Sans, Sora, Inter, Fraunces, Spline Sans Mono. All on Google Fonts. Load per era, not all at once.
- Build order: tokens, then the Jar screen to taste, then propagate.

---

## 10. The One-Sentence Test

If someone sees any screen of this app with the logo removed, they should still be able to say: "that's the money app that grows up with your kid." Every review of every new screen ends with that question.
