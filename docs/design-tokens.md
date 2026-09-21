# Design Tokens

How colour primitives are defined, and how to change one.

## The rule

**Colour ramps are edited in one file:**
[`packages/design-tokens/tokens/colors.json`](../packages/design-tokens/tokens/colors.json).
Never edit the two files generated from it:

| Generated file                              | Consumer                                                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/metronic/sass/_color-ramps.scss`       | Bootstrap/Metronic (`$gray-500`, `$success-600`, …). Each themed step is `if(isDarkMode(), dark, light)`, resolved at compile time |
| `packages/design-tokens/src/colorRamps.css` | Tailwind and CSS variables (`--color-gray-500`, `bg-success-600`), declared once in `@theme static`                                |

```bash
yarn tokens:generate   # rewrite both files from the JSON
yarn tokens:check      # exit 1 if either is stale (also run by the unit tests)
```

`generateTokens.test.ts` fails when a generated file no longer matches the JSON, whether the
JSON or the output was edited. The fix is always `yarn tokens:generate`.

## File format

```jsonc
"success": {
  "description": "Optional; becomes a comment in both outputs.",
  "steps": {
    "50":  { "light": "#ecfdf3", "dark": "#054f31" },  // differs per theme
    "950": { "light": "#4e0d30" },                     // same in both themes: no "dark"
    "400": { "light": "#f670c7", "scss": false }       // CSS-only: no SCSS variable
  }
}
```

Optional ramp-level keys: `scssName` (the SCSS variable prefix when it differs from the CSS
name — `error` is `$danger-*`), `scssDefault: false` (omit `!default`), `css: false` (SCSS
only — the static default green `primary`, which Tailwind never sees), `scss: false` (CSS
only — `gray-dark`).

Colours are lower-case `#rrggbb`; the generator rejects anything else, and a `dark` equal to
`light`.

## Gray in dark mode: `gray` and `gray-dark`

Dark UI wants neutral grays where the light `gray` is blue-tinted (500 is `#667085` vs
`#85888e`), so there are two CSS ramps, both physical (step 900 is dark in both):

- `--color-gray-N` (`gray`) is the same in both themes. Nothing overrides it per theme, so a bare
  `text-gray-500` is one colour everywhere.
- `--color-gray-dark-N` (`gray-dark`) is the palette for dark surfaces. It is read by the
  dark-theme blocks of `surfaceColors.css` and `buttonColors.css`, and by the `dark` sidebar style
  in `sidebarColors.css` (a fixed look that is dark in either theme, so it reads `gray-dark`
  unconditionally, while the `light` style reads `gray`). A component that needs a dark-specific
  gray writes `dark:bg-[var(--color-gray-dark-800)]` or `dark:bg-gray-dark-800`.

`gray-dark` is CSS-only (`"scss": false`) and its values are the SCSS dark grays re-indexed:
SCSS `$gray-N` is **theme-inverted** (`$gray-900` is light in dark mode), so
`gray-dark-N` = the SCSS dark value of the mirrored step (25 ↔ 950, 50 ↔ 900, …).
`colorParity.test.ts` keeps them in sync, so change the SCSS dark gray and `gray-dark` together.

The SCSS/CSS mismatch is why Tailwind's `bg-gray-50` and Metronic's `.bg-gray-50` mean opposite
things in dark mode (see `src/tailwind.css` for the re-point). Retiring the SCSS inversion is a
separate, larger step: it depends on every `$gray-N` reader in theme-sensitive SCSS first
moving to semantic tokens.

## Reading a token in code

For code that cannot take `var(--x)` directly (a canvas chart, a third-party widget), read the
resolved value instead of hard-coding a hex or repeating `getComputedStyle(...)`:

```ts
import { getCssVar, isDarkTheme } from 'waldur-design-tokens';
import { useResolvedVar } from 'waldur-design-tokens/react';

getCssVar('--waldur-brand-600', '#307300'); // trimmed; the fallback covers unset or no DOM
const value = useResolvedVar('--color-gray-500'); // React state, re-read when <html>'s style or data-theme changes
isDarkTheme(); // the theme applied to <html>, for code that has no theme context
```

`getCssVar` and `isDarkTheme` are snapshots, so re-read them when the theme or brand colour changes. `useResolvedVar` is
its own entry point so the main one stays free of React.

## Seeing the tokens

Storybook, group **Foundations**, stories in `packages/design-tokens/src/*.stories.tsx`:

- **Colors** — one page per ramp family, all in the same swatch style (step, resolved hex, variable
  name on hover): `Neutral` (`gray`, `gray-dark` and a side-by-side comparison), `Status`
  (`success`, `warning`, `error`, `info`), `Accent` (the decorative hues) and `Brand` (the runtime
  `--waldur-brand-*` ramp). The first three are driven by `tokens/colors.json`, so a new ramp or
  step appears with no story edit; `SurfaceTokens` shows the semantic layer.
- **Typography** and **Elevation** — the type scale, shadows and radii.

They live with the tokens they document, so a token change and its story change land in one package.

## What is not generated (yet)

- **Derived SCSS variables** — `$success`, `$success-active`, `$text-muted`, `$dark-active`, … stay in
  `_colors.scss` (they use Sass functions and reference other variables).
- **The brand ramp** — `--waldur-brand-*` is tenant-configurable and injected at runtime
  (`initBrandTokens()`); `$brand-*` in `_colors.scss` only maps onto it.
- **The semantic layer** — `$text-*`/`$bg-*`/`$border-*` in `_tokens.scss` and the
  `--surface-*`/`--btn-*`/`--pill-*` files.
- **Non-colour scales** — spacing, type, radii, shadows.

## Adding or changing a value

1. Edit `tokens/colors.json`.
2. `yarn tokens:generate`.
3. Commit the JSON and both generated files together.

Changing a light value changes what the app renders in both Bootstrap and Tailwind components
at once, which is the point. A new ramp or step appears in SCSS as `$<name>-<step>` and in CSS
as `--color-<name>-<step>` (and so as Tailwind utilities).

## Verifying a refactor changes nothing

When the generator or the data model changes and no pixel should move, compile the Metronic
stylesheets before and after and compare (`src/metronic/sass/style.scss` and `style.dark.scss`
with Sass's JS API, mapping the `@/` alias to `src/`); the output should be byte-identical.
For the CSS side, compile `src/tailwind.css` with `@tailwindcss/node` and diff the emitted
`--color-*` declarations.
