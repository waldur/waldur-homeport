# Tailwind/shadcn Migration Notes

Reference for the Bootstrap/Metronic → Tailwind/shadcn migration. Documents
the current architecture and the non-obvious decisions behind it — the things
a source comment can point to instead of re-explaining inline.

This file intentionally does **not** narrate the bug-by-bug history of how
each piece got here — that's in `git log` and the commit messages for the
files named below. What's here is the state of the system today and the
reasoning a future change in this area needs to not re-break.

**Status**: Tailwind is enabled app-wide (`vite.config.ts` + `src/index.tsx`,
see below). Two migrations are running at once, on two different axes, and
it matters which one a given piece of UI is on:

- **Behavior-only Radix, appearance unchanged** — the app's interactive
  floating-panel UI (dropdowns, popovers, the old `NavMenu`/`ActionsDropdown`
  menu shells) runs on Radix primitives, but every panel still wears
  Bootstrap's `.dropdown-menu`/`.popover` or Metronic's `.menu-sub-dropdown`
  classes and renders through the existing compiled CSS. No
  `Dropdown`/`OverlayTrigger`+`Popover` import from `react-bootstrap` remains
  outside `src/core/Tooltip.tsx`'s `Tip` (deliberately untouched — see the
  dropdown/menu system map below), and Metronic's own imperative
  `MenuComponent.ts` has been deleted entirely.
- **Full Tailwind/Radix rebuilds, behavior _and_ appearance replaced** — the
  left navigation sidebar (`packages/ui/src/Sidebar.tsx` + `Sheet.tsx`,
  wired in via `src/navigation/sidebar/`) is the first, and so far only,
  piece of production UI on this path: it no longer wears any
  Metronic/Bootstrap class at all. `packages/ui/src/Tooltip.tsx` (the
  `Tip` rebuild) ships in production too, used standalone by the sidebar's
  resources filter (`ResourcesMenuFilterButton.tsx`) — everything else in
  `packages/ui` (`BaseButton`, `Dialog`, `DropdownMenu`, `Popover`, `Card`,
  `Badge`, `Table`, …) is still Storybook-only; no other production call
  site imports from `waldur-ui` yet. Don't assume one migration's lessons
  transfer to the other without checking — "appearance hasn't moved" is
  true for the dropdown/menu work and false for the sidebar.

## Architecture

### Cascade layers: Bootstrap and Tailwind coexisting

`src/tailwind.css` imports Tailwind's `theme`/`preflight`/`utilities` pieces
separately (not the `@import "tailwindcss"` shorthand) and declares an
explicit layer order up front:

```css
@layer theme, base, bootstrap, utilities;
```

`style.scss`/`style.dark.scss` wrap their entire compiled Metronic output in
`@layer bootstrap { @import 'init'; }`, so the browser merges both into one
layer at this position regardless of load order (CSS layer order is decided
by first occurrence across the whole document). `bootstrap` sits between
Tailwind's `base` and `utilities` — ranking it below `utilities` lets
Tailwind win ordinary utility-vs-Bootstrap conflicts, while still outranking
`base`/preflight.

**Layering does not beat `!important`, and Bootstrap 5's utility API shares
a _lot_ of class names with Tailwind's own.** Both frameworks independently
generate single-purpose utility classes named after the CSS property they
set, and for the common ones they land on the identical string: `.border`,
`.bg-transparent`, `.text-white`, `.text-center`, every `.p-N`/`.m-N`/
`.px-N`/`.py-N`/`.mx-N`/`.me-N`/… spacing utility, and more. Bootstrap's
copy always carries `!important`; Tailwind's never does for a plain
utility, and `!important` sits in a separate priority tier above all
layered rules regardless of layer order — so on any page where Bootstrap's
compiled CSS is present (real app pages; not Storybook, which never loads
it — see the root font-size note below for why that matters when
comparing a measurement made in one environment against the other),
Bootstrap's version silently wins every time, no matter which layer either
one is in. Confirmed in Bootstrap's own compiled output
(`node_modules/bootstrap/dist/css/bootstrap.css`): e.g. `.text-white {
color: ... !important }`, `.p-3 { padding: 1rem !important }`.

Two known instances, one fixed and one not:

- `packages/ui/src/Tooltip.tsx`'s adaptive `theme='dark'` variant needs its
  label to flip between white and near-black text depending on the app's
  own light/dark mode (`dark:text-[...]`). Using Tailwind's `text-white`
  for the base case silently never let that override fire — the label
  rendered permanently white, background correctly inverting underneath
  it, only visible as unreadably-low-contrast text in dark mode. Fixed by
  swapping to the arbitrary-value `text-[#fff]`, which compiles to a
  differently-named class and so never collides.
- `packages/ui/src/BaseButton.tsx:407` (the loading-spinner margin, `me-1`)
  still uses the bare, colliding utility — a known, not-yet-fixed
  inconsistency with this same file's own explicit `border-[1px]`/
  `bg-[transparent]` policy above. Low-stakes today only because
  `BaseButton` isn't wired into production yet (see Status) — fix before
  it is.

`Badge.tsx`'s `border-[1px]` (not the bare `border` utility) is the same
pattern one more time, independently documented at that call site.

**The `@layer bootstrap` wrapper ships in the real app**, not just
Storybook — and unlayered CSS beats layered CSS _regardless of specificity_.
That means every one of the app's ~99 component stylesheets imported from a
`.tsx` (`import './Foo.scss'`, Vite injects it unlayered) ranks above all of
Metronic, including where Metronic previously won on specificity. **Rule:
component SCSS must be scoped under its own class, never under a Metronic
layout root** (`.aside`, `.header`, `.toolbar`, …) — nesting a Metronic class
_inside_ your own class is fine (that already outranks Metronic on
specificity, so the layer change is a no-op), but a rule scoped directly
under a layout-root class silently wins unconditionally once componentized.
Anything that genuinely needs to override Metronic layout belongs in
`src/metronic/sass/custom/`, inside the layer.

#### Enabling Tailwind app-wide

Two lines turn it on: `tailwindcss()` in `vite.config.ts`'s `plugins`, and
`import './tailwind.css'` in `src/index.tsx`. `.storybook/main.ts` keeps its
own separate instance of the plugin — both are needed and share
`src/tailwind.css`, so a story and the running app can't drift on layer
order or theme tokens. **Must be imported from the entry module**, not
wherever first wants a Tailwind class — Metronic's stylesheet is injected at
runtime as its own `<link>`, and layer order is fixed by the first `@layer`
occurrence in the document.

#### The preflight shim

With layering in place, preflight loses to Bootstrap almost everywhere — but
two rules have no Bootstrap counterpart: `img/svg/video/... { display:
block }` and `ol, ul, menu { list-style: none }`. Left unshimmed, every
`<img>`/inline `<svg>` would drop out of the text baseline, and every bare
`<ul>`/`<ol>` — including Markdown-rendered user content (offering
descriptions, terms of service) — would lose its bullets. `src/tailwind.css`
ends with a small `@layer bootstrap { … }` block that `revert`s exactly
those two properties (not explicit values — `revert` respects
tag-specific UA defaults like `audio:not([controls]) { display: none }`,
which a blanket `display: inline` would break).

Verifying parity after a change here: snapshot `getComputedStyle` for every
element, `deleteRule` the `@layer base` block, snapshot again, `insertRule`
it back and confirm the restored snapshot matches — any differing property
is something preflight actively changes. On a real app page, removing all 34
preflight rules currently produces **zero** differences beyond the shim.

**The layer statement is dropped in production builds** — Vite's optimizer
removes `@layer theme, base, bootstrap, utilities;` because the emitted
`dist/assets/index-*.css` already contains the four blocks in that order,
making the statement redundant _within that file_. Still correct today
(Metronic's stylesheet is injected by JS strictly after initial parse, so
`index-*.css` always establishes order first), but the explicit safety net
is gone — worth re-checking (`grep -o '@layer [a-z]*{' dist/assets/index-*.css`)
if the CSS chunking or theme-loading strategy ever changes.

### Root font-size override

Metronic forces `html, body { font-size: 13px !important }` (12px below
`md`, i.e. `max-width: 767.98px` — checked in the compiled stylesheet; the
992px `lg` query sets the same 13px again). Tailwind's scale is rem-based against a 16px assumption, so
`src/tailwind.css`'s `@theme` overrides `--spacing`/`--text-sm`/`--text-base`/
`--radius-md`/`--radius-lg` with explicit px values.

**The override works for `--radius-*` and `--z-index-*`, but numbered
spacing utilities still don't render at `4px × N` — because Bootstrap's own
utility of the same name wins, not because Tailwind ignores `--spacing`.**
Bootstrap's utility API emits `.p-N`/`.m-N`/`.gap-N`/… from `$spacers`, all
with `!important` (compiled `style-*.css`: `.p-1{padding:.25rem!important}`,
`.p-4{padding:.924rem!important}`, `.gap-4{gap:.924rem!important}`), and
Tailwind emits the same class names (`.p-4{padding:calc(var(--spacing) * 4)}`,
`--spacing:4px` does reach the built CSS). `!important` beats any
un-`!important` rule regardless of layer order, so on a real app page
Bootstrap's value is the one that renders. That accounts exactly for the
measurements that used to look inexplicable: `p-1`/`p-2`/`p-3`/`p-5` measured
`0.25rem × N` because those are Bootstrap's `$spacers` 1/2/3/5
(0.25/0.5/0.75/1.25rem), and `p-4` measured 11.088px because Bootstrap's
`$spacers[4]` is `0.154 × 6 = 0.924rem`, which at the 12px mobile root is
11.088px (Tailwind's own `p-4` would be 16px). Steps past the
end of Bootstrap's `$spacers` (its keys stop at 20) fall through to
Tailwind and render at `4px × N`, which is why the failure looked partial.

Consequence: in `packages/ui`, `p-4` means 16px in Storybook (no Bootstrap
loaded) and ~12px in the app. **Practical rule, unchanged: never use a
numbered spacing/gap utility for a value that needs to render at a specific
px size — use a px arbitrary value (`p-[12px]`)**, as `BaseButton.tsx`,
`Badge.tsx`, and `Tooltip.tsx` all do throughout. It is a workaround for the
class-name collision described above, not for a Tailwind limitation; the
structural fixes are a Tailwind class prefix or dropping Bootstrap's
overlapping utilities as consumers migrate. `--radius-*`
(`rounded-md`/`rounded-lg`/`rounded-modal`) is safe to use normally: Bootstrap
only defines numeric `.rounded-N` and `-circle`/`-pill`/`-top`-style names,
none of which Tailwind's named steps share. The one collision there is the
bare `.rounded` (Bootstrap: `8px !important`).

**Named scale tokens beyond the font-size/radius ones above, added as this
migration needed them** (all in `src/tailwind.css`'s `@theme` block, all
verified live to resolve to the stated value with zero drift from what
they replaced):

- **z-index** — `--z-index-sidebar-panel: 105`,
  `--z-index-mobile-drawer: 110`, `--z-index-toast: 1150` and
  `--z-index-tooltip: 1180`, now in
  `packages/design-tokens/src/zIndex.css` (not `src/tailwind.css`) so the
  micro-apps get the same `z-sidebar-panel`/`z-mobile-drawer` utilities that
  `waldur-ui`'s Sidebar and Sheet use — before, they were simply never
  generated there. The file opens with the whole stacking order, Bootstrap
  and Metronic layers included, and `zIndex.test.ts` asserts the ordering
  (drawer below modals, toast above every Bootstrap overlay, tooltip above
  toast) plus that `Tooltip.tsx`'s literal `1180` default equals the token.
  Tailwind's `--z-index-*` namespace auto-generates a matching `z-<name>`
  class. Named only where a value was chosen to match a still-present
  Metronic layer — components with no such parity requirement (`Dialog`,
  `Popover`, `DropdownMenu`) keep Tailwind's built-in `z-50`/`z-10`.
  `--z-index-toast` is `@theme static` because its only consumer is an inline
  `var(...)` in a TSX string, which Tailwind's usage scan doesn't see.
- **radius** — `--radius-modal: 20px`, covering `Dialog.tsx`'s modal
  content and `Sidebar.tsx`'s mode-switcher card (both visibly rounder than
  `rounded-lg`, both pair with `bg-[var(--surface-card-bg)]`). Deliberately
  _not_ named `rounded-xl`/`2xl`/`3xl` — those are Tailwind's own reserved
  keys with their own defaults, and repurposing one would silently change
  what it means for any future non-`packages/ui` caller expecting
  Tailwind's real default. A useful side effect of the custom name: it no
  longer trips `enforce-border-radius-tokens`'s `/rounded-\d+/` pattern
  (`packages/eslint-plugin-waldur/rules/enforce-border-radius-tokens.js`) —
  that rule targets Bootstrap's own numbered `rounded-1`…`rounded-5`
  utility classes, written before Tailwind was in the picture, but the
  regex incidentally also matches Tailwind's digit-leading `rounded-2xl`/
  `rounded-3xl`, so those two names can't be used as literal classes
  anywhere in lint-covered code regardless of this migration.

### Breakpoints

`src/tailwind.css` pins `--breakpoint-sm/md/lg/xl/2xl` to 576/768/992/1200/1400px
— the same values as Bootstrap's `$grid-breakpoints` and `GRID_BREAKPOINTS` in
`src/core/constants.ts` — instead of Tailwind's 640/768/1024/1280/1536, so
`lg` is 992px whether it appears as a Tailwind variant, a Bootstrap `.d-lg-*`
class, an SCSS media query or a `useMediaQuery()` call. The micro-app keeps
Tailwind's defaults (no Bootstrap there to agree with).

### Color ramps: generated from one file

The colour ramps are generated, not hand-written: `tokens/colors.json` in
`packages/design-tokens` is the only place a ramp value is edited, and
`yarn tokens:generate` writes both `src/metronic/sass/_color-ramps.scss`
(what Bootstrap/Metronic render) and `packages/design-tokens/src/colorRamps.css`
(what Tailwind reads). See [design-tokens.md](design-tokens.md).

Each CSS ramp step is declared once, in `@theme static`, under Tailwind's own
name (`--color-gray-50`); that both registers the `bg-gray-50`-style utilities
and provides the `var(--color-gray-50)` the other token files read. It used to
be a `:root` block plus a `@theme` block aliasing each variable to itself,
which shipped 128 self-referencing declarations
(`--color-gray-50: var(--color-gray-50)`) that only worked because the
unlayered `:root` value outranked Tailwind's layered `@theme` output.
(`@theme inline` doesn't fix it: Tailwind re-emits a variable whenever
`var(--its-name)` appears in the generated CSS.)

The SCSS and CSS copies used to be maintained by hand and had drifted
(`success-25/100/200`). Now `generateTokens.test.ts` fails when either output
is stale, and `colorParity.test.ts` checks that the generator's two outputs
agree. Note the two sides use opposite conventions for gray in dark mode:
`--color-gray-N` keeps physical lightness (gray-900 is dark in both themes),
SCSS `$gray-N` is theme-inverted (`$gray-900` is light in dark mode). The
generator encodes that as "CSS step N = SCSS dark value of the mirrored step".
The same class name therefore means opposite things — which is why
`.bg-gray-50` needs the `!important` re-point in `src/tailwind.css`.

### Brand color token bridge

`src/tailwind.css`'s second `@theme` block points Tailwind's color utilities
at the CSS custom properties the app sets at runtime (`--waldur-brand-*`,
written once by `afterBootstrap.tsx`'s `initCssVariables()`) — a naming
bridge, not a color definition. A harness that renders components outside
real app bootstrap (e.g. a Storybook decorator) must seed `--waldur-brand-*`
itself or brand-reactive styles fall back to invalid-at-computed-value-time.

### Dark mode signal

The app toggles dark mode by swapping the entire compiled stylesheet
(`loadTheme()` in `src/theme/utils.ts`) — there's no `.dark` class.
`loadTheme()` also sets `data-theme` on `<html>` as an additional signal.
Tailwind's `dark:` variant is `@custom-variant dark
(&:where([data-theme='dark'], [data-theme='dark'] *))`. The stylesheet swap
remains the source of truth for Bootstrap/Metronic styling; `data-theme` is
additive.

## AlertItem (Tailwind rebuild & Legacy retired)

`packages/ui/src/AlertItem.tsx` (exported from `waldur-ui`). Replaces the legacy
Bootstrap/Metronic component from `src/core/AlertItem.tsx` with pure Tailwind
utilities and surface design tokens. The legacy component (`AlertItem.tsx` and
`AlertItem.scss`) has been retired, and all ~35 production call sites across `src/`
now import directly from `waldur-ui`.

- **Pure Tailwind utilities**: No `.alert-item` or Bootstrap classes.
  All styling is done via explicit Tailwind utilities (`flex`, `gap-[0.846rem]`,
  `p-[1.23rem]`, `py-[1.23rem] px-0`, `rounded-[0.475rem]`, etc.).
- **Typography**: Uses `text-[1.077rem]` and `font-medium` (500) with
  `leading-[1.43]` on the title (`<h6>`) and `text-[1.077rem] font-normal text-[var(--surface-text-secondary)]`
  on the body. This matches Metronic's `$font-weight-bold: 500`, `$font-size-6: 1.077rem`,
  and `--bs-body-line-height: 1.43` dynamically across all viewports (including below `md`
  where root font-size scales to 12px, as well as desktop 13px).
- **Actions slot spacing**: Metronic's `$spacers: (4: $spacer * 0.154 * 6)`
  computed to 0.924rem (12.012px @ 13px root), mapped here as `gap-[0.924rem] pr-[2px] items-start`.
- **Border colors**: Uses `--surface-card-border` (`#E4E7EC` light, `#1F242F` dark),
  matching Metronic's `--bs-border-color` in both themes.
- **Lint rule**: `packages/eslint-plugin-waldur/rules/prefer-alert-item.js`
  steers call sites toward `import { AlertItem } from 'waldur-ui'`.

## BaseButton (Tailwind rebuild)

`packages/ui/src/BaseButton.tsx`. Colors come from
`packages/design-tokens/src/buttonColors.css`, cross-checked against the
real Bootstrap button via `getComputedStyle()` and against the reference
Figma design system, empirical value winning on disagreement.

- **Border is an inset `box-shadow`, not `border`.** A real `border`
  participates in `border-box` height, and this app's fractional
  rem-based padding chain at 13px root font-size anti-aliases a 1px border
  visibly thinner than the same border around this component's exact-px
  box — even with identical width/color. `box-shadow` sidesteps layout
  sizing entirely. Consequence: both `size` variants pad 1px extra on
  _both_ axes (`sm`: `px-[8px] py-[4px]`; `lg`: `px-[16px] py-[10px]`),
  and any `focus:`/`hover:` state with a visible border + ring combines
  both into one bracket value rather than layering, since `box-shadow` is
  one property.
- **`focus:`, not `focus-visible:`.** Matches Bootstrap's ring, which fires
  on any focus method including a click; `focus-visible:` suppresses for
  pointer-originated focus by design. Consequences: `active:shadow-none`
  everywhere (a mouse press matches `:focus`+`:active` simultaneously —
  Bootstrap fully suppresses the ring while pressed), and
  `focus:bg-[...]` resets on solid `danger`/`warning`/`success` (so the
  post-click, still-hovered state doesn't keep the hover tint on top of
  focus).
- **Focus ring color is its own per-variant token**
  (`--btn-<variant>-focus-ring`), not derived from border/text color, and
  light/dark are independent values, not a computed lighten/darken —
  e.g. `primary`/`text-primary`'s ring is `brand-600` light but `brand-500`
  dark (a brighter ramp step, not the same index carried over).
- **Pressed-state colors are their own ramp step**, not hover's color
  reused — see the color tables in `buttonColors.css` for the per-variant
  values. All five `text-*` (ghost) variants render no background at all
  while pressed (`active:bg-[transparent]`), since `:hover`+`:active`
  match simultaneously and nothing would otherwise outrank
  `hover:bg-[...]`.

## Dropdown/menu system map — which one to reach for

Four parallel systems coexist, each solving "a floating panel anchored to a
trigger" for a different visual language. Reaching for the wrong one is the
single most common way to reintroduce bugs this migration already fixed
once, so the choice is recorded here rather than re-derived per file:

1. **`src/navigation/NavMenu.tsx`** — `NavMenuContent`/`NavMenuSubContent`
   (`RadixDropdownMenu`) and `PopoverMenuContent` (`RadixPopover`). Use for
   anything wearing Metronic's menu skin: `.menu-sub-dropdown`,
   `.menu-link`, `.menu-item`, the `menu-gray-*`/`menu-state-bg-*` theme
   classes — header/footer/sidebar chrome (user dropdown, language
   selector, sidebar flyouts, role pickers).
2. **`src/table/ActionsDropdown.tsx`** — `ActionsDropdownComponent`/
   `ActionsDropdownItem` (`RadixDropdownMenu`) and
   `ActionsPopoverComponent`/`ActionsPopoverItem` (`RadixPopover`), plus
   `PlainActionItem` for the one context with no real Menu/Popover
   ancestor at all (`ModalActionsDialog`'s search results). Use for
   Bootstrap-skinned menus: `.dropdown-menu`, `.dropdown-item`,
   `.popover`/`.popover-body`. The default choice for anything new unless
   the surrounding UI is specifically Metronic chrome (rule 1) or already
   on the Tailwind design system (rule 3).
3. **`packages/ui/src/DropdownMenu.tsx` / `Popover.tsx`** — the
   Tailwind/shadcn primitives, styled via CSS variables. Not wired into
   the production bundle yet (Storybook-only) — don't reach for these in
   `src/` until the restyle is a deliberate, separately reviewed step.
   `Popover.tsx`'s file comment carries the rule rules 1 and 2 both
   inherit: **if it contains anything the user types into or drags, it's a
   Popover; if every child is a command row, it's a DropdownMenu.** A
   `DropdownMenu` owns focus with a roving tabindex and treats keystrokes
   as typeahead over its item collection — it will steal keystrokes from a
   focused text input the moment one matches a sibling row's label.
4. **Hover/focus-triggered `OverlayTrigger`+`Popover`/`Tooltip` from
   `react-bootstrap` directly** — deliberately untouched. These are rich
   tooltips (volume-discount math, truncated-list previews), not
   click-toggle menus. Radix's `Popover` has no built-in hover trigger, so
   converting one would mean hand-rolling mouseenter/mouseleave-with-delay
   logic to replace what Bootstrap already provides — not worth it absent
   a specific bug.

### Every trigger in an `asChild` chain must forward refs and props

Radix's `Slot` clones its immediate child, attaches the popper's positioning
ref, and merges in `aria-haspopup`/`aria-expanded`/`data-state` plus pointer
and keyboard handlers. Any component in that chain that doesn't forward
both breaks it — usually silently, as a button that looks correct and does
nothing. `BaseButton` and `Tooltip` (`packages/ui`) are both `forwardRef`
and relay `...rest` for this reason; `Tooltip`'s no-label early return uses
`Slot` rather than a bare fragment, since a fragment takes neither ref nor
props. Any custom component sitting directly inside a `Trigger`/`Anchor asChild`
needs the same treatment — `src/core/Tooltip.tsx`'s `Tip` does **not**
currently do this (a known, deliberately-unfixed hazard; wrap the trigger
around `Tip`, not the other way — see `ActionsDropdown.tsx`'s
`TableDropdownToggle` for the reference shape).

## `ActionsDropdown`/`ActionItem`: the Bootstrap-skinned menu shell

`src/table/ActionsDropdown.tsx` / `src/resource/actions/ActionItem.tsx`.
Reachable from ~184 and ~520 files respectively — the highest-leverage
single primitive in the app.

- **One axis at a time.** Keeps `.dropdown-menu`/`.dropdown-item`/
  `.dropdown-toggle` class names on the Radix-driven markup rather than
  also restyling onto `packages/ui`'s Tailwind `DropdownMenu` — those
  classes come from Bootstrap's own `_dropdown.scss`, unrelated to
  Metronic's menu stylesheet, so this doesn't block deleting that stylesheet
  later. The eventual Tailwind restyle stays a separate, reviewable step.
- **What Radix replaces outright**: the old module-level pub/sub that
  closed every other open dropdown instance (Radix dismisses on outside
  pointer events natively), and the manual `createPortal` (Radix's own
  `Portal`). `modal={false}` on the Root is deliberate — a modal Radix menu
  blocks outside pointer events and locks scroll, neither of which the
  Bootstrap dropdown did.
- **Keyboard highlight needs a bridge.** Bootstrap styles
  `.dropdown-item:hover`/`:focus`; Radix marks the active row with
  `[data-highlighted]` (set for both keyboard nav and pointer hover) and
  manages focus itself, so relying on `:focus` leaves arrow-key nav
  unhighlighted. `src/metronic/sass/custom/_dropdown.scss` maps
  `.dropdown-item[data-highlighted]`/`[data-disabled]` onto Bootstrap's
  hover/disabled treatment.
- **`.dropdown-toggle` stays on trigger buttons** even though Radix
  supplies its own `aria-haspopup`/`data-state` — removing it breaks
  `.disabled-view`'s `table .dropdown-toggle, .dropdown-toggle.btn-icon { display: none }` rule.
- **`ActionsDropdownShellProps` vs. `ActionsDropdownProps` are
  deliberately different types.** `ActionsDropdownComponent`'s `...rest`
  spreads onto `RadixDropdownMenu.Content`, a real DOM element — widening
  its prop type to the wrapper's fields (`data`, `row`, `refetch`, …) would
  let a caller pass e.g. `data={{}}` straight through as a stray DOM
  attribute. Keep the split when touching either type.
- **Menu-only exports**: `ActionsDropdownItem` (`forwardRef`, `onSelect`
  not `onClick`), `ActionsDropdownItemText`, `ActionsDropdownHeader`,
  `ActionsDropdownSeparator` — every bare react-bootstrap
  `Dropdown.Item`/`.Divider`/`.Header` inside one of these menus must use
  these instead; a plain element renders and is clickable but is invisible
  to arrow-key nav/typeahead and doesn't close the menu.
- **A menu row cannot render standalone.** Radix's `Item` throws outside a
  `DropdownMenu.Root`/`Content`. `src/test/harness.tsx` exports
  `inActionsMenu(children)` — an already-open, non-modal, trigger-less
  Root/Portal/Content — for testing a row component in isolation:
  `renderWithProviders(inActionsMenu(<DeleteCreditButton row={row} />))`.
- **`ActionsPopoverComponent`/`ActionsPopoverItem`** — the Popover-backed
  twin, same Bootstrap classing, for any menu whose content includes a real
  form control (a `DropdownMenu` will hijack that control's keystrokes as
  typeahead the moment one matches a sibling item's label — see the system
  map above).
- **`PlainActionItem`** — a plain native `<button>` with zero Radix
  dependency, same `.dropdown-item` appearance and `onSelect` API. `ActionItem`
  switches to it via a `notInMenu` context flag for the one real context
  with no Radix ancestor at all (`ActionDialogBody`'s "show all actions"
  search, a plain react-bootstrap `Modal`).
- **Row-level disabled styling**: a disabled Radix menu item gets
  `pointer-events: none` (`_dropdown.scss`'s `[data-disabled]` rule), so a
  `Tip`/tooltip explaining _why_ a row is disabled must sit on a separate,
  non-disabled sibling element (e.g. a `QuestionIcon`) rather than wrap the
  disabled item itself — see `UserBulkActions.tsx` for the pattern.

## `NavMenu`: the Metronic-skinned menu shell

`src/navigation/NavMenu.tsx`. A distinct family from `ActionsDropdown.tsx` —
these panels were never built on react-bootstrap; they wear Metronic's own
`.menu`/`.menu-sub`/`.menu-sub-dropdown`/`.menu-item`/`.menu-link` classes
and, pre-migration, were driven by Metronic's imperative `MenuComponent`
(now deleted entirely — see below).

- **Same "one axis at a time" principle**: Radix supplies
  behavior/positioning/accessibility, the existing compiled Metronic CSS
  supplies 100% of appearance. `.menu-sub-dropdown`'s visibility/entrance
  animation is gated by Metronic's own compiled `&.show[data-popper-placement]`
  rule (Popper.js's attribute — its _presence_, not value, gates
  `display`); `NavMenuContent`/`NavMenuSubContent` set that same class and
  attribute so the rule fires unmodified.
- **Keyboard highlight bridge is harder than `ActionsDropdown`'s**:
  Metronic ships many `.menu-state-*` color themes, not Bootstrap's one.
  The bridge only covers the themes actually used in the app
  (`menu-state-bg-gray`, `menu-state-bg-light`, `menu-state-title-primary`),
  calling `menu-link-theme` with the same literal arguments `_theme.scss`
  already passes for `:hover`, retargeted onto `[data-highlighted]`.
- **`.menu-item`/`.menu-link` split**: `NavMenuItem`/`NavMenuSubTrigger`
  attach Radix behavior directly to the inner `.menu-link` element (an
  `<a>`/`<Link>`/`<div>`), rendering the outer `.menu-item` as a plain,
  non-Radix wrapper for layout only. Any hand-rolled row that instead puts
  `.menu-link` on an inner `<span>` and `.menu-item` on the actual Radix
  item breaks `.menu-link:focus-visible`'s outline rule, which targets
  `.menu-link` specifically — use `NavMenuItem asChild` rather than
  hand-rolling this split.
- **Plain (non-`NavMenuItem`) content is a first-class case.** Anything
  that must _not_ auto-close the menu on interaction — a settings toggle, a
  Copy button — renders as a plain child of `NavMenuContent`, never
  registered with Radix's menu machinery, so its own click handler fires
  undisturbed. This is the header-cluster equivalent of `ActionsPopoverComponent`:
  "needs to survive its own click," not "needs a real text input."
- **`DropdownMenuSub` selection only closes the submenu, not the root** —
  Radix's own default. Not routed around; where it mattered
  (`LanguageSelectorDropdown`), the caller already reloads the page a
  moment later regardless.
- **`useHoverMenu()`** reproduces Metronic's
  `data-kt-menu-trigger="{default: 'click', lg: 'hover'}"` (click below
  `lg`, hover at `lg`+) for _top-level_ triggers — Radix's plain
  `DropdownMenuTrigger` has no hover mode at all (unlike `SubTrigger`,
  which does). `hoverHandlers` are spread onto both trigger and content
  (a `mouseleave` on either alone would close the menu while the pointer
  crosses the visual gap between them), with a 200ms close-on-leave delay
  ported from Metronic's own `hoverTimeout` default. `useHoverMenu(false)`
  skips the `lg`+ gate for the one call site (`PageBarTabs.tsx`) whose
  original attribute had no responsive variant.
- **`PopoverMenuContent`** — the shared shell for every ad-hoc
  `RadixPopover.Content` wearing this menu skin (`AsyncSearchBox`,
  `TableFiltersMenu`'s `FlyoutRow`, `RoleAndProjectSelectField`, etc.),
  consolidating what used to be six independently hand-copied
  `side`/`align`/`data-popper-placement`/`className` blocks into one
  implementation. Two `TableFiltersMenu.tsx` call sites are deliberately
  _not_ migrated to it — they need `forceMount` + a custom `container` +
  a callback ref, which the simple wrapper doesn't expose, and are already
  the most heavily-tested code in this area; widening the shared shell to
  fit them wasn't worth the added surface.
- **`useMediaQuery`/`react-responsive` testing gotcha**: this project's
  jsdom has no `window.matchMedia` at all, and `react-responsive` captures
  whatever it resolves to _at module-import time_ — reassigning
  `window.matchMedia` inside a test has no effect. Use `vi.mock('react-responsive',
() => ({ useMediaQuery: mockFn }))` instead.

### Radix `Popover.Portal` renders outside the local DOM subtree — watch z-index and modal stacking

`Popover.Portal`/`DropdownMenu.Portal` append to `document.body` by default,
so a portaled panel becomes a _sibling_ of whatever DOM ancestor it
logically belongs to — not nested under it. Two concrete failure modes to
check for on any new panel wrapped in a Bootstrap `Modal` or scoped
container:

- **z-index collisions**: Metronic's own menu classes carry Metronic's
  internal z-index scale (`$menu, dropdown, z-index`), which was never
  meant to compete with Bootstrap's modal (`$zindex-modal: 1055`). A panel
  that needs to render above a modal should use Bootstrap's own
  `$zindex-popover` (1070) token, not an arbitrary bumped number — Radix's
  Popper mirrors `Content`'s own CSS `z-index` onto the positioning
  wrapper, so this is a CSS-only fix.
- **DOM-query assumptions**: any code that does
  `document.querySelector('#some-container .some-portaled-thing')`
  assuming co-location will silently stop matching once the queried
  content is portaled to `document.body`. Pass an explicit `container` to
  `Portal` (e.g. `document.getElementById('kt_content_container')`) to
  restore co-location where something outside React depends on it — but
  note the container lookup runs during React's render phase, before
  commit, so it can return `null` on a tree's very first render if the
  container mounts in the _same_ commit as the portaled content.

## The sidebar: `packages/ui/src/Sidebar.tsx` + `Sheet.tsx`

`MenuComponent.ts`, `_SwapperComponent.ts`, `_ToggleComponent.ts`,
`_ScrollComponent.ts`, and `DrawerComponent.ts` (Metronic's imperative
sidebar/drawer machinery) have been deleted entirely, along with their
`bootstrap()`/`reinitialization()` calls and the entire `src/metronic/_utils/`
helper directory. The left navigation sidebar — the one piece described in
Status above as a _full_ rebuild, not just a behavior migration — now runs
on shadcn's real Sidebar recipe (`SidebarProvider`/`useSidebar`, a
collapsible desktop sidebar with an icon-only rail mode, a `Sheet`-based
mobile drawer), colors repointed at `waldur-design-tokens/surfaceColors.css`
instead of shadcn's own `--sidebar-*` vars. Deliberately not ported:
`SidebarInput`, `SidebarGroupAction`, `SidebarMenuAction`,
`SidebarMenuSkeleton`, and shadcn's _static_ `SidebarMenuSub*` family —
Metronic's `.menu-accordion` always needed a genuinely collapsible submenu
tree, so that family is a from-scratch accordion instead (below), not a
port of shadcn's non-collapsing one.

**Desktop/mobile is a full render-tree branch, not a CSS breakpoint.**
`useIsMobile(mobileBreakpoint)` decides which of two completely different
trees `Sidebar()` renders. Desktop renders a `group peer hidden md:block`
wrapper holding an invisible layout "spacer" (reserves horizontal space for
the real content column, transitions its own `width` on collapse) plus the
actual `fixed` panel overlaying it — two separate elements so that hovering
a collapsed rail can widen the visible panel without reflowing the page
content behind it (the panel's own group is the _named_ `group/panel`,
deliberately distinct from the spacer's unnamed `group`, for exactly this
reason). Mobile instead renders the whole subtree inside `Sheet`/
`SheetContent`, `width` a hardcoded `'250px'` — **not `18rem`**, which this
project's forced 13px root font-size would shrink to 216px. This is a
sharper version of the root-font-size gotcha above: Tailwind's own
`--spacing`-based utilities can at least be pinned back with an override
(imperfectly — see above); a **plain inline `style={{ width }}`** rem value
has no such override available at all, since it isn't a Tailwind utility to
retarget in the first place. Any new inline style expressed in `rem` in
this codebase is exposed to the identical trap.

**Collapse/hover-expand mechanics**: a `data-collapsible` attribute on the
fixed panel (empty when expanded, else `"icon"`) drives every descendant via
`group-data-[collapsible=icon]/panel:*` variants. `canHoverExpand` gates
Metronic's real `.aside-hoverable:hover` behavior — the rail widening to
full size plus a `shadow-[5px_0px_10px_rgba(70,78,95,0.075)]` on pointer
hover — but keyed off **React state** (`isHoverExpanded`, set from
`onMouseEnter`/`onMouseLeave`), not raw CSS `:hover`: an earlier version
used a plain `md:hover:w-(--sidebar-width)` class, which desynced from the
`data-collapsible` clearing logic whenever the sidebar collapsed while the
pointer was already resting on the toggle (no new `mouseenter` fires, so
CSS `:hover` unwinds instantly while the React state driving
`data-collapsible` hasn't caught up yet) — a wide panel briefly rendering
icon-only collapsed content. Routing both effects off the same state
variable made them structurally unable to diverge.

**Named z-index tokens**: the desktop panel and the mobile drawer each
needed a Metronic-parity z-index (`105`/`110`) — see the root font-size
section above for the tokens and why they're two genuinely different
measured values, not one reused.

**The accordion is a from-scratch `Collapsible` tree, not `Accordion`.**
`Accordion.Root` renders its own wrapping DOM element; a nested Root
(needed for "only one sibling open" inside `ResourcesMenu`'s recursive
categories) would insert an extra layer between a menu item and its
children. Collapsible has no group-level Root, so each accordion item is
its own `Collapsible.Root` via `asChild` (zero extra DOM), with
sibling-exclusivity as a small shared hook. `Collapsible.Trigger` is styled
directly with `sidebarMenuButtonVariants` rather than wrapping a
`SidebarMenuButton` via `asChild` — `SidebarMenuButton` isn't `forwardRef`,
and Radix's `asChild`/`Slot` needs a ref on the real rendered `<button>`.
Same nested-button constraint as `NavMenu`'s `.menu-item`/`.menu-link` split
above: `SidebarMenuAccordion`'s `badge` slot sits inside the accordion
header's own real `<button>` (`Collapsible.Trigger`), so anything rendered
there must not itself be a `<button>` —
`ResourcesMenuFilterButton.tsx` renders `<span role="button" tabIndex={0}
onKeyDown={...}>` with its own `stopPropagation`, not a nested `<button>`,
which the browser would silently reparent out as invalid HTML.

**Accordion height is measured manually, deliberately not read from
Radix's own CSS var.** `--radix-collapsible-content-height` is written into
a plain ref inside Radix's own `CollapsibleContentImpl`, which doesn't
force a re-render — on a fresh accordion's very first open, the var never
reaches the DOM before the slide `@keyframes` animate against it, and
animate to nothing. `SidebarMenuAccordion` sidesteps this the same way the
pre-rebuild `MenuAccordion` did: measuring `scrollHeight` into real
`useState` via a `ResizeObserver`, exposed as its own
`--sidebar-accordion-height` inline style for the
`waldur-sidebar-accordion-up`/`-down` keyframes to key off instead.

**The mobile Sheet's entrance animation: `@starting-style`, not
`forceMount`, and the trap in between.** The natural first instinct —
`forceMount` on the Sheet's Overlay/Content, so the slide-in transition has
a real "from" frame to animate away from — creates a chain of problems
worth knowing by name rather than rediscovering:

- Radix's `DialogPortal` gates its own `Presence` on its **own**
  `forceMount` prop, independent of its children's — force-mounting
  Overlay/Content alone still lets the Portal unmount them, so nothing
  animates until the Portal is force-mounted too.
- Once genuinely permanent, the invisible closed overlay (`fixed inset-0`)
  still swallows clicks: Radix's modal `Overlay` sets `style="pointer-events:
auto"` **inline**, which beats a `data-[state=closed]:pointer-events-none`
  _class_ regardless of specificity — needs its own trailing `!` to win
  over the inline style.
- The real reason to stop: `forceMount` keeps Overlay/Content **permanently
  mounted** even while closed, so Radix's _mount_-triggered side effects —
  `hideOthers()` (`aria-hidden` on everything else), scroll lock, outside-
  pointer suppression — become permanent too, not scoped to genuinely open
  state. Confirmed live: the sidebar's own toggle button ended up under a
  permanently `aria-hidden="true"` ancestor from the very first page load,
  Chromium's console flagging "Blocked aria-hidden on an element because
  its descendant retained focus" — on some input paths, non-functional.

The fix drops `forceMount` entirely and gives Radix's own `Presence`
something it can actually detect instead: Tailwind v4's `starting:` variant
(a real `@starting-style` block) gives a freshly-_mounted_ node a one-time
"from" frame to transition away from, without needing the node to already
exist. Overlay/Content now mount/unmount on genuine open/close — `Presence`
still defers the real unmount until the closing animation finishes, so
Radix's side effects stay scoped to real open state.

**Specificity ties need a trailing `!` in more than one place.** A
`group-data-[...]` variant and a plain base utility setting the _same_ CSS
property land at identical specificity once Tailwind wraps the variant in
`:where()` — source order (not intent) decides the tie, and the base rule
usually loses the fight silently. Three independent spots in `Sidebar.tsx`
hit this (the slot-padding collapse override, the panel-width collapse
override, the toggle-button reveal-on-hover sizing below) — grep for a
`group-data-[collapsible=icon]` variant sitting next to a plain class
setting the same property before assuming either one "just wins."

**Toggle-button reveal-on-hover: a three-step layout-shift fix.**
`WaldurSidebarBrand`'s collapse toggle is invisible until hovered/focused —
naively, `opacity-0` → `opacity-100`. That still reserves the button's full
footprint in the brand row's flex layout even while "invisible": harmless
in the spacious expanded row, but in the ~75px collapsed icon rail it
squeezes the logo mark into a visibly wrong sliver. Metronic's real
`#kt_aside_toggle` is genuinely zero-size until hovered, not just
transparent, so the fix is `md:size-0` (clipped) →
`md:group-hover/panel:size-9`/`md:focus-visible:size-9`. That still isn't
enough: growing **in flow** from 0 to 36px still shrinks the logo's
`flex-1` sibling box by 36px the instant it grows, shifting the centered
logo sideways. The real fix takes the button out of flex flow entirely at
`md:` (`absolute`, anchored to the row's own `relative`), so revealing it
overlays the row's edge instead of stealing space from anything — the
logo's box never changes size regardless of hover state. Mobile is
exempted: the Sheet renders this row unconditionally visible there, with no
`group/panel` hover ancestor to key off.

**No sidebar-state cookie anymore — a real behavior change, not a swap.**
shadcn's upstream Sidebar recipe persists collapsed/expanded state via a
cookie read **server-side** in a Next.js layout, passed in as the initial
`defaultOpen`. There's no server-side render here, so an earlier version of
this component read/wrote that cookie client-side instead — now removed
outright, with no replacement (`localStorage` or otherwise). `open` always
starts fresh from `defaultOpen` on every load: a user's last collapsed/
expanded choice is no longer remembered across sessions, on purpose, not as
an oversight.

**`SidebarCallToAction`** (`Sidebar.tsx`) — the "Add resource" pill at the
top of the sidebar, rendered as an outlined button rather than a plain nav
item so it reads as a call to action, not one more list entry, with `mb-6`
of its own breathing room. Extracted into `packages/ui` because the actual
consumer (`marketplace-popup/MarketplaceTrigger.tsx`) had hand-rolled its
own `SidebarMenuItem`/`SidebarMenuButton` pair that had already drifted
from the Storybook mockup — one shared implementation now backs both the
real usage and the story, rather than two copies that can silently diverge
again.

**`useSidebarLayoutShim.ts`** bridges the new primitive's `open`/`state`
into the legacy Metronic `layout.config.aside.minimized` boolean that
`AppHeader`/`Toolbar`/content-offset padding and `LLMChatDrawer`'s
minimize-detection still depend on (`LayoutProvider.setLayout()` rebuilds
every body class on every call with no memoization of its own, so this
effect is gated by an equality check to avoid looping). It also owns
**auto-minimize at medium viewport widths** (768–1399px, ported from the
pre-rebuild sidebar's own resize effect), permanently disabled for the
session the moment a user manually toggles the sidebar
(`markUserToggled()`, wired to `SidebarTrigger`'s `onClick`) — a real user
choice should never be silently overridden by a resize.

The app's other central drawer use — the shared `#kt_drawer` content panel
behind `DrawerContext`/`DrawerRoot` (support, chat, table filters,
pending-order confirmations, …) — is unrelated to this component and runs
on `@radix-ui/react-dialog` directly; see below.

### The shared content drawer (`#kt_drawer`): Dialog, real `@keyframes`, and a manual `.drawer-on` class

`DrawerRoot.tsx` now wraps the exact same `.card`/`.card-header`/`.card-body`
Bootstrap markup in `Dialog.Root`/`Dialog.Content` instead of Metronic's
`data-kt-drawer-*` attributes; `DrawerContext.tsx` gained a real `isOpen`
boolean (previously visibility lived **only** in the imperative
`DrawerComponent.getInstance('kt_drawer').show()/.hide()` calls, with no
React state backing it at all).

- **`forceMount` on `Dialog.Content` was tried first and reverted — it broke
  real clicks elsewhere on the page.** The motivation looked sound: a handful
  of existing helpers (`useDrawerExpand`/`useDrawerShellClass`/`isDrawerOpen`
  in `src/drawer/`) read and write `#kt_drawer`'s `classList`/`dataset`/inline
  `style` directly and assume the node always exists, mirroring Metronic's own
  DOM lifecycle (the div was permanently mounted; only a CSS class toggled its
  visibility) — `forceMount` looked like the natural way to preserve that
  (same family of "looks like the fix" trap as `Collapsible.Content`'s
  `forceMount` hazard above, different mechanism). In reality, `forceMount`
  keeps `DialogContentModal`'s inner `DismissableLayer` **permanently
  mounted**, and `DismissableLayer` registers a real
  `document.addEventListener('pointerdown', …)` unconditionally on mount —
  its own "is this pointerdown outside the layer" gate checks the
  cross-layer `layersWithOutsidePointerEventsDisabled` set, not
  `context.open`, so it runs (and calls `onOpenChange(false)`, harmlessly, on
  an already-closed drawer) for **every click anywhere in the document**, not
  just while genuinely open. That alone is inert — until it interacts with
  something else on the same element, at which point real (trusted) clicks
  on the header's Support/Pending-tasks toggle buttons silently did nothing,
  while every diagnostic that used an untrusted/synthetic click (`el.click()`,
  `dispatchEvent(new MouseEvent(...))`) or a plain DOM state check looked
  completely fine — the discrepancy is _only_ visible against a real,
  trusted pointer event, which is why it shipped past `tsc`/lint/the full
  unit suite/an initial Browser-pane pass and was only caught by a manual
  real-click regression report. **Lesson: test open/close on this kind of
  shell with a real trusted click, not just `el.click()` or a DOM assertion —
  they are not equivalent once `DismissableLayer` is involved.**
- **The fix drops `forceMount` and gives Radix's own Presence something real
  to detect instead.** Presence (`@radix-ui/react-presence`, this version)
  only detects an _animation_ (`animationstart`/`animationend`, via
  `getComputedStyle(node).animationName`) to decide whether to delay
  unmounting past a `present` flip to `false` — it does **not** detect plain
  CSS `transition`s, which is what core `_drawer.scss`'s `.drawer` uses for
  every other `.drawer` consumer (e.g. `SidebarLayout.tsx`'s wizard sidebar,
  untouched by any of this). So `_shell.scss` gives `#kt_drawer` specifically
  a real `@keyframes kt-drawer-slide-in`/`kt-drawer-slide-out` pair, keyed off
  the same manually-toggled `.drawer-on` class `DrawerRoot` already sets from
  `isOpen` (not Radix's own `data-state` — keeping the literal `.drawer-on`
  class is what keeps `useDrawerShellClass`/`isDrawerOpen`'s
  `classList.contains('drawer-on')` checks, and `LLMChatDrawer.tsx`'s own
  copy of that same check, working completely unmodified). Without
  `forceMount`, `Dialog.Content` doesn't even mount until the _first_ open
  (matching Metronic's initial `display: none`), and on every close Presence
  keeps it mounted for exactly the animation's real duration before removing
  it — verified in the real dev stack with a `computer` screenshot burst
  (forces a real paint per capture; blind `setTimeout` polling of
  `getAnimations()` in an automated/CDP-driven tab reads `currentTime: 0`
  forever, since such tabs don't advance animation compositing while
  backgrounded — see the testing gotcha below, this bit it twice).
- **Width moved from a Metronic breakpoint-string attribute
  (`data-kt-drawer-width="{default:'100%', 'lg':'800px'}"`) to a
  `--drawer-width` CSS custom property** set inline by `DrawerRoot` from
  `drawerProps.width`, consumed by a real `@include media-breakpoint-up(lg)`
  rule in `_shell.scss` (100% below `lg`, `var(--drawer-width, 800px)` at/above
  it). `useDrawerExpand`'s full-screen toggle writes the same custom property
  (`style.setProperty('--drawer-width', …)`) instead of `style.width`
  directly — the existing `MutationObserver` re-assertion (guarding against
  `DrawerRoot` re-renders clobbering an expanded width) still applies
  unchanged, just retargeted.
- **Two `_thread.scss` selectors scoped to `[data-kt-drawer]`** (an ancestor
  attribute-presence selector, matching the AI thread root/composer only when
  nested inside a Metronic-managed drawer) had to move to `#kt_drawer` — the
  attribute itself is gone from this element now that Radix owns it.
- **`Dialog.Title` wraps the existing `<h3 className="card-title …">`** via
  `asChild` (Radix requires an accessible name for the dialog role);
  `aria-describedby={undefined}` opts out of the paired description warning,
  since drawer content is arbitrary and has no natural description. Both are
  strict a11y additions — the old drawer had no ARIA role at all.

### Testing gotcha: `ResizeObserver` and animation timing

jsdom doesn't implement `ResizeObserver` — stub it in tests that render
`Collapsible.Content` (`vi.stubGlobal('ResizeObserver', class { observe(){}
unobserve(){} disconnect(){} })`, see `AssistantComposer.test.tsx` for the
precedent). Separately, when live-debugging a CSS animation in an
automated/CDP-driven browser tab: `getAnimations()`/`getBoundingClientRect()`
polling via `setTimeout` is **not reliable** — such tabs appear to skip
compositing animation frames unless something explicitly forces a render.
A tight burst of `screenshot` calls across the interaction (CDP forces a
real paint per capture) is the reliable substitute for confirming an
animation genuinely interpolates rather than snapping.

## `packages/ui`: portable Tailwind/Radix primitives

Zero Bootstrap coupling, published as `waldur-ui`. Started as `BaseButton`'s
dependency graph; now ~20 components (`Sidebar`, `Sheet`, `Dialog`,
`DropdownMenu`, `Popover`, `Card`, `Badge`, `Table`, `DataTable`, `TopBar`,
`ModePicker`, `Switch`, `Avatar`, …), most still Storybook-only — see Status
above for exactly which ones ship in production today, and the sidebar
section above for the one full rebuild among them.

- **`cn()`** — class-name merge helper (`clsx` + `tailwind-merge`).
- **`LoadingSpinner`** — Tailwind's `animate-spin`; distinct from
  `src/core/LoadingSpinner.tsx`'s `LoadingSpinnerSimple`, which ~385 call
  sites elsewhere still use unchanged.
- **`Tooltip`** — `@radix-ui/react-tooltip`/`@radix-ui/react-popover`-based
  rebuild of `src/core/Tooltip.tsx`'s `Tip`. Started scoped to `Tip`'s
  then-current usage (`label` + optional `body`, hover/focus trigger, dark
  bubble theme only); now covers `Tip`'s fuller react-bootstrap-derived
  API — `theme` (`'dark'` adaptive vs `'light'` fixed, see the theme prop's
  own doc comment for why the names are the confusing way round),
  `autoWidth`, `id`, `zIndex`, `delayDuration`, and `trigger="click"`
  (renders as a `Popover` instead of a `Tooltip`, since Radix's `Tooltip`
  primitive has no click-only mode — reuses this file's own bubble styling
  rather than `Popover.tsx`'s card styling, since visually it's still meant
  to read as a tooltip). `placement`/`container`/a separate `rootClose` prop
  stay unreplicated — no real call site needs them, and `rootClose` is
  subsumed by `trigger="click"`. The arrow is a custom polygon (`asChild`),
  not Radix's default: the default's base sits exactly flush with
  `Content`'s edge, and even with matching fill and zero gap that's prone to
  a visible anti-aliasing seam between the SVG and the HTML box's separate
  rasterizers — the custom one extends 1 viewBox unit (~0.5px) past its own
  box with `overflow: visible`, an intentional overlap that hides the seam
  by construction. Kept to the minimum that still works: a larger, earlier
  overlap visibly enlarged the arrow past Bootstrap's own
  `$tooltip-arrow-height`.
- **`BaseButton`** — see above. Internal imports of `cn`/`LoadingSpinner`/
  `Tooltip` are relative (`./cn`), not round-tripped through the package
  name.

`src/core/buttons/BaseButtonParity.stories.tsx` is the one place both
buttons render side by side, importing the new one as `BaseButtonTw` from
`waldur-ui` purely for local readability.

## Storybook toolchain

`yarn storybook` (dev, port 6006) / `yarn build-storybook`.

- **Stories**: `BaseButton.stories.tsx`/`BaseButtonTw.stories.tsx`
  (variant × size matrix) plus `BaseButtonParity.stories.tsx`
  (`Migration/BaseButton Parity`, tagged `data-pair`/`data-role`) for the
  Playwright parity spec to screenshot. Plain stories use
  `storybook-addon-pseudo-states` for quick visual hover/focus/active
  browsing; the parity story instead drives real Playwright interactions,
  since forced pseudo-states aren't reliable for the real Bootstrap
  button's compiled CSS.
- **`.storybook/main.ts`'s `viteFinal`** hand-duplicates `vite.config.ts`'s
  `resolve.alias`/`css.preprocessorOptions`/`define` rather than reusing
  its `plugins` array wholesale (that array's `react()` would double up
  with `@storybook/react-vite`'s). Keep the duplicated values in sync by
  hand.
- **`.storybook/preview.tsx`'s theme toggle** calls `loadTheme()` directly
  — the same function the real app's `ThemeProvider` calls.
- **Vitest project split** (`vitest.config.ts`): `unit` (jsdom) and
  `storybook` (browser-mode via `@vitest/browser-playwright`, renders every
  story as a smoke test, `yarn test:storybook`) need different CI images —
  `.gitlab-ci.yml` passes `--project=unit` explicitly for the unit job.
  The `storybook` project's `optimizeDeps.include` explicitly lists
  `aria-query`, `lz-string`, `pretty-format` — without them Vite's
  dependency scanner can't see into `@storybook/addon-vitest`'s build
  artifact to discover their transitive CJS deps, and each hits a
  browser-native interop `SyntaxError` at import time instead.

## Visual parity test suite (`e2e-visual/base-button-parity.spec.ts`)

Screenshots the old (Bootstrap) and new (Tailwind) `BaseButton` side by side
on the `BaseButtonParity` story and diffs the buffers directly — no
committed baseline to go stale.

```bash
yarn playwright test base-button-parity --project visual --workers=1
```

(`--workers=1` is required — a full run at `--workers=3` exhausted available
RAM on this machine.)

**Coverage**: 12 variants × 2 sizes × 2 themes × 6 states (`enabled`,
`disabled`, `hover`, `active`, `focus` via `.focus()`, `focus` via a real
`.click()`) = 288 cases.

**Checks, in order**:

1. **Dimension parity** (`MAX_DIMENSION_SLACK_PX = 0.5`) — compares
   `locator.boundingBox()` (exact CSS px), not the screenshot PNG's rounded
   integer dimensions — PNG-based comparison rounds based on the element's
   exact fractional page position, so a real regression and pure noise can
   round to the identical delta depending on placement. Measured noise
   ceiling via `boundingBox()` is ~0.06px.
2. **Pixelmatch ratio** (`DIFF_RATIO_THRESHOLD = 0.16`, `threshold: 0.25`
   per-pixel) — the primary pixel-diff check, tuned above rendering noise
   (up to ~13% on text-only/pastel variants) while staying below any real
   token bug's signal.
3. **Dominant-color chromaticity** (`CHROMATICITY_TOLERANCE = 10`,
   `FOREGROUND_DISTANCE_THRESHOLD = 30`) — closes pixelmatch's blind spot
   on small/text-heavy buttons, where a wrong hue only touches a small pixel
   fraction. Compares each channel's _share_ of brightness (chromaticity),
   which cancels uniform antialiasing-driven lighter/darker shifts while
   staying sensitive to an actual hue change.

**Known, accepted rendering-engine noise** (tokens verified byte-identical
via `getComputedStyle()`; not fixable without literally sharing DOM/CSS
between old and new, which defeats the migration's point): box-shadow
corner rendering at small radius differs by a fraction of a px between
implementations (most visible on `sm` buttons), and text/edge antialiasing
on pastel backgrounds at `lg` size depends on sub-pixel glyph position.

### Testing gotchas

- **CSS transitions need a real paint to settle** — a synchronous
  `getComputedStyle()` immediately after `.hover()`/`.focus()` reliably
  returns the pre-transition value. `gotoParity()` disables all
  transitions/animations page-wide via an injected stylesheet;
  `waitForTimeout(350)` before each state screenshot is a second,
  independent safeguard.
- **`:focus-visible` isn't triggered by a raw `.focus()` call** in
  Chromium — it requires a plausible keyboard origin. `:focus` (what this
  component actually uses) doesn't have that restriction, so the suite's
  two focus tests (`.focus()` and `.click()`) exercise genuinely different
  states, since `:hover` persists after a click but not after `.focus()`.
- **Reliably triggering `:active`**: a fresh browser context per test,
  `scrollIntoViewIfNeeded()`, `page.mouse.move()` to the element's exact
  center (from `boundingBox()`, not a hover-implied position) before
  `mouse.down()`, and an explicit `element.matches(':active')` check
  immediately before capturing — the test throws rather than silently
  comparing two enabled buttons.
- `storybook-addon-pseudo-states`' forced-state toggle is unreliable for
  the real Bootstrap button's compiled CSS specifically; the parity spec
  always drives real Playwright interactions instead.
