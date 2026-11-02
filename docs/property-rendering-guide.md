# Property Rendering Developer Guide

This guide establishes the architecture, standards, formatters, patterns, and antipatterns for rendering key-value properties and entity details across Waldur HomePort and its micro-applications.

---

## 1. Principles & Design Requirements

Key-value displays are central to cloud management: resource overview panels, expandable table rows, invoice summaries, identity details, and system diagnostic widgets. The property rendering framework fulfills six core requirements:

1. **Accessibility & Semantic HTML**: Key-value data is structured using the W3C Description List standard ([`<dl>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl), `<dt>`, `<dd>`). Data grids (`<table>`) are reserved for multi-column tabular data, while Description Lists provide assistive technologies with the correct programmatic associations between property terms and their values.
2. **Container-Owned Layout**: Label column widths (`termWidth`), horizontal borders, spacing, and empty-row visibility are configured at the container level (`<PropertyList>`), preventing misaligned columns and brittle per-row style overrides.
3. **Strongly Typed Formatting**: Data values (dates, currencies, counts, measurements, meters, booleans, lists, secrets) are formatted through dedicated typed helpers ([`propVal.*`](#4-typed-value-formatters-propval)), ensuring consistent localization and typography (`tabular-nums`, `<time>`, `<data>`).
4. **Reliable Clipboard Copy**: The [`FormattedProperty`](#the-formattedproperty-contract) contract decouples rendered React trees from clean clipboard strings, ensuring copy icons capture pure data values rather than `"[object Object]"` or rendered UI icons and badges.
5. **Deterministic Empty States**: The system enforces explicit rules for what counts as missing (`undefined`, `null`, `''`, `[]`) versus valid data (`0`, `0.0`, `false`), providing clear visibility policies across summary and divided layouts.
6. **Universal Micro-App Portability**: Primitives reside in `packages/ui` (`@waldur/ui`), allowing micro-applications to share identical, accessible property lists without depending on monolith-specific internals.

---

## 2. Core Architecture & Components

```text
<PropertyCard>                     (Card wrapper with title, loading, actions, and refresh)
  └── <PropertyList>               (<dl> container owning variant, term width, and empty policy)
        ├── <PropertyItem />       (Row with <dt> term, <dd> value, and optional actions)
        ├── <PropertyItem />
        └── <PropertyList.Section> (Grouping with title, description, and actions)
              └── <PropertyItem />
```

### `<PropertyList>`

The `<PropertyList>` container controls layout, alignment, and default visibility policies for all child items:

#### Props Reference

- `variant`:
  - `'divided'` *(default)*: Full-width rows with bottom borders, optional term descriptions, and an actions column. Used in configuration cards, modal dialogs, and detail panels.
  - `'summary'`: Borderless two-column layout. Omits empty values by default (`0` is retained). Used in resource summary tabs and overview cards.
  - `'compact'`: Tight key-left / value-right layout. Used in popovers, stat widgets, and compact sidebar cards.
- `termWidth`: Sets the fixed width of the `<dt>` label column across all child rows using the CSS custom property `--dt-width`. Presets: `'sm'` (160px), `'md'` (200px), `'lg'` (240px), `'xl'` (288px), or any valid CSS length (e.g. `'220px'`, `'40%'`).
- `hideIfEmpty`: Default empty-row policy for the entire list. Defaults to `false` for `'divided'` / `'compact'` and `true` for `'summary'`.
- `emptyPlaceholder`: Fallback placeholder for empty items (`'dash'` [default `—`], `'none'`, `'not-set'`, `'optional'`, `'na'`, or custom `ReactNode`).
- `detailsMode`: Enables medium titles (`text-secondary`) and muted values (`text-quaternary`).
- `alignTop`: Aligns label, value, and actions to the top instead of centering them vertically.
- `ellipsis`: Truncates overflowing values with an ellipsis instead of wrapping.
- `space`: Bottom margin spacing step in summary mode (e.g., `1` maps to `mb-1`).

---

### `<PropertyItem>`

`<PropertyItem>` represents an individual property row. It renders a `<dt>` term, a `<dd>` value, and an optional actions slot:

#### Props Reference

- `label`: The property name (`ReactNode`).
- `value`: The value to render (`ReactNode` or `FormattedProperty` from `propVal.*`).
- `description`: Subtitle or explanatory text rendered directly below the label (in `divided` mode).
- `tooltip`: Information icon with a hover tooltip placed next to the label.
- `warnTooltip`: Warning icon with tooltip for alerts or deprecation notes.
- `actions`: Action buttons or dropdowns aligned to the right (in `divided` mode).
- `hasCopy` / `copyable`: Renders a one-click clipboard copy button.
- `copyValue`: Explicit string to copy when `value` is complex React JSX.
- `hideIfEmpty`: Overrides the list default for omitting this item when missing.
- `placeholder`: Custom placeholder for an empty value (e.g., `"Never"`, `"Unlimited"`, or `'na'`). Providing a custom placeholder automatically keeps the row visible in `summary` mode.
- `disabled`: Dims the term and value while keeping the `actions` slot fully interactive.

---

### `<PropertyCard>`

A standardized card wrapper for property lists with built-in header, refresh trigger, and loading states:

```tsx
import { PropertyCard, PropertyItem, PropertyList } from 'waldur-ui';
import { propVal } from '@/property/propertyFields';

<PropertyCard
  title={translate('Resource overview')}
  refetch={refetch}
  loading={isLoading}
  actions={<ResourceActionsMenu resource={resource} />}
>
  <PropertyList variant="summary" termWidth="md">
    <PropertyItem label={translate('Name')} value={resource.name} hasCopy />
    <PropertyItem label={translate('Status')} value={propVal.state(resource.state)} />
  </PropertyList>
</PropertyCard>
```

---

### `<CopyableValue>`

For composite rows with multiple values where each value needs its own copy trigger:

```tsx
import { CopyableValue, PropertyItem } from 'waldur-ui';

<PropertyItem label={translate('Network interfaces')}>
  <div className="d-flex flex-column gap-1">
    <CopyableValue value="192.168.1.10" name={translate('Private IP')} />
    <CopyableValue value="194.126.101.5" name={translate('Public IP')} />
  </div>
</PropertyItem>
```

---

## 3. Empty Value Semantics & Visibility Policy

Waldur defines empty-state handling deterministically:

### What Counts as "Missing" vs "Value"

- **Missing (`isEmptyValue`)**: `undefined`, `null`, `''` (empty string), and `[]` (empty array). A formatter may add domain-specific missing cases (e.g., `NaN`, `Invalid Date`).
- **Valid Values (Never Missing)**: `0`, `0.0`, and `false`. These represent valid data (zero charges, zero servers, disabled flags) and are always rendered.

### Visibility Rules by Variant

| Feature | `variant="divided"` | `variant="summary"` |
| :--- | :--- | :--- |
| **Default empty behavior** | Row stays visible, renders `—` | Row is omitted from DOM |
| **Force visible when empty** | Default behavior | `<PropertyItem hideIfEmpty={false} />` |
| **Custom placeholder** | `placeholder="Never"` | Automatically sets `hideIfEmpty={false}` |
| **`0` and `false`** | Rendered (`0`, `No`) | Rendered (`0`, `No`) |

```tsx
<PropertyList variant="summary" termWidth="md">
  {/* Automatically hidden if backend returns null */}
  <PropertyItem label={translate('Description')} value={data.description} />

  {/* Stays visible with "—" because hideIfEmpty={false} is set */}
  <PropertyItem
    label={translate('Contact email')}
    value={data.contact_email}
    hideIfEmpty={false}
  />

  {/* Stays visible with "Never" because custom placeholder is provided */}
  <PropertyItem
    label={translate('Expires')}
    value={propVal.date(data.expires_at)}
    placeholder={translate('Never')}
  />
</PropertyList>
```

---

## 4. Typed Value Formatters (`propVal.*`)

Always use `propVal.*` formatters from `@/property/propertyFields`.

### The `FormattedProperty` Contract

Every `propVal.*` formatter returns a `FormattedProperty`:

1. **Semantic HTML Node**: Renders `<data value="...">` or `<time datetime="...">` with `tabular-nums` for alignment.
2. **Clean Text**: Supplies a plain string representation for clipboard copying via `hasCopy`.
3. **Missing Handling**: Returns `null` when the value is missing so `<PropertyList>` can apply its empty-state policy cleanly.

### Formatter Catalog

#### 1. Numeric and Financial

- `propVal.number(val, options)`:
  - Formats numbers or decimal strings (`"12.50"`) using the user's locale.
  - Options:
    - `unit`: Appended suffix (e.g. `'cores'`, `'days'`).
    - `fractionDigits`: Maximum decimals.
    - `unlimited`: Value that renders as translated `"Unlimited"` (e.g. `-1`).
    - `missingAs`: Fallback number when missing (e.g. `missingAs: 0`).
- `propVal.count(val, options)`:
  - Discrete integer count.
  - **Key semantic**: `null` or `undefined` is treated as `0`, not unknown/dash. Use for item counts, members, volumes.
- `propVal.currency(val, options)` *(alias `propVal.money`)*:
  - Formats currency using the deployment's default currency symbol.
  - Options:
    - `shorten`: Shortens large amounts (e.g. `€1.2k`).
    - `signed`: Prefixes `+` or `-` for balance or ledger changes.
- `propVal.percent(val, options)`:
  - Formats percentages.
  - Options:
    - `ratio`: Set to `true` if input is a `0.0`–`1.0` ratio instead of `0`–`100`.
    - `fractionDigits`: Decimals shown (defaults to `1`).

```tsx
<PropertyItem label={translate('Cores')} value={propVal.number(vm.cores, { unit: 'cores', unlimited: -1 })} />
<PropertyItem label={translate('Active users')} value={propVal.count(tenant.user_count)} />
<PropertyItem label={translate('Current cost')} value={propVal.currency(invoice.total)} hasCopy />
<PropertyItem label={translate('Cache hit ratio')} value={propVal.percent(stats.hit_ratio, { ratio: true })} />
```

---

#### 2. Measurements, Durations, and Gauges

- `propVal.fileSize(val, options)`:
  - Converts bytes into human-readable units (`B`, `KB`, `MB`, `GB`, `TB`).
  - Options:
    - `unit`: Source unit of input (`'B'` default, `'MB'`, `'GB'`, etc.).
- `propVal.duration(val, options)`:
  - Human-friendly time spans formatted as the two largest non-zero units (e.g., `3d 4h`, `12m 5s`, `12.35s`, `850ms`).
  - Options:
    - `unit`: Input unit (`'s'` default, `'ms'`).
- `propVal.meter(value, max, options)`:
  - Progress gauge with percentage calculation, threshold alerts, and polarities.
  - Options:
    - `display`: `'bar'` (stacked progress bar), `'inline'` (gauge + text), or `'text'`.
    - `polarity`:
      - `'negative'` (default): Higher values are bad (e.g., RAM usage, disk usage, error rates). Warning at 75%, Danger at 90%.
      - `'positive'`: Higher values are good (e.g., cache hit ratio, test pass rate, SLA uptime). Danger below 75%, Warning below 90%.
    - `variant`: Preset variant or custom `{ warning: 80, danger: 95 }`.
    - `format`: `'number'`, `'fileSize'`, or `'percent'`.
    - `unit`: Unit string for numbers.

```tsx
{/* Disk utilization: higher is negative */}
<PropertyItem
  label={translate('Disk utilization')}
  value={propVal.meter(volume.used_bytes, volume.total_bytes, {
    format: 'fileSize',
    display: 'bar',
    polarity: 'negative',
  })}
/>

{/* SLA compliance: higher is positive */}
<PropertyItem
  label={translate('SLA compliance')}
  value={propVal.meter(tenant.sla_uptime, 100, {
    format: 'percent',
    display: 'inline',
    polarity: 'positive',
    variant: { danger: 95, warning: 99 },
  })}
/>
```

---

#### 3. Dates and Timestamps

- `propVal.date(val, options)`:
  - Formats ISO strings, Date objects, or epoch timestamps.
  - Automatically wraps output in an accessible `<time datetime="...">` element.
  - Options:
    - `precision`: `'date'` (default), `'datetime'`, `'long'` (includes timezone), `'month'`.
    - `epoch`: Set to `true` if input is in Unix seconds.
    - `relative`: Renders relative time (e.g. `"3 hours ago"`).

```tsx
<PropertyItem label={translate('Created')} value={propVal.date(order.created, { precision: 'datetime' })} />
<PropertyItem label={translate('Last seen')} value={propVal.date(agent.last_ping, { relative: true })} />
```

---

#### 4. Booleans, States, and Badges

- `propVal.boolean(val, options)`:
  - Formats booleans cleanly without manual ternaries.
  - Options:
    - `wording`: `'yesNo'` (default), `'enabled'`, `'active'`, or custom pair `[translate('Done'), translate('Pending')]`.
    - `display`: `'text'` (default), `'badge'`, or `'icon'` (check or X with screen-reader text).
    - `colored`: Colorizes text (`text-success` / `text-quaternary`).
    - `variants`: Badge variant tuple for `[trueVariant, falseVariant]`.
- `propVal.state(val, options)`:
  - Formats entity state machine values with colored badges and status dots.
- `propVal.badge(val, options)` / `propVal.badgeList(arr, options)`:
  - Formats single strings or string arrays as pills with tone and size presets.

```tsx
<PropertyItem label={translate('Shared offering')} value={propVal.boolean(offering.shared, { wording: 'yesNo' })} />
<PropertyItem label={translate('HA routers')} value={propVal.boolean(router.ha, { wording: 'enabled', display: 'badge' })} />
<PropertyItem label={translate('Tags')} value={propVal.badgeList(resource.tags, { tone: 'outline' })} />
```

---

#### 5. Lists, Codes, Secrets, and Identities

- `propVal.list(arr, options)`:
  - Formats arrays cleanly.
  - Options:
    - `display`: `'inline'` (comma-separated), `'stack'` (vertical items), or `'badges'`.
    - `itemCopy`: Adds copy icons to individual items when stacked.
    - `max`: Limits items displayed with a `"+N more"` counter.
- `propVal.code(val, options)`:
  - Monospace code element.
  - Options: `truncate="middle"` for long UUIDs, hashes, and tokens.
- `propVal.secret(val)`:
  - Masked password or credential with reveal toggle. Clicking copy extracts the unmasked secret.
- `propVal.user(user)`:
  - Formats user object `{ full_name, username, email }` as `"Full Name (username)"`.

```tsx
<PropertyItem label={translate('Assigned IPs')} value={propVal.list(vm.ip_addresses, { display: 'stack', itemCopy: true })} />
<PropertyItem label={translate('UUID')} value={propVal.code(vm.uuid, { truncate: 'middle' })} hasCopy />
<PropertyItem label={translate('API key')} value={propVal.secret(creds.token)} />
<PropertyItem label={translate('Owner')} value={propVal.user(project.created_by)} />
```

---

## 5. Formatter Comparison Reference

| Formatter | Primary Input | Null/Undefined Output | What Clipboard Copies | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| `propVal.number` | `number \| string` | `null` (or `missingAs`) | Plain number string | Cores, RAM quantities, usage counts |
| `propVal.count` | `number \| string` | Treated as `0` | `"0"` | Entity totals (servers, users, disks) |
| `propVal.currency` | `number \| string` | `null` | `"12.50"` or `"€12.50"` | Prices, invoices, budgets, balances |
| `propVal.percent` | `number` | `null` | `"95.5%"` | Ratios, percentages, proportions |
| `propVal.meter` | `current, max` | `null` | `"8.2 GB / 16 GB (51.3%)"` | Disk capacity, CPU load, quota meters |
| `propVal.fileSize` | `number` | `null` | Formatted size with unit | Volume size, network payload, RAM |
| `propVal.duration` | `number` | `null` | Duration string (`"2h 15m"`) | Uptime, build duration, latency |
| `propVal.date` | `string \| Date \| number` | `null` | Formatted localized date | Timestamps, creation dates, schedules |
| `propVal.boolean` | `boolean` | `null` | Translated word (`"Yes"`) | Feature flags, boolean settings |
| `propVal.list` | `Array<any>` | `null` (if empty) | Comma or newline joined | IP lists, subnets, security groups |
| `propVal.code` | `string \| number` | `null` | Full untruncated string | UUIDs, hashes, certificate digests |
| `propVal.secret` | `string` | `null` | Unmasked plain text secret | Passwords, tokens, private keys |
| `propVal.user` | `UserObject` | `null` | `"Full Name (username)"` | Author, reviewer, creator |

---

## 6. Best Practices & Canonical Patterns

### 1. Let the Container Own the Layout

Always configure `termWidth` on `<PropertyList>`, never across individual `<PropertyItem>` rows.

```tsx
// ✅ Recommended: Container owns term width
<PropertyList variant="divided" termWidth="md">
  <PropertyItem label={translate('Name')} value={resource.name} />
  <PropertyItem label={translate('Category')} value={resource.category} />
</PropertyList>

// ❌ Antipattern: Individual row width overrides
<PropertyList variant="divided">
  <PropertyItem labelClass="col-sm-3" valueClass="col-sm-9" label="..." value="..." />
  <PropertyItem labelClass="col-sm-3" valueClass="col-sm-9" label="..." value="..." />
</PropertyList>
```

---

### 2. Let the Formatter Own the Whole Value

Do not pre-format values or wrap formatters in redundant existence ternaries. `propVal` functions return `null` when inputs are missing.

```tsx
// ✅ Recommended: Direct pass-through
<PropertyItem
  label={translate('Expiration date')}
  value={propVal.date(item.expires_at, { precision: 'datetime' })}
/>

// ❌ Antipattern: Outer ternary and manual formatting
<PropertyItem
  label={translate('Expiration date')}
  value={item.expires_at ? formatDateTime(item.expires_at) : '—'}
/>
```

---

### 3. Semantics of Zero vs Null

Choose the right formatter based on whether missing means "Zero" or "Unknown":

- **Count of entities (0 is standard)**: Use `propVal.count(val)`. If `val` is `null` or `undefined`, it renders `0`.
- **Measurement or gauge (empty means unknown)**: Use `propVal.number(val)`. If `val` is `null`, it renders `—` or hides the row.

---

### 4. Preserving Crucial Empty Rows in Summary Lists

In `variant="summary"`, empty items are omitted by default. If a field's absence must be explicitly acknowledged to the user (e.g., confirming an optional setting was not configured), set `hideIfEmpty={false}`:

```tsx
<PropertyList variant="summary">
  {/* Required: hide if missing */}
  <PropertyItem label={translate('Internal IP')} value={vm.private_ip} />

  {/* Crucial context: explicitly show dash if no public IP assigned */}
  <PropertyItem
    label={translate('Floating IP')}
    value={vm.floating_ip}
    hideIfEmpty={false}
  />
</PropertyList>
```

---

### 5. Multi-Value Cells in Expandable Table Rows

When an expandable row displays multi-item collections (such as subnets, interfaces, or commands), avoid creating ad-hoc multiple table columns. Use stacked lists or `<CopyableValue>`:

```tsx
<PropertyList variant="divided" termWidth="md">
  <PropertyItem
    label={translate('Assigned subnets')}
    value={propVal.list(tenant.subnets.map(s => `${s.name} (${s.cidr})`), {
      display: 'stack',
      itemCopy: true,
    })}
  />
</PropertyList>
```

---

### 6. Copying Composite React Nodes

When `value` is an arbitrary React element, compile-time safety disallows boolean `hasCopy` or `copyable={true}` to prevent copying `"[object Object]"`. Provide an explicit `copyValue`:

```tsx
<PropertyItem
  label={translate('Cluster endpoint')}
  value={
    <span className="text-monospace">
      <CloudServerIcon className="me-1" />
      {endpoint.host}:{endpoint.port}
    </span>
  }
  copyValue={`${endpoint.host}:${endpoint.port}`}
/>
```

---

## 7. Common Mistakes & Antipatterns

### 1. Using `<table>` for Key-Value Pairs

```tsx
// ❌ WRONG: Non-semantic table for key-value list
<table className="table table-borderless">
  <tbody>
    <tr>
      <th>{translate('Status')}</th>
      <td><Badge>{state}</Badge></td>
    </tr>
  </tbody>
</table>

// ✅ RIGHT: Semantic PropertyList
<PropertyList variant="divided" termWidth="sm">
  <PropertyItem label={translate('Status')} value={propVal.state(state)} />
</PropertyList>
```

---

### 2. Redundant Outer Existence Guards

```tsx
// ❌ WRONG: Outer JSX condition for items that can handle emptiness
{values.dns_nameservers?.length > 0 && (
  <PropertyItem
    label={translate('DNS nameservers')}
    value={propVal.list(values.dns_nameservers)}
  />
)}

// ✅ RIGHT: Let PropertyList and formatter manage visibility
<PropertyItem
  label={translate('DNS nameservers')}
  value={propVal.list(values.dns_nameservers)}
/>
```

---

### 3. Manual String Ternaries for Booleans

```tsx
// ❌ WRONG: String ternary
<PropertyItem
  label={translate('Enabled')}
  value={item.is_active ? translate('Yes') : translate('No')}
/>

// ✅ RIGHT: Typed boolean formatter
<PropertyItem
  label={translate('Enabled')}
  value={propVal.boolean(item.is_active)}
/>
```

---

### 4. Calling `renderFieldOrDash` Inside `value`

```tsx
// ❌ WRONG: Redundant fallback call
<PropertyItem
  label={translate('Host')}
  value={renderFieldOrDash(server.hostname)}
/>

// ✅ RIGHT: Let the row render the dash placeholder
<PropertyItem
  label={translate('Host')}
  value={server.hostname}
/>
```

---

### 5. Using `propVal.meter` for Non-Capacity Statistics

`propVal.meter` is designed for bounded capacities (value + max) or alert thresholds. Using it for standalone percentages with separate CSS warning classes is an antipattern.

```tsx
// ❌ WRONG: Misusing meter for simple database percentages
<PropertyItem
  label={translate('Rollback ratio')}
  value={propVal.meter(stats.rollback_ratio, { format: 'percent' })}
/>

// ✅ RIGHT: Use propVal.percent with semantic status class
<PropertyItem
  label={translate('Rollback ratio')}
  value={propVal.percent(stats.rollback_ratio)}
  valueClass={rollbackHealthClass}
/>
```

---

## 8. Real-World Recipes

### Recipe A: Resource Overview Tab

```tsx
import { FC } from 'react';
import { PropertyCard, PropertyItem, PropertyList } from 'waldur-ui';
import { propVal } from '@/property/propertyFields';
import { translate } from '@/i18n';

export const VirtualMachineSummary: FC<{ vm: VirtualMachine; refetch(): void }> = ({
  vm,
  refetch,
}) => (
  <PropertyCard
    title={translate('Virtual Machine details')}
    refetch={refetch}
    actions={<VirtualMachineActions vm={vm} />}
  >
    <PropertyList variant="summary" termWidth="md">
      <PropertyItem label={translate('UUID')} value={propVal.code(vm.uuid, { truncate: 'middle' })} hasCopy />
      <PropertyItem label={translate('State')} value={propVal.state(vm.state)} />
      <PropertyItem label={translate('Cores')} value={propVal.number(vm.cores, { unit: 'vCPU' })} />
      <PropertyItem label={translate('RAM')} value={propVal.fileSize(vm.ram_bytes)} />
      <PropertyItem
        label={translate('Disk utilization')}
        value={propVal.meter(vm.disk_used_bytes, vm.disk_total_bytes, { format: 'fileSize' })}
      />
      <PropertyItem label={translate('Fixed IP')} value={vm.fixed_ip} hasCopy />
      <PropertyItem label={translate('Floating IP')} value={vm.floating_ip} hasCopy hideIfEmpty={false} />
      <PropertyItem label={translate('Created')} value={propVal.date(vm.created, { precision: 'datetime' })} />
    </PropertyList>
  </PropertyCard>
);
```

---

### Recipe B: Expandable Table Row

```tsx
import { FC } from 'react';
import { PropertyItem, PropertyList } from 'waldur-ui';
import { propVal } from '@/property/propertyFields';
import { translate } from '@/i18n';

export const OfferingUsersExpandableRow: FC<{ row: OfferingUser }> = ({ row }) => (
  <PropertyList variant="divided" termWidth="sm" className="p-4 bg-gray-50">
    <PropertyItem label={translate('Username')} value={propVal.code(row.username)} hasCopy />
    <PropertyItem label={translate('Comment')} value={row.comment} hideIfEmpty={false} placeholder="N/A" />
    <PropertyItem label={translate('Propagation status')} value={propVal.state(row.propagation_status)} />
    <PropertyItem
      label={translate('Security groups')}
      value={propVal.list(row.security_groups, { display: 'badges' })}
    />
  </PropertyList>
);
```

---

### Recipe C: Micro-App Standalone Component

Micro-apps import directly from `@waldur/ui`:

```tsx
import { FC } from 'react';
import { PropertyList, PropertyItem } from '@waldur/ui';

export const MicroAppInstanceInfo: FC<{ instance: any }> = ({ instance }) => (
  <PropertyList variant="divided" termWidth="180px">
    <PropertyItem label="Application ID" value={instance.id} hasCopy />
    <PropertyItem label="Status" value={instance.status} />
    <PropertyItem label="Endpoints" value={instance.endpoints?.join(', ')} />
  </PropertyList>
);
```

---

## 9. Automated ESLint Enforcement

The ESLint rule `waldur-custom/prefer-typed-property` continuously audits code for manual formatting calls:

- Detects `formatDate`, `formatDateTime`, `formatMonth`, `formatRelative` → suggests `propVal.date`.
- Detects `defaultCurrency` → suggests `propVal.currency`.
- Detects `formatCount` → suggests `propVal.count`.
- Detects `formatUsageValue` → suggests `propVal.number`.
- Detects `formatFilesize` → suggests `propVal.fileSize`.
- Detects `formatPercent` → suggests `propVal.percent`.
- Detects boolean ternaries (`x ? translate('Yes') : translate('No')`) → suggests `propVal.boolean`.
- Detects calls to `renderFieldOrDash(x)` inside `PropertyItem`.

### Baseline Workflow

Existing legacy occurrences are tracked in `typed-property.baseline.json`. The baseline rule acts as a one-way ratchet:

- As legacy occurrences are cleaned up, the baseline count drops.
- A file with fewer legacy occurrences than listed is reported as stale.
- To sync the baseline after cleaning up legacy files:

```bash
yarn lint:properties:baseline
```

Never add new exemptions or raise baseline counts for new code. All new property rendering must use `PropertyList`, `PropertyItem`, and `propVal.*`.
