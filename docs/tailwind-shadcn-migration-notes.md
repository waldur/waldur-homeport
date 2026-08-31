# Tailwind/shadcn Migration Notes

Reference for the Bootstrap/Metronic → Tailwind/shadcn migration
(`feature/tailwind-shadcn-migration-phase0`). Documents the current
architecture and the non-obvious decisions behind it — the things a
source comment can point to instead of re-explaining inline.

**Status**: Phase 0/1 spike work, not wired into production.
`BaseButton` (the Tailwind rebuild) is reachable only via Storybook
(`yarn storybook`); `src/index.tsx` has zero migration footprint and
always renders `<Application />`.

## Architecture

### Cascade layers: Bootstrap and Tailwind coexisting

`src/tailwind.css` imports Tailwind's `theme`/`preflight`/`utilities`
pieces separately (not the `@import "tailwindcss"` shorthand) and
declares an explicit layer order up front:

```css
@layer theme, base, bootstrap, utilities;
```

`style.scss`/`style.dark.scss` wrap their entire compiled Metronic output
in `@layer bootstrap { @import 'init'; }`, so the browser merges both into
one layer at this position regardless of load order (CSS layer order is
decided by first occurrence across the whole document).

`bootstrap` sits between Tailwind's `base` and `utilities`, not below
everything: Tailwind's preflight resets the universal selector (`*,
::before, ::after { margin: 0; padding: 0; border: 0 solid }`), so ranking
`bootstrap` lower lets preflight wipe Bootstrap's own styling everywhere.
This order gives Bootstrap's styling priority over preflight while still
losing to Tailwind's utilities for ordinary rules.

**Layering does not beat `!important`**: Bootstrap 5's utility-API classes
(`.border`, `.bg-transparent`) generate with `!important`, which sits in a
separate priority tier above all layered rules regardless of layer order.
`packages/ui/src/BaseButton.tsx` uses `border-[1px]`/`bg-[transparent]`
instead of the identically-named Tailwind utilities for exactly this
reason — those two collide with Bootstrap's `!important` classes; nothing
else needed the workaround once layering was in place.

**The `@layer bootstrap` wrapper is not Storybook-only.** `src/tailwind.css`
is, but the wrapper lives in `style.scss`/`style.dark.scss`, so it ships in
the real app — and unlayered CSS beats layered CSS *regardless of
specificity*. That silently promoted every one of the ~99 component
stylesheets imported from a `.tsx` (`import './Foo.scss'`, which Vite injects
unlayered) above all of Metronic, including where Metronic previously won on
specificity.

Only one file was actually affected, and it shows the shape to avoid.
`MarketplaceTrigger.scss` scoped itself under a Metronic layout root:

```scss
/* specificity 0,4,0 — used to lose, now wins unconditionally */
.aside .menu-item.add-resource-toggle .menu-link { justify-content: center; }
```

against `custom/_aside.scss`'s collapsed-sidebar rule (0,5,0), which needs
`justify-content: start` inside a 43px box. The result was the Add resource
plus icon pushed out of view whenever the sidebar was minimized. The fix was
to move the block into `custom/_aside.scss` so it shares the layer.

So: **component SCSS must be scoped under its own class, never under a
Metronic layout root** (`.aside`, `.header`, `.toolbar`, …). Anything that
genuinely needs to override Metronic layout belongs in
`src/metronic/sass/custom/`, inside the layer. Nesting a Metronic class
*inside* your own class is fine — that is what every other component
stylesheet does, and it already outranks Metronic on specificity, so the
layer change is a no-op for them.

### Root font-size override

Metronic forces `html, body { font-size: 13px !important }` (12px below
the `lg` breakpoint). Tailwind's default scale is rem-based, so any
rem-based Tailwind utility on a page with Metronic loaded resizes against
a 13px root instead of the 16px Tailwind assumes. Cascade layering doesn't
fix this — it decides which declaration wins, not what a rem-relative
value computes to — so `src/tailwind.css`'s `@theme` block overrides
`--spacing`/`--text-sm`/`--text-base`/`--radius-md`/`--radius-lg` with
explicit px values instead.

**Numbered spacing utilities (`p-3`, `mt-1`) don't reliably pick up the
`--spacing` override**: Tailwind's own compiled utilities carry their own
`--spacing` declaration inside the (higher-priority) `utilities` layer,
which wins over the override living in `theme`. `--radius-lg`/`--text-sm`
aren't affected — they're direct theme keys with no downstream `calc()`
multiplication; only the base `--spacing` multiplier is shadowed. Use px
arbitrary values (`p-[12px]`, `mt-[4px]`) instead of the numbered scale —
`BaseButton.tsx` already does this throughout.

### Brand color token bridge

`src/tailwind.css`'s second `@theme` block points Tailwind's color
utilities at the CSS custom properties the app sets at runtime
(`--waldur-brand-*`, written once at bootstrap by `afterBootstrap.tsx`'s
`initCssVariables()`). It's a naming bridge, not a color definition — a
`BRAND_COLOR` change or dark-mode toggle re-themes Tailwind utilities with
zero code here changing. Any harness that renders components outside real
app bootstrap (e.g. a Storybook decorator) must seed `--waldur-brand-*`
itself, or brand-reactive styles fall back to CSS's "invalid at
computed-value time" behavior instead of a real color.

### Dark mode signal

The real app toggles dark mode by swapping the entire compiled stylesheet
(`src/theme/utils.ts`'s `loadTheme()`) — there's no `.dark` class.
`loadTheme()` also sets `data-theme` on `<html>` as an additional signal
for consumers that can't read `ThemeContext`. Tailwind's `dark:` variant
is defined in `tailwind.css` as `@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))`.
The stylesheet swap remains the source of truth for Bootstrap/Metronic
styling; `data-theme` is additive, not a second toggle.

## BaseButton (Tailwind rebuild)

`packages/ui/src/BaseButton.tsx`, exported as `BaseButton`. Colors come
from `packages/design-tokens/src/buttonColors.css`; every value there was
cross-checked against the real (Bootstrap) `BaseButton` via
`getComputedStyle()` and against Waldur's reference design system (an
Untitled-UI-derived Figma library), with the empirically-measured value
winning wherever the two disagreed.

### Border: `box-shadow`, not `border`

The border-replacement lives in an inset `box-shadow`
(`shadow-[inset_0_0_0_1px_<color>]`, `transparent` for variants with no
visible border) rather than the `border` property. A real `border`
participates in the box's total height under `border-box` sizing, and the
real button's rem-based padding/line-height chain lands on a _fractional_
height at this app's 13px root font-size, while this component's explicit
px values land on an exact integer — a 1px border around a
fractional-height box anti-aliases across the sub-pixel boundary and
renders visibly thinner than the same border around an exact-integer box,
even with byte-identical `border-width`/`border-color`. `box-shadow`
doesn't participate in layout sizing, sidestepping the difference
entirely.

Two things this requires everywhere the border-replacement is used:

- **Padding compensates on both axes.** Since `box-shadow` doesn't
  consume padding-box space the way `border` does, both `size` variants
  add 1px of padding per side beyond what the content needs, on _both_
  `px-`/`py-` (not just one axis) — `sm`: `px-[8px] py-[4px]`; `lg`:
  `px-[16px] py-[10px]`. Miss either axis and the button renders 1–2px
  off from the real one on that dimension.
- **`focus:`/`hover:` shadow values must combine layers.** `box-shadow`
  is one property, so a state's `shadow-[...]` class fully replaces it
  rather than layering on top of the base inset border the way a real
  `border` (a separate property) would. Every variant with a visible
  border and a focus ring combines both into one bracket value
  (`shadow-[inset_0_0_0_1px_<border>,0_0_0_2px_<ring>]`); `warning`
  additionally blends its border into its _hover_ fill the same way
  (asymmetric with `danger`/`success`, which only do this on focus).

### Focus: `focus:`, not `focus-visible:`

Every `focus:` class in `BaseButton.tsx` deliberately targets plain
`:focus`, not the more modern `focus-visible:`. The real Bootstrap button
ties its ring to plain `:focus`, which fires for any focus method
including a mouse click; `focus-visible:` is suppressed by the browser for
pointer-originated focus by design, so a component built on it shows no
ring at all after a click — a real, visible divergence from Bootstrap.
Matching Bootstrap's behavior here is a deliberate parity choice for this
migration phase over the more modern pattern.

Two consequences of firing the ring on every focus, not just keyboard
navigation:

- **`active:shadow-none` on every variant.** A mouse press focuses the
  button before the click completes, so `:active` and `:focus` match
  simultaneously. The real button always renders `box-shadow: none` while
  `:active` — the focus ring is fully suppressed during a press,
  regardless of variant. Without an explicit `active:shadow-none`, the
  `focus:` ring would render on top of the pressed color.
- **`focus:bg-[...]` resets on solid `danger`/`warning`/`success`.**
  After a click completes, the cursor is still over the button, so
  `:hover` stays matched alongside `:focus`. These three variants reset
  their background back to the base/enabled value on focus
  (`focus:bg-[var(--btn-danger-bg)]` etc.), overriding whatever `:hover`
  set — every other variant already escalates past the hover tint on
  focus for unrelated reasons, so only these three needed it added
  explicitly.

### Focus ring color

The ring's color is its own per-variant token
(`--btn-<variant>-focus-ring`), not derived from the variant's border or
text color, and light/dark are independent values — dark mode is not
simply a computed lighten/darken of light mode. Two things that aren't
obvious from the naming:

- `tertiary`/`tertiary-ghost` share `--btn-tertiary-focus-ring`
  (`gray-100` light, `gray-800` dark) — a deliberately faint ring, barely
  visible against the page. `text-secondary` looks similar (also a gray
  ring on a gray-bordered-adjacent button) but uses its own
  `--btn-text-secondary-focus-ring` (`gray-200` light, `gray-700` dark) —
  one step darker in both themes, not the same value.
- `primary`/`text-primary` share `--btn-primary-focus-ring`, and
  `secondary`/`text-secondary`'s background states share
  `--btn-secondary-focus-ring` — both are `brand-600` in light but
  `brand-500` in dark, a brighter step than the light value's ramp
  position, not the same brand ramp index carried over unchanged.
  `danger`/`warning`/`success` (and their `text-*` counterparts) follow
  the same pattern against their own ramps: `-600` in light, `-500` in
  dark.

### Active/pressed state

Pressed-state colors are their own ramp step, not a duplicate of hover's:

| Variant     | Light pressed bg | Light text | Dark pressed bg | Dark text |
| ----------- | ---------------- | ---------- | --------------- | --------- |
| `secondary` | brand-300        | unchanged  | brand-600       | unchanged |
| `danger`    | error-500        | white      | error-400       | gray-50   |
| `warning`   | warning-600      | white      | warning-300     | gray-50   |
| `success`   | success-500      | white      | success-400     | gray-50   |

`danger`/`warning`/`success` share `--btn-pressed-text-on-vivid` (`#fff`
light, `var(--color-gray-50)` dark) for their pressed text color — same
sharing pattern as `--btn-disabled-bg`/`--btn-disabled-text` across every
variant, since all three land on the identical value.

All five `text-*` (ghost) variants render **no background at all** while
pressed, in both themes — `active:bg-[transparent]` on each, since
`:hover` and `:active` match simultaneously and nothing would otherwise
outrank `hover:bg-[...]`. Their pressed text color splits three ways:

- `text-danger`/`text-warning`/`text-success`: unchanged from whatever
  `hover:text-[...]` already set (that rule stays applied during the
  simultaneous `:active` match).
- `text-secondary`: unchanged from its base/enabled color in both themes.
- `text-primary`: asymmetric. Light stays at `--btn-text-primary-color`
  (brand-700, already dark enough to read as pressed). Dark brightens all
  the way to gray-50 via a dedicated `--btn-text-primary-pressed` token —
  distinct from `--btn-pressed-text-on-vivid` because this variant has no
  background to sit on, so the contrast math differs from the solid
  variants above.

## `packages/ui`: portable Tailwind/Radix primitives

Holds the pieces of `BaseButton`'s dependency graph with zero Bootstrap
coupling:

- **`cn()`** — class-name merge helper.
- **`LoadingSpinner`** — Tailwind's `animate-spin` instead of Metronic's
  `.animation-spin`; no color class needed since `SpinnerIcon` already
  renders with `fill="currentColor"`. Distinct from
  `src/core/LoadingSpinner.tsx`'s `LoadingSpinnerSimple`, which ~385
  call sites elsewhere still use unchanged.
- **`Tooltip`** — `@radix-ui/react-tooltip`-based rebuild of
  `src/core/Tooltip.tsx`'s `Tip` (react-bootstrap's `OverlayTrigger`),
  scoped to `Tip`'s actual usage (`label` + optional `body`, default
  hover/focus trigger, always the dark bubble theme) rather than its
  fuller react-bootstrap-derived API. Colors reference
  `packages/design-tokens` directly (`--color-gray-900`/`--color-gray-300`
  — `Tip`'s dark bubble already happened to use exactly those steps).
- **`BaseButton`** — see above. Internal imports of `cn`/`LoadingSpinner`/
  `Tooltip` are relative (`./cn` etc.), not round-tripped through the
  package name.

`waldur-homeport/src/core/buttons/BaseButtonParity.stories.tsx` is the one
place both the old and new button render side by side, importing the new
one as `import { BaseButton as BaseButtonTw } from 'waldur-ui'` purely for
local readability in that file.

## Storybook toolchain

`yarn storybook` (dev, port 6006) / `yarn build-storybook`.

**Stories**: `BaseButton.stories.tsx` and `BaseButtonTw.stories.tsx`
(`packages/ui/src/BaseButton.stories.tsx`, sidebar title
`Core/Buttons/BaseButtonTw` kept unchanged so it sits next to the
Bootstrap original for side-by-side browsing), one story per state
rendering the full variant × size matrix, plus
`BaseButtonParity.stories.tsx` (`Migration/BaseButton Parity`) — a
different kind of story that renders old and new side by side, tagged
`data-pair`/`data-role`, for the Playwright parity spec to screenshot.
The plain component stories use `storybook-addon-pseudo-states` to force
hover/focus/active via a CSS class rewrite for quick visual browsing; the
parity story instead relies on the spec driving real Playwright
interactions, since forced pseudo-states aren't reliable enough for the
real Bootstrap button's compiled CSS (see below).

**`.storybook/main.ts`'s `viteFinal`** hand-duplicates `vite.config.ts`'s
`resolve.alias`/`css.preprocessorOptions`/`define` rather than reusing its
`plugins` array wholesale (that array's own `react()` would double up with
`@storybook/react-vite`'s). Keep the duplicated values in sync by hand.

**`.storybook/preview.tsx`'s theme toggle** calls `loadTheme()`
(`src/theme/utils.ts`) directly — the same function the real app's
`ThemeProvider` calls — so both the old Bootstrap-only story and the new
Tailwind `dark:` story get correctly-themed CSS from one toggle.

**Vitest project split** (`vitest.config.ts`): two named projects, `unit`
(jsdom, original unit tests) and `storybook` (browser-mode via
`@vitest/browser-playwright`, renders every story as a smoke test — `yarn
test:storybook`). They need different CI images, so `.gitlab-ci.yml`'s
"Run unit tests" job passes `--project=unit` explicitly and "Run Storybook
tests" runs separately on the Playwright image.

`storybook` project's `optimizeDeps.include` explicitly lists `aria-query`,
`lz-string`, `pretty-format` — without them, Vite's dependency scanner
can't see into `@storybook/addon-vitest`'s build artifact to discover
their transitive CJS deps, and each hits a browser-native
`SyntaxError`/`ReferenceError` interop failure at import time instead.

## Visual parity test suite (`e2e-visual/base-button-parity.spec.ts`)

Screenshots the old (Bootstrap) and new (Tailwind) `BaseButton` side by
side on the `BaseButtonParity` story and diffs the buffers directly — no
committed baseline to go stale. Run with:

```bash
yarn playwright test base-button-parity --project visual --workers=1
```

(`--workers=1` is required — a full run at `--workers=3` exhausted
available RAM on this machine.)

**Coverage**: 12 variants × 2 sizes × 2 themes × 6 states (`enabled`,
`disabled`, `hover`, `active`, `focus` via `.focus()`, `focus` via a real
`.click()`) = 288 cases.

### Checks, in the order they run

1. **Dimension parity** (`MAX_DIMENSION_SLACK_PX = 0.5`) — compares
   `locator.boundingBox()` (exact CSS pixels, captured at the same moment
   as each screenshot), not the screenshot PNG's rounded integer
   dimensions. PNG-based comparison was tried and rejected: the
   screenshot clip region rounds based on the element's exact fractional
   _position_ on the page, not just its own width, so a genuine
   regression and real noise can round to the identical PNG delta
   depending on where the element sits. The measured noise ceiling via
   `boundingBox()` is ~0.06px; the slack gives ~8x headroom above that
   while catching anything as small as half a pixel.
2. **Pixelmatch ratio** (`DIFF_RATIO_THRESHOLD = 0.16`, `threshold: 0.25`
   per-pixel) — the primary pixel-diff check. Tuned above pure rendering
   noise (up to ~13% on text-only/pastel-background variants, where
   antialiasing-affected edges are a large fraction of a small button's
   area) while staying well below any real color/token bug's signal.
3. **Dominant-color chromaticity** (`CHROMATICITY_TOLERANCE = 10`,
   `FOREGROUND_DISTANCE_THRESHOLD = 30`) — closes the pixelmatch ratio's
   blind spot on small/text-heavy buttons, where a completely wrong hue
   only touches a small fraction of the image and reads as a low ratio.
   Averages RGB over "foreground" pixels (anything beyond the distance
   threshold from the button's own corner-background color) and compares
   **chromaticity** — each channel's share of total brightness — which
   cancels out uniform lighter/darker antialiasing shifts while staying
   sensitive to an actual hue change.

### Known, accepted rendering-engine noise

Both checks converge on token/color values verified byte-identical
between old and new via direct `getComputedStyle()` comparison wherever
any residual diff remains. What's left is not fixable at the
token/component level — it's inherent to comparing two structurally
different CSS implementations achieving the same visual design:

- **Box-shadow corner rendering at small radius**: the real button's
  focus ring measures a `2.015px` spread; the new one measures exactly
  `2px` — same color, same syntax, different final spread depending on
  each implementation's intermediate box-sizing chain (`rem` vs. `px`
  units, different wrapper elements). Most visible on `sm`-size buttons'
  ring/border corners.
- **Text/edge antialiasing on pastel backgrounds at `lg` size**: glyph
  antialiasing coverage depends on exactly which sub-pixel position a
  glyph lands on, which can differ even when both implementations resolve
  to the same final px value on paper.

Eliminating these fully would require literally sharing DOM structure and
CSS between old and new, which defeats the point of the migration. Every
threshold above was set by measuring the real noise ceiling empirically
and adding deliberate margin — not guessed.

### Testing gotchas

- **CSS transitions need a real paint to settle.** A synchronous
  `getComputedStyle()` read immediately after `.hover()`/`.focus()`, with
  no repaint in between, reliably returns the pre-transition value.
  `gotoParity()` disables all transitions/animations page-wide via an
  injected stylesheet; the `waitForTimeout(350)` before each
  hover/focus/active screenshot is a second, independent safeguard.
- **`:focus-visible` isn't triggered by a raw `.focus()` call** in
  Chromium — it requires focus to plausibly originate from keyboard
  interaction. `:focus` (what this component actually uses — see above)
  doesn't have this restriction, so `.focus()` and `.click()` both
  trigger it, and the suite's two focus tests exist specifically to cover
  each trigger path (`.focus()` for keyboard/programmatic, `.click()` for
  real pointer-originated focus — they exercise genuinely different
  states given `:hover` persists after a click but not after `.focus()`).
- **Reliably triggering `:active`**: a fresh browser context per test
  (Playwright already does this per-`test()`), `scrollIntoViewIfNeeded()`,
  `page.mouse.move()` to the element's exact center (from `boundingBox()`,
  not a hover-implied position) before `mouse.down()`, and an explicit
  `element.matches(':active')` check immediately before capturing
  anything — the test throws a clear error if that check is false, rather
  than silently comparing two enabled buttons and passing.
- Storybook's `storybook-addon-pseudo-states` forced-state toggle is fine
  for the plain component stories' quick visual browsing, but unreliable
  for the real Bootstrap button's compiled CSS specifically — the parity
  spec always drives real Playwright interactions instead.
