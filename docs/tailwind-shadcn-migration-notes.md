# Tailwind/shadcn Migration Notes

Working notes for the Bootstrap/Metronic → Tailwind/shadcn migration
(`feature/tailwind-shadcn-migration-phase0`). Collects the reasoning,
investigation trails, and gotchas that used to live as long inline comments
scattered across the touched files — kept in one place so source comments
can stay short pointers instead of re-telling the story at every call site.

Current status: **Phase 0/1 spike work**, not wired into production.
`BaseButtonTw` is reachable only via Storybook (`yarn storybook`) —
`src/index.tsx` has zero Tailwind-migration footprint, unconditionally
rendering `<Application />`. The former `?tw-spike` showcase and
`?tw-parity` harness routes were both superseded by Storybook stories and
removed (see "Storybook toolchain" below).

## Cascade layers: making Bootstrap and Tailwind coexist

`src/tailwind.css` imports Tailwind's `theme`/`preflight`/`utilities`
pieces separately (instead of the `@import "tailwindcss"` shorthand) and
declares an explicit layer order up front:

```css
@layer theme, base, bootstrap, utilities;
```

`style.scss`/`style.dark.scss` wrap their entire compiled Metronic output
in `@layer bootstrap { @import 'init'; }`, using the same layer name so the
browser merges both into one layer at this position — regardless of load
order, since CSS layer order is decided by first occurrence across the
whole document, and this reservation is what establishes that occurrence.

**Why this order and not "bootstrap below everything"**: the first attempt
ranked `bootstrap` as the lowest-priority layer overall. That broke the
real (Bootstrap) `BaseButton` outright — Tailwind's preflight resets the
universal selector (`*, ::before, ::after { margin: 0; padding: 0; border:
0 solid }`), so with Bootstrap ranked below it, preflight wiped Bootstrap's
own styling everywhere, not just at points of conflict. Caught via a cheap
`getComputedStyle` sanity check before running the full test suite.
Sandwiching `bootstrap` between Tailwind's `base` and `utilities` fixes
this: Bootstrap's own styling now outranks Tailwind's preflight, while
still losing to Tailwind's utilities for ordinary, normal-priority rules.

**What layering does NOT fix**: Bootstrap 5's utility-API classes
(`.border`, `.bg-transparent`) are generated with `!important` by default
— confirmed via `getPropertyPriority()` on the live CSSOM rule.
`!important` declarations sit in a completely separate priority tier from
normal-priority layered rules and always win regardless of which layer
either side is in, so no amount of layer reordering makes Tailwind's plain
`border`/`bg-transparent` beat Bootstrap's same-named class. `packages/ui/src/BaseButton.tsx`
uses differently-named classes (`border-[1px]`, `bg-[transparent]`) for
exactly those two utilities, specifically because they collide with a
Bootstrap `!important` class — every other utility didn't need that
treatment once cascade layers were in place.

## Root font-size scaling

Metronic forces `html, body { font-size: 13px !important }` (12px below the
`lg` breakpoint). Tailwind's default scale is rem-based, so on any page
where Metronic is also loaded, every rem-based Tailwind utility silently
resizes against a 13px root instead of the 16px Tailwind assumes — found
via `BaseButtonTw`'s first visual-parity failure (a "primary-lg" button
rendered 40px tall instead of 44px). Cascade layering doesn't fix this — it
only decides which declaration wins, not what a rem-relative value computes
to once it does — so `src/tailwind.css`'s `@theme` block overrides
`--spacing`/`--text-sm`/`--text-base`/`--radius-md`/`--radius-lg` with
explicit px values instead.

## Brand color token bridge

`src/tailwind.css`'s second `@theme` block points Tailwind's color
utilities at the CSS custom properties the app already sets at runtime
(`--waldur-brand-*`, written once at real app bootstrap by
`afterBootstrap.tsx`'s `initCssVariables()`, itself called from
`core/bootstrap.ts`'s `loadConfig()`). It doesn't define new colors — it's
purely a naming bridge, so BRAND_COLOR changes or dark-mode toggles
re-theme Tailwind utilities with zero code here changing.

**Harnesses that bypass real app bootstrap must seed this manually**, or
brand-reactive styles fall back incorrectly. Both `SpikePage.tsx` and
`mountParity.tsx` call `generateBrandColors()`/`hexToRgb()` (the same
functions `afterBootstrap.tsx` calls) to seed `--waldur-brand-*` on mount.
`mountParity.tsx`'s harness in particular surfaced this the hard way: with
the var unset, `.btn.btn-secondary` (old Bootstrap) and `var(--waldur-brand-*)`
(new Tailwind) each hit CSS's own "invalid at computed-value time"
fallback *differently* (border-color resets to `currentColor`, text color
resets to inherited), producing two different wrong colors that had
nothing to do with either component implementation — the parity test's
first `secondary`-variant failure, misdiagnosed at first as a component
bug before being traced to the harness.

**Live re-theming caveat** (investigated in `SpikePage.tsx`, not a
migration blocker): rapidly repeated `setProperty()` calls on
`--waldur-brand-*` — as its color picker does on every keystroke —
occasionally left a `dark:bg-brand-*` utility rendering a stale color in
one browser session. A minimal non-Tailwind repro (double `var()`
indirection, no React) did not reproduce it, and most of the discrepancy
traced to normal oklch round-trip rounding rather than genuine staleness.
Moot either way — `initCssVariables()` only ever runs once, at bootstrap;
the real app has never supported live, reload-free `BRAND_COLOR`
propagation for Bootstrap-styled components either. Only worth a
from-scratch repro if a later phase deliberately adds live re-theming as a
new capability.

## Dark mode signal

The real app toggles dark mode by swapping the entire compiled stylesheet
(`src/theme/utils.ts`'s `loadTheme()`, via `hrefs.dark`/`hrefs.light`) —
there's no `.dark` class. `loadTheme()` now also sets `data-theme` on
`<html>`, purely as an additional signal for consumers that can't read
`ThemeContext` — Tailwind's `dark:` variant is defined in `tailwind.css` as
`@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))`.
The stylesheet swap remains the source of truth for existing
Bootstrap/Metronic styling; this is additive, not a second toggle.

## BaseButtonTw color tokens

`packages/design-tokens/src/colors.css` and `buttonColors.css` hold the base
ramps and semantic button tokens. Cross-checked two ways: empirically via
`getComputedStyle()` on the real `BaseButton` in both themes, and against
Waldur's own reference design system (an Untitled-UI-derived Figma
library). The two agreed almost everywhere except the success/green ramp,
which Waldur customized away from the reference's stock green — plausibly
to stay visually distinct from the (also green) default brand color.
Where they disagreed, the empirically-extracted value won, since that's
what actually ships.

**`text-primary`'s color, wrong twice in opposite directions**: the
original implementation used `var(--waldur-brand-700)` (correct); it was
"corrected" to `var(--color-gray-900)` during the reference cross-check, on
the strength of a stale `getComputedStyle()` read from a long-lived
interactive browser session (light and dark share one property name, so a
matched-properties-cache staleness issue silently returned the wrong
theme's value); a user visually spotted the resulting green-vs-gray
mismatch on `text-primary-lg`, which is what caught it. Re-verified with
genuinely fresh page loads in both themes before trusting either reading
again: light mode is brand-reactive (`--waldur-brand-700`), dark mode is a
fixed gray (`--color-gray-300`) — a real, legitimate asymmetry, not a bug.
**Lesson**: never trust a `getComputedStyle()` read from a long-lived
browser session when cross-checking theme-dependent CSS variables; always
reload fresh first.

**Hover/focus states had real, separate token bugs**, found by extending
the dominant-color parity check (below) to hover/focus-visible states and
comparing each case against the real button's `getComputedStyle()` output
and against `_variables.custom.scss`'s `$button-variants` map (the actual
SCSS source of truth):

- Hover backgrounds for `secondary`/`danger`/`warning`/`success` were one
  token step too light in light mode (e.g. `error-100` where the real
  button uses `error-200`) and one step too dark in dark mode (e.g.
  `error-800` where the real button uses `error-700`) — verified per color
  family independently via `getComputedStyle()`, not assumed uniform from
  one fix.
- `primary`/`secondary`/`tertiary`/`tertiary-ghost` never changed their fill
  on focus-visible (stayed at the enabled color); the real button uses the
  *same* fill for hover and focus in all four of these.
- `text-danger`/`text-warning`/`text-success` never changed their **text**
  color on hover/focus — the real button darkens/lightens it to the same
  interactive-state color its solid counterpart already uses
  (`--btn-danger-text` etc. — no new tokens needed, just reused). Their
  hover **background** also referenced the wrong token (the solid variant's
  enabled bg instead of its hover bg).
- `danger`/`warning`/`success` kept a visible border color during focus
  where the real button blends the border into the focus fill (the SCSS
  `'focused'` map omits an explicit border, which falls back to the focus
  background itself via `button-custom-variant-2`'s `get-def` helper).
  `warning` additionally blends its border on **hover** too, unlike
  danger/success — its `'hovered'` map omits border where theirs doesn't;
  confirmed via `getComputedStyle()`, not assumed symmetric.
- `secondary`'s dark-mode focus ring used `brand-400`; the real button's
  ring (read directly off the live `box-shadow`) is `brand-500`. The
  static SCSS token (`$ring-primary-100` → `$border-brand-solid` →
  `$brand-400` in dark mode) doesn't reliably track the runtime-injected
  `--waldur-brand-*` ramp used everywhere else — trust the live
  measurement over the SCSS source when the two disagree, since the live
  measurement is what actually ships.

`--btn-text-secondary-hover-bg` is a genuinely separate token from
`--btn-tertiary-bg-hover`, even though the two happen to share a value in
dark mode — the real button's `secondary` text-style hover/focus resolves
to `$bg-tertiary` (`gray-100`/`gray-800`), a distinct SCSS token from
`tertiary`'s own `$btn-tertiary-bg_hover` (`gray-50` light / `gray-900`
dark). Confirmed via `getComputedStyle()`, not assumed from the naming
similarity.

`colors.css`'s `--color-success-200` is a known, accepted small
inaccuracy (`#a9efc5` vs. a measured `#a6f4c5`) — the ramp's own header
already flags success as partly interpolated and not independently
verified. The discrepancy's chromaticity delta (~1.8) is well inside the
established noise tolerance (see below), so it was left alone rather than
touched — changing a shared base-ramp value risks shifting other, already-
passing consumers (`--btn-success-bg-pressed`, dark `--btn-text-success-color`).

## Visual parity test methodology (`base-button-parity.spec.ts`)

Screenshots `BaseButton` and `BaseButtonTw` side by side on the same page
— a Storybook story, `Migration/BaseButton Parity` (see "Storybook
toolchain" below) — and diffs the buffers directly — no committed baseline
image to go stale, since it's a live A/B comparison in the same browser,
same run. Covers all 12 variants × 2 sizes × 2 themes × 4 states
(enabled/disabled/hover/focus-visible) = 192 cases.

### Two complementary checks, two different blind spots

**Pixelmatch ratio** (`DIFF_RATIO_THRESHOLD`, currently 16%): started at
2%, raised as measurement (not guessing) showed the real noise ceiling was
higher — up to ~12% on text-only/pastel-background variants, where
antialiasing-affected edge pixels are a much larger fraction of a small or
low-contrast button's total area than on a solid-fill button. Confirmed as
pure rendering noise (not real bugs) by checking `getComputedStyle()` and
dimensions byte-identical in every case that triggered it, before touching
the threshold. Measured post-fix ceiling (2026, after the hover/focus
token fixes above): **11.72%**, on pastel-background `lg` buttons at
`enabled` (`secondary-lg`, `success-lg`). Re-measured again after the
harness moved to Storybook (same DOM-wrapper-chain reasoning as the
chromaticity recalibration below): **13.10%** — leaves ~3 points of margin
under the current 16% threshold, still comfortably inside it.

**Blind spot**: a small text-only button is almost all background: a
completely wrong hue only touches a small fraction of the image and reads
as a low ratio no threshold tuning fixes without also hiding real
antialiasing noise. This is exactly how the original `text-primary`
green-vs-gray bug (see above) slipped through at a 6.55% ratio — well
under threshold — and was only caught by a human looking at the page after
the full 192-case suite had reported clean.

**Dominant-color chromaticity check** (`CHROMATICITY_TOLERANCE`, currently
10 — see the recalibration note below for why it moved from 5): built
specifically to close that blind spot. Averages RGB over
"foreground" pixels — anything beyond `FOREGROUND_DISTANCE_THRESHOLD` from
the button's own corner-background color, isolating glyph/border/fill
regardless of the button's own transparency. (First version filtered by
`alpha > 200`, on the wrong assumption that a `bg-transparent` button would
screenshot as low-alpha pixels — Playwright's element screenshots are
always fully opaque, confirmed via a real alpha histogram, so that filter
silently matched the entire image and let the bug back through
undetected.) Compares old vs. new not on raw RGB but on **chromaticity**
— each channel's share of total brightness (`r,g,b / (r+g+b)`, scaled back
to 0–255) — which cancels out uniform lighter/darker shifts (antialiasing
noise) while staying sensitive to an actual hue change (a real token bug).

Calibrated empirically: forcing the check to report (tolerance 0) across
all 192 cases on the corrected codebase measured a **max chromaticity
delta of 5**, with 133/192 cases at exactly 0. The two outliers at 5 are
both `sm`-size `tertiary-ghost`/`text-secondary` focus-ring cases with
byte-identical `getComputedStyle()` output on both sides — the same class
of small-radius box-shadow corner-rendering artifact documented below, not
a token bug. Raw (non-normalized) per-channel delta was tried first and
rejected: it ranged 1–43 depending on variant/theme purely from legitimate
antialiasing noise, too wide a range to set a single global tolerance
against, since the real `text-primary` bug this check exists to catch only
measured ~33 in its own variant — a tolerance high enough to avoid
flagging legitimate noise would have sat above the bug's own signal and
missed it. That original tolerance (5) sat with effectively zero margin above the
measured noise ceiling — deliberate at the time, since the ceiling was a
real, verified rendering-engine limit.

**Recalibrated to 10 after moving the harness to Storybook**: swapping the
raw `?tw-parity` route for a Storybook story (see "Storybook toolchain"
below) changes the DOM wrapper chain around the buttons, which shifts
sub-pixel rendering slightly even though the components/tokens themselves
are unchanged — the old tolerance (5) started flaking. Recalibrated
properly, not just bumped: ran the full 192-case suite three separate
times (two against an already-warm Storybook dev server, one against a
genuinely cold one — the scenario CI always hits), and all three
converged on an identical max chromaticity delta of **4.61**. A single
ad hoc diagnostic script (used to investigate one flaking case in
isolation, outside the real suite) had shown 5.567 for that same case;
re-run through the actual spec three times and it never reproduced —
confirmed as an artifact of that throwaway script, not the suite itself,
before trusting either number. Tolerance set to 10: just over 2x margin
above a three-times-reproduced stable ceiling, while staying clearly below
the confirmed real-bug signal (~17) so the check stays useful rather than
just quiet.

### Known, accepted rendering-engine limitations

Both checks converge on the same conclusion: token/color values are now
verified byte-identical between old and new (via direct
`getComputedStyle()` comparison) everywhere the test suite still shows any
residual diff. What remains is **not fixable at the token/component
level** — it's inherent to comparing two structurally different CSS
implementations (Bootstrap vs. Tailwind) achieving the same visual design:

- **Box-shadow corner rendering at small radius**: the real `BaseButton`'s
  focus ring measures a `2.015px` spread; `BaseButtonTw`'s measures exactly
  `2px` — same color, same `box-shadow` syntax on both sides, but Chromium
  computes a slightly different final spread depending on each
  implementation's intermediate box-sizing chain (`rem` vs. `px` units,
  different wrapper elements). At small corner radii (`sm`-size buttons)
  this shows up as measurably different antialiasing coverage on the ring
  itself. Originally found and accepted for `danger-sm`/`warning-sm`
  (15.16%/15.35% ratio, confirmed stable across a full server restart);
  the same phenomenon later showed up on `tertiary-ghost`/`text-secondary`'s
  gray ring in the chromaticity check.
- **Text/edge antialiasing on pastel backgrounds at `lg` size**: text
  antialiasing coverage depends on exactly which sub-pixel position a
  glyph lands on, which depends on the precise padding/line-height chain —
  even when both resolve to the same final px value on paper, the browser
  can round differently building up to it.

The only way to eliminate these fully would be literally sharing DOM
structure and CSS between old and new, which defeats the point of the
migration. The right response, applied throughout this file's threshold
history, is to measure the real noise ceiling empirically and set
tolerances with deliberate, documented margin above it — not to guess, and
not to loosen a check just because a state is hard to get pixel-perfect
without first confirming (via `getComputedStyle()`, not assumption) that
what remains really is noise and not an unfixed bug. Every threshold in
this file was set that way; see git history / this document's revision
history for the evidence behind any specific number.

### Other test-harness lessons

- **CSS transitions need a real paint to settle**: a *synchronous*
  `getComputedStyle()` read immediately after `.hover()`/`.focus()` — with
  no repaint in between — reliably returns the pre-transition value, not
  the settled one (`.screenshot()` forces a real paint, which is why a
  transition-timing bug only ever showed up as a screenshot mismatch, never
  in a `getComputedStyle()`-based diagnostic during triage). `gotoParity()`
  disables all transitions/animations page-wide via an injected stylesheet
  specifically to remove this as a variable; the explicit
  `waitForTimeout(350)` before each hover/focus screenshot is a second,
  independent safeguard.
- **`:focus-visible` isn't reliably triggered by a raw DOM `.focus()`
  call** in Chromium — it requires the focus to plausibly originate from
  keyboard interaction. A quick `element.focus()` diagnostic can read back
  `box-shadow: none` / `outline-style: none` on a button that visibly does
  show a ring under real interaction, misleadingly suggesting the ring
  isn't implemented at all. Playwright's `locator.focus()` (used by the
  actual test suite) does trigger it correctly; verify with that, not a
  bare `.focus()` in a scratch script.
- **Run visual suites with `--workers=1`** on this machine — a full
  192-case run at `--workers=3` exhausted available RAM. Slower
  (~13-15 min vs. ~12 min) but reliable.

## Storybook toolchain

`yarn storybook` (dev, port 6006) / `yarn build-storybook`. Replaced both
hand-rolled harnesses that used to live under `src/spike/tailwind/`
(`SpikePage.tsx`/`Button.tsx`/`mount.tsx` for the `?tw-spike` showcase, and
`ParityPage.tsx`/`mountParity.tsx` for the `?tw-parity` old-vs-new
comparison — the whole directory is gone) with real stories:
`BaseButtonTw.stories.tsx` and `BaseButton.stories.tsx`, one story per
state (enabled/disabled/hover/focus-visible) rendering the full
variant × size matrix, plus `BaseButtonParity.stories.tsx` for the
old-vs-new comparison the Playwright spec needs (see below — it's a
genuinely different kind of story from the other two).

**`.storybook/main.ts`'s `viteFinal`** hand-duplicates `vite.config.ts`'s
`resolve.alias`/`css.preprocessorOptions`/`define`, and adds
`@tailwindcss/vite` fresh, rather than reusing `vite.config.ts`'s `plugins`
array wholesale — that array registers its own `react()`, which would
double up with `@storybook/react-vite`'s own React handling. Keep the
duplicated values in sync by hand; they change rarely.

**`.storybook/preview.tsx`'s theme toggle** calls `loadTheme()`
(`src/theme/utils.ts`) directly — the same function the real app's
`ThemeProvider` calls — rather than reimplementing a Tailwind-only
`data-theme` toggle. `loadTheme()` both swaps the compiled Metronic
stylesheet AND sets `data-theme`, so `BaseButton.stories.tsx` (old,
Bootstrap-only, no `dark:` variant of its own) gets correctly-themed CSS
too, not just `BaseButtonTw`'s Tailwind `dark:` variant. First navigation
to a dark story can render briefly unstyled while Vite cold-compiles the
(large) dark SCSS bundle — same class of flash `gotoParity()` already
works around in the Playwright spec; not a bug in the decorator.

**Hover/focus-visible without real interaction**:
`storybook-addon-pseudo-states` rewrites matching stylesheet rules (via
CSSOM `insertRule`, not by touching `<style>` text — worth knowing if you
ever need to debug it by grepping stylesheet content, since a plain-text
search finds nothing despite the rule being live) to add a class-based
selector alternative, then toggles that class on `#storybook-root`. This
sidesteps the exact fragility this migration hit repeatedly with
Playwright: a raw DOM `.focus()`/`.hover()` doesn't reliably settle a CSS
transition before the next read, and `:focus-visible` specifically isn't
triggered by a synchronous `.focus()` call at all in Chromium (see below).
Confirmed working end-to-end via a real Playwright screenshot — see the
next note for why that verification method mattered here specifically.

**A debugging trap worth recording**: while first verifying the
pseudo-states addon, an ad-hoc in-session browser-automation tool reported
`getComputedStyle()` not reflecting even an inline `!important` style set
directly via JS — which is close to impossible under normal CSS cascade
rules. That tool's own screenshot call failed with "the page is not
compositing frames," which was the real signal: the tool's page wasn't
actually being composited/rendered, so its computed-style reads for
certain properties (background-color; `outline` read back correctly,
oddly) were stale/unreliable, not the page's CSS. Cross-checking with a
throwaway Playwright script (matching this whole file's established
"trust the properly-rendered, headless-but-composited browser, not an ad
hoc automation tool" pattern) immediately showed the real, correct value.
**Lesson**: when a check produces a logically-impossible result (a
highest-priority CSS declaration not applying), suspect the verification
tool before the code under test — especially one that just told you it
isn't rendering frames.

**The parity harness lives in Storybook too, but as a different kind of
story**: `BaseButtonParity.stories.tsx` (`Migration/BaseButton Parity` in
the sidebar) renders old and new side by side, tagged
`data-pair`/`data-role`, replacing the old raw `?tw-parity` route
(`ParityPage.tsx`/`mountParity.tsx`/the branch in `src/index.tsx` — all
removed; `index.tsx` is back to unconditionally rendering `<Application
/>`, with zero Tailwind-migration footprint in the real app's entry
point). `base-button-parity.spec.ts`'s `gotoParity()` navigates straight
to that story's `iframe.html` URL (`http://localhost:6006/iframe.html?
id=migration-basebutton-parity--default&viewMode=story&globals=theme:
{theme}`) — a second `webServer` entry in `playwright.config.ts` starts
Storybook's dev server alongside the main app's.

This is deliberately a *different kind of story* from
`BaseButton.stories.tsx`/`BaseButtonTw.stories.tsx`: those use
`storybook-addon-pseudo-states` to force hover/focus-visible via a CSS
class, which is right for a quick visual browse but wouldn't exercise the
real thing this spec needs to catch bugs in — the spec still drives real
Playwright `.hover()`/`.focus()` against the rendered pairs itself, exactly
as it did against the old `?tw-parity` route. Once `BaseButtonTw`
graduates to replace `BaseButton` outright, this parity story and spec
become unnecessary and the plain component stories become the sole,
permanent home for verifying this (and future migrated) components.

**Vitest project split** (`vitest.config.ts`): adding
`@storybook/addon-vitest` (via `yarn dlx storybook@latest add
@storybook/addon-vitest`, which rewrites this file — don't hand-edit
around it) restructured the previously-flat Vitest config into two named
projects: `unit` (the original jsdom-based unit tests, unchanged) and
`storybook` (browser-mode, real Chromium via `@vitest/browser-playwright`,
renders every story as a smoke test). They need different CI images — the
`storybook` project needs the same Playwright-browser image the E2E jobs
use, which a plain Node image can't run — so `.gitlab-ci.yml`'s "Run unit
tests" job now explicitly passes `--project=unit` to avoid accidentally
picking up the browser-mode project on an image that can't run it, and
"Run Storybook tests" is a separate job on the Playwright image.

**`storybook` project's `optimizeDeps.include`**: without it, every run
fails at import time with a browser-native `SyntaxError: ... does not
provide an export named 'X'` (or, once that specific package is listed,
`ReferenceError: exports is not defined` for the next one) — a CJS/ESM
interop failure. Root cause: Vite's dependency scanner only discovers
which `node_modules` packages need its esbuild pre-bundle pass by crawling
from project source files; it can't see into
`@storybook/addon-vitest/dist/vitest-plugin/setup-file-with-project-annotations.js`
(a Storybook-internal build artifact, not project source), so none of
*that* file's transitive CJS deps get pre-bundled and each hits the same
interop failure when served on-demand instead. Tried pointing
`optimizeDeps.entries` at the setup file directly first, hoping the
scanner would trace through it — it didn't (and pointing entries at
`.storybook/**/*` more broadly crashed differently, pulling in
`main.ts`'s `@tailwindcss/vite`, which loads a native `.node` binary
esbuild can't bundle at all). Explicitly listing each package in
`optimizeDeps.include` instead — `aria-query`, then `lz-string`, then
`pretty-format`, found one at a time as each fix revealed the next
unbundled dep in the same setup file's chain — worked and was stable
across repeated runs. Disabling the a11y integration
(`parameters.a11y.test = 'off'` in `preview.tsx`) was tried too, on the
theory that a11y assertions were what pulled in the jest-dom-adjacent
chain — didn't help, so the dependency is unconditional in the setup file,
not a11y-specific.

## packages/ui: portable Tailwind/Radix primitives

`packages/ui` (`waldur-ui`) holds the pieces of `BaseButtonTw`'s
dependency graph that are genuinely portable, extracted out one at a time
as each stopped depending on Bootstrap:

- **`cn()`** — had zero Bootstrap coupling to begin with, just moved.
- **`LoadingSpinner`** — swaps Metronic's `.animation-spin` class for
  Tailwind's built-in `animate-spin` utility, and drops the `.text-primary`
  Bootstrap-utility default since `SpinnerIcon` already renders with
  `fill="currentColor"` — no color class was ever actually needed. The
  original `LoadingSpinnerSimple` (`src/core/LoadingSpinner.tsx`) is
  untouched and still used by ~385 call sites elsewhere.
- **`Tooltip`** — a `@radix-ui/react-tooltip`-based rebuild of
  `src/core/Tooltip.tsx`'s `Tip` (react-bootstrap's `OverlayTrigger`),
  built for visual parity with it, not just a generic shadcn tooltip.
  Scoped to `Tip`'s actual current usage — `label` + optional `body`,
  default hover/focus trigger — not its fuller react-bootstrap-derived API
  (`trigger` arrays, `container`, `rootClose`, `delay`, `autoWidth`,
  `zIndex`, light/dark `theme`), since nothing in `packages/ui` needs that
  yet. `Tip` itself always defaults to its dark-bubble theme regardless of
  the app's light/dark mode — `BaseButtonTw`'s own usage never passes
  `theme`, so only that one variant needed replicating.

**Tooltip visual-parity cross-check**: every value in `Tooltip.tsx`'s class
list (background/text colors, padding, border-radius, box-shadow,
font-size/line-height, max-width, arrow size) was extracted via
`getComputedStyle()` on the real `Tip` rendered in Storybook — same
methodology as `BaseButtonTw`'s own tokens (see above), using a throwaway
probe story rendered by a headless Playwright script rather than the
Claude Code browser tool directly, for the same computed-style-reliability
reason noted elsewhere in this doc. Result was near-pixel-identical: bg
`rgb(16,24,40)` (exactly `--color-gray-900`), body text
`rgb(208,213,221)` (exactly `--color-gray-300`), border-radius exactly
`8px`, padding/font-size/line-height within sub-pixel rounding
(12.012px→12px, 17.1957px→17px). The color match isn't coincidence —
`Tip`'s dark bubble already happened to use exactly this app's gray-900/
gray-300 ramp steps, so the new component references
`packages/design-tokens`' tokens directly rather than duplicating the hex
values.

**Numbered Tailwind spacing utilities (`p-3`, `mt-1`) don't reliably pick
up this file's `--spacing: 4px` override**: measured `9.75px` for `p-3`
where `12px` was expected (`9.75 = 3 × 0.25rem × 13px` — the *default*
rem-based Tailwind spacing scale at Metronic's forced 13px root, not the
override). Root-caused to cascade-layer precedence: `tailwind.css`
declares `@layer theme, base, bootstrap, utilities`, and Tailwind's own
compiled utilities apparently carry their own `--spacing` declaration
inside the (higher-priority) `utilities` layer, which wins over the
custom override living in the `theme` layer. `--radius-lg`/`--text-sm`
aren't affected since those are directly-named theme keys with no
downstream `calc()` multiplication — only the base `--spacing` multiplier
is shadowed. **Fix**: use px arbitrary values (`p-[12px]`, `mt-[4px]`)
instead of the numbered scale, exactly what `BaseButtonTw` already does
for all of its own padding — this was already a deliberate, established
pattern in this codebase, and the tooltip work is independent confirmation
of why.

**`BaseButtonTw` has moved into `packages/ui`** (`packages/ui/src/BaseButton.tsx`,
exported as `BaseButton` — the `Tw` suffix was only ever needed to
disambiguate from the Bootstrap original within `src/core/buttons/`; once
moved into its own package there's nothing to disambiguate from, matching
the unprefixed naming already used for `LoadingSpinner`/`Tooltip`). Its
own internal imports of `cn`/`LoadingSpinner`/`Tooltip` became relative
(`./cn` etc.) instead of round-tripping through the `waldur-ui` package
name. `waldur-homeport/src/core/buttons/BaseButtonParity.stories.tsx`
(the old-vs-new comparison fixture the Playwright spec screenshots) is
the one place that still needs both components side by side — it imports
the new one as `import { BaseButton as BaseButtonTw } from 'waldur-ui'`,
aliasing back to the old name locally purely for that file's own
readability. `BaseButtonTw.stories.tsx` moved too
(`packages/ui/src/BaseButton.stories.tsx`), keeping its Storybook sidebar
title (`Core/Buttons/BaseButtonTw`) unchanged on purpose so it still
appears right next to the Bootstrap original's story for side-by-side
browsing — sidebar grouping is independent of where the file physically
lives. Full 192-case parity suite re-verified passing after the move.

`packages/ui` now has everything `BaseButtonTw` needs — `cn`,
`LoadingSpinner`, `Tooltip`, and the button itself — with zero remaining
Bootstrap coupling.

**Disabled buttons leaking their hover color under Storybook's forced
pseudo-states**: six variants with a transparent base background
(`tertiary-ghost`, `text-primary`, `text-secondary`, `text-danger`,
`text-warning`, `text-success`) had no `disabled:bg-` override at all —
relying solely on `disabled:pointer-events-none` to make sure a real
`:hover` could never fire on a disabled button. That's true for every real
browser interaction, but Storybook's `storybook-addon-pseudo-states`
toolbar can force `:hover`/`:focus-visible`/etc. on *any* story via a
class-selector rewrite that doesn't respect `pointer-events: none` —
toggling it on the `Disabled` story showed a disabled `text-warning`
button with `--btn-warning-bg-hover` (`#fedf89`) as its background instead
of staying transparent. Confirmed this wasn't a pre-existing addon quirk
by checking the real Bootstrap `BaseButton` under the identical forced
toggle — it stays transparent, so this was a genuine gap in the new
class list, not an artifact everything already lived with. Fixed by
adding an explicit `disabled:bg-[transparent]` to all six variants (the
solid variants — `primary`/`secondary`/`tertiary`/`danger`/`warning`/
`success` — already had an equivalent `disabled:bg-[var(--btn-disabled-bg)]`
override, so they were never affected). Structurally can't manifest for a
real end user, but worth fixing so the class list is self-consistently
correct regardless of what triggers the pseudo-state, not just what a real
mouse can trigger. Full 192-case parity suite re-verified passing —
CSS-additive fix, doesn't touch anything the suite's `enabled`/`disabled`/
`hover`/`focus-visible` states actually screenshot.

**`tertiary`'s border looked visibly thicker than the real Bootstrap
button's**, despite `getComputedStyle()` showing byte-identical
`border-width`/`border-color` (`1px`/`rgb(208,213,221)`) on both. Root
cause: `border` participates in the box's total height under
`box-sizing: border-box`, and the real button's rem-based padding/
line-height chain lands on a *fractional* total height at this app's 13px
root font-size (`43.96875px` for `lg`), while this component's explicit
px values land on an exact integer (`44px`) — deliberately, per the root
font-size scaling section above. A 1px border around a fractional-height
box gets anti-aliased across the sub-pixel boundary and reads softer/
thinner; the same border around an exact-integer box renders crisp and
full-opacity, which reads as visibly *thicker* by comparison even though
the declared width/color are identical numbers. Confirmed via screenshots
at 3x device-scale-factor (the artifact is subtle at 1x, obvious at 3x —
plausibly why it surfaced on a high-DPI display).

Fixed by replacing `border` with an inset `box-shadow` for the
border-replacement across all 12 variants (`shadow-[inset_0_0_0_1px_<color>]`,
`transparent` for the six variants with no visible border) —
`box-shadow` doesn't participate in layout sizing at all, sidestepping
the fractional-vs-integer anti-aliasing difference entirely. Required two
compensating changes:

- **Padding**: since box-shadow no longer consumes the 2px (1px × 2
  sides) a real border used to eat from the padding-box, both `size`
  variants gained 1px of padding per side (`py-[3px]` → `py-[4px]` for
  `sm`, `py-[9px]` → `py-[10px]` for `lg`) to keep the exact same total
  heights (28px/44px) — padding is a shared axis across all 12 color
  variants via `cva`, so this had to change once at the `size` level
  rather than per-variant.
- **`focus-visible` combining**: `box-shadow` is one CSS property, so a
  `focus-visible:shadow-[...]` class fully *replaces* the property rather
  than layering on top of the base `shadow-[inset_...]` the way a real
  `border` (a separate property from `box-shadow`) naturally coexisted
  with the old `focus-visible:shadow-[0_0_0_2px_var(--btn-*-focus-ring)]`
  ring. The five variants with a real border (`secondary`/`tertiary`/
  `danger`/`warning`/`success`) needed their `focus-visible:shadow-[...]`
  rewritten to include *both* layers in one bracket value (inset border +
  outer ring, comma-separated) so the border doesn't visibly vanish while
  focused. Same combining need for `warning`'s hover-only border blend
  (`hover:border-[...]` → `hover:shadow-[inset_0_0_0_1px_...]`, no ring
  involved there). The seven variants with no visible border (`primary`,
  `tertiary-ghost`, and the five `text-*` ones) didn't need combining —
  their border was already transparent, so losing it during focus made no
  visible difference either way, matching their pre-fix behavior exactly.

Verified: `border-width: 0px` and the expected inset-shadow color on all
of `primary`/`secondary`/`tertiary`/`danger`/`warning`/`success`/
`text-warning` via `getComputedStyle()` (confirming the property swap
took effect and every color value survived unchanged), screenshots
showing matching border crispness against the real button at 3x scale,
and the full 192-case parity suite still passing.

**That box-shadow border swap broke the hover transition's smoothness**,
reported as "hover doesn't work" — real mouse hover *did* still change
every color correctly (verified via `getComputedStyle()` before/after a
real Playwright `.hover()`, both for genuine interaction and for
Storybook's forced-pseudo-state `Hover` story), but it didn't *look*
like it worked: Tailwind's `transition-colors` utility's
`transition-property` list is `color, background-color, border-color,
outline-color, text-decoration-color, fill, stroke, ...` — no
`box-shadow`. With the border now living in `box-shadow` instead of
`border-color`, the background eased in smoothly over the existing
150ms while the border-replacement snapped instantly, a jarring,
half-animated effect on every variant with a visible border. Fixed by
replacing `transition-colors` with an explicit
`transition-[color,background-color,box-shadow]`. Confirmed via
`getComputedStyle().transitionProperty` before/after; the parity
spec's screenshots are unaffected either way since it explicitly
disables all transitions/animations before capturing (see the parity
methodology section above), so this was invisible to the 192-case
suite in both directions — a case where the automated check couldn't
have caught the regression at all, only interactive/visual testing
could.

**Reflowed `buttonVariants`'s per-variant class strings** from one
dense 200-400 character line each into an array of per-state fragments
(`[base-shadow, base-bg/text, hover, focus-visible, active, disabled]`,
joined with `.join(' ')`) — same literal class tokens Tailwind's
scanner already saw, purely a formatting change, no value/behavior
difference. Motivated directly by the three bugs above: all three were
subtle mistakes buried mid-string in a format that made them hard to
spot in review (a missing `disabled:` line, a `focus-visible:shadow`
needing to combine two things into one value, a base-string property
list missing an entry) — splitting each state onto its own line makes
each of those the kind of thing you can eyeball against its neighbors.
Verified as a true no-op via the full 192-case parity suite (still
192/192) and a `build-storybook` run, not just `tsc`/`eslint`.
