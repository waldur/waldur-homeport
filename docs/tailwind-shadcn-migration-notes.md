# Tailwind/shadcn Migration Notes

Reference for the Bootstrap/Metronic → Tailwind/shadcn migration. Documents
the current architecture and the non-obvious decisions behind it — the things
a source comment can point to instead of re-explaining inline.

This file intentionally does **not** narrate the bug-by-bug history of how
each piece got here — that's in `git log` and the commit messages for the
files named below. What's here is the state of the system today and the
reasoning a future change in this area needs to not re-break.

**Status**: Tailwind is enabled app-wide (`vite.config.ts` + `src/index.tsx`,
see below), and the app's interactive floating-panel UI — dropdowns,
popovers, the sidebar accordion — now runs on Radix primitives across the
whole codebase (no `Dropdown`/`OverlayTrigger`+`Popover` import from
`react-bootstrap` remains, and Metronic's own imperative `MenuComponent.ts`
has been deleted entirely). **Appearance has not moved**: every one of these
Radix-driven panels still wears Bootstrap's `.dropdown-menu`/`.popover` or
Metronic's `.menu-sub-dropdown` classes and renders through the existing
compiled CSS — only the behavior (open/close, focus, keyboard nav,
positioning) is on Radix. `BaseButton` (the Tailwind/shadcn rebuild in
`packages/ui`) is still reachable only via Storybook — no production button
has been switched over to it yet.

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

**Layering does not beat `!important`.** Bootstrap 5's utility-API classes
(`.border`, `.bg-transparent`) generate with `!important`, which sits in a
separate priority tier above all layered rules regardless of layer order.
`BaseButton.tsx` uses `border-[1px]`/`bg-[transparent]` instead of the
identically-named Tailwind utilities for exactly this reason.

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
`lg`). Tailwind's scale is rem-based against a 16px assumption, so
`src/tailwind.css`'s `@theme` overrides `--spacing`/`--text-sm`/`--text-base`/
`--radius-md`/`--radius-lg` with explicit px values. **Numbered spacing
utilities (`p-3`, `mt-1`) don't pick up the override** — Tailwind's compiled
utilities carry their own `--spacing` inside the higher-priority `utilities`
layer. Use px arbitrary values (`p-[12px]`) instead, as `BaseButton.tsx`
does throughout.

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

## The sidebar navigation accordion: Collapsible, not Accordion

`src/navigation/sidebar/MenuAccordion.tsx` and friends — the left sidebar's
in-flow expand/collapse tree, the one piece of the dropdown/menu migration
that needed a genuinely different Radix primitive (no floating panel at
all).

- **`@radix-ui/react-collapsible`, not `react-accordion`.**
  `Accordion.Root` renders its own wrapping DOM element; a nested Root
  (needed for "only one sibling open" inside `ResourcesMenu`'s recursive
  categories) would insert an extra `<div>` between `.menu-sub-accordion`
  and its `.menu-item` children, breaking the indentation mixin's
  direct-child selector chain. Collapsible has no group-level Root — each
  `.menu-item.menu-accordion` is its own `Collapsible.Root` via `asChild`
  (zero extra DOM), and sibling-exclusivity is a small shared hook,
  `useExclusiveOpen()` (`sidebar/utils.ts`).
- **`Collapsible.Trigger` takes `className="menu-link"` directly** (no
  wrapping `<span>`, no `asChild`), making it a real `<button>` — core SCSS
  already has a reset block for this (`button.menu-link`,
  `core/components/menu/_base.scss`). Consequence: anything rendered into
  the accordion header's `badge` slot must not itself be a `<button>`
  (invalid nested-button HTML) — `ResourcesMenuFilterButton.tsx` renders
  `<span role="button" tabIndex={0} onKeyDown={...}>` for this reason. Also
  consequence: `.menu-link`'s width comes from `flex: 0 0 100%`, which only
  does anything inside a flex parent — a plain block-level `<a>` fills its
  parent's width by default regardless, but a `<button>` keeps its own
  fit-content intrinsic sizing unless something explicitly stretches it.
  `.aside .menu .menu-item .menu-link { width: 100%; }` in `custom/_aside.scss`
  is scoped to the sidebar specifically, since `button.menu-link` is also
  reused by `FooterDropdown.tsx` for a horizontal (not full-width) item.
- **`Collapsible.Content` uses Radix's default hidden-attribute-driven
  mount/unmount, deliberately not `forceMount`.** `forceMount` looks like
  the natural fix for CSS `[hidden]`-fighting (see below), but it silently
  breaks Radix's own `--radix-collapsible-content-height` freshness: that
  var is only re-measured via a real mount/unmount-triggered state update,
  and `forceMount` pins the component permanently "present," turning every
  toggle after the first into a no-op for that measurement. The accepted
  cost of _not_ using `forceMount` is a cross-layer `!important` instead
  (see below) — a narrower, better-understood problem than losing height
  measurement.
- **Height is measured manually into `useState`, not read from Radix's own
  CSS var, for the very first open.** `CollapsibleContentImpl` measures
  height into a plain `useRef` (not `useState`) — updating a ref doesn't
  re-render, and the only thing that would otherwise force a second render
  is a `setIsPresent(present)` call that's a no-op bailout on a component's
  first-ever open (state already equals `present`). Net effect: the height
  var never reaches the DOM on a fresh mount's first open, and any
  `@keyframes` reading it animate to nothing. `MenuAccordion.tsx` sidesteps
  this by measuring `contentRef.current.scrollHeight` itself into real
  `useState` (re-renders on every measurement) via a single long-lived
  `ResizeObserver` per component instance, keyed to re-run on `[open]`
  changes (not `[]` — `MenuAccordion` itself stays mounted across the whole
  open/closed lifecycle, so an empty deps array would attach the observer
  exactly once, while `contentRef.current` is still null).
- **Animate via `animation`/`@keyframes`, not `transition`.** Radix's own
  `CollapsibleContentImpl` synchronously disables (`transitionDuration =
'0s'`, `animationName = 'none'`), force-reflows via
  `getBoundingClientRect()`, then restores — a disable→reflow→restore
  dance that reliably _restarts_ a named `animation` but gives a
  `transition` nothing to interpolate from (no intervening painted frame
  at the old value). Match Radix's own pattern:
  `animation: kt-menu-accordion-down`/`-up` keyframed against
  `var(--radix-collapsible-content-height)` (or the manually-measured
  `--menu-accordion-height` var above), not a `transition: height` rule.
- **Two separate cross-layer `!important` gaps to know about**, both from
  Tailwind's preflight loading in an earlier `@layer` than Metronic's own
  compiled `bootstrap` layer (cascade layers reverse `!important` priority
  — an earlier layer's `!important` beats a later layer's regardless of
  selector specificity, so nothing inside `bootstrap` can out-rank `base`
  on this axis):
  - Tailwind's `[hidden]:where(...) { display: none !important }`
    (preflight, `@layer base`) permanently hides `Collapsible.Content`'s
    closed resting state even after a matching `[data-state]` override, so
    `.menu-sub-accordion[data-state] { display: flex; }` needs its own
    `!important` in `custom/_aside.scss` to win.
  - core's own two `.menu-sub-accordion` `display: none` rules (one
    top-level, one nested inside a breakpoint mixin) also need overriding
    the same way — apply the override to _both_ `open` and `closed`
    states, since Radix's `Presence` keeps the node mounted with
    `data-state="closed"` for the duration of the closing transition
    before actually unmounting, and `display: none` during that window
    would freeze the transition before it plays.
- **Arrow rotation and the open-state highlight key off `[data-state]`,
  not Metronic's `.hover`/`.show` classes** (nothing sets those under
  Radix). Both rules need their own `transition` declared on an
  _unconditioned_ base selector, not only inside the `[data-state='open']`
  conditional block — a transition only animates if the element's current
  computed style already declares it, and the moment a conditional
  selector stops matching (closing), `transition` reverts to unset along
  with `transform`, so the open animation plays but the close snaps. This
  is a recurring shape across every Radix-driven caret/arrow bridge in this
  codebase, not unique to the accordion — check for it (`grep` for
  `transition` living only inside a `[data-state=...]`/`.show`-gated block)
  on any new one.
- **Deviation from Metronic's exact algorithm, accepted deliberately**:
  Metronic's `_hideAccordions` never actually clears a nested item's own
  `.show` when its parent collapses, so a collapsed-then-reopened category
  remembers it was expanded. Radix's `Content` unmounts on close, resetting
  nested state. Accepted since real nesting only goes 2 levels deep today.
- **Route-driven auto-expand**: a `useEffect` on route change calls the
  same shared `useExclusiveOpen`'s `setOpenId` — a one-shot "open it" on
  route match, never the equivalent of `.hide()`, so a route-active section
  the user manually collapsed doesn't reopen until the next matching
  navigation.
- **`MenuComponent.ts`, `_SwapperComponent.ts`, `_ToggleComponent.ts`, `_ScrollComponent.ts`, and `DrawerComponent.ts` have been deleted entirely**, along with their
  `bootstrap()`/`reinitialization()` calls in `MasterInit.tsx`/`Sidebar.tsx`,
  `hideAll()` in `Content.tsx`, and the entire `src/metronic/_utils/` helper
  directory. The sidebar minimizer toggle in `BrandName.tsx` runs
  on `@radix-ui/react-toggle`. The sidebar menu scroll area in `Sidebar.tsx` runs
  on `@radix-ui/react-scroll-area` (with a shared `ScrollArea` primitive in `packages/ui`).
  `Sidebar.tsx`'s mobile responsive drawer below `lg` now runs on declarative React
  state (`mobileSidebarOpen` in `LayoutContext`, toggled by `AppHeader.tsx`'s hamburger button)
  with a scoped `.drawer-mobile` CSS transition and portal overlay, closing automatically
  on route changes and `Escape`. The app's other central drawer use — the shared
  `#kt_drawer` content panel behind `DrawerContext`/`DrawerRoot` (support, chat, table
  filters, pending-order confirmations, …) — runs on `@radix-ui/react-dialog`; see below.

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

Holds `BaseButton`'s dependency graph with zero Bootstrap coupling:

- **`cn()`** — class-name merge helper.
- **`LoadingSpinner`** — Tailwind's `animate-spin`; distinct from
  `src/core/LoadingSpinner.tsx`'s `LoadingSpinnerSimple`, which ~385 call
  sites elsewhere still use unchanged.
- **`Tooltip`** — `@radix-ui/react-tooltip`-based rebuild of
  `src/core/Tooltip.tsx`'s `Tip`, scoped to `Tip`'s actual usage (`label` +
  optional `body`, hover/focus trigger, dark bubble theme only) rather than
  its fuller react-bootstrap-derived API.
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
