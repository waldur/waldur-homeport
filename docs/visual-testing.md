# Visual Regression Testing

How to check that a change moves no pixel it shouldn't, and how to show the pixels it does move.
Read this before refactoring CSS, design tokens, a shared component's markup or the Bootstrap
stylesheet, and before writing "no visual change" in a merge request.

Unit tests and lint do not see rendering. A class Tailwind does not generate, an unlayered
stylesheet that now outranks a utility, a cascade-layer `!important` that used to win: each
passes every other check and still changes the page.

## Which tool answers which question

| Question                                                               | Tool                                                                   | Needs                       |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------- |
| Did my branch change how any story renders, compared with `develop`?   | [Storybook comparison](#storybook-comparison-every-story-base-vs-head) | Two Storybook builds        |
| Does the new component render like the old one it replaces?            | [Parity specs](#parity-specs-old-and-new-side-by-side)                 | Storybook on :6006          |
| Is a migrated layout still the size it was measured to be?             | [Geometry specs](#geometry-specs-pinned-measurements)                  | Storybook on :6006          |
| Do real pages with data still look the same?                           | [Page screenshots](#page-screenshots-with-local-baselines)             | App on :8001 with a backend |
| How do the busy screens look before and after, with real data?         | [Integration-testing screenshots](#integration-testing-screenshots)    | The MR's CI pipeline        |
| Does a keyboard focus ring stay visible?                               | `e2e-visual/focus-ring.spec.ts`                                        | Storybook on :6006          |
| Did a SCSS refactor change a resolved colour, or what Bootstrap emits? | [Stylesheet checks](#stylesheet-checks-no-browser)                     | Nothing                     |

For a refactor that should change nothing (tokens, SCSS moves, component internals), run the
Storybook comparison: it covers every story in both themes and needs no backend. For a change that moves
pixels on purpose (spacing, padding, a new token value), run it too, and attach the largest
differences to the merge request.

## Ground rules

- **Storybook renders with the app's stylesheet.** The theme decorator in `.storybook/preview.tsx`
  calls `loadTheme()`, which injects the compiled Bootstrap/Metronic stylesheet and sets
  `data-theme`. A story therefore shows the same cascade the app does, including Bootstrap's
  `!important` utilities. Every tool here waits for that stylesheet (a `link` whose URL matches
  `/style[-.]/`) before capturing; a capture taken earlier shows unstyled markup.
- **Freeze before capturing.** Wait for `document.fonts.ready` (a capture in the fallback font
  differs on every text pixel), and inject
  `*, *::before, *::after { transition: none !important; animation: none !important; }`.
  `gotoParity()` and `theme-snapshots.mjs` do both.
- **Both themes.** Capture light and dark: a token change is often right in one and wrong in the
  other. Storybook takes the theme as a URL global:
  `iframe.html?id=<story-id>&viewMode=story&globals=theme:dark`.
- **Pixels for colour, boxes for geometry.** A pixel diff is the right check for a colour or a
  missing element. For spacing and size, measure `boundingBox()` instead: a 1px shift changes every
  pixel after it, so a pixel ratio cannot tell "everything moved 1px" from "one thing moved 20px".
  The parity harness checks dimensions first for this reason.
- **The root font size is 13px (12px below `md`).** rem values differ between the two, so measure
  at both viewports when a layout is rem-based (`top-bar-geometry.spec.ts` does).
- **Storybook is not the app for focus and hover.** `storybook-addon-pseudo-states` rewrites
  `:focus-visible` and `:hover` selectors (see
  [tailwind-shadcn-migration-notes.md](tailwind-shadcn-migration-notes.md) → "Testing Gotchas &
  Pitfalls" → "Storybook rewrites pseudo-classes").
  Confirm focus and hover results against the dev server on :8001.
- **Never bulk-accept a baseline.** Look at every changed image, and state in the merge request
  what changed and by how much.

## Storybook comparison: every story, base vs head

`scripts/theme-snapshots.mjs` screenshots every story of a static Storybook build in light and
dark, then pixel-diffs two such captures. Build the base branch and your branch, capture each, and
compare. It serves the build itself; nothing else needs to be running.

```bash
# Base build, in a separate worktree so your checkout stays on your branch
git worktree add ../homeport-base origin/develop
(cd ../homeport-base && yarn install --immutable && yarn build-storybook)

# Head build
yarn build-storybook

node scripts/theme-snapshots.mjs capture ../homeport-base/storybook-static /tmp/vt/base
node scripts/theme-snapshots.mjs capture storybook-static /tmp/vt/head
node scripts/theme-snapshots.mjs compare /tmp/vt/base /tmp/vt/head /tmp/vt/report
```

- `capture <storybook-static> <out-dir> [--filter <regex>] [--font <family>] [--widths <px,…>] [--themes <light,dark>]`
  writes `<story-id>.<theme>.png`, full page, at a 1280×900 viewport. `--filter` matches story ids
  (`--filter '^actions-'`). `--font` forces one font family everywhere, for comparing two builds
  that load different web fonts: the text then cannot differ, so colour changes stand out.
- `--widths` captures each story once per viewport width instead, as
  `<story-id>.<theme>.w<px>.png`. Use it for any layout change: `576,768,992,1200` are the `sm`,
  `md`, `lg` and `xl` breakpoints, and a width below `sm` (`375`) is a phone. A layout that
  breaks only at one breakpoint (a column that stops wrapping, a row squeezed on a phone) looks
  fine at 1280px. `--themes light` skips the dark captures when the change cannot touch colour.
- `compare <base-dir> <head-dir> <report-dir>` writes `report.json` (every pair: `same`,
  `changed` with `changedPixels`, `ratio` and `sizeChanged`, or `missing in head` / `new in head`)
  and, for each changed pair, a `base | head | changed pixels in red` PNG. It prints the changed
  pairs sorted by ratio and exits 1 when anything differs.
- The per-pixel threshold is 0.05: antialiasing passes, a one-step colour ramp change does not.
- `compare` pairs any two directories of PNGs by file name, so it also diffs the
  [integration-testing screenshots](#integration-testing-screenshots).

**Reading the report.** For a change that should be invisible, the expected result is
`0 changed` in both themes; open every changed sheet. For an intended change, start with the
largest ratios and every `size changed` entry (the page got taller or shorter), check that each is
the change you meant, and name the stories you checked in the merge request. A ratio says how much
of the page changed, not by how much: a 1px shift near the top of a story changes most of it.

## Parity specs: old and new side by side

A parity spec renders the old implementation and its replacement on one Storybook page and diffs
the two live renders against each other, in the same browser and run, so there is no committed
baseline to go stale. `e2e-visual/visualParityHarness.ts` provides the machinery;
`card-parity.spec.ts` and `stat-card-parity.spec.ts` use it.

1. **The story** (`src/core/CardParity.stories.tsx`, title `Migration/Card Parity`) renders each
   case twice, wrapped in `data-pair="<case>" data-role="old"` and `data-role="new"`, at the same
   fixed width.
2. **The spec** creates a harness and runs each case in both themes:

   ```typescript
   const { gotoParity, expectPixelParity } = createParityHarness({
     storyId: 'migration-card-parity--default',
     diffDir: path.join(__dirname, '../test-results/card-parity-diffs'),
     thresholds: {
       maxDimensionSlackPx: 1.0,
       diffRatioThreshold: 0.06,
       pixelmatchThreshold: 0.25,
       foregroundDistanceThreshold: 30,
       chromaticityTolerance: 3,
     },
   });

   // In each test, after `await gotoParity(page, theme)`:
   await expectPixelParity(
     page.locator(`[data-pair="${caseId}"][data-role="old"]`),
     page.locator(`[data-pair="${caseId}"][data-role="new"]`),
     `${theme}-${caseId}`,
   );
   ```

3. **The checks**, in order: dimensions (`boundingBox()`, within `maxDimensionSlackPx`), the
   pixelmatch ratio (`diffRatioThreshold`), and dominant-colour chromaticity
   (`chromaticityTolerance`), which catches a wrong hue on a small, text-heavy element that a ratio
   would pass. A failing case writes `<name>-old.png`, `-new.png` and `-diff.png` to `diffDir`.
4. **Thresholds are measured, not borrowed.** Run the spec, record the largest ratio and
   chromaticity across all cases and both themes, and set each threshold a little above that
   noise. Write the measurement in a comment next to the threshold, as `stat-card-parity.spec.ts`
   does. `expectBufferParity()` takes two captured buffers, for cases that need an interaction
   (hover, focus) between the old and the new capture.

## Geometry specs: pinned measurements

Once the old implementation is gone there is nothing left to render beside the new one, so a
geometry spec pins the numbers instead. `top-bar-geometry.spec.ts` renders the
`navigation-topbar--app-header-layout` story at a desktop and a mobile viewport, in both themes,
and asserts each element's `boundingBox()` against values measured on the legacy header, within
0.3px. Use this pattern for a layout whose measurements must survive a refactor: find elements by
`data-testid`, and record where each expected number came from.

## Page screenshots with local baselines

`charts.spec.ts` and `wizards.spec.ts` sign in to the app on :8001 as `staff` / `demo`, open real
pages and dialogs and call `toHaveScreenshot()` (project `visual`, `maxDiffPixelRatio: 0.01`).
They need a backend with that user, and their baselines (`e2e-visual/snapshots/`) are
git-ignored: each machine keeps its own. To compare two branches with them, write the baselines on
the base and run against them on the head:

```bash
git switch develop
yarn playwright test charts wizards --project=visual --workers=1 --update-snapshots
git switch my-branch
yarn playwright test charts wizards --project=visual --workers=1
```

(`yarn test:visual` and `yarn test:visual:update` run every Playwright project, including `e2e`.)

Playwright writes the expected, actual and diff images of each failure to `test-results/`.

## Integration-testing screenshots

`waldur-integration-testing` drives a full Waldur stack in Playwright. Its tests call
`take_screenshot("<name>")` on a page or component, which saves `docs/screenshots/<name>.png`, and
every E2E job keeps `docs/screenshots/` as an artifact for a week. These are the only screenshots
of real pages with data that need no local backend.

- **The head:** a HomePort merge request that changes runtime files triggers the suite downstream
  ("Trigger integration tests") with the MR's image. `Select E2E suites`
  (`scripts/select-e2e-suites.mjs`) narrows it to the areas the change can affect, so an MR may run
  fewer jobs than `develop` does.
- **The base:** the downstream pipeline triggered from `develop`, which runs every suite against
  `:latest`. Use one at or after your branch's merge base.
- **Comparing:** download each job's artifacts from both downstream pipelines, put each side's
  PNGs in one directory, and run
  `node scripts/theme-snapshots.mjs compare <base-dir> <head-dir> <report-dir>`. Pairs exist only
  for jobs that ran on both sides; the rest show as `missing in head` or `new in head`.
- **Expect noise.** Data differs between runs (dates, generated names, row counts), so a pixel
  ratio ranks the screenshots rather than passing or failing them. Look at the side-by-side sheets.
- `tests/test_docs_screenshots.py` defines `generate_documentation_screenshots`, which is not named
  `test_*`, so pytest does not collect it and its screenshots are not produced in CI.

## Stylesheet checks (no browser)

- **`node scripts/color-diff.mjs save|compare <snapshot.json>`** records the colour every
  declaration of the compiled Bootstrap stylesheet resolves to, in light and dark, and reports each
  one that changed. Use it for SCSS colour-variable refactors; see
  [design-tokens.md](design-tokens.md) → "Verifying a refactor changes nothing".
- **`yarn styles:usage compare`** (`scripts/bootstrap-css-usage.mjs`, runs in CI) fails when the
  compiled Bootstrap stylesheet gains an unused class or its selectors are added or reordered, and
  prints the selector diff. After an intended change, run `yarn styles:usage save` and commit the
  baseline. See [development-setup.md](development-setup.md).
- **`src/tailwindBootstrapColors.test.ts`** compiles both stylesheets and checks that Bootstrap
  emits no colour utility that would collide with Tailwind's.

## What CI runs

| Job                         | What it catches                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Run Storybook tests         | A story that fails to render or whose play function fails (`yarn test:storybook`). No pixel comparison; `allow_failure` on merge requests. |
| `yarn styles:usage compare` | Added or reordered selectors and new unused classes in the Bootstrap stylesheet.                                                           |
| Trigger integration tests   | The downstream E2E suite, with its `docs/screenshots/` artifacts.                                                                          |

The `e2e-visual` specs and `theme-snapshots.mjs` do not run in CI. Run the ones that fit the change
locally and put the result in the merge request.

## Reporting a visual change in a merge request

- Which tools ran, against which base commit, and in which themes and viewports.
- For an intended change: the largest difference observed (in pixels for geometry, as a ratio for
  pixel diffs), and side-by-side images of the busiest affected screens.
- For a change meant to be invisible: "0 changed" from the Storybook comparison, or the stories that did
  change and why that is acceptable.
- What was not checked, and why (no backend, a suite that did not run).

## Commands

| Command                                                         | What it does                                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `yarn build-storybook`                                          | Static Storybook in `storybook-static/`, the input of `theme-snapshots.mjs` |
| `node scripts/theme-snapshots.mjs capture …` / `compare …`      | Storybook comparison                                                        |
| `yarn test:e2e:visual`                                          | Every `e2e-visual` spec (project `visual`, one worker)                      |
| `yarn playwright test card-parity --project=visual --workers=1` | One spec; the argument is a filter, and a path is read as a project name    |
| `yarn test:visual:update`                                       | Rewrite the local `toHaveScreenshot()` baselines (every project)            |

`playwright.config.ts` starts the app (`yarn start`, :8001) and Storybook (`yarn storybook --ci`,
:6006), and outside CI reuses ones already running. A spec may import `packages/ui/src/...`
modules directly, but not the `waldur-ui` barrel, whose modules touch `document` at import time.
