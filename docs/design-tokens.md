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
only — the static default green `primary`, which Tailwind never sees).

Colours are lower-case `#rrggbb`; the generator rejects anything else, and a `dark` equal to
`light`.

## Gray is stored two ways on purpose

`dark` in the JSON is the SCSS value: `$gray-N` is **theme-inverted** (`$gray-900` is light in
dark mode). The CSS `--color-gray-N` keeps **physical lightness** (`--color-gray-900` is dark in
both themes), so its dark block is derived: CSS step _N_ = the SCSS dark value of the mirrored
step (25 ↔ 950, 50 ↔ 900, …). You don't write it; the generator does.

This is also why Tailwind's `bg-gray-50` and Metronic's `.bg-gray-50` mean opposite things in
dark mode (see `src/tailwind.css` for the re-point).

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
