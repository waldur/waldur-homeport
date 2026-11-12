# Property fields

A read-only row in a details panel, a summary or a dialog is a `PropertyItem` inside a `PropertyList` (waldur-ui). When the row's value is a kind of value — a date, an amount, a yes/no, a list, a meter — use the typed formatter for it from `@/property/propertyFields` (`propVal`) instead of formatting the value by hand. The formatter owns the whole value:

- **when it is missing:** `undefined`, `null`, `''` and `[]` are missing; `0` and `false` are values. A format adds its own cases (an invalid date, `NaN`, a blank string);
- **how it reads:** the same in every panel, and `<time>` / `<data>` elements where the browser can use them;
- **what its copy icon copies** under `hasCopy`.

What a missing value shows is left to the list: a `divided` list shows a dash (or the row's `placeholder`), a `summary` list leaves the row out (`hideIfEmpty={false}` keeps it, with its dash). `hideIfEmpty` hides a row in any list.

```tsx
import { PropertyItem, PropertyList } from 'waldur-ui';
import { propVal } from '@/property/propertyFields';

<PropertyList>
  <PropertyItem
    label={translate('Created')}
    value={propVal.date(order.created, { precision: 'datetime' })}
  />
  <PropertyItem
    label={translate('Total')}
    value={propVal.currency(invoice.total)}
    hasCopy
  />
  <PropertyItem
    label={translate('Shared')}
    value={propVal.boolean(offering.shared)}
  />
</PropertyList>;
```

## The formatters (`propVal.*`)

| Formatter | Value | Options |
| --- | --- | --- |
| `propVal.text` | string, number | `lines` (1–3, clamp) |
| `propVal.code` | string, number | `truncate="middle"` for long identifiers |
| `propVal.date` | ISO string, `Date`, number | `precision`: `date` · `datetime` · `long` (with zone) · `month`; `epoch` (Unix seconds); `relative` |
| `propVal.duration` | number | `unit`: `s` (default) · `ms` — reads `3d 4h`, `12m 5s`, `12.35s`, `850ms` |
| `propVal.number` | number, decimal string | `unit`, `fractionDigits`, `unlimited` (the value that reads "Unlimited") |
| `propVal.count` | number, decimal string | integer count |
| `propVal.currency` | number, decimal string | `shorten`, `signed` |
| `propVal.percent` | number | `ratio` (0–1 input), `fractionDigits` |
| `propVal.meter` | number (value, max) | `format`: `fileSize` · `percent` · `number`; `display`: `bar` · `inline` · `text`; `variant`: preset or thresholds `{ warning, danger }`; `polarity`: `positive` · `negative` |
| `propVal.fileSize` | number | `unit`: the value's unit, `B` (default) to `TB` |
| `propVal.boolean` | boolean (`null` is missing) | `wording`: `yesNo` · `enabled` · `active` · a `[yes, no]` pair; `display`: `text` · `badge` · `icon`; `colored`; badge `variants` (the pair `true`/`false` wear) and `size` |
| `propVal.badge` | string | `variant`, `tone`, `size` |
| `propVal.badgeList` | array | `variant`, `tone`, `size` |
| `propVal.enum` | string, number | `labels` (value → label) or `options` (the field's select choices) |
| `propVal.list` | array | `display`: `inline` · `stack` · `badges`; `itemCopy` (stack); `max` |
| `propVal.user` | `{ full_name, username, email }` | — reads "Full Name (username)", or whichever name is known |
| `propVal.richText` | string | `format`: `plain` · `markdown` · `html`; `truncate` (plain) |
| `propVal.json` | any | `compact` |
| `propVal.secret` | string | — masked, revealable, copies the secret itself |

A value no type fits — a domain badge, a composite cell — stays a plain `PropertyItem` with `value={<Component />}`.

## Several values in one row

`propVal.list` covers a list of plain values. For values that each need their own look or copy icon, put one waldur-ui `CopyableValue` per value as the row's children.

## Adding a formatter

A formatter is a function in `src/property/formats/` and exported on `propVal` in `src/property/formats/propVal.ts`.

## Lint: `waldur-custom/prefer-typed-property`

The rule reports a `PropertyItem` whose `value` is formatted by hand where a typed formatter fits: `formatDate`/`formatDateTime`/`formatMonth`/`formatRelative`, `defaultCurrency`, `formatCount`/`formatUsageValue`, `formatFilesize`, `formatPercent`, a Yes/No · Enabled/Disabled · Active/Inactive ternary, `CheckOrX`, `BooleanField`, `FormattedHtml`, `SafeMarkdown`, `x.join(', ')`, the same behind `x ? f(x) : empty` or `x && f(x)` — and `renderFieldOrDash(x)`, since the row draws the dash itself.
