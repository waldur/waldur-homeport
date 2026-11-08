# Retiring static inline styles

An audit of every `style={{ … }}` in `src/` and `packages/`, and a staged plan
to move the ones that are a static class in disguise onto Tailwind utilities.

Inline styles are not banned — a value computed at runtime (a progress width, a
chart gradient, a CSS custom property) belongs there. The problem is the static
ones: `style={{ maxWidth: '100%', maxHeight: '80px' }}` is three declarations
that could be two classes, and because an inline style outranks every
stylesheet and every utility, each one is also a silent opt-out of the
cascade — of dark mode, of responsive variants, of the token scales the lint
rules guard.

## What the audit found

432 `style={{ … }}` attributes across 287 files.

| Bucket                                              | Count |
| --------------------------------------------------- | ----- |
| **Static** — every value a literal string or number | 305   |
| of those, app code                                  | 254   |
| of those, stories / tests / lint fixtures           | 51    |
| **Runtime** — at least one computed value           | 127   |
| of those, a ternary between two literals            | 7     |

The 305 static attributes hold 423 individual declarations. Classified by what
replaces them:

| Replacement              | Count | Example                                          |
| ------------------------ | ----- | ------------------------------------------------ |
| Keyword utility, 1:1     | 143   | `whiteSpace: 'pre-wrap'` → `whitespace-pre-wrap` |
| On the 4px spacing scale | 237   | `minWidth: 160` → `min-w-40`                     |
| Arbitrary value          | 19    | `maxHeight: '70vh'` → `max-h-[70vh]`             |
| Needs a human decision   | 24    | gradients, forced colours, `maskType`            |

Seven of those 24 are deliberate fixtures inside
`packages/eslint-plugin-waldur/rules/*.test.ts` and
`packages/stylelint-plugin-waldur/rules/*.test.ts` — they exist so the rules
can report them, and must stay.

Where the static styles sit:

- **220 on plain DOM elements** (116 `div`, 30 `img`, 26 `span`, 13 `th`,
  11 `p`, 8 `td`, 6 `pre`, …) — a `className` swap, nothing else to check.
- **34 on React components** (`TableHead`, `FormField`, `Card`, `BaseButton`,
  `ExpandableContainer`, `DatePicker`, …) — each needs a look at whether the
  component forwards `className` to the element the style was aimed at.
  Spot-checked: `FormFieldProps extends HTMLAttributes<HTMLElement>`,
  `TableHead` and `ExpandableContainer` all take `className`.

By area (app code only, 195 files):

```text
49 marketplace   24 administration  14 reporting   11 project    5 ai-assistant
36 proposals     24 auth            14 openportal  7 table       5 packages/ui
                                    12 matrix      6 user/customer each
```

Only 17 files hold three or more; the long tail is one or two per file. The
worst are `StepContributionsSection.tsx` (6), `FeaturesList.tsx` (5),
`OrganisationAllocationTab.tsx` (5), `MatrixCallView.tsx` (4),
`TosDataTables.tsx` (4), `DetailsDiff.tsx` (4).

## Three findings worth acting on before any mass rewrite

### 1. The auth logo overrides its own responsive cascade

21 files in `src/auth/layouts/` plus `src/auth/LoginColumn.tsx` repeat the same
logo:

```tsx
<div className="login-logo mb-2.5">
  <img
    alt={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
    src={imageUrl}
    style={{ maxWidth: '100%', maxHeight: '80px' }}
  />
</div>
```

`LoginColumn.scss` already styles that element, responsively:

```scss
@media (width >= 768px) {
  .login-logo img {
    max-height: 80px;
  }
}
@media (height <= 600px) {
  .login-logo img {
    max-height: 50px;
  }
}
@media (height <= 450px) {
  .login-logo img {
    max-height: 35px;
  }
}
```

The inline `max-height: 80px` outranks all three, so on a short viewport the
logo never shrinks — the 600px and 450px rules are dead. `MinimalLayout.tsx`
makes it worse with `maxHeight: '100px'`, overriding the 768px rule too.

A naive rewrite to `max-h-20` reproduces the bug exactly. The fix is to
**delete** the inline style, not translate it.

There is a second problem in the same place: `.login-logo` is defined only in
`LoginColumn.scss`, which only `LoginColumn.tsx` imports. The 21 alternative
layouts use the class without pulling in its stylesheet, so whether those rules
apply at all depends on `LoginColumn` happening to land in the same chunk. The
inline style is what actually sizes the logo today.

So this cluster is one shared component, not 22 class swaps:

```tsx
// src/auth/LoginLogo.tsx
export const LoginLogo = ({ className }: { className?: string }) => (
  <div className={classNames('flex items-center justify-center', className)}>
    <img
      alt={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
      src={getIconUrl('login_logo')}
      className="login-logo-image max-w-full"
    />
  </div>
);
```

Keep the three height steps where they already are, in a stylesheet the
component imports itself — height-based media queries have no Tailwind variant
in this project, and writing them as arbitrary variants would be harder to read
than the SCSS they replace. The point is that the component owns both the
markup and the rules, instead of 22 call sites borrowing a class from a file
they do not import.

That is 23 of the 305 static attributes and the only behaviour change in the
whole plan, so it ships on its own with a visual check.

### 2. rem-based `max-w-*` is not a safe target for px values

HomePort pins the root font size to 13px, 12px below `md`
(`src/tailwind.css:202`). Tailwind's container scale is in rem, so `max-w-xl`
is 468px here, not 576px — and 432px on a phone. Mapping
`style={{ maxWidth: 520 }}` to a named container class would silently resize it
twice.

The spacing scale is safe: `--spacing` is pinned to `4px`
(`packages/design-tokens/src/css/primitives/spacing.css:8`), so `max-w-130` is
exactly 520px at any root. **Every px value maps through the spacing scale or
an arbitrary `[520px]`, never through `max-w-xl`.** That is what makes 237 of
the 423 declarations mechanical.

(18 existing `max-w-xl` and 18 `max-w-md` uses in the codebase already ride the
13px root. Out of scope here; worth a separate look.)

### 3. Four literal colours are hiding from `no-literal-color`

`no-literal-color` reads class lists and stylesheets; these sit in style objects
and were never counted:

| Site                                                          | Declaration                              |
| ------------------------------------------------------------- | ---------------------------------------- |
| `src/customer/project-digest/ProjectDigestPreview.tsx:82`     | `backgroundColor: '#fff', color: '#333'` |
| `packages/ui/src/AccordionCard/AccordionCard.stories.tsx:115` | `border: '1px dashed #999'`              |

`ProjectDigestPreview` is a deliberate forced-light surface — it previews an
email body, which renders on white in a mail client. It still should not be a
hex: give it a named class (`.email-preview`, or `bg-white text-neutral-700`
with a comment) so the intent is legible and `colors:check` can see it. The
story border is just a story border; `border border-dashed border-secondary`.

Both are fixed in Phase 0. Note that fixing them did not move
`yarn colors:check` (still 6, baseline 6) and neither file was ever listed:
the detector genuinely cannot see a hex inside a style object, so making
`no-literal-color` read style objects is a real follow-up, not bookkeeping.

## Mapping table

The 143 keyword replacements, all exact:

| Declaration                       | Class                 |     | Declaration                  | Class                 |
| --------------------------------- | --------------------- | --- | ---------------------------- | --------------------- |
| `whiteSpace: 'pre-line'` (15)     | `whitespace-pre-line` |     | `overflow: 'auto'`           | `overflow-auto`       |
| `whiteSpace: 'pre-wrap'` (14)     | `whitespace-pre-wrap` |     | `overflowY: 'auto'`          | `overflow-y-auto`     |
| `whiteSpace: 'nowrap'`            | `whitespace-nowrap`   |     | `overflowX: 'auto'`          | `overflow-x-auto`     |
| `wordBreak: 'break-word'`         | `break-words`         |     | `objectFit: 'contain'`       | `object-contain`      |
| `maxWidth: '100%'` (27)           | `max-w-full`          |     | `objectFit: 'cover'`         | `object-cover`        |
| `width: '100%'`                   | `w-full`              |     | `pointerEvents: 'none'`      | `pointer-events-none` |
| `height: '100%'`                  | `h-full`              |     | `pointerEvents: 'auto'`      | `pointer-events-auto` |
| `minWidth: 'max-content'`         | `min-w-max`           |     | `position: 'absolute'`       | `absolute`            |
| `display: 'flex'` (9)             | `flex`                |     | `flexDirection: 'column'`    | `flex-col`            |
| `display: 'none'`                 | `hidden`              |     | `textAlign: 'center'`        | `text-center`         |
| `cursor: 'pointer'` (7)           | `cursor-pointer`      |     | `textTransform: 'uppercase'` | `uppercase`           |
| `justifyContent: 'center'`        | `justify-center`      |     | `userSelect: 'none'`         | `select-none`         |
| `justifyContent: 'space-between'` | `justify-between`     |     | `touchAction: 'none'`        | `touch-none`          |
| `alignItems: 'center'`            | `items-center`        |     | `flex: 1`                    | `flex-1`              |
| `alignSelf: 'center'`             | `self-center`         |     | `gridColumn: '1 / -1'`       | `col-span-full`       |

The 237 scale replacements follow one formula — **px ÷ 4** — and use the
project's logical spacing utilities (`ms`/`me`/`ps`/`pe` outnumber
`ml`/`mr`/`pl`/`pr` by roughly 20:1, and no RTL direction is wired, so the
switch is inert):

| Declaration              | Class           |     | Declaration            | Class     |
| ------------------------ | --------------- | --- | ---------------------- | --------- |
| `minWidth: 200` (7)      | `min-w-[200px]` |     | `padding: '16px'` (8)  | `p-4`     |
| `minWidth: 120` (5)      | `min-w-30`      |     | `paddingLeft: '16px'`  | `ps-4`    |
| `minWidth: 90` (5)       | `min-w-22.5`    |     | `paddingRight: 0`      | `pe-0`    |
| `minWidth: 0` (4)        | `min-w-0`       |     | `gap: 16` (4)          | `gap-4`   |
| `maxWidth: 520` (6)      | `max-w-130`     |     | `marginBottom: '20px'` | `mb-5`    |
| `maxHeight: '80px'` (17) | `max-h-20`      |     | `marginLeft: 'auto'`   | `ms-auto` |

Only 19 declarations need an arbitrary value, and they are the obvious ones:
`h-[70vh]`, `max-h-[70vh]`, `w-[5%]`, `min-w-[10ch]`, `min-h-[1.2em]`,
`z-[1056]`, `w-[42.5px]`. Two carry `calc()`, whose spaces cannot survive into
a class name: `height: 'calc(100vh - 320px)'` becomes `h-[calc(100vh-320px)]`
or `h-[calc(100vh_-_320px)]` with Tailwind's underscores — both compile, and
the codemod should pick one. Left as written, with the spaces, the class breaks
at the first space and generates nothing.

Every class named in this document was checked against the project's own
`--spacing: 4px` theme with `@tailwindcss/cli`, including the fractional steps
(`min-w-22.5`, `w-42.5`) and `max-w-130`.

## Plan

### Phase 0 — land the guard, baselined at today's count — **done**

`waldur-custom/no-static-inline-style`
(`packages/eslint-plugin-waldur/rules/no-static-inline-style.js`) reports a
property of a JSX `style` object when every part of its value is a literal
**and** the declaration has a Tailwind utility, which the message names. It is
not autofixable: a fix has to reach `className`, which may be absent, a
`classNames()` call, or on a component that does not forward it. That is the
codemod's job in Phase 2.

The `inJsxStyle` helper the three sibling rules each had their own copy of now
lives in `packages/eslint-plugin-waldur/lib/jsx-style.js`, alongside
`staticStyleValue` and `styleObjectHasSpread`; `require-font-size-scale`,
`require-weight-scale` and `enforce-border-radius-tokens` import it from there
(their 48 tests pass unchanged).

The rule stays silent on a value computed at runtime, a CSS custom property, a
declaration with no utility, and — a case the audit did not anticipate — **any
style object with a spread in it**. Where a caller's `style` is spread in,
merge order decides which declaration wins, so moving one of the object's
literals to a class can change what applies. Those are the forwarded-`style`
components the audit put in "what stays", so the rule leaves the whole object
alone rather than reporting its literals.

`fontSize`, `fontWeight` and `borderRadius` are left to
`require-font-size-scale`, `require-weight-scale` and
`enforce-border-radius-tokens`, which already report them inline, so nothing is
reported twice.

The baseline is `inline-style.baseline.json`, written by
`scripts/static-inline-style-baseline.mjs` through `writeRuleBaseline`
(`yarn lint:styles:baseline`), counted per file and per property:

```json
{ "src/auth/layouts/NewsLayout.tsx": { "maxHeight": 1, "maxWidth": 1 } }
```

**It lists 444 declarations in 232 files**, not the 305 attributes the audit
counted, for two reasons that both make it the better number: the rule counts
_declarations_, and it counts them in mixed objects too — `style={{ width:
'100%', maxHeight }}` has one static declaration the audit's all-or-nothing
bucketing missed. Verified end to end: a file at its listed count passes, one
more declaration is reported, and a file holding fewer is reported as stale, so
the counts only shrink.

Shipped with it:

- The two literal-colour fixes from finding 3. `ProjectDigestPreview` now
  carries `bg-white dark:bg-white text-gray-700 dark:text-gray-700` and a
  comment saying why it is forced light, matching `HpcFileContentDialog`'s
  existing pattern for an embedded HTML report; the `AccordionCard` story
  border is `border border-dashed border-secondary`.
- `yarn colors:save` was **not** needed: the count stayed at 6, and neither
  file was ever in `scripts/color-literals.baseline.json`. That confirms the
  gap rather than closing it — `no-literal-color` still cannot see a hex in a
  style object. Teaching it to, now that `staticStyleValue` exists, is a small
  follow-up worth doing.
- A "## Inline styles" section in `docs/design-tokens.md`, a
  "## Static inline style guard" section in `docs/code-quality.md`, a bullet in
  `CLAUDE.md`, and the guard's row in the design-tokens guard table.
- `docs/ui-consistency-guidelines.md`'s truncation example, which showed
  `style={{ maxWidth: 200 }}` as approved, is now
  `className="ellipsis inline-block max-w-50"` (it also used the retired
  Bootstrap `d-inline-block`).
- `docs/tailwind-shadcn-migration-notes.md`'s rem-trap warning, which ended
  "**Always use explicit pixel values (`style={{ width: '250px' }}`) for inline
  sizing**", now sends readers to the px-pinned spacing scale and the custom
  property bridge instead.
- `docs/theme.md:195` needed **no** change: the audit misread it. Its
  `style={{ backgroundColor: '#f5f5f5', color: '#333' }}` is already labelled
  "Bad" and contrasted with `className="bg-secondary text-secondary"`.

CI now fails on any _new_ static inline style while the 444 existing
declarations are burnt down, so nothing in the phases below is urgent.

### Phase 1 — the auth logo — **done**

`src/auth/LoginLogo.tsx` and `src/auth/LoginLogo.css` replace the block all 23
call sites repeated. A layout now says only how tall the logo may be and how
much room to leave under it:

```tsx
<LoginLogo className="mb-2.5" />          // 80px cap, seventeen layouts
<LoginLogo className="mb-2.5" size="sm" />  // 70px, four layouts
<LoginLogo className="mb-3" size="lg" />    // 100px, MinimalLayout
```

All 45 inline declarations are gone (23 `maxWidth`, 22 `maxHeight`), and the
dead `.login-logo` rules are out of `LoginColumn.scss` and into the
component's own stylesheet, which the component imports — so a layout no
longer borrows rules from a file it does not import.

Specificity is the whole trick. Each size sets the image's `max-height`
through `[data-size='…']` (0,2,0), so the short-viewport steps have to match
that weight — `.login-logo-image[data-size]`, not a bare class — and then win
on source order. Written the obvious way, a size would outrank the steps and
`height <= 600px` would do nothing, which is precisely what the inline
`max-height` did to it. (A custom property would have read better, but
stylelint's `property-disallowed-list` keeps `--*` definitions inside
`packages/design-tokens/`.)

The three per-layout caps were **kept, not flattened** — 80/70/100 is what each
layout renders today, and unifying them would be a visual change nobody asked
for.

Verified in the browser against the real stylesheet, measuring computed styles
at each breakpoint:

| Viewport | image `max-height` | wrapper `min-height` |
| -------- | ------------------ | -------------------- |
| 1280×900 | 80 / 70 / 100 ✓    | 100px, flex-centred  |
| 1280×580 | 50 for all three ✓ | 60px                 |
| 1280×430 | 35 for all three ✓ | 40px                 |
| 400×900  | 80                 | 0, not flex          |
| 400×420  | 35 ✓               | 40px                 |

The 50px and 35px rows are the rules that have never once applied.

Two things the plan had not accounted for, both found while doing it:

- **`LoginColumn` asks for a localized logo** — it alone calls
  `getIconUrl('login_logo', currentLanguage?.code)`, which appends
  `?language=xx`; the 21 layouts call it with no language. `LoginLogo` takes an
  optional `language` prop and only `LoginColumn` passes it, so every call site
  keeps the logo it shows today. Whether the layouts _should_ localize is a
  real question, deliberately left alone here.
- **`LoginColumn` had no `maxHeight` at all**, so below 768px its logo was
  uncapped — the `.login-logo img { max-height: 80px }` rule was scoped to
  `width >= 768px` along with the flex centring around it. It is now capped at
  80px there like every other layout. That is the one intended rendering change
  beyond the short-viewport fix.

### Phase 2 — codemod the keyword and scale declarations — **done**

`scripts/codemods/static-inline-style.mjs`, built like
`scripts/codemods/bootstrap-spacing.mjs`: an ad-hoc ESLint rule whose fixes are
collected, applied back to front and re-printed with prettier. It took the
property families to convert, so it ran in reviewable slices:

```bash
node scripts/codemods/static-inline-style.mjs whiteSpace wordBreak
node scripts/codemods/static-inline-style.mjs maxWidth minWidth -- src/reporting
```

The class for a declaration comes from the rule's own `utilityFor`, so the
codemod and the linter cannot disagree about what a declaration becomes.

| Slice                                         | Declarations | Files |
| --------------------------------------------- | ------------ | ----- |
| 1 — `whiteSpace`, `wordBreak`, `overflowWrap` | 31           | 21    |
| 2 — the remaining keyword properties          | 69           | 40    |
| 3 — `width`/`height`/`min`/`max`, `flexBasis` | 175          | 125   |
| 4 — padding, margin, gap, inset               | 55           | 30    |
| **total**                                     | **330**      | —     |

**The baseline went 441 → 396 (phase 1) → 66 declarations in 37 files.**

The codemod was deleted once the baseline reached zero, as
`bootstrap-spacing.mjs` was when the Bootstrap spacing migration finished: the
rule is what keeps inline styles out now, and `git log` has the tool if the
job ever comes back.

The codemod only rewrites what it can rewrite safely, and prints every site it
leaves behind with the reason. Across the four slices that was 46: 38 component
hosts (phase 3), 7 with a `className` that is not a plain string literal, and
one with a comment inside the style object that reprinting would drop. A style
object with a spread in it is passed over silently, as the rule passes over it.

Two safeguards worth keeping in mind, both of which earned their place:

- **A class already setting the same property.** Moving `maxWidth: 200` onto an
  element that already says `max-w-full` does not leave the inline value
  winning as it does today — it leaves two utilities for one property, and
  Tailwind's emit order decides, not the class list. `setsSameProperty` answers
  that from the same two tables the utilities come from, and the codemod skips
  the site. A sweep of every rewritten class list afterwards found no element
  with two sizing utilities for one property.
- **Steps Bootstrap made ambiguous.** The first run wrote `min-w-50` for
  `minWidth: 200` and `no-bootstrap-layout-utility` rejected all 15 such
  classes: Bootstrap used `w-50` for 50% and Tailwind reads it as 200px, so the
  name is reported whichever was meant. `utilityFor` now emits the arbitrary
  form for `w`, `h`, `min-w`, `min-h`, `top`, `bottom`, `start` and `end` at
  steps 25, 50, 75 and 100 — `min-w-[200px]`, not `min-w-50`. `max-w-*` and
  `max-h-*` are unaffected, since Bootstrap spelled those `mw-100`/`mh-100`.
  Covered by a test, and the examples in `CLAUDE.md`, `docs/design-tokens.md`
  and this document were corrected to match.

Checks after the four slices: `yarn lint:check` reports **zero errors** across
`src`, `locales/tools` and `packages` — which matters more than it sounds,
because `no-unknown-class` asks the same Tailwind design system the build loads
whether each class exists, so every one of the 330 generated classes is known
to paint something. `tsgo --noEmit`, `colors:check` (6/6), `rem:check`
(705/705), `style:check` and prettier are all clean, and 2,751 tests pass
(628 lint-plugin, 404 beside the changed files, 1,719 across `packages/ui`,
`src/table` and `src/auth`).

Two checks beyond the linters, for the things a linter cannot see:

- **Two utilities for one property.** A sweep of every rewritten class list
  found no element carrying two sizing utilities for the same property.
- **Lost specificity.** An inline style outranked an unlayered component
  stylesheet; a utility does not, so a converted declaration could now lose
  where it used to win. Indexing every class in every `.scss`/`.css` under
  `src` and `packages` against the properties its rules declare, and
  intersecting that with the classes the codemod added, turned up five
  apparent hits — all false, each a scoped legacy selector
  (`#{$card-header} .gap-3`) naming the very class the utility provides.

Spot-checked in Storybook: `AccordionCard`'s wide-content story still measures
1200px wide with 8px padding and a dashed border (now `--border-secondary`
rather than `#999`), and `ImageTablePlaceholder` still clears both sides and
centres its wrapped flex row.

What is left in the baseline, for phase 3:

```text
15 width      4 cursor         3 display      2 whiteSpace    1 overflow
 9 height     4 paddingLeft    3 minWidth     2 marginLeft    1 objectFit
 5 maxWidth   4 paddingRight   3 minHeight    1 margin        1 position
             3 pointerEvents                  1 padding       … and 6 more
```

### Phase 3 — the sites a codemod should not touch — **done**

**The baseline is 13 declarations in 6 files**, down from 441.

The work split three ways.

**Components that do forward.** Twelve were read and confirmed to put
`className` and `style` on the same element — each either spreads `{...props}`
onto one element or merges `className` into the element it also gives `style`
to. They are listed in the codemod's `SAFE_COMPONENTS`, which converted 28
declarations in 13 files: `AlertItem`, `BaseButton`, `Badge`, `Card`,
`CardContent`, `Code`, `ExpandableContainer`, `FormField`, `TableCell`,
`TableHead`, `TabsList`, `TabsTrigger`. `Menu.Content` and the two SVGR
`Logo` components were the same case and went by hand.

**Class lists the codemod would not touch**, done by hand — a `className` that
is a prop, a ternary, a template or a `cn()` call, and the conditional style
objects (`style={cond ? {…} : undefined}`) that become conditional classes:
`FeaturesList`, `MermaidChart`, `RateStars`, `DashboardCard`,
`UserIdentityBridgeTab`, `Tooltip`, `LikertField`, `ModelCard1`,
`ApproveByProviderDialog`, `SwimlaneDiagram`, `TableHeader`,
`VerticalProgressSteps`, `MailView`. Two of these were pure redundancy:
`SlurmPolicySection`'s `cursor: 'pointer'` and `DashboardCard`'s were already
in the class list beside them.

**Four that are correct as they are** now carry an
`eslint-disable-next-line … -- <reason>` rather than a baseline slot, because
nothing will ever convert them:

- `Modal.tsx` ×2 — "Radix sets pointer-events inline, so a class could not
  override it", which the file already said. The paired `pointer-events: auto`
  must also hold without a stylesheet, since the tests run without one.
- `FeaturedIcon.test.tsx` and `MenuPanels.test.tsx` — the forwarded `style` is
  the thing each test asserts on.

#### Closing the last thirteen

**The baseline is empty.** The six files left after the first pass fell to one
more round, which began as "give three components a `className` that lands
where `style` does" and found that most of the rest were not blocked at all.

Two components really did need the prop:

- **`DatePicker`** had a `style` prop and no `className`. It has one now,
  threaded through `DatePickerPopover` and merged onto the same element
  `style` lands on, in both the inline and the popover variant.
- **`withFormGroup`** gives `className` to the `FormGroup` wrapper, so a class
  for the control had nowhere to go. It now takes `controlClassName`, which
  reaches the wrapped component — and `TextField` already documents that its
  `className` goes on the `<textarea>`, exactly where `style` went.

**`FilterBox` needed nothing.** It already had `inputClassName`, which reaches
the same element as `style`; the earlier survey saw `className →
containerClassName` and stopped there. Worth knowing about that call site,
though: `<FilterBox style={{ flex: 1 }}>` puts `flex: 1` on the _input_, while
the flex item in the row around it is the container, so the box probably does
not grow the way it was meant to. The conversion to `inputClassName="flex-1"`
keeps today's rendering exactly; moving it to `className="flex-1"` would make
it grow, and that is a visible change for someone to choose.

**Three more were never blocked**, only mis-filed in the table above:

- `MapContainer` is ours (`src/map/MapContainer.tsx`), not react-leaflet's,
  and puts `className` and `style` on the same div.
- The LiveKit components extend `React.HTMLAttributes<HTMLDivElement>`, so
  `className` reaches the same div. Four `height: '100%'` became `h-full`.
- `TableHeader`'s four paddings were **dead code**: `TableHeader.scss` already
  sets `padding-left: 0 !important; padding-right: 0 !important` on
  `th.first-expandable-column`, under the identical condition. They were
  deleted rather than converted, and with no caller left passing `style`, the
  cell's `style` prop went with them — only the runtime pin offsets remain.

One mistake on the way, caught by `no-bootstrap-layout-utility`: the hand-written
`controlClassName="h-25"` for `height: 100` walked into the ambiguous-step trap
that `utilityFor` exists to avoid. Hand edits bypass the codemod, and so bypass
the guard it encodes; the linter is what caught it. It is `h-[100px]`.

Still inline, and right to be: the runtime values in **What stays** below, the
four sites carrying an `eslint-disable` with a reason (the Radix
`pointer-events` pair in `Modal.tsx`, and two tests asserting on a forwarded
`style`), and the pin offsets in `TableHeader`.

### Phase 4 — close out

With the baseline at zero for app code, flip the rule from baselined to plain
`error` and delete `inline-style.baseline.json` and its script, as the Bootstrap
guards will be deleted when their baselines empty.

## What stays

The 127 runtime styles are correct as they are, and the rule must not report
them. They fall into four groups:

- **Measured or animated geometry** — ``width: `${percent}%` `` on progress
  and cost bars, `height={containerHeight}` on charts, `transform` on a drag
  handle, `animationDelay` on a stagger.
- **Custom-property bridges** — `style={{ '--sidebar-width-icon': … }}`,
  `--drawer-width`, `--boot-brand`, `--dt-width`. This is the documented way to
  pass a varying value to a literal utility
  (`docs/tailwind-shadcn-migration-notes.md:699`); more of these, not fewer.
- **Forwarded `style` props** — `ImagePlaceholder`, `FeaturedIcon`, `Avatar`,
  `Tooltip`, `HeaderButtonBullet` all merge a caller's `style`.
- **Generated backgrounds** — gradients and `backgroundImage: url(...)` from
  user data.
