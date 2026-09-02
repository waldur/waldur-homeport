# Tailwind/shadcn Migration Notes

Reference for the Bootstrap/Metronic → Tailwind/shadcn migration
(`feature/tailwind-shadcn-migration-phase0`). Documents the current
architecture and the non-obvious decisions behind it — the things a
source comment can point to instead of re-explaining inline.

**Status**: Tailwind is enabled in the real app bundle.
`vite.config.ts` registers `@tailwindcss/vite` and `src/index.tsx`
imports `src/tailwind.css`, so anything under `src/` can now use
Tailwind classes and `packages/ui`'s Radix primitives. That was the
prerequisite for the Metronic-dropdown → Radix-dropdown migration; see
"Enabling Tailwind app-wide" below for what shipped with it.

No component has been *switched over* yet: the app still renders every
dropdown, button and table through Bootstrap/Metronic exactly as before,
and this change is verified to be visually inert (see the parity
verification below). `BaseButton` (the Tailwind rebuild) is still
reachable only via Storybook.

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

### Enabling Tailwind app-wide

Two lines turn it on — `tailwindcss()` in `vite.config.ts`'s `plugins`
and `import './tailwind.css'` in `src/index.tsx`. `.storybook/main.ts`
keeps its own separate instance of the plugin; the two are independent
and both are needed. `src/tailwind.css` is now shared by the app and
Storybook so a story and the running app cannot drift on layer order,
the px `@theme` overrides or the brand-token bridge.

**`tailwind.css` must be imported from the entry module**, not pulled in
by whichever component first wants a Tailwind class. The Metronic
stylesheet is injected at runtime as its own `<link>` (`loadTheme()`),
and layer order is fixed by the first `@layer` occurrence in the
document — importing eagerly at the entry guarantees the ordering
statement lands first.

#### The preflight shim

With the layer order in place, preflight loses to Bootstrap for
essentially everything — but only where Bootstrap has a competing
declaration. Two preflight rules have no Bootstrap counterpart and so
reached the app:

```css
img, svg, video, canvas, audio, iframe, embed, object { display: block }
img, video { max-width: 100%; height: auto }
ol, ul, menu { list-style: none; margin: 0; padding: 0 }
```

Reboot only sets `vertical-align: middle` on img/svg, and has its own
list `margin`/`padding-left` but no `list-style`. So every one of the
app's ~61 `<img>` tags and every inline Phosphor `<svg>` flipped from
inline to block (dropping out of the text baseline they were laid out
against), and every bare `<ul>`/`<ol>` lost its bullets — including
every list in Markdown the app renders as user content (`SafeMarkdown` /
`TruncatedMarkdown`: offering descriptions, announcements, terms of
service, user agreements), none of which carry a class to style back.

`src/tailwind.css` ends with a small `@layer bootstrap { … }` block that
reverts exactly those properties, and nothing else. Three things about
it that are deliberate:

- **`revert`, not explicit values.** It rolls back to the UA origin, so
  each element gets its real initial display without the rule hardcoding
  one per tag — notably Chrome's own `audio:not([controls]) { display:
  none }`, which a blanket `display: inline` would override and make
  hidden audio elements visible.
- **Only `list-style`, not the whole list rule.** Reboot's own
  `margin`/`padding-left` already win on layer order; `list-style` is
  the single property that needed reverting. Metronic's list-based
  components (`.menu`, `.menu-sub`, `.nav`, `.pagination`) set
  `list-style: none` themselves at class specificity and stay
  bulletless.
- **It lives in `bootstrap`**, giving the precedence chain
  `preflight (base) < shim < Tailwind utilities < component .scss`. New
  Tailwind markup that wants block media or unstyled lists asks
  explicitly (`block`, `max-w-full`, `list-none`), and unlayered
  component stylesheets keep winning as they always did.

`packages/ui` needed no opt-in: every `<img>`/`<svg>` it renders
(`AvatarImage`, `WaldurLogo`'s wordmark, `SidebarToggleGraphic`) is a
flex item of its own wrapper — `AvatarRoot`, `WaldurLogo`'s span, and
`ICON_BUTTON_BASE_CLASSNAME` respectively — so it is blockified by its
parent and never depended on preflight's rule. Re-check that before
moving one of them into an inline-flow context.

#### What preflight still changes, and why it was left alone

After the shim, removing all 34 preflight rules from the live CSSOM and
re-reading every computed style produces **no differences at all** on a
real app page, and only these three on a synthetic page exercising every
element preflight targets:

- `border-style: none → solid` on `*` — preflight's `border: 0 solid`.
  Width stays `0`, so it renders nothing. It would only become visible
  for CSS that sets `border-width` with no `border-style`; the codebase
  has exactly two such rules (`BookingResourcesCalendar.scss`,
  `CategoryCard.scss`) and both already resolve a style (an explicit
  `border-style: solid` and Bootstrap's `.card` respectively). Left as
  is — reverting `border` globally would undo the reset shadcn
  components in `packages/ui` are built against.
- `option { padding-left: 2px → 0 }` and `input { color }` inheriting
  the app's text color — both inside native form-control chrome, both
  invisible in practice.

#### Verifying parity after a change here

The check that produced the above is worth repeating whenever this area
changes, because it isolates preflight instead of comparing against
browser defaults (comparing to UA defaults just re-discovers that
Bootstrap exists, which was the first, wrong version of this test):
find the `@layer base` block in `document.styleSheets`, snapshot
`getComputedStyle` for every element, `deleteRule` the whole layer,
snapshot again, then re-`insertRule` the saved `cssText` and confirm the
restored snapshot matches the first. Any property that differs between
the two snapshots is something preflight is actively changing in the
real app.

#### The layer statement is dropped in production builds

`src/tailwind.css` declares `@layer theme, base, bootstrap, utilities;`
up front, and that statement survives in dev. The production optimizer
**removes it**, because the four layer blocks happen to be emitted into
`dist/assets/index-*.css` in exactly that order and the statement is
then redundant *within that file*.

That is still correct today: `index-*.css` is a `<link>` in the built
`index.html`, no other emitted stylesheet declares a layer at all, and
Metronic's own `@layer bootstrap { … }` sheet is injected by JS strictly
after the initial head is parsed — so `index-*.css` always establishes
the order. But the explicit safety net is gone in prod, so if the
Metronic stylesheet ever becomes a static `<link>` ahead of
`index-*.css`, `bootstrap` would register first and rank *below*
preflight, which is the one arrangement that breaks the whole app. Worth
re-checking the emitted order (`grep -o '@layer [a-z]*{' dist/assets/index-*.css`)
if the CSS chunking or the theme-loading strategy changes.

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

## Menu vs. popover, and the `asChild` composition rule

### Which primitive a Metronic dropdown maps to

A Radix `DropdownMenu` is a *menu*: it owns focus with a roving tabindex
and treats plain keystrokes as typeahead. That is right for a list of
commands and actively wrong for anything holding a form control — typing
into a text input inside one either moves the menu selection or never
reaches the input.

Many of waldur-homeport's Metronic `menu-sub-dropdown` popups are not
menus in that sense. They hold filter fields, selects, date pickers,
search boxes and Cancel/Apply footers: `TableFiltersMenu` /
`TableFilterItem`, `AsyncSearchBox`, `MarketplaceLandingFilter`,
`BoxRadioField`, `RoleAndProjectSelectField`. `TableColumnsButton` is
already a react-bootstrap `Popover` (an `OverlayTrigger`, not a
`Dropdown`) and holds a search box plus dnd-kit drag handles.

**The rule: if it contains anything the user types into or drags, it is a
`Popover`; if every child is a command row, it is a `DropdownMenu`.**
Forcing the first group through `DropdownMenu` is the most likely way to
derail this migration.

`packages/ui/src/Popover.tsx` is the shadcn Popover recipe for that first
group. Metronic sets `$popover-box-shadow: $dropdown-box-shadow` and
`$popover-border-radius: $border-radius`, so a popover and a dropdown are
deliberately the same floating surface here and the two files share those
token values — but not one exported class constant, because the menu
panel also carries menu-only concerns (`p-1` item gutter, `min-w-40`, the
Metronic menu entrance) that a popover holding arbitrary content must not
inherit. Motion is Bootstrap's own `.fade` (opacity .15s linear), which
is what the react-bootstrap popovers being replaced actually use.

There is deliberately **no `DropdownMenuCheckboxItem`**. It looks like an
obvious gap, but nothing in the app is a checkbox inside a *menu*: the
only checkbox-bearing popup is `TableColumnsButton`, which is a popover.
Add it when a real consumer appears, not before.

### Every trigger in an `asChild` chain must forward refs and props

Radix's `Slot` clones its immediate child, attaches the ref the popper
positions against, and merges in `aria-haspopup`/`aria-expanded`/
`data-state` plus its own pointer and keyboard handlers. Any component in
that chain that does not forward both breaks it — usually silently, as a
button that looks correct and does nothing.

Two fixes this required, both prerequisites for migrating any real
dropdown:

- **`BaseButton` is now `forwardRef`**, and `...rest` reaches the
  `<button>`. It previously filtered `rest` down to `data-*` props only,
  which would have swallowed exactly the ARIA and handlers Radix injects.
  (`data-state` alone would have survived — so the button would even have
  styled correctly while remaining inert.)
- **`Tooltip` is now `forwardRef` and relays `...rest`** to its
  `TooltipPrimitive.Trigger` (already `asChild`, so anything given to it
  lands on the real element). This matters because a tooltipped button
  puts `Tooltip` *between* the outer trigger and the `<button>`, so
  `Slot` clones `Tooltip`, not the button. Its no-label early return uses
  `Slot` rather than a bare fragment for the same reason — a fragment
  takes neither ref nor props, so an optional tooltip would otherwise
  break composition precisely when it is absent.

`TopBar.tsx`'s `IconButton` documents the same requirement at the point
where getting it wrong once crashed the whole dashboard.

Verified in Storybook (`Core/Popover`) rather than assumed: the trigger
`<button>` really receives `aria-haspopup="dialog"`/`"menu"`,
`aria-expanded` and `data-state`; both a plain and a tooltipped
`BaseButton` open their surface; and real typed keystrokes reach an
`<input>` inside a `PopoverContent` with the popover staying open and the
input keeping focus. The 288-case BaseButton visual parity suite still
passes unchanged, so the `forwardRef` rewrite altered no rendering.

## `ActionsDropdown`/`ActionItem`: the row-actions menu on Radix

`src/table/ActionsDropdown.tsx` and `src/resource/actions/ActionItem.tsx`
are reachable from ~184 and ~520 files respectively, so this was the
highest-leverage single rewrite in the migration — converting them
internally moved the bulk of the app's row-action menus onto Radix's
`DropdownMenu` with **zero call-site edits** at most sites.

### One axis at a time: behavior on Radix, appearance still Bootstrap

The rewrite deliberately keeps `.dropdown-menu`/`.dropdown-item`/
`.dropdown-toggle` class names on the Radix-driven markup, rather than
also restyling onto packages/ui's Tailwind `DropdownMenu` in the same
change. Those classes come from Bootstrap's own `_dropdown.scss`, not
from Metronic's menu SCSS (`src/metronic/sass/core/components/menu/`), so
this does not block deleting that ~1345-line stylesheet later — the two
are unrelated CSS. It does mean the eventual Tailwind restyle is a
separate, reviewable step with its own diff, instead of one change that
silently changed both behavior and 184 files' appearance at once.

Verified as a real parity claim, not an assumption: a Storybook story
(`Table/ActionsDropdown`) opens the real menu, and its measured values —
panel background/radius/shadow/padding/min-width, item padding/font/
line-height/gap, even the exact hover fill `rgb(249, 250, 251)` — were
compared against the live react-bootstrap version at the same route
before conversion. Every value matched exactly. That baseline is worth
re-capturing (open `Table/ActionsDropdown` in Storybook, click the
trigger, read `getComputedStyle`) before the later restyle, so drift is
caught immediately rather than discovered as a visual regression.

### What Radix replaces outright

Two workarounds in the old `ActionsDropdown` are gone because Radix does
the job natively: the module-level pub/sub that closed every other open
instance (Radix dismisses on outside pointer events on its own), and the
manual `createPortal(children, document.body)` (Radix's own `Portal` does
the same escape from the table's overflow/stacking context, while also
keeping the menu tied to its trigger for positioning and focus return).
`modal={false}` on the Root is a deliberate parity choice, not a
default — a modal Radix menu blocks outside pointer events and locks body
scroll, neither of which the Bootstrap dropdown did.

### The one real appearance gap: keyboard highlight

Bootstrap styles `.dropdown-item:hover`/`:focus`. Radix manages focus
itself and marks the active row with `[data-highlighted]` — set for
*both* keyboard navigation and pointer hover — so relying on `:focus`
leaves arrow-key navigation completely unhighlighted (`:focus` also stops
matching whenever the document itself isn't focused, which is exactly
the state a driven-but-unfocused test page is in — this is what a naive
"click and check `:focus`" verification would have missed entirely).
`src/metronic/sass/custom/_dropdown.scss` (new) maps
`.dropdown-item[data-highlighted]` to the same hover color, and
`.dropdown-item[data-disabled]` to the same disabled treatment Bootstrap
gave `.dropdown-item.disabled`/`:disabled` — necessary because a menu row
is a `<div role="menuitem">` now, not a `<button>`, so `:disabled` no
longer matches it at all.

Confirmed behaviorally in Storybook, not just visually: `ArrowDown`
correctly skips a `disabled` row entirely (lands on the next enabled one,
not on the disabled row with no highlight), and clicking a disabled row
does not fire its handler or close the menu.

### `.dropdown-toggle` stays on the trigger buttons

Both trigger button variants in `TableDropdownToggle` keep the
`.dropdown-toggle` class even though Radix supplies its own
`aria-haspopup`/`data-state` and has no use for Bootstrap's caret
pseudo-element (`no-arrow` already suppresses that). Removing it was
tried first and broke `.disabled-view`'s `table .dropdown-toggle,
.dropdown-toggle.btn-icon { display: none }`
(`src/metronic/sass/custom/_content.scss`) — every row-action toggle
reappeared in every read-only view. Caught by the existing
`MatrixChatHeader.test.tsx` suite, not by inspection — a reminder that
"the class only draws a pseudo-element" is exactly the kind of claim
worth grepping for before trusting it.

### `ActionsDropdownShellProps` vs. `ActionsDropdownProps`

`ActionsDropdownComponent` (the low-level Root+Trigger+Content shell) and
`ActionsDropdown` (the row-actions convenience wrapper with
`loading`/`error`/`actions`/`row`/`refetch`/`data`) intentionally have
different, non-identical prop types — mirroring how the original code
used react-bootstrap's own `DropdownProps` for the former and a separate,
wider `ActionsDropdownProps` for the latter. `ActionsDropdownComponent`'s
`...rest` is spread onto `RadixDropdownMenu.Content`, a real DOM element,
so if its prop type were widened to include the wrapper-only fields, a
caller could pass e.g. `data={{}}` straight to the shell and have it land
as a stray, unrecognized DOM attribute. Keep this split when touching
either type — collapsing them back into one interface silently reopens
the gap.

### New menu-only helper exports

Alongside `ActionsDropdown`/`ActionsDropdownComponent`, the file now
exports `ActionsDropdownItem` (the row itself — `forwardRef`, `onSelect`
not `onClick`), `ActionsDropdownItemText` (Bootstrap's
`.dropdown-item-text`, used by `ActionGroup`'s section caption),
`ActionsDropdownHeader` (`.dropdown-header`) and
`ActionsDropdownSeparator` (`.dropdown-divider`). Every file that
previously rendered a bare react-bootstrap `Dropdown.Item`/`.Divider`/
`.Header` inside an `ActionsDropdown` was converted to these — a plain
element dropped into a Radix menu renders and is clickable, but is
invisible to arrow-key navigation and typeahead and does not close the
menu on activation, so leaving one unconverted is a silent regression,
not a compile error.

A menu row rendering a link (`DropdownLink`, or a plain external `<a>`)
uses `<ActionsDropdownItem asChild><DropdownLink .../></ActionsDropdownItem>`
so the row *is* the anchor rather than nesting one inside a `menuitem`
div — this requires the link component itself to be `forwardRef`
(`DropdownLink` needed converting), for the same Slot-cloning reason
documented under BaseButton/Tooltip above.

### Test fallout: a menu row cannot render standalone anymore

Radix's `Item` reads menu context on render and throws `` `MenuItem`
must be used within `Menu` `` outside a `DropdownMenu.Root`/`Content` —
the single largest category of test failures this step produced (38 of
50 initial failures, across 16 files), since react-bootstrap's
`Dropdown.Item` had no such requirement and many action-button tests
rendered the row component directly.

`src/test/harness.tsx` now exports `inActionsMenu(children)`: an
already-`open`, non-`modal` Root/Portal/Content with **no Trigger** —
omitting the trigger is deliberate, since it would render a real
`<button>` into the test container and break "this renders nothing"
assertions that check for an empty container. Wrap any row-action
component's render call with it:

```tsx
renderWithProviders(inActionsMenu(<DeleteCreditButton row={row} />));
```

Two smaller, real fallout items, not just mechanical fixups:

- **`role="menuitem"`, not `role="button"`.** Rows are Radix menu items
  now — the more accurate role, since react-bootstrap's `Dropdown.Item`
  rendered a bare `<button>` with no menu semantics. Tests asserting on
  rendered actions via `queryAllByRole('button')` needed to switch to
  `'menuitem'`.
- **`aria-disabled`, not the `.disabled` class.** A disabled row is a
  `<div role="menuitem" aria-disabled="true">`, not a disabled
  `<button>`, so `toHaveClass('disabled')` assertions needed to become
  `toHaveAttribute('aria-disabled', 'true')` — real semantics assistive
  tech can read, where the old markup only looked disabled.

## Closing the remaining gaps: crash sweep + real Popover shell

Two follow-ups landed after the `ActionsDropdown`/`ActionItem` rewrite,
both found by systematically re-auditing the change rather than waiting
for the next bug report.

### The crash sweep: every remaining react-bootstrap `Dropdown` host

`ActionItem`'s default row changed from react-bootstrap's `Dropdown.Item`
(tolerates missing menu context) to Radix's `ActionsDropdownItem`
(throws `` `MenuItem` must be used within `Menu` `` outside one). Any
host still using a raw react-bootstrap `<Dropdown>` — or the separate
`ActionDropdownButton` host component, which had the identical problem —
broke the moment its menu opened. Found live in production as
`AddUserButton` crashing inside `project/team/TeamDropdownActions.tsx`.

Fixed by tracing the full blast radius rather than patching the one
report: every raw `<Dropdown>` host in the codebase (21) and every
`ActionDropdownButton` consumer (13), cross-referenced against all
`ActionItem` importers to find which of their rendered children resolve
to a Radix row by default. 12 hosts were genuinely affected — the rest
render only literal Bootstrap content and needed nothing.

`ActionDropdownButton.tsx` (13 consumers) was rewritten onto Radix,
mirroring `ActionsDropdownComponent` but keeping its own distinct toggle
markup — its caret rotates only while open, unlike
`TableDropdownToggle`'s permanently-rotated labeled variant; the two
triggers have always looked different, and unifying them is a separate,
visual-risk change from a bugfix. Six of the twelve hosts shared one
exact "+ Add" trigger (leading icon, label, trailing rotated caret) —
extracted once as `AddDropdownToggle` rather than copied six times.
`OfferingStateActions.tsx`'s react-bootstrap `Dropdown.Toggle split` and
`DeployPageActions.tsx`'s `bsPrefix`-overridden toggle both had their
*exact* rendered classes confirmed via a throwaway RTL render-and-inspect
probe rather than reconstructed from reading react-bootstrap's source —
`bsPrefix` turned out to replace the toggle's base class outright, not
append to it, which is easy to get backwards by inference alone.

Verified each of the 12 by rendering it under RTL, clicking its trigger,
and asserting a real `role="menu"`/`role="menuitem"` tree with no thrown
error. Not exhaustive by construction (a hand-picked list, however
carefully traced) — the mechanical remainder still worth double-checking
after any large call-site rewrite: re-grep for `<Dropdown[ >]` and every
standalone `Dropdown*` export (`DropdownItem`, `DropdownDivider`,
`DropdownButton`) after the fact, since `import { DropdownItem } from
'react-bootstrap'` doesn't match a `<Dropdown` or `\bDropdown\b` search
the way `Dropdown.Item` does. That second-pass grep caught four more
(non-crashing, since a bare `DropdownItem`/`DropdownDivider` doesn't
require context) — `ScriptEditorHeader.tsx`, `InvoicePayButton.tsx`,
`ResourceMultiSelectAction.tsx`, `BatchProjectActions.tsx` — converted
the same way.

### The real Popover shell: `ActionsPopoverComponent` / `ActionsPopoverItem`

The re-audit surfaced one case the crash sweep couldn't catch, because
it doesn't crash: `ScriptEditorHeader.tsx` renders a `FilterBox` search
input inside an `ActionsDropdownComponent` menu, predating this
migration entirely. `ActionsDropdownComponent` silently changed meaning
underneath it — from a Bootstrap-hosted panel (no typeahead) to a
Radix `DropdownMenu` (owns focus, treats character keys as typeahead
over its item collection) — without the file itself changing at all.

Confirmed empirically before touching anything, per the standing rule
that a `DropdownMenu` cannot host a text input (see "Menu vs. popover"
above): a focused `<input>` inside `DropdownMenu.Content` receives
ordinary keystrokes fine — until one happens to match a sibling item's
typeahead prefix, at which point focus silently jumps to that item and
every keystroke after is lost. Typing `alpha search text` next to an
item literally titled "Alpha" landed exactly `"a"` in the input.

Step 1 built `Popover`/`PopoverContent` in `packages/ui` for this exact
class of problem, but that primitive is Tailwind-classed — reaching for
it here would restyle this one menu into a different visual system than
every other dropdown in the app, exactly the "one axis at a time"
violation `ActionsDropdownComponent` itself was written to avoid. The
fix instead is `ActionsDropdownComponent`'s Popover-backed twin, added
alongside it in `src/table/ActionsDropdown.tsx`:

- **`ActionsPopoverComponent`** — identical shell, trigger and Bootstrap
  `.dropdown-menu` classing as `ActionsDropdownComponent`, on
  `@radix-ui/react-popover` instead of `@radix-ui/react-dropdown-menu`.
  Popover has no roving-tabindex item collection at all, so a focused
  input's keystrokes are never at risk of being reinterpreted.
- **`ActionsPopoverItem`** — the necessary companion, not an
  afterthought: `ActionsDropdownItem` wraps `RadixDropdownMenu.Item`,
  which reads `DropdownMenu`'s own collection context specifically and
  throws that identical "must be used within Menu" error under a
  Popover too (confirmed empirically — the same instinct that said
  "just reuse ActionsDropdownItem here" was tried and was wrong). A
  Popover has no item/menu concept to hook into, so this is deliberately
  a plain `.dropdown-item`-classed element instead, closed on activation
  via `RadixPopover.Close asChild` — confirmed to need no `forwardRef`
  on its composed child, since `Close` only merges an `onClick` and
  never positions anything the way `Trigger`'s ref does.

Root cause, restated as the standing check: **after converting any
`ActionsDropdownComponent`/`ActionDropdownButton` consumer — or when
reviewing one that predates this migration — grep its children for
`<input`, `FilterBox`, `<select`, `Form.Control`, or any other typeable
control.** A DropdownMenu is unsafe for that content even when nothing
throws; only a proximity-based re-scan (not a plain "does this file
mention Dropdown" grep) reliably finds it, since the offending file
often imports nothing indicating a problem — it is what its neighbor
imports that changed. Verified end-to-end with the adversarial case
itself: typing `API_KEY` while an `API_SECRET` row sits nearby now
reaches the search input intact and filters correctly.

## `NavMenu`: Metronic's own menu system on Radix

A *third* dropdown family, distinct from both `ActionsDropdown.tsx`
(replaces react-bootstrap's `<Dropdown>`, wears Bootstrap's
`.dropdown-menu`/`.dropdown-item` classes) and `packages/ui`'s Tailwind
`DropdownMenu`. The header/footer/sidebar-popup menus were never built on
react-bootstrap at all — they're driven by Metronic's own imperative
`MenuComponent`/`data-kt-menu-*` system (`src/metronic/components/
MenuComponent.ts`, a hand-rolled Popper.js wrapper) and wear Metronic's
own `.menu`/`.menu-sub`/`.menu-sub-dropdown`/`.menu-item`/`.menu-link`
classes (`src/metronic/sass/core/components/menu/`).

**Out of scope, deliberately**: the sidebar's *accordion* tree
(`.menu-sub-accordion`, `MenuAccordion.tsx`) shares this same stylesheet
and the same `MenuComponent`, but it is static in-flow expand/collapse
navigation, not a floating popup — a fundamentally different UI pattern
that belongs to Radix Collapsible/Accordion, not DropdownMenu. Converting
it is a separate task. A handful of other `data-kt-menu-*` attributes
across the sidebar (`Sidebar.tsx`'s root `data-kt-menu="true"`,
`ResourcesMenu.tsx`'s "show more" toggle, `OfferingsPanel.tsx`'s
dismiss marker) turned out to be vestigial — no sibling `.menu-sub` for
them to control, meaning Metronic's own JS already did nothing with them
today — and were left untouched rather than guessed at.

### `src/navigation/NavMenu.tsx`

Same "one axis at a time" principle as `ActionsDropdown.tsx`: Radix
supplies behaviour/positioning/accessibility, the *existing compiled*
Metronic CSS keeps supplying 100% of the appearance — no new visual
styling anywhere in this primitive.

`.menu-sub-dropdown`'s visibility and entrance animation are gated by
Metronic's own compiled `&.show[data-popper-placement] { display: flex;
animation: … }` rule — Popper.js's own attribute, whose *presence* alone
(not its value) is what the display-toggle actually checks.
`NavMenuContent`/`NavMenuSubContent` add that same `.show` class and a
`data-popper-placement` attribute themselves, so this rule fires exactly
as already compiled — shadow, radius, background, z-index, and the
default fade+move-up entrance animation are all reused unmodified, not
reimplemented. `data-popper-placement`'s *value* here is only a
"requested" placement string (`"bottom-start"`, `"left-start"`, …,
mirroring the `data-kt-menu-placement` values the original markup used) —
it does not track Radix's real post-collision-flip position, which Radix
doesn't expose in that string shape. The one place the *value* actually
matters — Metronic's animation picks "move down" instead of "move up"
when `[data-popper-placement^='top']` — is bridged in
`custom/_menu.scss` against Radix's own `data-side` attribute instead,
which *does* reflect any collision-driven flip, exactly the technique
`packages/ui`'s Tailwind `DropdownMenuContent` already documented using
for the identical animation.

**Keyboard highlight, harder than Bootstrap's version**: `.menu-link:hover`
is a plain CSS pseudo-class (mouse hover needs zero changes), but
Radix's `[data-highlighted]` needs a bridge — same gap as
`ActionsDropdown.tsx`'s `.dropdown-item[data-highlighted]`. Metronic is
harder here because, unlike Bootstrap's one dropdown theme, it ships
*many* `.menu-state-*` color themes (grays, bg-light, title-primary, …),
each with its own hover color/background compiled from
`menu-link-hover-state`. A single guessed bridge color the way
`ActionsDropdown` uses would be wrong for most of them. The fix greps for
which theme classes the app *actually* uses (three, not the full
10+-variant set: `menu-state-bg-gray`, `menu-state-bg-light`,
`menu-state-title-primary`) and, for each, calls `menu-link-theme`
directly with the *same literal color arguments* `menu/_theme.scss`
already passes it for `:hover` — retargeted from `:hover`/`.hover` onto
`[data-highlighted]`, without touching `core/` (`_theme.scss`,
`mixins/_menu.scss` stay vendor-pristine) and without duplicating
variants nothing in this app uses.

### The `.menu-item` / `.menu-link` split

Metronic's markup convention nests a real interactive element
(`.menu-link` — an `<a>`, `<Link>`, or plain `<div>`) inside a
non-interactive layout wrapper (`.menu-item`). `NavMenuItem` (and
`NavMenuSubTrigger`) attach Radix's Item/SubTrigger behaviour directly to
the *inner* `.menu-link` element — matching how `ActionsDropdownItem`
attaches Bootstrap's `.dropdown-item` class directly to the Radix Item
rather than to a separate wrapper — and render the outer `.menu-item` as
a plain, non-Radix `<div>` purely for layout parity.

`NavMenuSubTrigger`'s `.menu-arrow` chevron is opt-in (`arrow` prop,
default `false`), not automatic: neither of this migration's two real
submenu call sites (`LanguageSelectorDropdown`, `UserDropdownMenuItems`)
rendered that element in their original markup, so defaulting it on
would have silently added a visual element that wasn't there before —
checked per call site, not assumed from the primitive's own name.

### Plain (non-`NavMenuItem`) content is a first-class case, not a gap

`UserDropdown.tsx`'s account menu mixes real command rows (profile
tabs, language picker, logout — need `NavMenuItem`/`NavMenuSub`) with
persistent interactive widgets that must *not* auto-close the menu on
interaction: `ThemeSwitcher`'s checkbox, `UserToken`'s readonly field +
Copy button, `UserIpAddress`'s Copy button. Wrapping any of these in
`NavMenuItem` would trigger Radix's default select-and-close behaviour —
exactly wrong for a settings toggle or a copy action the user expects to
keep the menu open through. They're rendered as plain children of
`NavMenuContent` instead — never registered with Radix's menu machinery
at all, so their own click handlers fire completely undisturbed. This
mirrors how `ActionsDropdown.tsx`'s Popover twin exists for "needs a real
text input"; here the equivalent case is "needs to survive its own
click" — plain content, not a special primitive, is the shell's built-in
answer to it. Confirmed with a real interaction test, not assumed: click
each and assert the menu is still open afterward.

### `DropdownMenuSub` selection only closes the submenu, not the root

Radix's own deliberate default: selecting an item nested inside a
`DropdownMenuSub` closes that `Sub` but leaves the root `DropdownMenu`
open. Found while testing `LanguageSelectorDropdown` — picking a language
left the account menu itself open. Not treated as a bug to route around:
`setLanguage` already calls `location.reload()` a second later, so the
whole page (menu included) is gone regardless by the time it would
matter, and forcing a full-tree close for this one case would mean
fighting Radix's own considered UX default (a nested submenu selection
not nuking an unrelated parent menu is often exactly what you want)
rather than reusing it.

### Verification

No pre-existing test exercised any of this beyond one static data-mapping
check (`LanguageSelectorDropdown.test.tsx` only tests `LanguageCountry`,
never renders the component). Verified instead with real interaction
tests written for this change: the Language submenu opens on hover *and*
click and lists real entries; picking one calls `setLanguage` and closes
only that submenu; the theme checkbox toggles the theme without closing
the menu; the token/IP Copy buttons don't close the menu either;
arrow-key navigation actually highlights a row
(`.menu-link[data-highlighted]` present); the logged-out state renders
Sign-in instead of the profile summary and omits Log out entirely;
`UserDropdownMenuItems`' own leaf-vs-submenu branching renders a plain
link row for a childless item and a real, openable submenu for one with
children. Full suite: 526 test files / 3514 tests pass, 0 lint errors,
tsc clean, build passes.

## Footer and tabs: the second `NavMenu` cluster, and hover-on-desktop

Second cluster of the Metronic `.menu`/`.menu-sub-dropdown` migration
(`src/navigation/NavMenu.tsx`, introduced for the header account menu —
see that section above for the primitive itself and why it exists).
Converted: the footer's `Support`/`Legal & Privacy` dropdowns
(`FooterDropdown.tsx` + its consumers) and the app's top-level section
tabs (`TabsList.tsx`, `Toolbar.tsx`, `PageBarTabs.tsx`'s in-page sub-tabs).

### `useHoverMenu`: a top-level trigger that opens on hover

Both `FooterDropdown.tsx` and `TabsList.tsx`'s parent-tab-with-children
case carried the exact same original attribute:
`data-kt-menu-trigger="{default: 'click', lg: 'hover'}"` — click below the
`lg` breakpoint, hover at `lg` and up. This is a harder gap than the
header cluster's submenus: Radix's `SubTrigger` opens on hover natively,
but these are *top-level* `Trigger`s, and Radix's plain
`DropdownMenuTrigger` only ever opens on click/keyboard with no hover
mode at all. `useHoverMenu()` (`@/navigation/NavMenu`) reproduces it by
hand — `open` lifted and controlled, `hoverHandlers` spread onto *both*
the trigger and the content (mouseleave on either one alone closes the
menu the instant the pointer crosses the small visual gap between button
and panel while moving toward it), gated to `lg`+. The 200ms
close-on-leave delay isn't invented: it's Metronic's own MenuComponent
default (`defaultMenuOptions.dropdown.hoverTimeout`,
`src/metronic/components/MenuComponent.ts`), ported so a pointer
momentarily leaving the panel while crossing back toward the trigger
doesn't visibly flicker the menu shut.

`PageBarTabs.tsx`'s in-page sub-tabs carried a *different* original value
— the plain string `data-kt-menu-trigger="hover"`, with no responsive
`{default: 'click', ...}` variant at all. `useHoverMenu(false)` skips the
`lg`+ gate for this one case — hover is unconditional at every viewport
width, matching that literal attribute value rather than assuming every
hover-trigger in the app was the responsive kind.

Testing `useMediaQuery`-gated behavior directly hit a real environment
limit worth recording: this project's jsdom has no `window.matchMedia` at
all (`typeof window.matchMedia === 'undefined'`), and `react-responsive`'s
own `matchmediaquery` dependency captures whatever `window.matchMedia`
resolves to *at module-import time* — so reassigning
`window.matchMedia = vi.fn(...)` inside a test has zero effect, silently.
The fix is `vi.mock('react-responsive', () => ({ useMediaQuery:
mockFn }))` instead, controlling the hook's return value directly rather
than trying to make the browser API state behave through several layers
of indirection.

### Mobile accordion vs. dropdown: a deliberate simplification, checked first

Metronic's own CSS gives `TabsList.tsx`'s parent-with-children tab *two
different layout modes* depending on viewport — an inline accordion below
`lg` (`.menu-lg-down-accordion`, `.menu-sub-down-accordion`) and a
floating popup at `lg`+ (`.menu-sub-dropdown`) — a bigger difference than
FooterDropdown's "same popup, different open-trigger" case, since Radix's
`DropdownMenu` has no built-in inline/floating layout switch at all.

Checked rather than assumed before simplifying: `MenuComponent.ts`'s own
click handler never calls `preventDefault()` on this trigger (the line is
present in the source, commented out — a deliberate vendor choice, not a
gap) — and `Link.tsx`'s own `onClick` always fires its state transition
regardless of what Metronic's accordion toggle does. So clicking this row
*already* navigates away immediately in the common case (every real
`parentTab` here carries its own `to`/`redirectTo`), remounting the whole
tree and making whatever the accordion was doing underneath it invisible
in practice today. Reproducing a true inline-accordion mode would
faithfully replicate a mode nothing can actually observe; both
breakpoints collapse to the same hover-capable Radix dropdown instead —
simpler, and already what `lg`+ users see today. If a `parentTab` ever
exists with children but no `to`/`redirectTo` of its own, this
simplification is the one place in the whole migration worth re-checking
against real usage before trusting it further.

### Verification

No prior test existed for `TabsList.tsx`/`PageBarTabs.tsx` at all (only
`FooterDropdown.test.tsx` existed, and — like the header cluster — it
only worked because Metronic kept submenu content in the DOM at all times
just CSS-hidden; Radix mounts on open, so `getByTestId('child')` had to
move behind a real click first, matching every other test adaptation in
this migration). Two existing tests needed a second, different fix:
`LegalPrivacyMenu.test.tsx` mocks `FooterDropdown` entirely, and its
mock — a plain `<div>{children}</div>` — stopped providing real Radix
menu context the moment `LegalPrivacyMenu`'s own rows became real
`RadixDropdownMenu.Item`s; the mock now wraps children in a minimal real
`RadixDropdownMenu.Root`/`Content` instead of a plain div.

`TabWithChildren` and `PageBarTabItemWithSubTabs` are exported
specifically for isolated testing — `TabsList`'s own `useOnStateChanged`
call needs a full `<UIRouter>` context this project's router mock doesn't
provide (pre-existing, unrelated to this migration), so testing the new
Radix behavior in isolation was the tractable path. Verified: the
dropdown opens on click regardless of viewport and lists real,
keyboard-reachable `menuitem` rows; the `here`/active class still applies;
`FooterDropdown`'s hover state machine — opens on hover, stays open
immediately after leaving, closes ~200ms later, and re-entering the panel
within that window cancels the pending close — all confirmed with fake
timers; `PageBarTabItemWithSubTabs` opens on hover with no viewport gate,
and its trigger's own scroll-to-section click still fires independently
of the dropdown. Full suite: 526 test files / 3514 tests pass, 0 lint
errors, tsc clean, build passes.

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
