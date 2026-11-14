# Design Tokens

How colours are defined — the ramps, the semantic roles built on them, the Tailwind utilities
that expose those roles — and how to change one.

- [The rule](#the-rule) and [file format](#file-format): ramps as data
- [Semantic roles](#semantic-roles): the neutral text scale, surfaces, borders, the status
  matrix, brand
- [Tailwind utilities for the roles](#tailwind-utilities-for-the-roles): `text-tertiary` is
  `var(--text-tertiary)`
- [Retired colour utilities](#retired-colour-utilities)
- [The brand colour in SCSS](#the-brand-colour-in-scss)
- [Guards](#guards): tests and lint rules that keep all of the above true

## The rule

**Colour ramps are edited in one file:**
[`packages/design-tokens/tokens/colors.json`](../packages/design-tokens/tokens/colors.json).
Never edit the file generated from it:

| Generated file                                             | Consumer                                                                                            |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `packages/design-tokens/src/css/primitives/colorRamps.css` | Tailwind and CSS variables (`--color-gray-500`, `bg-success-600`), declared once in `@theme static` |

```bash
yarn tokens:generate   # rewrite colorRamps.css from the JSON
yarn tokens:check      # exit 1 if it is stale (also run by the unit tests)
yarn tokens:audit      # dead/ghost tokens, redundant aliases, new duplicate roles (exit 1)
yarn tokens:duplicates # the same, plus the full duplicate value-profile report
```

`generateTokens.test.ts` fails when a generated file no longer matches the JSON, whether the
JSON or the output was edited. The fix is always `yarn tokens:generate`.
`tokenAudit.test.ts` fails when an unexempted token has zero call sites in consumer code,
when consumer code references undeclared ghost tokens, when duplicate semantic token
declarations exist across stylesheets, or when two semantic tokens resolve to the same value
in both themes and the pair is not in `DUPLICATE_BASELINE` (see [Guards](#guards)).

## File format

```jsonc
"success": {
  "description": "Optional; becomes a comment in the output.",
  "steps": {
    "50":  { "light": "#ecfdf3" }
  }
}
```

Optional ramp-level key: `css: false` (leave the ramp out of the CSS).

Colours are lower-case `#rrggbb`; the generator rejects anything else. A step has one value:
the key is `light` for history, and the generator rejects a `dark` one. Ramps are physical and
the same in both themes; dark UI picks other steps through the semantic tokens. (The Sass
ramps used to be theme-inverted for a separate dark compile, `style.dark.scss`, which is gone.)

## Gray in dark mode: `gray` and `gray-dark`

Dark UI wants neutral grays where the light `gray` is blue-tinted (500 is `#667085` vs
`#85888e`), so there are two CSS ramps, both physical (step 900 is dark in both):

- `--color-gray-N` (`gray`) is the same in both themes: nothing overrides the variable per theme,
  and `text-gray-500` is `--color-gray-500` in dark mode too (bare gray steps are not theme-inverted).
  So a bare gray is dark-on-dark in dark mode: for neutral text, surfaces and borders use the
  [semantic utilities](#tailwind-utilities-for-the-roles), or pair the step with its `gray-dark`
  mirror (`bg-gray-300 dark:bg-gray-dark-600`).
- `--color-gray-dark-N` (`gray-dark`) is the palette for dark surfaces. It is read by the
  dark-theme blocks of `background.css` and `button.css`, and by the `dark` sidebar style
  in `sidebar.css` (a fixed look that is dark in either theme, so it reads `gray-dark`
  unconditionally, while the `light` style reads `gray`). A component that needs a dark-specific
  gray writes `dark:bg-[var(--color-gray-dark-800)]` or `dark:bg-gray-dark-800`.

Sass never reads `gray-dark`. Its values are what the old theme-inverted SCSS grays were
in dark mode, re-indexed: `gray-dark-N` was the dark value of the mirrored `$gray-N` (25 ↔ 950,
50 ↔ 900, …). The `mirrored-ramp-color()` mixin keeps that pairing for one-off SCSS colours.

## Semantic roles

The semantic layer (`packages/design-tokens/src/css/semantic/`) names what a colour is _for_.
Each role is defined for both themes in one file; prefer a role to a ramp step whenever one
fits. Values below are light / dark; `gray-dark-N` is written `dN`.

### Neutral content: `--text-*` (`text.css`)

One ladder for text **and** icons, strongest first. Every step is a distinct gray in both
themes.

| Token               | Light    | Dark | Use                                 |
| ------------------- | -------- | ---- | ----------------------------------- |
| `--text-primary`    | gray-900 | d25  | Headings, primary content           |
| `--text-secondary`  | gray-700 | d200 | Body copy, strong labels            |
| `--text-tertiary`   | gray-600 | d300 | Supporting text, menu items         |
| `--text-quaternary` | gray-500 | d400 | Muted text, subtitles, placeholders |
| `--text-quinary`    | gray-400 | d500 | Faint text, decorative icons        |
| `--text-senary`     | gray-300 | d600 | Disabled marks, inactive indicators |
| `--text-disabled`   | gray-300 | d500 | Disabled input and date-picker text |

The names follow the Untitled UI ordinal convention, and they match the Tailwind utilities
(`text-secondary` … `text-senary`). There is no separate `--fg-*` neutral family any more:
`--fg-primary` … `--fg-senary`, `--text-body`, `--text-subdued` and `--text-muted` were merged
into this scale. The renames, for reading old code or branches:

| Old                                   | New                 |
| ------------------------------------- | ------------------- |
| `--fg-primary`                        | `--text-primary`    |
| `--text-body`, `--fg-secondary`       | `--text-secondary`  |
| `--text-subdued`, `--fg-tertiary`     | `--text-tertiary`   |
| `--text-secondary`, `--fg-quaternary` | `--text-quaternary` |
| `--text-muted`, `--fg-quinary`        | `--text-quinary`    |
| `--fg-senary`                         | `--text-senary`     |

Note the trap in the middle row: the **old** `--text-secondary` was gray-500 and is now
`--text-quaternary`; the **new** `--text-secondary` is gray-700.

`text.css` also holds `--fg-white` (white text or icon in both themes). Every brand role is in
`brand.css`: the brand marks (`--fg-brand-primary`, `--fg-brand-secondary`,
`--fg-brand-accent`), brand text (`--text-brand-primary` / `--text-brand-secondary`, and
`--text-primary-on-brand` on a brand fill), brand surfaces and borders, and the focus ring.

### Surfaces: `--bg-*` (`background.css`)

| Token                | Light    | Dark | Use                                      |
| -------------------- | -------- | ---- | ---------------------------------------- |
| `--bg-primary`       | white    | d950 | The base surface                         |
| `--bg-primary-hover` | gray-50  | d800 | Hover/highlight of a row on that surface |
| `--bg-secondary`     | gray-50  | d900 | Faint panel, alternate section           |
| `--bg-tertiary`      | gray-100 | d800 | Avatar tiles, chips, pressed states      |
| `--bg-quaternary`    | gray-200 | d700 | Stronger fill (selected day, track)      |

Plus `--page-bg` and `--card-bg`, and the brand fills `--bg-brand-*`.

### Borders and lines: `--border-*` (`borders.css`)

| Token                     | Light     | Dark      | Use                                                                                                              |
| ------------------------- | --------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| `--border-primary`        | gray-300  | d700      | Input and control borders                                                                                        |
| `--border-secondary`      | gray-200  | d800      | Card and section borders (the default)                                                                           |
| `--border-tertiary`       | gray-100  | d800      | Hairlines                                                                                                        |
| `--border-divider`        | gray-200  | d700      | A drawn line: rules, step connectors                                                                             |
| `--border-divider-medium` | gray-300  | d600      | A line that must show on any surface: timeline and stepper connectors, dashed outlines (`border-divider-medium`) |
| `--border-divider-strong` | gray-400  | d500      | A strong line: drag handles                                                                                      |
| `--border-brand`          | brand-300 | brand-400 | Subtle brand border                                                                                              |
| `--border-brand-solid`    | brand-600 | brand-500 | Selected/active brand border                                                                                     |

State borders (success, warning, danger) are in the status matrix, not here.

### State colours: the status matrix (`status.css`)

Every colour that signals a state — badges, banners, alerts, health indicators, validation
errors, destructive menu items, status dots, focus rings on an invalid control — reads one
matrix:

| Slot         | success / warning | danger        | Use                                      |
| ------------ | ----------------- | ------------- | ---------------------------------------- |
| `-bg`        | 50 / 900          | 50 / 900      | Tinted surface (pill, banner, row)       |
| `-bg-strong` | 100 / 900         | 100 / 900     | Tint on one small shape (diagram node)   |
| `-border`    | 300 / 400         | 300 / 400     | Subtle border, neutral or tinted surface |
| `-solid`     | 600 / 500         | 600 / 500     | Saturated fill or ring                   |
| `-fg`        | 700 / 400         | 700 / **300** | Text, icons and dots                     |

as `--status-{success,warning,danger}-{bg,bg-strong,border,solid,fg}`, plus `-bg`, `-bg-strong`
and `-fg` only for `info` (50 / 900, 200 / 900 and 600 / 300) and `neutral`. `-bg-strong` has no
utility: it is for Mermaid node fills (`style A fill:var(--status-success-bg-strong)`), where the
50-step `-bg` nearly vanishes against plain nodes. Steps refer to the intent's ramp (`danger` reads `error-*`).

Each slot has a Tailwind utility (`tailwind/theme.css`):

| Slot      | Utility                                                                    |
| --------- | -------------------------------------------------------------------------- |
| `-fg`     | `text-danger`, `text-success`, `text-warning`, `text-info`, `text-neutral` |
| `-solid`  | `bg-danger`, `border-danger`, …                                            |
| `-bg`     | `bg-danger-subtle`, …, `bg-info-subtle`, `bg-neutral-subtle`               |
| `-border` | `border-danger-subtle`, …                                                  |

Use these, not the arbitrary form: `no-raw-status-ramp` autofixes `text-[var(--status-danger-fg)]`
to `text-danger`. A slot outside that table (`-solid` as text, say) keeps the arbitrary form.

- **One `-fg` for every surface.** Each `-fg` clears WCAG AA (4.5:1) on the card, on the page
  and on its own `-bg`, in both themes, so the same slot serves text on a neutral surface and
  text on a tinted pill. `statusContrast.test.ts` reads the CSS and enforces it; this is why
  danger's dark `-fg` is error-300 (error-400 on error-900 is 3.5:1).
- **`danger`, not `error`.** Roles are named by intent, like the button, `ActionItem` and Badge
  variants; `error` is only the red ramp's name.
- **No raw ramps for states.** `bg-success-50 dark:bg-success-900` is `bg-success-subtle`;
  the `no-raw-status-ramp` lint rule reports the raw form. A
  deliberate step outside the matrix (Badge's `outline` tone, `FeaturedIcon`'s tile tint, a
  halo ring) carries an `eslint-disable` with its reason.
- Retired names: `--text-{error,warning,success}-primary`, `--fg-{error,warning,success}-*`,
  `--border-{error,success}`, `--border-*-solid`, `--bg-{error,warning}-primary`,
  `--status-*-text` and `--status-*-dot` all became `-fg`, `-border`, `-solid` or `-bg` slots.

`Badge`'s `solid` and `light` tones and `Progress`'s fills read `-solid` / `-bg` / `-fg`
directly, so a badge, a bar and an alert of the same intent cannot drift apart.

### Brand

`--brand-*` is the tenant's runtime ramp (`initBrandTokens()`); `--brand-color` is its
step 600. Tailwind sees the ramp through the `--color-brand-*` bridge in `tailwind/theme.css`
(`bg-brand-50`, `text-brand-700`): physical steps like `gray-N`, the same in both themes. A
brand-tinted surface is `bg-brand-subtle` (`--bg-brand-subtle`: brand-50, brand-900 in dark). Brand text and lines are `text-brand` / `border-brand` /
`outline-brand`, which read the role `--text-brand`: `--brand-color` in light, `--brand-300` in
dark, where the tenant colour is too dark to read. A solid brand fill is
`bg-brand-solid`, brand-coloured secondary text (links) `text-brand-secondary`, and the pale
brand edge (`--border-brand`) is `border-brand-subtle`, named like the status matrix's tinted
`-subtle` border since `border-brand` is already the line colour. Semantic brand roles: `--bg-brand-*`, `--border-brand*`,
`--fg-brand-*`, `--text-brand*`, `--focus-ring-color`.

## Tailwind utilities for the roles

`tailwind/theme.css` in this package holds every utility whose value is a variable defined
elsewhere: the semantic roles and the runtime brand ramp. A primitive declares its own utility,
since there the variable is the token (`--color-gray-500`, `--radius-md`); a bridge never lives
next to a value, and a value never changes per theme outside `semantic/`. It bridges the roles to
Tailwind with **property-scoped theme keys**
(`--text-color-*`, `--background-color-*`, `--border-color-*`), not `--color-*`. A `--color-*`
entry fans out to every colour utility — `bg-`, `border-`, `ring-`, `fill-`, … — and a text gray
is not a background. Scoped keys give exactly one utility per role, and one rule:

It ships in the package and `index.css` imports it, so waldur-homeport, Storybook and the
micro-apps all get the same utilities; `waldur-ui` and `shell` depend on them.
`tailwindTheme.test.ts` fails if they use a semantic utility the package does not declare.

> **A utility and the variable of the same name are the same colour.**

| Utility                                                 | Is                                                |
| ------------------------------------------------------- | ------------------------------------------------- |
| `text-primary` … `text-senary`                          | `var(--text-primary)` … `var(--text-senary)`      |
| `bg-primary`, `bg-primary-hover`                        | `var(--bg-primary)`, `var(--bg-primary-hover)`    |
| `bg-secondary`, `bg-tertiary`, `bg-quaternary`          | `var(--bg-secondary)` …                           |
| `border-primary`, `border-secondary`, `border-tertiary` | `var(--border-primary)` …                         |
| `border-divider`                                        | `var(--border-divider)`                           |
| `text-brand`, `border-brand`, `outline-brand`           | `var(--brand-color)`                              |
| `bg-brand-solid`, `bg-brand-subtle`                     | `var(--bg-brand-solid)`, `var(--bg-brand-subtle)` |
| `text-brand-secondary`                                  | `var(--text-brand-secondary)`                     |
| `border-brand-subtle`                                   | `var(--border-brand)`                             |
| `bg-page`, `bg-card`                                    | `var(--page-bg)`, `var(--card-bg)`                |

- **No exceptions.** `text-primary` used to be the brand colour; its brand uses were renamed to
  `text-brand`, and `text-primary` is now `var(--text-primary)` like every other step.
- Prefer the named utility to the arbitrary form: `text-quaternary`, not
  `text-[var(--text-quaternary)]`. Roles with no utility (`--bg-brand-primary-alt`,
  `--bg-brand-secondary`, `--fg-brand-*`, `--text-brand-primary`) use the arbitrary form; the status matrix has its own (above).
- `min-w-dialog-action` (`var(--dialog-action-min-w)`) is the one size here: the minimum
  width of a dialog or wizard footer button.
- There is no `bg-secondary` _text_ colour, `text-secondary` _background_ and so on: each name
  exists only for the property it belongs to.
- Removed aliases: `bg-surface-faint` (now `bg-secondary`), `bg-bg-primary` (`bg-primary`),
  `border-border-*` (`border-*`), and the `--color-surface-faint`, `--color-bg-primary`,
  `--color-border-*`, `--color-secondary`, `--color-tertiary`, `--color-quaternary` keys. A brand
  border that used to be `border-primary` is now `border-brand`.
- **Neutral text and background utilities** use semantic tokens with the identical value in both
  themes: `text-quaternary`, `text-quinary`, `text-tertiary`, `text-secondary`, `bg-primary`,
  `bg-tertiary`, `bg-quaternary`, `border-divider`.

## Retired colour utilities

Obsolete colour classes paint nothing, and every colour class is Tailwind's and follows the design tokens. A bare `border` sets only the width, so it always names a colour: `border border-secondary` (`waldur-custom/require-border-color`, autofix).

| Retired Class                                      | Replacement                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| `text-danger` / `-success` / `-warning`            | Tailwind's `text-danger`, … (the `-fg` slot; a step darker in light mode) |
| `bg-` / `border-` `danger` / `success` / `warning` | Tailwind's `bg-danger`, … (the `-solid` slot)                             |
| `text-info`, `bg-info`                             | `text-info-600 dark:text-info-300`, `bg-info-600`                         |
| `text-dark`, `text-body`                           | `text-primary`                                                            |
| `text-gray`, `text-muted`, `text-reset`            | `text-tertiary`, `text-quaternary`, `text-inherit`                        |
| `bg-light`, `bg-dark`                              | `bg-tertiary dark:bg-quaternary`, `bg-[var(--bg-primary-solid)]`          |
| `border-top` / `-bottom` / `-start` / `-end`       | `border-t border-t-secondary`, … (`l` / `r` for start / end)              |
| `text-gray-800`/`900`, `border-gray-300`           | `text-primary`, `border-primary`                                          |

`FormText` (waldur-ui) is `text-tertiary`; give it `className="text-quaternary"` for a quieter line, or `text-danger` for an error.

- **Borders name their colour**: `border` (and `border-t`, `border-b-2`, …) sets only the
  width; without a colour class the line takes `currentColor`. Give every state an explicit
  colour, e.g. `rounded-lg border border-secondary` and `border-brand` when selected.
  `waldur-custom/require-border-color` reports a bare `border` without one and autofixes it to
  `border border-secondary`.

## The brand colour in SCSS

The tenant's brand is the **runtime** `--brand-*` ramp, which Sass never sees.

- In custom SCSS, paint brand with the semantic brand tokens — `var(--bg-brand-solid)`,
  `var(--border-brand-solid)`, `var(--fg-brand-primary)`, `var(--text-brand-secondary)` — or a
  runtime step, `var(--brand-600)`. For a tint that inverts in dark mode, write
  `var(--brand-50)` with a `dark-theme` override to `var(--brand-900)`. For a focus glow, use
  `color-mix(in srgb, var(--focus-ring-color) 25%, transparent)`.
- Never pass a CSS variable into a Sass colour function: legacy stylesheets define no Sass colours and read the tokens directly.

## Font size

One scale, pinned in physical pixels in `primitives/typography.css` (`@theme static`) to
prevent distortion under Waldur's forced 13px root font size (`html, body { font-size: 13px !important; }`):

| Token         | Size | Line Height | Tailwind Class |
| ------------- | ---- | ----------- | -------------- |
| `--text-xs`   | 12px | 16px        | `text-xs`      |
| `--text-sm`   | 14px | 20px        | `text-sm`      |
| `--text-base` | 16px | 24px        | `text-base`    |
| `--text-lg`   | 18px | 28px        | `text-lg`      |
| `--text-xl`   | 20px | 28px        | `text-xl`      |
| `--text-2xl`  | 24px | 32px        | `text-2xl`     |
| `--text-3xl`  | 30px | 36px        | `text-3xl`     |
| `--text-4xl`  | 36px | 40px        | `text-4xl`     |

- **Font size scale (`text-*`).** Font size follows the scale via the `waldur-custom/require-font-size-scale` ESLint rule (which also autofixes retired `fs-*` classes to `text-*`).
- **Why pinned in pixels?** Default Tailwind uses relative `rem` units (e.g. `text-lg` is 1.125rem).
  With an unpinned root, 1.125rem at 13px resolves to 14.625px instead of the intended 18px. Pinned
  declarations ensure consistent typography across both desktop (13px root) and mobile (12px root).
- **One apparent size for every font.** `primitives/typography.css` sets the native
  `font-size-adjust: 0.546` on `html`: Inter's x-height ratio, measured. The browser scales each font's
  glyphs so its x-height matches Inter's, so a deployment `FONT_FAMILY` whose glyphs run small (Maven
  Pro, 0.499) renders about 9% larger and Inter itself is unchanged. Only glyphs scale: line heights,
  boxes and spacing stay the same for every font. Monospace (`code`, `kbd`, `samp`, `pre`,
  `.font-mono`, and a stylesheet that sets a monospace stack) keeps its own size with
  `font-size-adjust: none`. There is no per-font factor to maintain.
- **rem is not on the scale.** A `rem` size follows the root, which is 13px on desktop and 12px on
  phones, while the tokens stay put, so rem text shrinks about 8% on phones next to token text meant to
  match it. Body text and `h1`–`h6` (the reboot, now `src/styles/legacy/_reboot.scss`) and card titles
  are still rem; they move to the scale with the reboot and card steps.
- **Linted in TSX and SCSS.** `waldur-custom/require-font-size-scale` reports an arbitrary px or rem
  size in TSX (`text-[14px]`, `text-[length:1.077rem]`, `text-[1.25rem]/5`) with the token it equals
  (rem at the 13px root), without fixing it: the arbitrary class sets only a font size, while a `text-*`
  class also sets a line height, so check the result. The stylelint rule `waldur/font-size-scale` allows
  a `font-size` (or the size in a `font:` shorthand) of `var(--text-*)` or one relative to its parent
  (`em`, `%`, `inherit`, `smaller`, `larger`) and names the equal token for a px or rem size. Exempt:
  the root and body sizes (`src/tailwind.css`), and the boot splash and boot error screen
  (`packages/boot-splash/`, `src/BootErrorScreen.css`), which paint before the tokens load.
- **No new rem, in a size or anywhere else.** A rem font size is also a rem length, so
  `waldur-custom/no-rem-length` and `waldur/no-rem-length` count it against the file's baseline (see
  [Root font size](#root-font-size)); the message names the `--text-*` token it equals at the 13px root.
- **Below the scale (10px, 11px).** A handful of badges, card metadata and phone-width labels use 10px
  or 11px (`text-[10px]`/`text-[11px]` in TSX, a commented `stylelint-disable` in SCSS). Whether they
  fold into `text-xs` or get a `text-2xs` step is not decided yet; don't add new ones.
- **No arbitrary `text-[14px]`.** Named scale tokens (`text-sm`) must be used instead.
- **No inline `fontSize`** on JSX elements: static font sizes must use standard utility classes. Dynamic
  scaling (such as proportional avatar placeholder text or country flag emojis) requires an explicit
  `eslint-disable` with rationale.

## Font weight

One scale, the five weights `fonts.css` loads (Inter 300–700), declared in
`primitives/typography.css`:

| Weight | Utility         | SCSS                          | Use                      |
| ------ | --------------- | ----------------------------- | ------------------------ |
| 300    | `font-light`    | `var(--font-weight-light)`    | Display text only        |
| 400    | `font-normal`   | `var(--font-weight-normal)`   | Body                     |
| 500    | `font-medium`   | `var(--font-weight-medium)`   | Labels, emphasis         |
| 600    | `font-semibold` | `var(--font-weight-semibold)` | Headings, titles         |
| 700    | `font-bold`     | `var(--font-weight-bold)`     | Strong headings, figures |

- **Font weights (`font-*`).** Standard Tailwind `font-*` utilities are used (`font-light` … `font-bold`). The `waldur-custom/require-weight-scale` rule autofixes obsolete `fw-*` classes.
- **No other steps.** The theme clears Tailwind's `thin`, `extralight`, `extrabold` and `black`,
  so those classes compile to nothing, and an arbitrary `font-[600]` is reported: Inter is not
  loaded at other weights, and the browser would only fall back to the nearest loaded one.
- **No inline `fontWeight`** on a JSX element: it outranks every stylesheet. Chart and PDF
  options (ECharts `fontWeight`) are not styles and keep their own.
- **SCSS** reads `var(--font-weight-*)`: stylelint rejects a number or keyword in component
  SCSS.
- A utility does not outrank an **unlayered** stylesheet (a component's `.scss` imported from
  TSX). Where such a rule sets the weight of the same element, drop the weight from the rule, or,
  if the rule is right for everything else it matches, use the important modifier on that element
  (`font-normal!`) with a comment.

## Spacing

One scale: Tailwind's, with `--spacing` pinned to `4px` in `primitives/spacing.css`, so
`gap-3` is 12px and `mb-1.5` is 6px at any root font size.

Spacing uses standard Tailwind steps (`p-3`, `mb-1.5`, `gap-2`).

- **Write Tailwind's step**: `mb-3` is 12px. Use standard Tailwind steps; do not use arbitrary pixel values like `[6.5px]` to approximate non-standard steps.
- **No runtime class names.** Tailwind generates only the names it finds in source, so
  `` `mb-${space}` `` styles nothing. Look the class up in a map of literals, as `FormGroup`'s
  `space` does (`SPACE_CLASSES` in `waldur-form`; `space` is a Tailwind step).
- **No new rem lengths.** A padding, margin, gap, width or offset in rem follows the root; write
  px, or the Tailwind step that equals it (`p-3`, not `p-[0.923rem]`; `calc(var(--spacing) * 3)`
  in a stylesheet). See [Root font size](#root-font-size).

## Inline styles

An inline `style` outranks every stylesheet, every utility and every `!important` in a layer, so
a declaration left there is outside all of the above: outside dark mode, outside the responsive
variants, outside the scales the rules on this page guard. `style={{ maxWidth: '100%',
maxHeight: '80px' }}` is three declarations that could be two classes, and
`waldur-custom/no-static-inline-style` reports each one, naming the utility
(`max-w-full max-h-20`).

It reports a property of a JSX `style` object when every part of its value is a literal **and**
the declaration has a utility. Sizes map through the px-pinned spacing scale, never Tailwind's
rem container scale: `minWidth: 160` is `min-w-40`, and `max-w-xl` is 468px here (432px on a
phone), not 576px. A px value off the whole-or-half step is named as an arbitrary utility
(`margin: 17` is `m-[17px]`), so choosing 16 or 20 stays a decision someone makes.

Two kinds of value skip the scale and take the arbitrary form. One is a px off the whole-or-half
step, as above. The other is a step that was ambiguous: `w`, `h`, `min-w`, `min-h`, `top`,
`bottom`, `start` and `end` at 25, 50, 75 or 100 — so `minWidth: 200` is `min-w-[200px]`, not
`min-w-50`, to avoid ambiguity between percentage and pixel values.

An inline style is still right where the value is not static:

- **Measured or animated geometry** — ``width: `${percent}%` ``, a chart's height, a drag
  handle's `transform`, a stagger's `animationDelay`.
- **A custom property bridging a varying value into a literal utility** — `style={{ '--w': px }}`
  with `w-[var(--w)]`. Tailwind generates only the class names it finds in source, so this is the
  way to vary one.
- **A forwarded `style` prop** — where a caller's object is spread in, merge order decides the
  winner, so the rule leaves the whole object alone.
- **A declaration with no utility** — a gradient, `maskType`, an `animation` shorthand.

`fontSize`, `fontWeight` and `borderRadius` belong to `require-font-size-scale`,
`require-weight-scale` and `enforce-border-radius-tokens`, which already report them inline.

How the declarations that predate the rule were retired is in
[inline-style-retirement-plan.md](inline-style-retirement-plan.md).

## Root font size

`src/tailwind.css` forces `html, body { font-size: 13px !important }` (12px below `md`). The
tokens are pinned in px so they ignore it, but about 700 `rem` lengths in stylesheets, arbitrary
classes and inline styles are still tuned against it. Moving off the forced root takes three
steps:

1. **Nothing depends on the root.** Convert each rem literal to the px it is at 13px, or to a
   token that equals it, so no pixel moves. Tailwind's own rem defaults are already done:
   `primitives/containers.css` pins the `--container-*` widths (`max-w-md` is 364px, as 28rem was
   at 13px) and clears the unused rem steps (`text-5xl`…`9xl`, `rounded-3xl`/`4xl`, bare
   `rounded`); `tailwindTheme.test.ts` fails if a Tailwind default is left in rem.
2. **Root back to the browser default**, with no pixel change, since nothing reads it any more.
3. **Token scales in rem**, so the UI follows the user's font-size preference.

Two guards hold step 1:

- **The rem ratchet.** `scripts/rem-literals.mjs` counts raw `rem` lengths per file against
  `scripts/rem-literals.baseline.json`: stylesheet declarations and SCSS variables (outside
  `packages/design-tokens/src/css/`), mixin arguments, and every string in TS/TSX, so arbitrary
  classes (`p-[1.85rem]`, `max-w-[calc(100vw-3rem)]`) and inline style values. `yarn rem:check`
  (in CI) fails when a file gains one. A file that loses one passes with a reminder: run
  `yarn rem:save` in the same merge request, so the count cannot grow back (step 1 removes rem in
  many merge requests at once, and failing each until it rewrites the shared baseline would make
  them conflict on it). `yarn rem:report [path…]` lists each with the px it is at the 13px root
  and the token that equals it (`=`) or is within 0.07px of it (`≈`): a Tailwind step or
  `calc(var(--spacing) * N)` for a length, `text-*` or `var(--text-*)` for a font size.
  **Write the px, or a token marked `=`.** A `≈` token is a sub-pixel change (`1.85rem` is
  24.05px, step 6 is 24px): take it only when the Storybook comparison shows no difference. `waldur-custom/no-rem-length` (ESLint)
  and `waldur/no-rem-length` (stylelint) run the same detector against the same baseline, so the
  editor flags a new rem as soon as a file has more than its count. Not counted: comments, `0rem`,
  media queries (their rem is the browser's initial font size, not `html`'s; a container query's
  rem is the root's, so it counts), tests, stories and mocks, and the lint rules' own tables. The detector is
  `packages/design-tokens/scripts/rem-literals.mjs`.
- **The root-invariance check.** `scripts/theme-snapshots.mjs root-invariance` captures every story with `html`'s font size forced to 13px and to
  20px and lists the stories that differ: each one still sizes something in rem. It is not a CI
  gate yet; step 2 can start when its list is empty. Use `--themes light` to halve the run; see
  `docs/visual-testing.md` for the command. It also catches what the ratchet cannot see: a rem utility with no
  literal, and an `em` under a rem font size (body text is `1.077rem`).

## Corner radius

All corner radius steps are pinned to physical pixels in `primitives/radius.css` (`@theme static`)
to prevent fractional `rem` compression under Waldur's forced 13px root font size
(`html, body { font-size: 13px !important; }`):

| Token            | Size   | Tailwind Class  | Use                                             |
| ---------------- | ------ | --------------- | ----------------------------------------------- |
| `--radius-none`  | 0px    | `rounded-none`  | Square corners, flush card attachments          |
| `--radius-xs`    | 2px    | `rounded-xs`    | Subtle inner corners, tiny tags                 |
| `--radius-sm`    | 4px    | `rounded-sm`    | Compact inputs, checkboxes, small indicators    |
| `--radius-md`    | 6px    | `rounded-md`    | Standard buttons, form controls, dropdown items |
| `--radius-lg`    | 8px    | `rounded-lg`    | Cards, panels, dialog headers, table containers |
| `--radius-xl`    | 12px   | `rounded-xl`    | Prominent cards, thread bubbles, chat panels    |
| `--radius-2xl`   | 16px   | `rounded-2xl`   | Large feature cards, hero containers            |
| `--radius-modal` | 20px   | `rounded-modal` | Sidebar mode-switcher card                      |
| `--radius-full`  | 9999px | `rounded-full`  | Avatars, pills, circular badges, status dots    |

- **Enforce border radius tokens.** Use Tailwind `rounded-none`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, and `rounded-full` via `waldur-custom/enforce-border-radius-tokens`. Tailwind's own bare `rounded` is 0.25rem, off the pinned scale.
- **Why pinned in pixels?** Default Tailwind radii use relative `rem` units (e.g. `rounded-sm` is 0.25rem,
  `rounded-xl` is 0.75rem). Under Waldur's forced 13px root font size, unpinned `rem` tokens shrink
  unintentionally (`rounded-sm` becomes 3.25px, `rounded-xl` becomes 9.75px). Pinning the scale preserves
  crisp, consistent corner geometry.
- **SCSS**: Use the `--radius-*` tokens, or Tailwind's `rounded-*` utilities, directly.
- **No inline `borderRadius`** in JSX elements. Use standard utility classes (`rounded-sm`, `rounded-md`,
  `rounded-lg`, etc.).

## Control height

The three sizes an interactive control comes in, pinned in px in
`primitives/controls.css` (`@theme static`):

| Token                 | Size | Read as                            | Use                                     |
| --------------------- | ---- | ---------------------------------- | --------------------------------------- |
| `--control-height-sm` | 28px | `h-[var(--control-height-sm)]`     | compact buttons, pagination, table rows |
| `--control-height-md` | 36px | `min-h-[var(--control-height-md)]` | the default button and control          |
| `--control-height-lg` | 44px | `min-h-[var(--control-height-lg)]` | large buttons, form fields              |

These are the sizes [ui-consistency-guidelines.md](ui-consistency-guidelines.md) already named
("Three standard sizes: 44px (large), 36px (default), 28px (small)"); the token gives them a name
in code, so a component no longer restates the number and two components cannot drift apart
unnoticed.

- **A control is a thing the user operates** — a button, a select, a date field, a pagination
  button. A table row (`SimpleTable`'s 44px cell), a layout band (the 44px filter bar) and a card
  header (`--card-header-min-h`) land on the same numbers by coincidence and must not read this
  token: a control resize must not drag the table rows with it.
- **On a square icon-only control** width is the height, so `size-[var(--control-height-sm)]` is
  the spelling, not a second token.
- **Two library sizes sit off the scale on purpose** and say so where they are: `Select`'s
  `isTableCell` is 35px (the measured height of the control it replaced) and `DatePicker`'s
  default trigger is 40px (the _form-control_ minimum the same guide gives, while `Select`, also a
  field, is 44px — the guide carries both numbers, and that is unresolved).
- **No `--control-height` for 40px yet**, deliberately: naming it would bake that contradiction
  into the scale.

## Guards

| What                                                    | Enforced by                                                                          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Generated ramps match `colors.json`                     | `generateTokens.test.ts`, `yarn tokens:check`                                        |
| No dead, ghost or redundantly aliased tokens            | `tokenAudit.test.ts`, `yarn tokens:audit`                                            |
| No new duplicate roles (same value in both themes)      | `DUPLICATE_BASELINE` in `scripts/audit-tokens.mjs`, via the same two                 |
| Status `-fg` clears AA on every surface                 | `statusContrast.test.ts`                                                             |
| Badge `solid` and Progress fills stay identical         | `progressTokens.test.ts`                                                             |
| Every semantic utility waldur-ui/shell use is declared  | `tailwindTheme.test.ts`                                                              |
| A bare `border` names its colour                        | `waldur-custom/require-border-color` (autofix)                                       |
| State colours from the status matrix, not raw ramps     | `waldur-custom/no-raw-status-ramp`                                                   |
| A colour token with a utility is written as the utility | `waldur-custom/prefer-token-utility` (autofix; table read from `theme.css`)          |
| Font size on the scale; no `fs-*` or inline size        | `waldur-custom/require-font-size-scale` (autofixes `fs-*`), `waldur/font-size-scale` |
| Font weight on the scale; no `fw-*` or inline weight    | `waldur-custom/require-weight-scale` (autofixes `fw-*`), stylelint                   |
| Corner radius on the scale; no retired or inline radius | `waldur-custom/enforce-border-radius-tokens` (autofix), stylelint                    |
| No static inline declarations                           | `waldur-custom/no-static-inline-style`                                               |
| Every physical colour has a `dark:` counterpart         | `waldur-custom/require-dark-pair`                                                    |
| No `--bs-*` reads in stylesheets                        | stylelint                                                                            |
| Hard-coded colours (hex, `rgb()`, named) only go down   | `no-literal-color` (ESLint and stylelint), `yarn colors:check`                       |
| Raw `rem` lengths only go down                          | `no-rem-length` (ESLint and stylelint), `yarn rem:check`                             |

**Duplicate roles.** Two semantic tokens with the same value in both themes are one role with
two names until shown otherwise. The audit fails on any such group not listed in
`DUPLICATE_BASELINE`, and on a listed group that is no longer a duplicate (prune it). Either
merge the tokens, or add the group with the reason the roles must stay separate — today: a
surface and a hairline that share gray-100, a surface and a drawn line at gray-200, the brand
border/icon/focus ring, the strong divider and `--text-quinary`, and the card hairline and the
neutral diagram-node tint (`--border-secondary`, `--status-neutral-bg-strong`).

**Dark pairs.** A ramp step, `white`/`black`, a hex or a raw `var(--color-*-N)` /
`var(--brand-N)` is the same colour in both themes. `require-dark-pair` reports one that has no
`dark:` utility for the same property, under the same other variants, in its class list (the
className, the `cn()` call or the class-map entry it belongs to). Prefer the semantic utility
the message names (`bg-primary`, `bg-brand-subtle`, `text-brand`, `text-danger`, …); keep a
physical step only with its dark mirror (`ring-brand-50 dark:ring-brand-900`). A solid fill
(`bg-*` at 400 or stronger) and white or black text on one read the same in both themes and
pass. Tests are exempt: they assert class names, nothing renders.

**Hard-coded colours.** A hex value, an `rgb()`/`hsl()` call or a named colour in a string,
a style object, an SVG attribute, chart options or a stylesheet is the same colour in both
themes and ignores the brand. `scripts/color-literals.mjs` counts them per file against
`scripts/color-literals.baseline.json`, and `yarn colors:check` (in CI) fails when a file gains
one, and when a file loses one until `yarn colors:save` lowers its count. `yarn colors:report
[path…]` lists each literal with the ramp step it equals (`=`) or is closest to (`≈`). Replace
one with a utility, `getChartThemeColors()` for canvas charts, or `currentColor` plus a `text-*`
class for SVG.
The chart roles (`src/dashboard/chartColors.ts`) cover the usual needs: `success`, `notice`
(warning-400), `warning`, `danger` and `progress` (blue-500) for states; `muted`, `neutral` and
`track` for secondary series, `neutralStrong` for its paired series and `remaining` for the
unused part of a gauge; `text`, `textSecondary` and `textQuaternary` for labels; `infoFg`/`infoBg`
for an accent chip; `shadow(alpha)` for a canvas shadow; `getCategoricalColors(n)` (up to 16)
for series. Chart tooltips use the card surface (`src/echarts/themes.ts`), so tooltip HTML takes
the text utilities (`class="text-quaternary"`). A shadow or darkening tint in a stylesheet is
`color-mix(in srgb, var(--shadow-color) 8%, transparent)` (`semantic/elevation.css`). Files where the literal is the point are listed with
their reason in `ALLOWED`: token sources and the boot splash, the login-page layout artwork,
masks, output rendered outside the app's stylesheet (PDF, email preview, data-URI images,
off-screen exports) and third-party or generated colours. Tests, stories and mocks are skipped.
`waldur-custom/no-literal-color` (ESLint, scripts) and `waldur/no-literal-color` (stylelint,
stylesheets) run the same detector against the same baseline, so the editor flags a literal as
soon as a file has more than its count, each with its nearest ramp step. The detector and `ALLOWED` are in `packages/design-tokens/scripts/color-literals.mjs`. A short all-digit hex counts only where a
colour goes (first in its string, after `:`, `,`, a function's `(`, a length or a border style),
so an issue number such as `(#455)` in a message is not one.

## Reading a token in code

For code that cannot take `var(--x)` directly (a canvas chart, a third-party widget), read the
resolved value instead of hard-coding a hex or repeating `getComputedStyle(...)`:

```ts
import { getCssVar, isDarkTheme } from 'waldur-design-tokens';
import { useResolvedVar } from 'waldur-design-tokens/react';

getCssVar('--brand-600', '#307300'); // trimmed; the fallback covers unset or no DOM
const value = useResolvedVar('--color-gray-500'); // React state, re-read when <html>'s style or data-theme changes
isDarkTheme(); // the theme applied to <html>, for code that has no theme context
```

`getCssVar` and `isDarkTheme` are snapshots, so re-read them when the theme or brand colour changes. `useResolvedVar` is
its own entry point so the main one stays free of React.

## Seeing the tokens

Storybook, group **Foundations**, stories in `packages/design-tokens/src/*.stories.tsx`:

- **Colors** — the primitive ramps, one page per family in the same swatch style (step, resolved
  hex, variable name on hover): `Neutral` (`gray`, `gray-dark` and a side-by-side comparison),
  `Status` (`success`, `warning`, `error`, `info`), `Accent` (the decorative hues) and `Brand` (the
  runtime `--brand-*` ramp). Driven by `tokens/colors.json`.
- **Semantic Colors** — `Text`, `Backgrounds`, `Borders`, `Brand` and the `Status` matrix: every
  role with its Tailwind utility, its light and dark source values, the value the page resolves
  now, and (for text, brand and status) its live WCAG contrast.
- **Typography** — the type scale and the pinned `--text-*` tokens; **Elevation** — every shadow;
  **Layout** — spacing, radius, breakpoints and the z-index layers; **Component Tokens** — one page
  per `components/*.css` file.

Everything but the ramp swatches and the type specimens is read from the token stylesheets
themselves (`stories/tokenSource.ts` parses them through Vite's `?raw` import), so a token added,
renamed or re-pointed shows up with no story edit, and its comment becomes its description.
`tokenSource.test.ts` checks that the parser keeps every declared token and that every component
token file has a page.

They live with the tokens they document, so a token change and its story change land in one package.

## What is not generated (yet)

- **The brand ramp** — `--brand-*` is tenant-configurable and injected at runtime
  (`initBrandTokens()`).
- **The semantic layer** — `--border-*`/`--text-*`/`--btn-*`/`--status-*` CSS files
  consumed directly across stylesheets and components (see [Semantic roles](#semantic-roles)),
  and the Tailwind bridge to them in `tailwind/theme.css`.
- **Non-colour scales** — spacing, type, radii, shadows.

## Where a token file lives

Tokens are hand-written CSS files. Dark mode lives in the semantic layer only: a semantic file
holds both themes, a `:root` block and a `:root[data-theme='dark']` block that redeclares only
what differs, and reads ramp steps (`var(--color-gray-100)`) and the runtime brand variable,
never raw hex (the modal backdrop is the one exception, as no ramp covers it). A component file
has a single `:root` block whose colours read semantic roles, and switches theme through them.

Tokens come in three tiers (a 3-layer architecture):

1. **Primitives** (`primitives/`): Raw scales and foundational values: colour ramps, the brand fallback, typography, spacing, radius, breakpoints, z-index.
2. **Semantic roles** (`semantic/`): Theme-aware roles, one file per concern: neutral surfaces, lines and text (`background.css`, `borders.css`, `text.css`), `brand.css` (every brand role and the focus ring), `status.css`, `elevation.css`.
3. **Component tokens** (`components/`): Dedicated tokens scoped to specific `waldur-ui` component families.

Components read semantic roles or component tokens, never a raw ramp step. Each layer reads
only the layer below it, so a colour resolves in at most two hops: component → semantic →
primitive.

All tokens live in `packages/design-tokens/src/css/` structured into three layer folders, each with an aggregate `index.css`. Two more locations hold what is not a token: `fonts.css` (`@font-face` rules) and `tailwind/` (Tailwind wiring: the semantic utilities, custom variants, keyframes and motion utilities). Files in `primitives/`, `semantic/` and `components/` declare custom properties only.

| Layer             | Directory         | Files                                                                                                                               |
| :---------------- | :---------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **1. Primitives** | `primitives/`     | `colors.css`, `colorRamps.css`, `typography.css`, `spacing.css`, `radius.css`, `breakpoints.css`, `zIndex.css`                      |
| **2. Semantic**   | `semantic/`       | `background.css`, `borders.css`, `text.css`, `brand.css`, `status.css`, `elevation.css`                                             |
| **3. Components** | `components/`     | `button.css`, `card.css`, `check.css`, `dialog.css`, `menu.css`, `progress.css`, `sheet.css`, `sidebar.css`, `tab.css`, `table.css` |
| Not tokens        | root, `tailwind/` | `fonts.css`; `tailwind/theme.css`, `tailwind/variants.css`, `tailwind/animations.css`                                               |

`index.css` aggregates everything: `fonts.css`, the three layers, then `tailwind/theme.css`, `tailwind/variants.css` and `tailwind/animations.css`. Every app imports it, so adding a token to its layer, or a utility to `tailwind/`, reaches all consumers. A component file is named after its `waldur-ui` family (`button.css`, not `buttonColors.css`): it may hold sizes and shadows as well as colours.

**App-only colours** (read by one component in `src/`) don't need a token: write Tailwind
utilities with the `dark:` variant at the call site, e.g. `text-brand-600 dark:text-brand-300`.

Rules for a new token:

1. Read by one call site in `src/`? Use Tailwind utilities with `dark:`, no token.
2. Read by a `waldur-ui` component, or by several call sites? Add it to `packages/design-tokens`,
   in the file for its domain or component, prefixed by its owner (`--card-*`, `--table-*`).
3. Import a new file from `index.css`, which stays a categorized list of imports.
4. Keep the source note and the light and dark values in the same file.
5. If it is a sidebar style token (`--nav-*`, `--sidebar-bg`) it must not be
   theme-scoped. Add new files to `FILES` in `sidebarTheme.test.ts`, which checks this.
6. Custom properties (`--*`) must not be declared in stylesheets outside `packages/design-tokens/`
   (enforced by Stylelint's `property-disallowed-list`).
7. One hop per layer, never sideways: a semantic token binds to primitive ramps (`--color-*`),
   runtime scales (`--brand-*`) or raw CSS values, never to another semantic domain's token; a
   component token binds to a semantic token, never to another component's token
   (`auditRedundantAliases`, enforced by `tokenAudit.test.ts`).
8. Component tokens don't handle dark mode: no `[data-theme]` selector in `components/`, and
   no colour from below the semantic layer (`var(--color-*)`, `var(--brand-*)`, hex, `rgb()`,
   `color-mix()`). If no semantic role has the light and dark pair a component needs, add the
   role to `semantic/` first. Sidebar style blocks (`[data-sidebar-style]`) are exempt: they are
   fixed looks that must not follow the theme. Enforced by `auditComponentLayer` in
   `tokenAudit.test.ts`; files not yet converted are listed in `COMPONENT_LAYER_RATCHET` in
   `scripts/audit-tokens.mjs`, which only shrinks. When converting a file, map each token by its
   light and dark values, not by name.

`progress.css` holds the `--progress-*` fills, track, label colours and heights;
`progressTokens.test.ts` checks that every variant has a fill and label, that fills match
`Badge` `solid`, and that labels stay readable.

## Retiring `--bs-*`

Obsolete `--bs-*` custom properties sit outside the token architecture. Read the design tokens instead:

| `--bs-*`                                       | Token                                                         |
| ---------------------------------------------- | ------------------------------------------------------------- |
| `--bs-border-color`                            | `--border-secondary`                                          |
| `--bs-body-bg`                                 | `--bg-primary`                                                |
| `--bs-body-color`                              | `--text-primary`                                              |
| `--bs-primary`, `--bs-primary-N`               | `--brand-color`, `--brand-N`                                  |
| `--bs-gray-100` / `-200`                       | `--bg-tertiary` / `--bg-quaternary`                           |
| `--bs-gray-200` / `-400` drawn as a line       | `--border-divider` / `--border-divider-strong`                |
| `--bs-gray-50`                                 | `--bg-secondary`                                              |
| `--bs-gray-400` / `-500` / `-600` / `-700`     | `--text-quinary` / `-quaternary` / `-tertiary` / `-secondary` |
| `--bs-dark`                                    | `--text-primary`                                              |
| `--bs-success` / `-danger` / `-active-warning` | `--status-success-fg` / `-danger-fg` / `-warning-fg`          |
| `--bs-primary-rgb`                             | `--brand-color-rgb` (follows the tenant brand)                |

Never swap a `--bs-gray-N` for `--color-gray-N`: neither follows the theme. Pick the role token
by what the colour paints, not by its gray step: a connector
or handle that read `--bs-gray-400` is `--border-divider-strong`, not the muted text role. A
one-off with no role (a `--bs-gray-300` guide line, `--bs-dark` as a border) gets the ramp step
plus its `gray-dark` mirror at the call site.

Stylelint rules (`declaration-property-value-disallowed-list` and `property-disallowed-list`)
disallow `--bs-*` reads in stylesheets (CSS/SCSS). Outside SCSS nothing reads them.

## Adding or changing a value

1. Edit `tokens/colors.json`.
2. `yarn tokens:generate`.
3. Commit the JSON and the generated file together.

Changing a light value changes what the app renders across all components at once, which is the point. A new ramp or step appears in CSS as `--color-<name>-<step>` (and so as Tailwind utilities). Sass defines no colour ramp or colour variables. The legacy stylesheets read the tokens directly.

## Verifying a refactor changes nothing

When the generator, the data model or the legacy SCSS changes and no pixel should move,
snapshot the legacy stylesheet before and compare after:

```bash
node scripts/color-diff.mjs save /tmp/before.json   # on the base commit
node scripts/color-diff.mjs compare /tmp/before.json
```

It compiles `src/styles/index.scss` and records what every declaration resolves to in
each theme, with the design tokens and the `dark-theme` / `light-theme` overrides applied, so a
change that keeps the rendered colour (a token in place of an SCSS gray of the same value)
reports nothing.
For the CSS side, compile `src/tailwind.css` with `@tailwindcss/node` and diff the emitted
`--color-*` declarations. To see the rendered result, screenshot every Storybook story on both
commits in both themes with `scripts/theme-snapshots.mjs` (see
[visual-testing.md](visual-testing.md) → "Storybook comparison").

Legacy stylesheets consume CSS custom properties directly (`var(--text-primary)`,
`var(--bg-primary)`, `var(--border-primary)`, etc.), ensuring identical token resolution
across both legacy and Tailwind components.
