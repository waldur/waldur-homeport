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

## Fix: footer `MenuItem` crashed outside `FooterDropdown`

Reported live in production, straight after the footer/tabs cluster
landed: `` `MenuItem` must be used within `Menu` `` from
`src/navigation/footer/MenuItem.tsx`. Same root cause as the much larger
crash sweep earlier in this migration (see "Fix: 'MenuItem must be used
within Menu' crash on 12 dropdown hosts" above), at much smaller scale —
worth recording anyway, because the way it slipped through is instructive.

`MenuItem.tsx` has three real call sites, and only *one* of them is
inside a real Radix menu:

- `MobileMenu.tsx`'s **grouped** case (2+ dynamic items) — nested inside
  `FooterDropdown.tsx`'s `NavMenuContent`. Real menu context.
- `FooterLinks.tsx`'s **desktop** layout — renders `MenuItem` directly as
  a `<ul>` child, no `FooterDropdown` anywhere above it.
- `MobileMenu.tsx`'s **ungrouped** case (< 2 items) — returns `MenuItem`
  elements directly, same as above, no menu ancestor.

The conversion had used `RadixDropdownMenu.Item` internally (matching the
sibling files in that same commit — `IssuesLink.tsx`, `DocsLink.tsx`,
`LegalPrivacyMenu.tsx`'s `FooterMenuLink` — which all happen to have
exactly *one* call site, always inside a real menu). `MenuItem.tsx` was
checked against grep for "does `<MenuItem` appear inside a `FooterDropdown`
render" and confirmed for the grouped case, but the other two standalone
paths weren't independently re-verified before commit — a narrower audit
than the crash-sweep methodology used earlier in this migration, which
is exactly why it should have been re-run here too: a component's
default behaviour has to work in *its narrowest real host*, not its
richest one, and confirming that requires enumerating every host, not
just the one being actively edited.

Fixed by reverting `MenuItem.tsx` to a plain `<Link>` — no
`RadixDropdownMenu.Item` at all, safe in all three contexts, at the cost
of the grouped-mobile case not getting real ARIA `menuitem` semantics
(a minor, accepted trade against a hard crash in the other two). A new
`MenuItem.test.tsx` renders all three real host shapes without mocking
`MenuItem` itself (`FooterLinks.test.tsx`'s existing mock of `MenuItem`
is exactly why that suite couldn't have caught this) so this specific
regression can't reappear silently. Full suite: 527 test files / 3517
tests pass (527/3517, up from 526/3514 with the new test file), 0 lint
errors, tsc clean, build passes.

## Fix: `TabWithChildren` arrow animation and item colour regression

Reported live via screenshots, straight after the footer/tabs cluster
landed: the "Credentials" top-level tab's caret no longer flipped/coloured
on open, and its dropdown rows rendered brand-green instead of gray. Two
independent bugs in `src/navigation/TabsList.tsx`'s `TabWithChildren`,
both pre-existing gaps this migration exposed rather than something the
Radix conversion itself broke incorrectly:

**Arrow rotation/colour.** `custom/_menu.scss`'s `.header-menu .menu-item`
block keys its `.menu-arrow` colour+rotation off Metronic's own
`.show`/`.here`/`.hover` classes, added by the old `MenuComponent.ts`'s
`_showDropdown` (`item.classList.add('show')`). Nothing adds `.show`
anymore now that Radix drives open/close, so the caret was permanently
stuck in its default (closed, gray-500) state. Fixed by adding a parallel
`[data-state='open']` rule block, bridging onto the attribute
`RadixDropdownMenu.Trigger asChild` already sets on the same
`.menu-item`-classed element — no new wiring needed, unlike the
`[data-highlighted]`/`data-side` bridges elsewhere in this file, since
`data-state` lands there automatically. See the comment directly above
the new rule in `custom/_menu.scss` for the full reasoning.

**Item colour.** `TabWithChildren`'s `NavMenuContent` was missing the
`.menu-gray-600` class that `UserDropdown.tsx`'s identical
`menu-state-bg-gray` dropdown already carries (`menu-dropdown-default
menu-column menu-gray-600 menu-state-bg-gray ...`). Without it, nothing
in the compiled CSS overrode Bootstrap's base `a { color:
var(--waldur-brand-700) }` rule, so every row rendered brand-green
regardless of Radix. Confirmed via `MenuComponent.ts`'s `_showDropdown`
that the *original*, pre-Radix code had the exact same gap — Metronic's
own JS only ever toggled classes on the trigger/content, never on child
rows — so this half was a latent bug the conversion surfaced, not one it
introduced. Fixed by adding `.menu-gray-600` to match `UserDropdown.tsx`'s
proven pairing.

**Verification.** Both fixes were confirmed against real compiled CSS via
a temporary Storybook story (`UIRouter`-wrapped, since the vitest router
mocks don't apply outside vitest), deleted before commit. Simulating a
Radix open/close toggle with `dispatchEvent(PointerEvent...)` (a plain
`.click()` doesn't trigger Radix's pointer-based open) and reading
computed style confirmed: `mask`/`background-color` on the arrow
correctly switch between transparent (closed) and
`var(--waldur-brand-600)` (open), and item text is gray-700
(`rgb(71, 84, 103)`) instead of brand-green in both states. The `transform`
computed value itself is unreliable to read this way in this specific
non-composited headless environment — CSS transitions never tick without
real compositing, freezing `getComputedStyle` mid-animation regardless of
wait time — confirmed by disabling `transition` entirely (`* {
transition: none !important }`) and re-reading: with that isolation,
`data-state="closed"` reads `rotateZ(90deg)` (pointing down, the existing
default) and `data-state="open"` reads `rotateZ(270deg)` (pointing up,
matching Metronic's original `.show`-keyed rotation exactly). Full suite:
527 test files / 3517 tests pass, 0 lint errors on the changed files, tsc
clean, build passes.

## Fix: `NavMenuSub` entrance animation stutter (Language flyout)

Reported live via screencast, after the arrow/colour fix above landed:
the language submenu (`LanguageSelectorDropdown`, opened from
`UserDropdownMenu`) "opens fine, but flickers visually" — a visible
jump/stutter during the slide-in, not a functional failure (confirmed by
isolated Storybook reproduction: the underlying `NavMenuSub`/hover-intent
mechanism opens reliably and stays open with no flicker in isolation, so
the bug had to be about the animation itself, not Radix's hover logic).

Root cause: `.menu-sub-dropdown.show[data-popper-placement]`'s entrance
animation (core's `menu-sub-dropdown-animation-move-up`/`-down`,
`core/components/menu/_base.scss`) animates `margin-top`/`margin-bottom`
— a layout-affecting property. Radix's positioning (Floating UI) watches
the content element with a `ResizeObserver` and repositions on any size
change, so every animation frame is itself a resize the observer reacts
to — the CSS keyframe and Radix's own repositioning fight over the same
box on every frame, producing the reported jitter. This is specific to
Radix content: the still-Popper.js-driven menus elsewhere in the app
(`TableFiltersMenu`, `AsyncSearchBox`, etc. — not yet migrated to
`NavMenu`) don't hit it, since Popper.js's own reposition cycle isn't
wired to a `ResizeObserver` the same way.

Fixed in `custom/_menu.scss` with a `translate`-based replacement
(`menu-sub-dropdown-radix-move-up`/`-down`), scoped to Radix content only
via the `[data-side]` attribute (Radix-exclusive — Popper.js never sets
it) alongside the existing `data-popper-placement` requirement. `translate`
was chosen deliberately over `transform`: Radix's own inline style already
uses `transform` for positioning, and animating that same property via a
CSS keyframe would have overridden it entirely for the animation's
duration (a worse bug — the popup would render at the wrong position,
snapping back only when the animation ended). `translate` is a separate,
composable CSS property that doesn't affect layout and doesn't touch
Radix's own `transform`, so it removes the `ResizeObserver` fight without
that risk. The fade half of the animation is untouched (reuses core's own
`menu-sub-dropdown-animation-fade-in` — opacity never affects layout, so
it was never part of the problem).

Verified in Storybook: the compiled `animationName` on the open
`SubContent` switched from the core (margin-based) keyframes to the new
`translate`-based ones, and the panel's `getBoundingClientRect()` stayed
at the correct, stable position throughout — no jump from the `translate`
addition. Live login on the local dev stack to confirm the *visual*
smoothness directly wasn't possible at the time (the seeded `staff`/`demo`
credentials didn't match this instance), so this was verified structurally
rather than by eye — user confirmed afterwards, on their own logged-in
session, that the flicker is gone. Full suite: 526 test files / 3513 tests
pass (2 pre-existing, unrelated flaky tests confirmed by re-running in
isolation), 0 lint errors on the changed files, tsc clean, build passes.

## Fix: `ActionsDropdown` toggle carets didn't rotate correctly — two rounds

Reported live via screenshot, right after the animation-stutter fix
above was confirmed: the "Actions" button's caret (`TableDropdownToggle`
in labeled mode, `src/table/ActionsDropdown.tsx`) stayed pointing down
while the menu was open, instead of flipping to point up.

**Round 1 — the `.show`/`data-state` gap.** The caret's rotation comes
from a *generic*, non-menu-specific rule in `custom/_base.scss` —
`.show, .active, .collapsible:not(.collapsed) > .rotate-180 { transform:
rotateZ(180deg); … }` — which requires the *parent* element to carry one
of those three classes. A react-bootstrap `<Dropdown.Toggle>` added
`.show` to the toggle button itself while open, satisfying this;
`RadixDropdownMenu.Trigger asChild` sets `data-state="open"` on that same
button instead, which the rule never checked for, so the caret was stuck
closed once react-bootstrap's `<Dropdown>` was replaced with
`ActionsDropdownComponent`. Same category of bug as the two entries
above (`.show`-class styling silently orphaned by a Radix conversion that
sets `data-state` instead). Fixed with a narrowly-scoped bridge in
`custom/_dropdown.scss` — `.dropdown-toggle[data-state='open'] >
.rotate-180` — rather than widening the shared `_base.scss` rule, which
also drives real, unrelated non-Radix collapsibles (`AccordionCard`,
sidebar menus) that already worked correctly off `.show`/`.active`.
Verified in Storybook against the *open* state only — caret correctly
read `matrix(-1, 0, 0, -1, 0, 0)` (`rotate(180deg)`) — and shipped.

**Round 2 — the real, larger bug this masked.** The user then reported a
second, opposite-looking symptom: an unrelated "+ Add ▾" toggle
(`AddDropdownToggle`, same file) showed its caret stuck pointing *up*
while its menu was *closed*. Re-verifying round 1's "Actions" button
against its own closed state (never actually checked — round 1 only
tested open) found the identical thing: `data-state="closed"` yet the
caret computed `rotate(180deg)` anyway. Root cause: Tailwind (enabled
app-wide since "Enable Tailwind in the app bundle") content-scans every
source file for class-name-shaped strings and generates a real utility
for anything matching `rotate-<number>` — including a bare `.rotate-180`
used as a *Metronic* class name, with no idea that's what it was. Its
generated `.rotate-180 { rotate: 180deg }` utility lives in the
`utilities` layer, declared last in `theme, base, bootstrap, utilities`
— `@layer` ordering beats specificity across layers entirely, so it won
unconditionally over both `_base.scss`'s gated rule *and* round 1's new
bridge, rotating the icon any time the class was merely present in the
DOM, regardless of `.show`/`.active`/`data-state`. This affected every
static (always-present, parent-class-gated) use of the literal
`rotate-180` class app-wide, not just the two reported: `AccordionCard`,
`TableHeader`, `TableBody`, `ActionsDropdown` (both toggles),
`ResourcesMenu`, `MarketplaceLandingFilter`, `RoleAndProjectSelectField`,
`ResourceAccessButton`. `ActionDropdownButton.tsx` was the one exception
(checked in round 1 and still correct): it applies the class
*conditionally* from JS state (`isOpen && 'rotate-180'`), so Tailwind's
unconditional rule only ever fires exactly when the app already wants it
to — an accidental match, not evidence the collision wasn't real there
too. `aui-icon-rotate-180` (Matrix chat sidebar, a different, already
app-prefixed class) was never affected — the substring just happens to
contain "rotate-180".

Fixed by renaming the Metronic class everywhere: `rotate-180` →
`rotate-toggle-180`, across both `custom/_base.scss` and
`custom/_dropdown.scss` and all nine real TSX usage sites. First attempt
at this rename picked `rotate-active-180` — which turned out to itself
collide with a *pre-existing, differently-scoped* Metronic utility
(`core/components/_rotate.scss`'s `@each $value in (90, 180, 270)` loop
generates `.rotate-#{$value}` conditional, `.rotate-n#{$value}` negative
conditional, *and* `.rotate-active-#{$value}` — the last one
unconditional, always-rotated, unrelated to open/closed state at all).
That's also what `rotate-active-90` (`FooterDropdown.tsx`'s arrow) really
is — a real, meaningful utility, not the dead code an earlier CSSOM-walk
check in this same document mistakenly concluded (that check's own
matching bug, corrected here). `rotate-toggle-180` avoids both
collisions: not a bare `rotate-<number>` Tailwind can parse, and not one
of core's own three generated `rotate-*-<number>` families.

Verified in Storybook, this time checking *both* states with real
pointer-down/up sequences (a plain `.click()` doesn't reliably trigger
Radix's open state) and CSS transitions disabled: closed reads
`transform: none` (down), open reads `matrix(-1, 0, 0, -1, 0, 0)` (up),
confirmed on both the "Actions" and "Add" toggles. Full suite: 526 test
files / 3514 tests pass (1 pre-existing, unrelated flaky test confirmed
by re-running in isolation), 0 lint errors on the changed files (one
Prettier line-length wrap from the longer class name, auto-fixed), tsc
clean, build passes.

The lesson for any *future* Bootstrap/Metronic-to-Radix conversion:
grep for `> .rotate-180`-style parent-gated selectors before shipping,
not after — and, now that Tailwind shares the bundle, treat any bare
short/numeric-looking custom class name as a name Tailwind might also
generate a utility for, not just a name Bootstrap/Metronic happens to
already use.

## Fix: `ActionItem` crashed inside `ModalActionsDialog`'s "show all" search

Reported live in production, pasted stack trace: `` `MenuItem` must be
used within `Menu` `` from `ActionsDropdownItem` → `ActionItem` →
`DialogActionItem` → `ForceDestroyAction`. Same root class of bug as the
footer `MenuItem` crash earlier in this migration — a shared component
rendered in a context its default assumes it will never see.

`ActionItem` (`src/resource/actions/ActionItem.tsx`) defaults to
rendering as `ActionsDropdownItem` — a real `RadixDropdownMenu.Item` —
unless a caller passes its own `as`. Every resource-type action list
(`OpenStackInstanceActions` and siblings, registered via
`ActionsLists.tsx`) is written once and reused in *two* real places:

- `ActionsPopover.tsx`'s inline quick-actions preview, inside
  `ActionsDropdownComponent` — a real Radix menu. Safe.
- `ModalActionsDialog.tsx`'s "show all actions" search results, reached
  via that preview's own "Show all" link — rendered inside
  `ActionDialogBody`, a plain react-bootstrap `Modal`, no Radix ancestor
  of any kind. `RadixDropdownMenu.Item` throws immediately outside a
  Root/Content. Every action in every resource type's list hit this the
  moment someone opened "show all" — `ForceDestroyAction` is just the one
  a live stack trace happened to name.

Fixed by teaching `ActionItem` to switch its default `Component` based on
context, the same way it already reads `ResourceActionMenuContext` for
`query`/`hideDisabled`/`hideGroupName`/`hideNonImportant`. A new
`notInMenu` field, set by `ActionDialogBody` (not `ActionsPopover`,
which stays on the real-menu default), switches `ActionItem` to a new
`PlainActionItem` (`src/table/ActionsDropdown.tsx`) — same `.dropdown-item`
appearance and `onSelect` API as `ActionsDropdownItem`, but a plain native
`<button>` with zero Radix dependency, so it works with no ancestor at
all. Neither of the two existing non-menu options fit: `ActionButton`/
`CompactActionButton` (already available via `ActionItem`'s `as` prop)
render as visually distinct buttons, wrong for a list of search results
styled as dropdown rows; `ActionsPopoverItem` (built earlier in this
migration for the same "real row styling, no Menu semantics" need) still
needs a `RadixPopover.Root`/`Content` ancestor via its own
`RadixPopover.Close asChild`, which `ActionDialogBody` doesn't have
either — this modal has no Radix primitive backing it whatsoever.

Added `ActionItem.test.tsx`, a permanent regression test rendering
`ActionItem` in both real contexts without mocking it — inside a real
`ActionsDropdownComponent` (asserts the default Radix path still selects
and closes correctly) and standalone under
`ResourceActionMenuContext.Provider value={{ notInMenu: true }}` with no
Radix ancestor at all (asserts it doesn't throw and still fires the
action on click). Full suite: 527 test files / 3516 tests pass (1
pre-existing, unrelated flaky test confirmed by re-running in isolation),
0 lint errors on the changed files, tsc clean, build passes.

## Fix: `TabWithChildren` submenu font didn't match its own trigger

Reported live via screenshot: the "Accounting" tab's dropdown ("Invoices",
"Payment profiles") rendered in a visibly lighter, smaller-looking font
than "Accounting"/"Policy" themselves — same `TabWithChildren` component
as the two fixes above (`TabsList.tsx`), this time hit through the
organization/customer tabs rather than the user-profile ones, since
`TabsList` is the one shared component behind both (`Toolbar.tsx`'s only
consumer).

Root cause: `Toolbar.tsx` wraps the whole top-level tab bar in `fs-6
fw-bolder` (`.menu.menu-row...fs-6.fw-bolder`), but `TabWithChildren`'s
own dropdown `NavMenuContent` set neither — no font-size or font-weight
class at all — so it fell back through the cascade to whatever
`.menu-dropdown-default`/Bootstrap defaults resolve to, visibly lighter
and marginally smaller than the trigger row above it. `UserDropdownMenu`
(a sibling dropdown, `src/navigation/header/UserDropdown.tsx`) already
sets `fw-bold fs-6` on its own content and was never reported with this
problem — the reference this fix matches, though not literally: this app's
`_variables.scss` redefines Bootstrap's `$font-weight-bold`/`$font-weight-bolder`
as absolute values (500 / 600, not Bootstrap's default 700 / the relative
keyword `bolder`), so `.fw-bold` (500) alone would have been visibly
lighter than the trigger's own `.fw-bolder` (600) — confirmed by measuring
both, not assumed. Used `fw-bolder`, matching the trigger's own weight
exactly rather than the close-but-not-identical `fw-bold` UserDropdownMenu
uses, since the user asked for the submenu to match "the menu itself"
specifically, not just look similar.

Verified in Storybook, wrapped in the same `fs-6 fw-bolder` toolbar
classes `Toolbar.tsx` actually uses: trigger and every dropdown item now
compute the identical `font-size` (14.001px), `font-weight` (600), and
`font-family`. Full suite: 527 test files / 3516 tests pass (1
pre-existing, unrelated flaky test), 0 lint errors, tsc clean, build
passes.

## Fix: `TabWithChildren` rows showed a stray focus outline on hover

Reported live via screenshot: hovering a row in the "Credentials"
dropdown ("Remote accounts") drew a harsh black rectangle around it —
same `TabWithChildren` component as the three fixes above, a fourth
distinct bug in the same handful of lines.

Root cause: unlike every other converted menu in this migration,
`TabWithChildren`'s children didn't use the shared `NavMenuItem`
primitive — they hand-rolled `RadixDropdownMenu.Item asChild` around a
`<Link className="menu-item">` wrapping an *inner* `<span
className="menu-link">`. That split the two classes core CSS expects
together: `.menu-link:focus-visible { outline: … }` /
`:not(:focus-visible) { outline: none }`
(`core/components/menu/_base.scss`) target `.menu-link` directly, but
here `.menu-link` was the *inner* span while the *actual* focused
element — the real `<a role="menuitem">`, Radix's roving-tabindex target
— only ever carried `.menu-item`. Neither focus rule ever matched the
real element, so it fell through to the browser's unstyled native focus
outline instead — and Radix moves roving focus to a row on pointer hover
too, not just keyboard nav, so the raw outline appeared on mouse hover,
not only Tab.

`NavMenuItem` (`src/navigation/NavMenu.tsx`) already exists specifically
to keep these two classes on the right elements — `LogoutMenuItem.tsx`
and every other converted row in this migration already uses it
correctly. Fixed by switching `TabWithChildren`'s children to it too:
`<NavMenuItem asChild><Link>…</Link></NavMenuItem>` puts `.menu-link` via
Slot directly onto the rendered `<a>`, dropping the now-redundant inner
span and the manual `className="menu-item"` (`NavMenuItem`'s own
wrapping `<div>` supplies that instead). No visual change beyond the fix
itself — same classes end up in the DOM, just on the elements the shared
CSS actually expects them on.

Verified in Storybook: the rendered row is now `<a class="menu-link"
role="menuitem">` directly (previously `.menu-item` on the `<a>`,
`.menu-link` on a nested span) — a real pointer-hover-driven focus
(`pointerover`/`pointermove`, not `.focus()`) now correctly fails
`:focus-visible` and computes `outline-style: none`, while item text
colour (`rgb(71, 84, 103)`, the earlier fix) is unaffected. Full suite:
528 test files / 3519 tests pass (0 flaky this run), 0 lint errors, tsc
clean, build passes.

## Fix: caret rotation animated opening but snapped shut on close

Reported live: "when dropdown menu or table expandable is collapsed,
caret rotation animation is not rendered - but should" — affecting the
`rotate-toggle-180` family from the previous two fixes (`ActionsDropdown`
toggles, `TableBody`'s row-expander caret) *and* `TabWithChildren`'s own
separate `.menu-arrow` rotation, all three sharing the same underlying
mistake.

Root cause, pre-existing (not introduced by this migration, just never
fixed): every one of these rules declared `transition: transform 0.3s
ease` *only inside* the conditional block that also sets the rotated
`transform` — `.active > .rotate-toggle-180 { transform: …; transition:
… }`, `.dropdown-toggle[data-state='open'] > .rotate-toggle-180 {
transform: …; transition: … }`, `.header-menu .menu-item[data-state='open']
> .menu-link .menu-arrow:after { transform: …; transition: … }`. A CSS
transition only animates a property change if the *element's current
computed style* declares `transition` for it — and the instant the
triggering class/attribute is removed (collapsing), that whole
conditional selector stops matching, so `transition` reverts to unset
along with `transform`. The rotation still changes value, just
instantly: opening animates (the matching rule carries its own
transition), closing snaps.

Core's own sibling utilities (`core/components/_rotate.scss`'s
`.rotate-{value}` family) never had this bug — they declare `transition`
once on the always-present base class, with only `transform` inside the
conditional block. Fixed the three custom rules the same way: moved
`transition: transform 0.3s ease` (or `get($menu, accordion,
arrow-transition)`, the same value) onto each rule's unconditioned base
selector — `.rotate-toggle-180` itself (`custom/_base.scss`), `.header-menu
.menu-item > .menu-link .menu-arrow:after` (`custom/_menu.scss`) — leaving
only `transform` inside the conditional blocks, including the
`custom/_dropdown.scss` bridge from the caret-rotation fix (now
redundant to duplicate `transition` there too, so removed).

Verified in Storybook: the *closed* state's computed `transition` — read
without any interaction, so provably not a leftover from a still-running
animation — now reads `"transform 0.3s"` on all three (previously would
have been unset/`"all 0s ease 0s"`), confirming the reverse animation now
has something to animate with. Full suite: 528 test files / 3519 tests
pass (0 flaky this run), 0 lint errors, tsc clean, build passes.

## Migrating the remaining Metronic menus

The last real cluster of `data-kt-menu-trigger`/`MenuComponent`-driven
floating menus in the app, requested directly ("migrate remaining
metronic menu to radix") rather than surfaced by a live bug report like
the fixes above. Five files, in increasing order of coupling:

- `src/core/async/AsyncSearchBox.tsx` — a search input that opens a
  results dropdown as the user types.
- `src/marketplace/deploy/steps/BoxRadioField.tsx` — a per-choice
  "version" options dropdown nested inside a radio card.
- `src/invitations/actions/create/RoleAndProjectSelectField.tsx` — a
  two-level role→project picker with its own search input.
- `src/table/TableFiltersMenu.tsx` / `TableFilterItem.tsx` /
  `TableBody.tsx`'s `InlineFilterButton` — the table filters subsystem:
  three files sharing `TableFilterContext` and, previously, global
  `MenuComponent.hideDropdowns(null)`/`.reinitialization()`/`.getInstance()`
  calls, converted together as one unit rather than incrementally (asked
  and confirmed with the user first, given the coupling).

### Why Popover, not DropdownMenu, for all five

Every one of these panels holds a real form control — a search input,
`WindowedSelect`, a `Select`, a filter's own arbitrary field — so all
five use `RadixPopover`, never `RadixDropdownMenu`. This is the same
reasoning as `ActionsPopoverComponent` earlier in this migration: a
DropdownMenu owns focus with a roving tabindex and treats keys as
typeahead over its own item collection, which steals keystrokes from a
focused text input the moment one matches a sibling row's label. Every
one of these five files' tests deliberately re-runs that adversarial
check — type a full word into the panel's own input, assert every
character landed — rather than just asserting the panel opens, since
"opens correctly" alone doesn't catch this class of bug.

### `TableFiltersMenu`'s nested nature: `FlyoutRow`

`SaveFilterItems`'s "Current filters"/"Saved filters" rows, and every
individual `TableFilterItem`, fly out a sub-panel to the *right* of the
outer list — core's own `.menu-sub` flyout shape. Radix's Popover has no
built-in "Sub" the way DropdownMenu does, but nesting one Popover inside
another's Content works fine (each has its own independent open state),
so `FlyoutRow` (`TableFiltersMenu.tsx`) is that pattern factored out:
`RadixPopover.Root` + `Trigger asChild` on the row + `Content` on the
flyout, reusing `.menu-sub menu-sub-dropdown show` exactly like every
other Radix-driven panel in this migration.

### The `apply`/`hideMenu` → `setOpen` translation

`TableFiltersMenu`'s own `apply(hideMenu)` used to close via the global
`MenuComponent.hideDropdowns(null)` — closes *whatever* Metronic menu is
currently open, anywhere. That doesn't exist for Radix; each menu is its
own component with its own state. `TableFiltersMenu` now owns `open`
itself and its `apply` override calls `setOpen(false)` directly, and
`TableFilterItem`'s own "Cancel" button (for `instantApply={false}`
filters) now closes only *that filter's own* flyout via its own local
`setOpen(false)` rather than the outer menu — arguably a **behavior
improvement**, not just a faithful port: the original global close would
have closed the *entire* filters menu on Cancel, not just backed out to
the filter list, which was never clearly the intent (a Metronic default
side effect of "close whatever's open" being the only tool available,
not a deliberate design choice).

### `openMenuName`/`menuIsOpen`: the auto-open-a-specific-filter feature

Clicking a column header's own funnel icon should jump straight to that
column's filter, not the general list — Metronic's version did this
imperatively, firing `menuInstance.show(item)` from a listener on the
*outer* menu's own `kt.menu.dropdown.shown` event. Both are threaded
through `TableFilterContext` now: `openMenuName` (which filter, from
`TableFiltersMenu`'s own `openName` prop) and `menuIsOpen` (whether the
outer Popover is currently open). `TableFilterItem` reacts to
`menuIsOpen` transitioning to `true` by opening its own flyout if its
name matches — keyed off *visibility*, not mount, for a reason covered
next.

### A real regression caught before shipping: `hasFilterMenu()`'s DOM query

`TableBody.tsx`'s `hasFilterMenu(column.filter)` decides whether to
render a cell's inline-filter shortcut by directly querying the DOM —
`document.querySelector('#kt_content_container .table-filters-menu
#filter-item-' + key)` — for a filter row with that id. Metronic's own
`.menu-sub-dropdown` was *always* mounted (just CSS-hidden via
`display: none` until `.show`), so this worked regardless of whether the
menu had ever been opened. Radix's Popover.Content, by default, doesn't
render its children at all until first opened — swapping to Radix as-is
would have made `hasFilterMenu()` wrongly return false (hiding the
inline-filter shortcut) any time the "Add filter"/column-toggle menu
happened to be closed, which is most of the time. Caught by writing a
regression test for it (`TableFiltersMenu.test.tsx`), not by inspection —
worth calling out because it's exactly the kind of silent breakage this
migration's "exhaustive consumer audit" habit exists to catch, in a
place a straightforward per-file audit wouldn't have looked (a *different
file*, `TableBody.tsx`, reading a DOM side effect of this one).

Fixed with `forceMount` on both `Popover.Content` and its `Portal`, plus
threading the `show` class through conditionally on the `open` state
instead of hardcoding it — restoring the original "always mounted,
CSS-hidden" shape exactly. This is also *why* `menuIsOpen` (previous
section) has to be a separate signal from mount: with `forceMount`,
`TableFilterItem` now mounts immediately on page load rather than only
once its menu opens, so the "auto-open the matching filter" effect can no
longer key off its own mount — it must key off the menu becoming
*visible*, which happens later and possibly more than once.

### Deliberately left alone: the sidebar accordion tree

`MenuAccordion.tsx`, `ResourcesMenu.tsx`'s `CustomToggle`, and
`MenuItem.tsx` still carry `data-kt-menu-trigger`/`MenuComponent` calls
(as does `MasterInit.tsx`'s global `MenuComponent.bootstrap()`, still
needed to keep this working). Confirmed by reading, not assumed: these
render `.menu-sub-accordion` — Metronic's *in-flow* expand/collapse
navigation tree, not a floating popup at all, and per `NavMenu.tsx`'s own
top-of-file comment from earlier in this migration, deliberately out of
scope — it belongs to a different Radix primitive entirely
(Collapsible/Accordion), not `DropdownMenu`/`Popover`. Grepping for every
`data-kt-menu-trigger`/`MenuComponent` reference after this batch
confirms nothing outside this tree remains.

### Verification

Added a permanent regression test per file (six new test files/additions
total, including the `hasFilterMenu()` one above), each exercising the
real component chain unmocked — `StringFilter` → `withTableFilter` →
`TableFilterItem`, `RoleAndProjectSelectField` → `Form` → the real
two-level popup, etc. — matching this migration's established "test the
real host, don't mock the thing you just changed" discipline. Full
suite: 532 test files / 3532 tests pass (0 flaky), 0 lint errors, tsc
clean, build passes.

## Fix: `TableFiltersMenu`'s "Add filter" button stopped opening

Reported live right after the previous migration batch shipped: "Add
filter button doesn't work at all now!" The button rendered — it just
didn't open anything. Root cause: `Tip` (`src/core/Tooltip.tsx`) sat
*inside* `RadixPopover.Trigger asChild`:

```tsx
// Before — broken
<RadixPopover.Trigger asChild>
  <Tip id="table-add-filter-tip" label={translate('Add filter')}>
    <Button variant="secondary" size="sm" /* ... */>...</Button>
  </Tip>
</RadixPopover.Trigger>
```

`Tip` is a plain function component, not `forwardRef`, and doesn't spread
`{...rest}` onto its own rendered `<span>` — only `onClick`/`className`
are explicitly forwarded (confirmed by reading `Tooltip.tsx` in full).
Radix's `Slot` (what `asChild` uses to merge props/ref onto its child)
had nothing but `Tip` itself to attach to, and `Tip` forwards neither the
`ref` nor the rest of Radix's merged props (`aria-expanded`,
`data-state`, the Popper anchor wiring) down to the real `<Button>`
further inside. The button rendered — Popper just had no real element to
position against, and the click never toggled Radix's own state.

**Why the existing jsdom test didn't catch it**: the test asserted
"clicking opens the filter list," and that assertion *passed* on the
broken code — `onClick` still fired via ordinary DOM event bubbling
through `Tip`'s wrapping `<span>`, independent of whatever Radix's ref
chain was doing. jsdom also has no real layout engine, so a
`Trigger`/anchor mismatch that would visibly mis-position (or entirely
fail to open) a real Popper-positioned panel produces no failure at all
in jsdom. The fix needed a jsdom-checkable proxy for "did the ref chain
actually reach the button": asserting `data-state`/`aria-expanded`
directly on the button element, which Radix only ever sets on the
element it actually captured a ref to.

**Fix**: invert the nesting — `Tip` wraps `Trigger asChild`, not the
other way around, matching the pre-existing pattern already used by
`ActionsDropdown.tsx`'s `TableDropdownToggle` (which wraps an
already-fully-composed toggle from *outside*, never sits inside an
`asChild` chain):

```tsx
// After — Tip wraps the trigger
<Tip id="table-add-filter-tip" label={translate('Add filter')}>
  <RadixPopover.Trigger asChild>
    <Button variant="secondary" size="sm" /* ... */>...</Button>
  </RadixPopover.Trigger>
</Tip>
```

Verified two ways: live in Storybook via real pointer events (confirmed
`data-state="open"`, `aria-expanded="true"`, and a sane real-world panel
position, not `0,0`/`NaN`), and a new jsdom test asserting those same
attributes — proven to actually catch the bug via `git stash`/`git stash
pop` (fails on the pre-fix code, passes after).

**Broader, deliberately-not-fixed risk**: `Tip` not being `forwardRef` is
a latent hazard for *any* future `asChild` composition that puts `Tip`
directly inside a `Trigger`/`Anchor`. Making `Tip` itself `forwardRef` is
a much higher-risk change (it's used everywhere in the app) than fixing
the one broken call site, so it was deliberately left alone — the
`TableDropdownToggle`/wrap-the-trigger shape is now the reference pattern
for anywhere else this comes up.

## Fix: inline and column table filters stopped appearing

Reported live: "inline & column table filters does not work anymore too
- but should." Unlike the "Add filter" bug above, the triggers involved
here were structurally fine — no `Tip`-inside-`asChild` anywhere.

Root cause was one level removed: `TableBody.tsx`'s `InlineFilterButton`
(the per-cell "filter by this value" shortcut) only renders when
`hasFilterMenu(column.filter)` finds `#kt_content_container
.table-filters-menu #filter-item-{key}` in the DOM (see the
`hasFilterMenu()` section above — this selector assumes Metronic's own
never-portaled markup). `RadixPopover.Portal` defaults to rendering into
`document.body`, which — once `TableFiltersMenu` moved onto Radix — moved
its entire force-mounted content subtree, `#filter-item-*` rows included,
*outside* `#kt_content_container` in the real DOM, even though it's
nested inside that element in the React tree. The selector silently
stopped matching, so `hasFilterMenu()` always returned `false` and the
inline shortcut never rendered at all — for any column, on any table,
regardless of whether its own menu was open or closed.

The per-column header funnel icon (`TableFiltersMenu`'s `openName`
branch, "column filters" in the report) isn't gated by `hasFilterMenu()`
and opens independently of this bug; the report almost certainly refers
to the same visible feature by both names — the per-cell shortcut *is*
how you filter by a specific column's value once hovering a row.

**Fix**: anchor the Portal back inside the page's content wrapper instead
of touching `hasFilterMenu()` itself:

```tsx
const getFilterMenuPortalContainer = () =>
  document.getElementById('kt_content_container') ?? undefined;
// ...
<RadixPopover.Portal forceMount container={getFilterMenuPortalContainer()}>
```

Applied to both of `TableFiltersMenu`'s `Portal` instances (column-toggle
and "Add filter" branches) — the only two whose content `hasFilterMenu()`
reads. Falls back to Radix's own default (`document.body`) wherever the
wrapper isn't present, e.g. Storybook/tests that don't render the real
layout shell.

**A second, sharper timing trap surfaced while writing the regression
test.** `getFilterMenuPortalContainer()` runs during React's render
phase, before anything commits — so on the very *first* render of a tree
where `#kt_content_container` and `TableFiltersMenu` mount together in
one commit, `document.getElementById('kt_content_container')` still finds
nothing, and the Portal falls back to `document.body` regardless of the
fix. This never happens in the real app: `#kt_content_container` lives in
the persistent page shell (`src/metronic/layout/components/Content.tsx`),
mounted once, well before any individual table underneath it renders for
the first time — so by the time any `TableFiltersMenu` instance ever
renders, the wrapper is already sitting in the DOM from an earlier
commit. A first attempt at both the live repro (a Storybook debug story)
and the regression test rendered `#kt_content_container` as a plain JSX
ancestor of the component under test — committing both in the same pass
— and consequently kept "reproducing" the bug even after the fix was
applied, until this ordering mismatch was diagnosed. The corrected repro
creates `#kt_content_container` as a real DOM node and attaches it to
`document.body` *before* calling `render()`/mounting the story, matching
production's actual mount order.

A second, unrelated ordering assumption came up in the same repro: real
tables populate `rows` asynchronously (a fetch resolves after the filters
bar has already committed); a synchronous, hard-coded `rows` array skips
that entirely and — thanks to `TableCell`'s `React.memo` — never gets a
second render pass to re-evaluate `hasFilterMenu()` against the
now-current DOM. The regression test populates `rows` from an effect
(mirroring a real fetch) for the same reason.

Verified live in Storybook (`document.querySelector` for
`#kt_content_container .table-filters-menu #filter-item-*` before/after
the fix, plus a real pointer click confirming the shortcut opens with
sane `data-state`/`aria-expanded`) and with a new jsdom regression test
in `TableBody.test.tsx` — proven via `git stash`/`git stash pop` to fail
against the pre-fix code and pass against the fix.

## Fix: column-header filter flyout positioned to the side instead of below

Follow-up to the fix above — a user screenshot showing the column-header
"State" filter icon open prompted a live re-check of that specific
trigger. It turned out to open and function correctly end to end
(clicking it, selecting a multi-select checkbox option, seeing it applied
as a tag all worked); the first read of that check looked broken purely
because of a self-inflicted test-methodology bug — checking
`data-state` *synchronously* in the same script right after `.click()`,
before Radix's resulting state update had actually committed. A `wait`
between the click and the check showed the true, already-working state.
Worth naming because it's the mirror image of the jsdom blind spot from
earlier fixes in this doc: there it was jsdom passing a test that should
have failed; here it was a live check reporting a failure that wasn't
real, from not giving an async update time to land.

While re-verifying, a second, genuinely real bug surfaced: the flyout
opened from the column header positioned itself `side="right"` (beside
the row) instead of `side="bottom"` (under the header) — cosmetically
wrong, though usually saved from looking broken by Radix's own collision
detection flipping it when there's no room to the right. `git log -S` on
`columnFilter` (the context flag `TableFilterItem.tsx` reads to choose
between the two) turned up nothing across the entire history of
`src/table/` except its own declaration and read sites — the flag has
been dead code since it was introduced in commit `d96c601b3` (Nov 2024,
[WAL-7415]), unrelated to this migration; it was simply never wired to
an actual value by whichever trigger opened the menu. Fixed in
`TableFiltersMenu.tsx`'s context override:

```tsx
columnFilter: Boolean(props.openName),
```

`openName` is only ever set on the column-header instance
(`TableHeader.tsx` passes it; the "Add filter" list instance in
`TableFilters.tsx` doesn't), so its presence is exactly the signal
`TableFilterItem` needs. Verified live (the auto-opened flyout's
`data-side` flips from `right` to `bottom`) and with a new jsdom
regression test in `TableFiltersMenu.test.tsx`, proven via a scripted
stash of just that one line to fail without the fix and pass with it.

> **Superseded** by "Not needed at all: the column-header popup's nested
> flyout" below — the column-header target row no longer has a nested
> Popover of its own to position, `columnFilter` no longer exists, and
> `data-side` now comes from the *outer* TableFiltersMenu Content
> instead. Left as-is for the history; the positioning problem it
> describes and the reasoning about `git log -S` finding dead code both
> still hold, just for code that's since been replaced rather than
> patched in place.

## Fix: column-header filter toggle never rendered for a wrapped `filters` component

The real bug behind a live report that read, on first glance, like
several filter flyouts rendering open simultaneously. `TableFiltersMenu`
gates the column-header toggle behind an `existed` check — "does a
filter matching `openName` actually exist in `props.filters`, or did the
column point at one that's since been removed/renamed." The Radix
conversion earlier in this migration replaced the pre-Radix version's DOM
query with a check against the *static* `props.filters` element tree:

```tsx
// Looked reasonable, was broken for every real caller
const existed =
  !props.openName ||
  React.Children.toArray(props.filters).some(
    (child: any) => child?.props?.name === props.openName,
  );
```

Grepping every `filters={` call site in the app (dozens) turned up
exactly one pattern: `filters={<SomeGeneratedFilterComponent />}` — a
single wrapper component, never a bare field and never a raw Fragment
passed directly. The actual named filter (`<SelectFilter name="state"
.../>`) is nested *inside* that wrapper's own render output, never a
direct child of what's passed to `filters` — so
`React.Children.toArray(props.filters)` always saw exactly one childless
wrapper element, `child.props.name` was always `undefined`, and `existed`
always evaluated `false`. The column-header funnel icon has silently
rendered nothing, for every filterable column, on every page in the app,
ever since this shipped — confirmed live in Storybook with a repro built
the same way every real page does it (`filters={<Wrapper />}` wrapping
two `SelectFilter`s): zero toggle buttons in the DOM for two filterable
columns. The bug hid especially well because it fails silent (`return
null`, no error) and because every debug repro and regression test
written *while investigating this exact area* earlier in this session
happened to pass a bare field directly as `filters` — sidestepping the
one shape that actually breaks.

Sequence of events, for the record: a screenshot showed what looked like
two filter flyouts (an "Offering"-style dropdown and a
checkboxes-and-toggle box) open at once. That read as "opening a second
filter row doesn't close the first," which doesn't hold up under direct
testing — clicking a second row consistently closes the first via
Radix's own default `DismissableLayer` outside-click handling, no
extra coordination required (confirmed with a same-list repro, a
cross-instance repro — the "Add filter" list vs. a column header's own
toggle — and by reverting to the pre-refactor code and testing that
directly). An attempt at explicit "only one row open" coordination state
was built, found unnecessary, and discarded — it actively fought Radix's
own dismiss-vs-open sequencing and introduced a real, reproducible
self-dismiss race that isn't present without it (kept as a cautionary
note, not a change). The `existed` bug is the one that actually explains
the report: before it was fixed, column-header toggles were entirely
invisible, so whatever the user saw open must have come from *within*
the "Add filter" list itself, not from a column header at all — and nothing
in that list's own coordination is broken.

Fix: check the real rendered DOM instead of the static element tree,
same as the pre-Radix Metronic version did — it works at any wrapper
nesting depth because it doesn't care how many components sit between
`props.filters` and the actual `<div id="filter-item-{name}">`:

```tsx
const [existed, setExisted] = useState(true);
const checkExisted = useCallback(
  (node: HTMLDivElement | null) => {
    if (node && props.openName) {
      const item = node.querySelector('#filter-item-' + props.openName);
      setExisted(Boolean(item));
    }
  },
  [props.openName],
);
// ...
if (props.openName && !existed) return null;
```

A callback ref, not `useRef` + `useEffect` (tried first, didn't work):
Radix's `Presence` — what `forceMount` relies on to keep Content mounted
while closed — defers actually attaching Content's real DOM node by one
render pass. A plain ref read inside a parent-level `useEffect` is still
`null` the first time that effect runs, so the check silently never
fires and `existed` never leaves its initial `true`. Confirmed directly:
logging inside the effect showed `hasRef: false` on every run. A callback
ref sidesteps the whole question of *which* render pass actually attaches
the node — it fires exactly when the node itself attaches, whenever that
turns out to be.

One existing test needed updating as a direct consequence: `existed`
starting `true` and only resolving after a render means "renders nothing
for a filter that no longer exists" is no longer synchronously true right
after `render()` — it takes a `waitFor`, the same two-pass "render then
possibly hide" shape the original pre-Radix version had.

Verified live in Storybook (0 → 2 column-filter toggle buttons for two
filterable columns, using the same wrapper-component pattern real pages
use) and with a new regression test using a wrapper component rather than
a bare field — proven via a scripted revert to the old `React.Children`
check to fail without the fix and pass with it.

## Fix: not needed at all — the column-header popup's nested flyout

Direct follow-up, from a live screenshot of the now-*visible* (previous
fix) column-header toggle: clicking it opened the full "Add filter"-style
list of every filter name, with the target filter's own flyout then
rendered alongside/overlapping it. Quoting the report: "clicking on
filter icon in table column header leads to dropdown menu rendered for
all fields and filter control itself - this is bug - dropdown menu is
not needed in this case." Right diagnosis on the first read — the
column-header instance's whole point is "this one column's own control,"
and `TableFiltersMenu`'s `openName` branch was rendering `{props.filters}`
unfiltered (every row), relying on `TableFilterItem.tsx`'s per-row
`openMenuName === props.name` check to *auto-expand* the matching one
inside its own nested Popover — but every other row still rendered its
own collapsed `menu-link`, and the auto-expanded one still flew out to
the side as its own separate floating panel, layered on top.

Restructured `TableMenuFilterItem` (`TableFilterItem.tsx`) to branch
three ways on `openMenuName`:

```tsx
const isColumnMode = Boolean(openMenuName);
const isColumnTarget = isColumnMode && openMenuName === props.name;

if (isColumnMode && !isColumnTarget) return null;       // every other row: nothing
if (isColumnTarget) return (/* field rendered directly, no nested Popover */);
return (/* unchanged: "Add filter" list's own collapsed accordion row */);
```

The non-target branch renders `null` outright rather than a collapsed
row — a column-header popup has exactly one thing to show. The target
branch drops the nested `RadixPopover.Root`/`Trigger`/`Content` shape
entirely and renders `props.children` straight into the outer
`TableFiltersMenu` Content, which already supplies its own
`side="bottom"` positioning (see the now-superseded `columnFilter`
section above) — nothing left to position twice.

**Two knock-on bugs surfaced while building this, both specific to the
target row now being visible immediately rather than behind a click:**

1. The `itemValue`-driven "apply while typing" effect used to be gated
   correctly by accident — the "Add filter" list's own row starts
   `open === false`, so the effect was inert until a user click, and
   mount-time firing was never actually possible. The column-target row
   has no such gate: it's "open" from the very first render. Without a
   separate guard, this fired a real `applyFiltersFn()`/`setFilter()`
   dispatch during the *initial mount* of every filterable column at
   once — a flood of synchronous cross-component dispatches, all firing
   while React was still mid-mount for sibling columns, reproduced live
   in Storybook as a React "Should not already be working" crash (not
   caught by the jsdom suite, which never exercises more than one
   filterable column mounting simultaneously). Fixed with a `skipFirstRun`
   ref that suppresses exactly the mount-time firing of that effect.
2. Rendering `props.children` unconditionally the moment the
   force-mounted row exists — page load, for every filterable column at
   once — let components like react-select's own auto-focus-on-mount
   behavor fire immediately and simultaneously across every column,
   independently reproducing the same crash (traced via the error's own
   stack to `Select.focusInput()`). Restored `menuIsOpen` to context
   (removed earlier in this same investigation as apparently-dead code —
   turned out to still be needed, just for a new reason) and gated the
   target row's children on it: `{menuIsOpen && props.children}`. The
   field now only mounts once the popup is actually opened, matching the
   "Add filter" list's own row's existing behavior.

A `closeMenu` context function was added for the target row's own
"Cancel" button (non-instant-apply filters only): since there's no
nested Popover left for that row to close on its own, `TableFiltersMenu`
now exposes closing *itself* — `closeMenu: () => setOpen(false)` —
distinct from `apply`, which always applies before closing.

Verified live end-to-end in Storybook (exactly one column-filter panel
open at a time, containing only that column's own `SelectFilter`
control — no list, no overlap; selecting a checkbox option applies and
shows as a tag) and with a new regression test asserting a sibling
filter's label/field never appears when a column-header instance opens.

## Fix: switching between two rows in the "Add filter" list needed two clicks

Direct follow-up: the fix above turned out not to be the whole story
behind the original "multiple filters open simultaneously" screenshot.
It explained why the *column-header* popup looked broken; it didn't
touch the "Add filter" list itself, whose accordion-of-rows shape (each
row its own nested Radix Popover, unchanged by any of this migration's
earlier fixes) was where the report's actual screenshot — two rows
("Offering", "Downscaled") both looking expanded at once — came from.

**A first repro didn't reproduce it.** Two simple `StringFilter` rows,
switching directly between them, closed the first cleanly every time —
Radix's own default outside-click dismissal looked sufficient on its
own, matching this doc's very first read of the situation (see the
now-superseded "not needed at all" section above, which reached that
conclusion from the same kind of small repro). **The real, ~12-row list
proved that wrong.** Rebuilding it exactly — same field names, same mix
of dropdown (`SelectFilter`) and toggle (`BooleanFilter`) types, live in
Storybook — switching rows needed a *second* click: the first only
dismissed the previously-open row, leaving nothing open until clicked
again. This is the actual mechanism a mid-transition screenshot catches
as "both open."

**Root cause, traced with a temporary debug event log** (timestamped
pushes to `window.__debugLog` from every `onOpenChange`/dismiss
callback, since jsdom can't reproduce this — see below): lifting "which
row is open" to shared state (`activeItemName`, `setActiveItemName` —
new context fields, owned by `TableFiltersMenu`'s "Add filter" list
instance) correctly opens the newly-clicked row immediately. But the
*previously* open row's close is asynchronous — Radix doesn't unmount it
synchronously with the state change — and when it finally does unmount,
its default `onCloseAutoFocus` behavior returns focus to *its own
trigger*. By then the new row has already opened elsewhere in the DOM;
that stray focus-return lands on the new row's own `DismissableLayer`,
which reads "focus just moved to an element outside my Content" as an
outside interaction and dismisses the new row — moments after it opened.
The event log's own sequence made this unambiguous: `next: true`
(explicit open) → `settlingTo` the new name → `onCloseAutoFocus` fires
for the *old* row → `onFocusOutside`/`onInteractOutside` fire for the
*new* row with the old row's own trigger element as `e.target` →
`setOpen(false)` on the new row.

**First attempted fix, discarded**: deferring the shared-state switch
through an intermediate `undefined` frame (`setTimeout(..., 0)`) before
landing on the real target — modeled on the same-shaped fix already
proven for the column-header case. It masked the symptom (a fresh open
never misfired) but not reliably: in the full 12-row tree it still
sometimes took a second click, and it added a real timing dependency for
no longer-necessary reason once the actual cause was identified.

**Actual fix**: suppress both `onOpenAutoFocus` and `onCloseAutoFocus`
on every row's own `Popover.Content` — `TableFilterItem.tsx`'s
`TableMenuFilterItem` (the "Add filter" list's per-filter row) and this
file's `FlyoutRow` (Current filters / Saved filters):

```tsx
onOpenAutoFocus={(e) => e.preventDefault()}
onCloseAutoFocus={(e) => e.preventDefault()}
```

With no auto-focus-driven event for either side to misread, the shared
`activeItemName` state (kept, since it's still what fixes the "needs a
second click" symptom on its own) can be a plain `useState` setter with
no deferral at all — verified by simplifying it back to one and
confirming the fix still holds.

**A second instance of the same bug**, caught by testing exhaustively
rather than assuming one fix covered every row type: `FlyoutRow` only
had `onOpenAutoFocus` suppressed at first (copied from
`TableMenuFilterItem`'s fix, `onCloseAutoFocus` missed) — switching
*from* "Saved filters" *to* a filter row failed the exact same way,
caught by testing that specific direction live rather than only the
reverse.

Verified live in Storybook: single-click switches confirmed in every
direction tried (`TableMenuFilterItem` ↔ `TableMenuFilterItem`,
`FlyoutRow` ↔ `TableMenuFilterItem`, four rows in a row), plus real
value selection still committing correctly after several switches. The
new regression test in `TableFiltersMenu.test.tsx` passes identically
with or without the fix under jsdom (no real focus/layout timing to
reproduce the race with) — proven via a scripted revert of just the two
`onOpenAutoFocus`/`onCloseAutoFocus` lines — so it stands as an
end-to-end behavior lock, not proof; the live Storybook verification is
what actually proves this one.

## Fix: mobile/sidebar filter drawer rows rendered empty and disappeared

Reported live, separately from the two fixes above and confirmed
pre-existing (not caused by this migration's Radix work): opening the
mobile "Filters" drawer showed several accordion sections
("Parent offering", "Category", "Organization") expanded but visibly
empty, with content flashing briefly before vanishing.

**Ruled out first, by reading**: `SelectHelper.ts`'s
`reorderOptions`/`reorderAsyncOptions` (both correctly short-circuit on
`value === null`, and `withTableFilter.tsx`'s `OuterField` guarantees
`null`, never `undefined`); `createLoadOptions.ts` (degrades gracefully
on a failed request, doesn't throw); `DrawerRoot.tsx` (the drawer itself
is driven by Metronic's own imperative `DrawerComponent`, unrelated to
Radix or to anything touched by the two fixes above).

**Reproduced live** in Storybook with a fast, network-independent stubbed
`loadOptions` — ruling out backend latency as the cause. Expanding a
section showed its field fully mounted and auto-focused
(`metronic-select__control--is-focused metronic-select__control--menu-is-open`)
while the accordion's own `.accordion-collapse` element hadn't even
reached its `show` class yet, and the console repeated React's "not
wrapped in `act(...)`" warning for every async-select field in the
drawer — not just the one clicked.

**Root cause**: `TableSidebarFilterItem` (`TableFilterItem.tsx`)
rendered `props.children` unconditionally inside `Accordion.Body`.
React-bootstrap's underlying `Collapse` mounts its children regardless of
collapsed state — only a CSS height/opacity transition hides them — and
the sidebar container renders every row with `alwaysOpen`, so every
row's field mounted at once. For an `AsyncSelectFilter` that meant every
row's own forced `autoFocus: true, menuIsOpen: true` (`useSelect.ts`'s
`tableFilterProps`, set for any `variant="tableFilter"` with no
distinction between menu and sidebar `filterPosition`) fired
simultaneously, and N react-select instances racing for
focus/menu-open at once starved the main thread for over a second before
any of them settled — the "renders empty, disappears" symptom is that
block, not an actual crash. Same root shape as `TableMenuFilterItem`'s
`isColumnTarget` gate (fixed earlier this migration for the
column-header popup), just triggered by react-bootstrap's `Accordion`
instead of a force-mounted Radix `Popover`.

**First attempted fix, discarded**: passing `unmountOnExit` to the
`<Accordion>` wrapping the sidebar's rows. Failed at the type level —
`Accordion.Body` (what `TableSidebarFilterItem` actually renders through)
wraps `Accordion.Collapse` but only forwards `eventKey` and the
`onEnter*`/`onExit*` callbacks, not arbitrary props, and neither
`AccordionProps` nor `AccordionBodyProps` types `unmountOnExit` at all —
only the lower-level `Accordion.Collapse`'s props (`CollapseProps`) do.

**Actual fix**: read react-bootstrap's own `AccordionContext` directly
and gate the mount on whether this row is actually the expanded one —
the same "defer the mount" shape as `isColumnTarget`, just driven by
Accordion's `activeEventKey` instead of a Popover's open state:

```tsx
const { activeEventKey } = React.useContext(AccordionContext);
const isExpanded = Array.isArray(activeEventKey)
  ? activeEventKey.includes(props.name)
  : activeEventKey === props.name;
// ...
<div className="filter-field">{isExpanded && props.children}</div>
```

`activeEventKey` is an array under `alwaysOpen` (multiple rows can be
open at once), so the check handles both shapes. This reuses the exact
state that already drives the accordion's own visual open/close — no new
state, no timing dependency.

Verified live in Storybook: expanding a row now mounts and auto-focuses
only that row's field (confirmed via `aria-expanded`/`.show` and the
field's own DOM), a second row can be expanded independently without
disturbing the first (`alwaysOpen` preserved), collapsing a row unmounts
its field again, and the console is clean — no more `act()` warnings, no
multi-second stall. Two new regression tests added to
`TableFilterItem.test.tsx`, proven to actually catch the bug via a
scripted revert of the `isExpanded &&` guard (both failed identically
against the reverted code, both pass against the fix) — pinning the
mounting contract the fix relies on. The live focus-race itself isn't
reproducible under jsdom's simpler event loop, matching this migration's
established pattern for this class of bug.

**This fixed a real bug, but not the one in the report.** Reported back
live, after the above shipped: still blank, "not only async select but
ALL fields" — including `BooleanFilter` (a plain checkbox, no
react-select, no autofocus anywhere near it). My own Storybook check had
only confirmed the field *mounted* with the right DOM/geometry
(`scrollHeight`, `offsetHeight`) — never that it actually *painted*.
Asked the user to inspect a blank row's element in real DevTools: the
checkbox `<input>` and its `<label>` were genuinely in the DOM with
correct, non-zero layout boxes — not a mounting problem at all.
`getComputedStyle` on that input, requested directly from the user, was
the actual break: `visibility: collapse` on every ancestor from
`.accordion-collapse` down. Checking the *same* Storybook story for the
property I'd never actually looked at confirmed it there too — I'd
verified presence and size, not paint.

**Root cause**: Tailwind ships a `visibility` utility literally named
`.collapse` (the three-state set `visible`/`invisible`/`collapse`, for
hiding table rows without reflow). React-bootstrap's `Collapse` /
`Accordion.Collapse` / `Navbar.Collapse` independently use the bare
class name `collapse` as their own component marker — unrelated meaning,
identical name, predating the Tailwind utility by years. This file's own
deliberate layer order (`utilities` ranked above `bootstrap`, top of
this file) means Tailwind's rule silently wins on every one of those
elements. `visibility: collapse` on a non-table element computes exactly
like `hidden` per spec — the element keeps its normal layout box (which
is why `.show`, `scrollHeight`, and even the async-select's autofocus
above all looked correct) but paints nothing. Grepping for react-bootstrap
`Collapse` usage turned up at least seven affected components
(`AccordionCard`, `TableHeader`, this file's sidebar drawer,
`ChatHistorySidebar`, `CategoriesPanel`, `InferenceServiceView`,
`TwoStageWorkflowCard`) — an app-wide collision, not something specific
to filters.

**Fix**, in `src/tailwind.css` (shared by the real app and Storybook, so
one change covers both):

```css
@layer bootstrap {
  .collapse {
    visibility: visible !important;
  }
}
```

Layer order alone can't reclaim this — `bootstrap` ranks *below*
`utilities` on purpose — so a normal-priority rule here would still
lose. Cascade Layers order `!important` declarations in *reverse*, and
rank any `!important` above any normal-priority rule regardless of
layer, so `!important` reliably beats Tailwind's non-important utility
without touching that deliberate ordering. Checked first for any
genuine Tailwind `.collapse` (table-visibility) usage in the app — none
exists — so reclaiming the name outright is safe.

Verified live in Storybook via `getComputedStyle`: `visibility` on the
accordion body and its checkbox/select children flips from `collapse` to
`visible`, both before and after a hard reload, for both the
`AsyncSelectFilter` and `BooleanFilter` rows. No jsdom regression test
for this one — jsdom's `getComputedStyle` doesn't evaluate real CSS
cascade layers/`@import` at all, so a test asserting `visibility` here
would pass or fail independent of the actual bug; the live, cross-checked
`getComputedStyle` evidence (two different real environments, both
before and after) is what stands as verification.

## Fix: column-header filter popup too narrow

Reported live, with a screenshot: the column-header filter popup (the
funnel icon on a column like "Category") clipped/overlapped its
`AsyncSelectFilter` search box and option list into neighboring columns.

Root cause: `TableFiltersMenu.tsx`'s `RadixPopover.Content` for this
specific popup (the `props.openName` branch) carried no width utility
class at all, so it fell back to Metronic's base `.menu-column` CSS
class — a fixed ~175px, too narrow for a search box plus option list.
The sibling popup one component over — `TableFilterItem.tsx`'s
`TableMenuFilterItem`, the "Add filter" list's own per-row flyout,
showing the exact same kind of content (one filter's field) — already
uses `w-375px` for this reason. Applied the same class to
`TableFiltersMenu.tsx`'s column-header `Popover.Content` for
consistency.

Verified live in Storybook (`TableFiltersMenu` needs an ambient
`FilterContextProvider` with `filterPosition="menu"` around it — passing
`filterPosition` directly as a prop on `TableFiltersMenu` itself doesn't
reach `TableFilterItem`, which reads it from context, not a `props`
passthrough inside `TableFiltersMenu`): the popup's rendered
`getBoundingClientRect().width` is 375, up from the unstyled ~175.

## Fix: funnel "Set filters" button opened the popup at the wrong position

Reported live, with a screenshot: clicking the funnel icon next to the
table search box — while filters were already active (a "2" badge on
the button) — opened the "Add filter" list pinned to the viewport
origin, overlapping the page's left sidebar nav, instead of anchored
near the button.

**Root cause**, confirmed via a dispatched investigation then verified
directly: `TableToolbar.tsx`'s `onClickFilterButton` (and a near-
identical, currently-unused duplicate in `TableButtons.tsx` — see
below) is a hack around the funnel button not being a real Popover
trigger itself. It calls `actions.toggleFilterMenu()` (no argument —
a bare flip) and then, in the same handler, programmatically
`.click()`s the *real* Radix trigger (`TableFiltersMenu.tsx`'s own "+"
`.btn-add-filter` button) so Radix's own open/position machinery takes
over. `Table.tsx`'s mount effect already sets `showFilterMenuToggle`
true whenever `filtersStorage.length > 0` — exactly the "2 active
filters" case in the report — so a *bare flip* on a button click flips
it back to `false`, which applies `d-none` (`Table.tsx`'s `Card.Header`)
to the very row containing the trigger this handler is about to click.
Every other call site of `toggleFilterMenu` in the codebase
(`FilterContextProvider.tsx`, `TableFiltersMenu.tsx`'s own `apply()`)
already passes `true` — these two were the only outliers.

**Verified live in Storybook**, with a `MutationObserver` watching every
class-attribute change during the click (real `getBoundingClientRect()`
readings, not jsdom): with the bare-toggle bug, the trigger's
`Card.Header` gains `d-none` in the *same batch* as the popup's own
`show` class — a real, measured side effect, confirmed absent with the
fix (only the popup's own `show` class changes; the header's class never
mutates). This is the actual defect the fix removes. Note for honesty:
in this specific harness, the popup's *reported position* self-corrected
to a sane value shortly after, even with the header hidden — likely
floating-ui falling back to its last good measurement rather than the
reported (0,0) — so the position-collapse itself wasn't perfectly
reproduced end-to-end here, but the causal defect (the trigger's
container going `display:none` mid-open) *was* directly measured and
is the same mechanism the live report's screenshot is consistent with;
the fix removes that mutation outright.

**Fix**: `actions.toggleFilterMenu(true)` / `props.toggleFilterMenu(true)`
at both call sites, matching the convention already used everywhere
else. `TableButtons.tsx`'s own copy of this handler was first suspected
dead — a `grep -rln "from './TableButtons'\|from '@/table/TableButtons'"`
found nothing outside the file itself — but that pattern missed
`TableToolbar.tsx`'s own relative import, `from '../../TableButtons'`.
It's live: `TableToolbarActions` renders `TableButtons` whenever
`showActionsColumn` is true, with `renderFilterButton={isSm ||
!config.hasQuery}` — the small-viewport/no-search-box complement of
`TableToolbarActions`' own `showFilterButtonNextToSearch` case above, so
`TableButtons`' own `onClickFilterButton` is the live path exactly when
the "next to search" placement doesn't apply. Both copies needed the fix;
neither is dead.

## Fix: `ActionDropdownButton`'s toggle did nothing on click

Reported live: on the admin "Identity & Authentication" page's Providers
tab, every provider card's "Enabled"/"Not configured" dropdown button
(Keycloak, TARA, MyAccessID, Local identity provider, SAML2, FreeIPA —
all built on `ActionDropdownButton`) rendered correctly but did nothing
when clicked.

**Root cause**: `ActionDropdownButton.tsx`'s `Toggle` is rendered under
`RadixDropdownMenu.Trigger asChild` — Radix's `Slot` clones the child and
merges in `aria-haspopup`/`aria-expanded`/`data-state` *plus the actual
open-on-click handling* (`onClick`/`onPointerDown`/`onKeyDown`) as extra
props on whatever it clones. `Toggle`'s signature destructured only its
own named props (`title`, `variant`, `size`, `className`, `disabled`,
`id`, `isOpen`) and never captured or spread a `...rest` onto the
underlying `<button>` — every prop Slot injected was silently dropped.
The button looked entirely correct (label, variant, caret) with no
console error; it just had no handler wired to open anything. Traced by
diffing against `ActionsDropdown.tsx`'s `TableDropdownToggle`, the
working sibling under the identical `Trigger asChild` pattern, which
already spreads `...rest` with a comment stating exactly why.

`ActionDropdownButton` was itself migrated from a react-bootstrap
`Dropdown`/`Dropdown.Item` onto this Radix component earlier in this
session's dropdown-host batch (`Fix MenuItem must be used within Menu
crash on 12 dropdown hosts`) — this `...rest` omission was introduced
then and had gone unexercised until now.

**Fix**: added `Omit<ComponentPropsWithoutRef<'button'>, 'title'>` to
`Toggle`'s prop type (`Omit`, not a plain intersection, because this
component's own `title` prop is `ReactNode` — a dropdown label — which
collides with the native button `title` attribute's `string` type) and
spread `...rest` onto the `<button>`, mirroring `TableDropdownToggle`.

New regression test in `ActionDropdownButton.test.tsx` — click the
toggle, assert a child item becomes visible — proven to actually catch
the bug via a scripted revert (fails cleanly against the pre-fix code,
passes against the fix). Live Storybook verification hit a different
wall: this session's Browser-pane tooling wasn't compositing frames at
the time, so neither a raw `.click()` nor a full synthetic
pointerdown/pointerup/click sequence could produce a real "trusted"
click — but the *same* limitation reproduced identically against
`TableDropdownToggle` (the known-working control) in the same
environment, confirming it as a tooling gap rather than evidence against
the fix. The `aria-haspopup`/`aria-expanded`/`data-state` attributes
appearing on the button only after the fix (absent before it) is the
direct, verified evidence Slot's props now reach the DOM element.

## Fix: marketplace search box stuck on "Loading" forever

Reported live: the search box in the marketplace dashboard's hero banner
showed a "Loading" dropdown that never resolved, no matter what was
typed.

**Root cause**: `AsyncSearchBox.tsx` gated its `useInfiniteQuery` behind
a separate `enabled` state, flipped `true` only inside the Radix
`Popover.Root`'s `onOpenChange` callback. But this component opens via
`Popover.Anchor`, not `Popover.Trigger` — Anchor is purely a positioning
reference with no interaction handling of its own. The panel actually
opens because the search `<input>`'s own `onFocus`/`onChange` call
`setOpen(true)` directly. `onOpenChange` only fires for changes *Radix
itself* initiates (a Trigger click, Escape, outside-click) — never for
an externally-driven `open` prop change — so `setEnabled(true)` never
ran and the query stayed permanently disabled. React Query v5 removed
the old `idle` status, so a disabled query reports `pending` — rendered
identically to a real in-flight request by `InfiniteList.tsx`, with no
way to tell "never asked" from "still waiting" apart from checking
whether the mock/network actually saw a request. Introduced when this
component's dropdown was converted from Metronic's IntersectionObserver-
based lazy fetch onto Radix (`Migrate the remaining Metronic menus onto
Radix`, earlier this session) — the old effect fired once the ref
entered the viewport, unconditionally; the new `onOpenChange`-based
version assumed Radix would always be the one calling it.

**Fix**: dropped the separate `enabled` state and gated the query on
`open` directly (`enabled: open`) — the same "don't fetch until the
panel would show" laziness was the whole point of `enabled` in the first
place, and `open` already reflects that correctly regardless of what
opened it.

**Test-coverage gap, closed alongside the fix**: `AsyncSearchBox.test.tsx`
already had two tests — "opens without throwing" and "accepts a full
word" — neither of which asserts the fetcher is ever called or results
ever render, so neither caught this. Added a third test asserting both;
proven to actually catch the bug via a scripted revert of the `enabled`
change (fails cleanly against the reverted code — `fetcher` genuinely
never called — passes against the fix). Writing that test also surfaced
a second, independent bug in the test fixture itself: the mocked
fetcher's resolved shape (`{ data: { results, page_count } }`) never
matched what `waldur-api-client`'s `processApiResponse` actually reads —
`result.data` as the raw row array directly, plus a real fetch-like
`result.response.headers` for content-type/result-count/pagination —
harmless when nothing checked the rendered results, but silently wrong.
Fixed the shared fixture to match the SDK's real return shape.

## Migrating the sidebar navigation accordion off Metronic JS

The one piece of the "Metronic dropdown/menu → Radix" migration
deliberately deferred earlier — `NavMenu.tsx`'s own top-of-file comment
flagged `.menu-sub-accordion` (the left sidebar's expand/collapse nav
tree) as needing "a different Radix primitive — Collapsible/Accordion —
entirely," since it's in-flow expand/collapse navigation, not a floating
popup.

### Collapsible, not Accordion

`Accordion.Root` renders its own wrapping DOM element. A nested Root
(needed to coordinate "only one sibling open" inside `ResourcesMenu`'s
recursive categories) would insert an extra `<div>` between
`.menu-sub-accordion` and its `.menu-item` children, breaking the
indentation mixin's direct-child selector chain
(`menu-link-indention`, `core/components/mixins/_menu.scss`, 4 levels of
`.menu-sub > .menu-item > .menu-link`). `@radix-ui/react-collapsible` has
no group-level Root at all: each `.menu-item.menu-accordion` is its own
`Collapsible.Root` via `asChild` (zero extra DOM), and "only one sibling
open" is just a small shared hook (`useExclusiveOpen`, `utils.ts`) —
`{openId, toggle}`, passed as `open`/`onOpenChange` into each sibling.
Verified live afterward that indentation genuinely still works
(`~25px` on nested/leaf items vs `0px` at the top level) — this was the
whole reason for choosing Collapsible, so it was worth confirming, not
just trusting the reasoning.

`Collapsible.Trigger` takes `className="menu-link"` directly, not
wrapped in a `<span>` via `asChild` — making it a real `<button>`, which
core SCSS was already prepared for (`button.menu-link` reset block,
`core/components/menu/_base.scss`, added by an earlier commit
specifically for keyboard-reachable menu triggers). One companion fix
this required: `ResourcesMenuFilterButton.tsx` renders into
`MenuAccordion`'s `badge` slot, inside the header — also a `<button>`
before this — now nested inside another `<button>`, invalid HTML.
Changed to `<span role="button" tabIndex={0} onKeyDown={...}>`.

Metronic's exact algorithm (`_hideAccordions`, `MenuComponent.ts`) closes
every open accordion in the *entire* tree when one opens, not just
immediate siblings, and never actually clears a nested item's own
`.show` class when its parent collapses — so a collapsed-then-reopened
category remembers it was expanded. Radix's `Content` unmounts on
close, resetting nested state instead. Accepted as a minor, deliberate
deviation: real nesting only ever goes 2 levels deep today
(`CategoryGroup.categories?: Category[]`, but `Category` itself has no
`.categories` — verified in `src/marketplace/types.ts`), so it only
affects re-opening an already-visited, already-collapsed category.

### Route-driven auto-expand

`UnifiedSidebar.tsx` used to imperatively call
`MenuComponent.getInstance(...).show(item)` on every route change, to
auto-expand the section matching the current page (so a deep link to a
resource lands with "Resources" already open). Replaced with a
`useEffect` that calls the *same* shared `useExclusiveOpen`'s
`setOpenId` using the same two route-name lists — a one-shot "open it"
on route match, not a persistent binding, matching the original's own
behavior of never calling the equivalent of `.hide()`: the user can
still manually collapse a route-active section afterward, and it only
reopens on the next matching navigation.

### Seven real bugs, found only by testing live — not by reading the code

Both this migration's own investigation and a dispatched planning
agent's independent research read the relevant SCSS beforehand and
missed these; they only surfaced once the result was actually clicked
open and inspected live. Bugs 1–2 surfaced in Storybook with
`getBoundingClientRect()` checked, not assumed from the CSS source. Bugs
3–4 surfaced later, against a live user bug report ("layout is bit
different, animation is gone") that Storybook alone hadn't caught —
Storybook doesn't load the real app's Tailwind preflight bundle
(`src/tailwind.css`) the same way the actual dev server does, so the
cascade-layer conflict in bug 3 wasn't reproducible there at all;
finding it required live CSSOM inspection of the real app via Claude in
Chrome, since the sandboxed Browser pane hit a login wall against this
app's real auth. Bugs 5–6 surfaced in a *second* round of the same live
user report, once bugs 1–4 were believed fixed and a screenshot showed
they weren't fully: the row-width/icon-alignment complaint and the caret
snapping were separate, real regressions this session had (wrongly)
assumed the earlier fixes already covered.

**1. The accordion never became visible at all.**
`core/components/menu/_base.scss` has *two* separate `.menu-sub-accordion`
rules — a simple top-level one, easy to find, and a second, more
specific one nested inside a breakpoint mixin: `display: none`, flipped
to `display: flex` only by a `.show` class (on itself or its parent).
Nothing sets `.show` once `MenuComponent` stops driving this tree, so
without a matching override the content stayed `display: none`
*forever* — `[data-state]`, the arrow rotation, all of it looked
correct, but `getBoundingClientRect().height` stayed 0 no matter what.
Fixed with `.menu-sub-accordion[data-state] { display: flex; }` in
`custom/_aside.scss`, applying to both `open` and `closed`: Radix's
Presence keeps this node mounted with `data-state="closed"` for the
duration of the closing transition before actually unmounting it (the
same exit-animation pattern Dialog/Popover use), and `display: none`
during that window would freeze the close transition before Radix ever
saw it play.

**2. `transition: height` looked right on disk but never actually
animated — traced to Radix's own internal implementation, not the CSS.**
The first attempt at bug 1's fix paired `display: flex !important` with
`transition: height 250ms ease-out` and `[data-state='open']
{ height: var(--radix-collapsible-content-height) }`. It rendered
correctly and *looked* like it should animate, but every open/close
snapped straight to the final height with no interpolation. Reading
`@radix-ui/react-collapsible`'s source
(`node_modules/@radix-ui/react-collapsible/dist/index.mjs`,
`CollapsibleContentImpl`) explains why: on every open/close it
synchronously sets `node.style.transitionDuration = '0s'` and
`node.style.animationName = 'none'`, calls `getBoundingClientRect()` to
measure the content (this call is also what forces a synchronous reflow
between disabling and re-enabling — without it the two style writes
would just coalesce into one, since both happen in the same layout
effect before paint), then restores both. That disable → forced-reflow →
restore dance is specifically what makes an `animation` restart reliably
(a computed `animation-name` going `none` → a named animation after a
forced reflow reliably (re)starts it, per spec) — which is exactly the
pattern Radix's own docs use (`animation: slideDown/slideUp` +
`@keyframes` reading the `--radix-*-content-height` var). A `transition`
has no equivalent hook here: with no intervening *painted* frame at the
old value, there's nothing for it to interpolate from, so the browser
just resolves directly to the new value. The fix was to follow Radix's
own pattern instead of fighting it — `animation: kt-menu-accordion-down`
/ `kt-menu-accordion-up`, keyframed from `0` to
`var(--radix-collapsible-content-height)`, matching the pattern this
migration's own earlier notes (see revision history) had originally
tried and prematurely abandoned in favor of `transition` — that earlier
abandonment was itself chasing a *different* bug (bug 1, the missing
`display` override) that happened to make both approaches look equally
broken in Storybook at the time.

**3. `!important` didn't actually beat `[hidden]`, even with higher
specificity — a cross-layer `!important` ordering issue, not a
specificity one.** Bug 1's fix (`display: flex !important`) covered
core's own non-important `display: none`, but the live app kept the
accordion content permanently invisible whenever `Collapsible.Content`
set the native `hidden` attribute in its closed resting state. Tailwind
ships `[hidden]:where(:not([hidden="until-found"]))
{ display: none !important; }` in its own preflight, inside
`@layer base`. Confirmed live via `document.styleSheets` CSSOM
inspection: Tailwind's compiled `<style>` tag declares
`@layer theme, base, utilities` (and its own small `@layer bootstrap`)
well before Metronic's compiled `<link>` stylesheet's own, much larger
`@layer bootstrap` block is parsed — fixing `base` ahead of `bootstrap`
in the *whole document's* cascade layer order. Cascade layers reverse
priority specifically for `!important` declarations: an earlier layer's
`!important` wins over a later layer's `!important`, regardless of
selector specificity. `.aside .menu .menu-sub-accordion[data-state]`
easily outranks the bare `[hidden]` on specificity alone, but specificity
never even gets compared here — layer order decides it first, and
`bootstrap` (later) always loses to `base` (earlier) on that axis. There
is no CSS-only way to out-rank it from inside `bootstrap`; the fix had to
stop trying to win the fight (see bug 4).

**4. The natural-seeming way to dodge bug 3 — `forceMount` — breaks
Radix's own height measurement instead.** If `Collapsible.Content` never
sets `hidden` in the first place, there's no `[hidden]` fight to lose.
Radix's `Content` accepts a `forceMount` prop for exactly this: content
stays permanently mounted and CSS alone (`[data-state]`) controls
visibility. Tried live, and it does dodge bug 3 cleanly — but reading
`CollapsibleContentImpl` further shows the underlying
`--radix-collapsible-content-height` custom property is refreshed via
`heightRef.current = rect.height` inside a layout effect gated on
`[context.open, present]`, and that new value only reaches the rendered
`style` prop through a `setIsPresent(present)` call in the *same* effect
— a real state update, but only when `present`'s value actually changes.
`forceMount` pins `present` to `true` permanently, so after the very
first mount `setIsPresent(true)` is a no-op bailout on every subsequent
toggle: no re-render, so the height var is computed once and then never
refreshed again. Confirmed live: `content.style.getPropertyValue
('--radix-collapsible-content-height')` under `forceMount` read empty on
several toggles that should have re-measured it, and the animation from
bug 2 snapped for a different reason than before. Reverted `forceMount`;
kept Radix's default hidden-attribute mount/unmount (which does
genuinely toggle `present` on every open/close, keeping the height var
fresh) and paid for it with the `!important` from bug 3 instead — a
narrower, better-understood cost than losing correct height measurement.

**5. The trigger button shrank to fit its content instead of filling the
row — also explained two other reported symptoms.** Reported live, with
a screenshot, as "layout is bit different" and "icons are at the right
side" (meaning: they weren't). `.menu-link`'s width comes from
`flex: 0 0 100%` (core/components/menu/_base.scss) — but `flex-basis`
only does anything when the *parent* is a flex container, and
`.menu-item` is `display: block`. The old `<a class="menu-link">`
trigger never noticed, because a plain block-level box fills its block
parent's width by default regardless of flex properties. `button`
elements don't get that default: form controls keep their own
fit-content intrinsic sizing even once `display: flex` is set, unless
something explicitly stretches them (a real flex/grid parent, or a
literal `width`) — confirmed live via `getComputedStyle`/
`getBoundingClientRect`: the `<button>` measured 179px inside a 255px-
wide `.menu-item`. Once `Collapsible.Trigger` became a real `<button>`
(this migration), the row silently started shrinking to content width.
That single narrower box is also what the other two symptoms were:
the open-state background highlight (sized off this same element) not
spanning the row, and the funnel/caret icons sitting right after the
title instead of pinned to the row's right edge — `.menu-title`'s
`flex-grow: 1` (core SCSS) had no extra width to grow into. Fixed with
one `width: 100%` on `.aside .menu .menu-item .menu-link` — scoped to
the sidebar specifically, since `button.menu-link` is also reused by
`FooterDropdown.tsx` for a horizontal (not full-width) footer item.

**6. The arrow's rotation had no `transition` at all — a second instance
of the exact bug already fixed once for `.header-menu`.** Reported live,
same round as bug 5, as the caret rotation snapping instead of
animating. `.menu-arrow:after`'s `transition` declaration
(core/components/menu/_base.scss) lives inside `&.show { .menu-link {
.menu-arrow:after { transition: ...; } } }` — gated behind Metronic's
own `.show` class, which nothing sets anymore under Radix. This
migration's own `[data-state]` override only ever set `transform`, on
the (wrong) assumption that core "already carries its own transition" —
it doesn't, for anything Radix drives. The exact same bug shape, for the
exact same reason, was already found and fixed for `.header-menu
.menu-item` earlier in this migration (`custom/_menu.scss`, see its own
comment there) — missed here because this file's rule was written
before that fix landed and never revisited. Fixed the same way: added
`transition: get($menu, accordion, arrow-transition);` to an
always-present `&:not(.menu-dropdown) > .menu-link .menu-arrow:after`
base rule in `custom/_aside.scss`, not gated behind any `[data-state]`
condition.

Also verified live afterward, once all six fixes above were in place —
this time with stronger evidence than earlier rounds in this same
session. The Claude-in-Chrome automation tab used throughout reported
`document.hidden === true` regardless of click/focus activity
(confirmed via `document.visibilityState`), which made JS-based
animation-timing diagnostics (`getAnimations()`, `getBoundingClientRect()`
sampled over `setTimeout`) unreliable — Chrome throttles animation
rendering for hidden tabs, and those diagnostics kept reporting instant
snaps even for changes that, per source-level analysis, should animate.
Screenshots turned out to be the reliable channel instead: CDP forces a
real paint for each capture regardless of tab visibility. A burst of
sequential screenshots across an open/close click showed genuinely
different intermediate heights (one resource item visible, then two,
then the full three) rather than an instant jump, and a tightly zoomed
burst on the arrow specifically caught it mid-rotation between its
closed and open icon shapes — direct visual proof both animations
genuinely interpolate, not just a plausible reading of the CSS. Also
confirmed: the open-state background highlight and funnel/caret icon
alignment now match the reference `Administration` row, sibling-
exclusivity holds at both the top level (Resources vs. Calls) and nested
level (Storage vs. Compute inside Resources), and the `disabled` case
renders fully static markup with no `Collapsible`, no button, no
`data-state`.

**7. The open accordion's own highlight was a hand-rolled duplicate with
the *wrong* colour, shadowing a correctly-designed rule this migration
never touched.** Reported live, a commit later, as "background is not
the same, row highlight is missing" — comparing two screenshots where a
route-active leaf item (`Private clouds`) showed a visible highlight in
one and nothing in the other. Chasing that down live turned up something
this migration had missed entirely:
`layout/aside/_menu.scss` already has a complete, per-aside-style colour
system for exactly this (`$asides` map: `bg-hover`, `bg-active`,
`bg-subitem`, `accordion-active`, `sub-accordion-active`, one full set
per style — `primary`/`accent`/`accent-light`/`dark`/`light`), applied
via `&.menu-accordion { &.hover { background: get($value,
accordion-active); } }`. `.hover` is Metronic's own JS-set class
(`MenuComponent`'s accordion algorithm) — dead under Radix, same as
every other `.hover`/`.show` reference this migration bridged elsewhere.
This one was missed because the accordion visually still looked "open"
(border-radius, overflow, arrow rotation all bridged correctly) and
*something* was rendering a highlight — bug 1's `!important` `display`
override had originally shipped with `custom/_aside.scss` growing its
own duplicate rule with a hardcoded, non-per-style colour
(`if(isDarkMode(), $gray-300, $primary-700)`) rather than reusing this
file's tokens, which looked plausible enough at a glance to not notice
it was covering for the real rule being dead underneath. It only stood
out once tested against the `accent` aside style specifically, where the
generic `$primary-700` fallback least resembled `accordion-active`'s
actual brand-derived value (confirmed live:
`getComputedStyle(...).backgroundColor` on the accordion read
`rgb(40, 97, 0)` before the fix, against an expected `rgb(31, 80, 0)` —
different enough to read as "wrong", though similar enough in a
screenshot to not obviously look broken). Fixed by bridging the
*original* rule (`&.hover, &[data-state='open'] { background:
get($value, accordion-active); }`, same pattern for the 2nd-level
accordion variant just below it) and deleting the duplicate rather than
maintaining two versions of the same thing. The leaf item's own
highlight (`Private clouds`, `.here` state) was never actually broken —
`menu-link-here-state`'s `&.here > .menu-link` selector uses a real
persistent class MenuItem.tsx sets from React state, not a Metronic-JS
one, so it kept working throughout; it read correctly
(`get($value, bg-subitem)`, confirmed live) both before and after this
fix, just dimmer than the miscoloured accordion background sitting next
to it made it look by comparison.

**Not migrated, deliberately**: `MenuComponent.ts` itself stays —
`OfferingsPanel.tsx` (inside the unrelated `MarketplaceTrigger` modal)
still has a live `data-kt-menu-dismiss="true"` that it actively reads,
and `MasterInit.tsx`/`MasterLayout.tsx`'s bootstrap/reinit calls stay for
that reason. `Sidebar.tsx`'s other Metronic widgets — `DrawerComponent`
(mobile drawer), `ScrollComponent` (custom scrollbar), `ToggleComponent`
(minimize toggle) — are untouched, a different concern from the menu.

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
