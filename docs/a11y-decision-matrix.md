# Accessibility (A11y) Decision Matrix: When to Use What

This guide establishes the architectural and accessibility standards for mutually exclusive switchers, tabs, action groups, and navigation controls across Waldur HomePort. It provides explicit decision trees and code recipes for developers and AI coding agents (LLMs).

---

## 1. Quick Decision Rules

Follow this decision order to determine the correct component:

1. **Does it change the URL or navigate to another page/state?**<br>➔ **Navigation Link** (`@/core/Link` or `<nav>` + `<a>`).
2. **Does it trigger an immediate action, preset, or calculation?**<br>➔ **Action Button Group** (`BaseButton` with `role="group"` and optional `aria-pressed`).
3. **Can multiple options be active simultaneously?**<br>➔ **Multi-select Buttons / Checkboxes** (`role="group"` with `aria-pressed` or `Checkbox`).
4. **Does each option own a distinct, large content panel?**<br>➔ **Tabs** (`Tabs` from `waldur-ui`; see [tabs.md](tabs.md), which also covers the segmented look).
5. **Is it a question in a submission form with validation errors?**<br>➔ **Form RadioGroup** (`RadioGroup` inside `<fieldset>` + `<legend>`).
6. **Does it switch a display lens, interval, or in-memory list filter?**<br>➔ **View Lens / Filter** (`SegmentedControl` with `role="radiogroup"`).

---

## 2. Comparative Matrix

| UI Pattern                   | Standard Component                              | Underlying Semantics                                                     | Keyboard Model                                                                                                          | Valid Contexts                                                                               | Prohibited Anti-Patterns                                                       |
| :--------------------------- | :---------------------------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **View Lens / Filter**       | `SegmentedControl` (`waldur-ui`)                | `role="radiogroup"`<br>`role="radio"`<br>`aria-checked`                  | Single <kbd>Tab</kbd> stop;<br><kbd>←</kbd> / <kbd>→</kbd> select option                                                | Filtering a list in place (All/Unread), chart intervals (Day/Month), diff modes (Table/JSON) | **Never** use for actions (+1h extend), routing tabs, or tab panels            |
| **Action Preset / Shortcut** | Group of `BaseButton` (`waldur-ui`)             | `role="group"`<br>`<button>`<br>`aria-pressed`                           | Normal <kbd>Tab</kbd> stop per button;<br><kbd>Enter</kbd> / <kbd>Space</kbd> activates                                 | Offset buttons (+30m, +1h), preset calculators, filter clearers                              | **Never** use `SegmentedControl` (radios imply persistent state, not actions)  |
| **Tabbed Panels**            | `Tabs` (`waldur-ui`, Radix; [tabs.md](tabs.md)) | `role="tablist"`<br>`role="tab"`<br>`role="tabpanel"`<br>`aria-controls` | Single <kbd>Tab</kbd> stop;<br><kbd>←</kbd> / <kbd>→</kbd> moves tabs;<br><kbd>Space</kbd> / <kbd>Enter</kbd> activates | Swapping major DOM sections (e.g. Overview vs Settings vs Audit Log)                         | **Never** use `SegmentedControl` without `role="tabpanel"` and `aria-controls` |
| **Page Navigation**          | `@/core/Link` or `<nav>` + `<a>`                | `<nav aria-label="...">`<br>`<a href="...">`                             | Normal <kbd>Tab</kbd> per link;<br><kbd>Enter</kbd> navigates;<br>Right-click "Open in new tab"                         | UI-Router state tabs (`TableNav`), page headers, sidebar links                               | **Never** use `SegmentedControl` or `<button>` for URL transitions             |
| **Form Question**            | `RadioGroup` (`waldur-ui`)                      | `<fieldset>`<br>`<legend>`<br>native `<input type="radio">`              | Single <kbd>Tab</kbd> stop;<br>Arrow keys select                                                                        | Standard form questions with error messages and form serialization                           | Don't use `SegmentedControl` when validation errors or descriptions are needed |
| **Multi-Select Filter**      | Button group with `aria-pressed`                | `role="group"`<br>`<button aria-pressed="...">`                          | <kbd>Tab</kbd> between buttons;<br><kbd>Space</kbd> toggles                                                             | Filter tags, multi-select chips, facet bars                                                  | `SegmentedControl` strictly supports one active value                          |

---

## 3. Pattern Implementation Guides

### Pattern 1: View Lens / Display Filter (`SegmentedControl`)

Use when changing **how** current data is viewed without navigating away or unmounting surrounding layout.

```tsx
// ✅ CORRECT: View lens in a table or list header
import { useMemo, useState } from 'react';
import { SegmentedControl, SegmentedControlOption } from 'waldur-ui';
import { translate } from '@/i18n';

type ViewMode = 'table' | 'json';

export const MyDiffViewer = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const options: SegmentedControlOption<ViewMode>[] = useMemo(
    () => [
      { value: 'table', label: translate('Table') },
      { value: 'json', label: translate('JSON') },
    ],
    [],
  );

  return (
    <SegmentedControl<ViewMode>
      aria-label={translate('Diff view')}
      size="sm"
      options={options}
      value={viewMode}
      onValueChange={setViewMode}
    />
  );
};
```

**A11y Rules for `SegmentedControl`:**

1. **Mandatory accessible name**: Must supply `aria-label` or `aria-labelledby`. Screen readers announce: `"{aria-label}, radio group. Table, radio button, checked, 1 of 2"`.
2. **Value must never be empty**: If state can be cleared, use toggle buttons, not a radio group.
3. **No action side-effects**: Selecting an option should only update the view lens/filter parameter.

---

### Pattern 2: Action Presets & Shortcuts (`BaseButton` Group)

Use when buttons trigger an immediate operation or calculation (e.g. calculating dates, triggering presets).

```tsx
// ✅ CORRECT: Quick extend action buttons
import { BaseButton } from 'waldur-ui';
import { translate } from '@/i18n';

const PRESETS = [
  { key: '30m', label: '+30 min', minutes: 30 },
  { key: '1h', label: '+1 h', minutes: 60 },
  { key: '2h', label: '+2 h', minutes: 120 },
];

export const QuickExtendSection = ({ onApply, activeKey, submitting }) => (
  <div
    role="group"
    aria-label={translate('Quick extend options')}
    className="d-flex flex-wrap gap-2"
  >
    {PRESETS.map((preset) => {
      const isSelected = activeKey === preset.key;
      return (
        <BaseButton
          key={preset.key}
          size="sm"
          variant={isSelected ? 'secondary' : 'tertiary'}
          disabled={submitting}
          disabledReason={
            submitting ? translate('Submission in progress') : undefined
          }
          onClick={() => onApply(preset.key, preset.minutes)}
          label={preset.label}
          aria-pressed={isSelected}
        />
      );
    })}
  </div>
);
```

**Why `SegmentedControl` is an Anti-Pattern here:**

- In Radix `RadioGroup`, `onValueChange` only triggers when changing to a _different_ value. If a user clicks `+30 min`, manually adjusts the input, and clicks `+30 min` again, `RadioGroup` drops the interaction.
- Screen readers announce `"Radio button, checked"`, misleading users to believe they are selecting a form field setting rather than executing an action.

---

### Pattern 3: Page & Route Navigation (`TabNav` / `@/core/Link`)

When selecting a tab changes the URL or router state, the items must stay real links. Give each `TabNav` item a `link: <Link … />`; see [tabs.md](tabs.md) for the markup.

**Prohibited Anti-Pattern:**

- Never replace routing links with `SegmentedControl` or plain `<button>` elements. Doing so breaks middle-click, "Copy link address", search-engine indexing, and screen reader link announcements.

---

## 4. Checklist for Developers & LLMs

Before choosing or migrating a switcher component, run this checklist:

- [ ] **What happens on click?**
  - Updates URL/route? ➔ **Use `Link` / `<nav>`**.
  - Triggers calculation or modal action? ➔ **Use `BaseButton` (`role="group"` + `aria-pressed`)**.
  - Swaps a large tab panel? ➔ **Use `Tabs`** (see [tabs.md](tabs.md)).
  - Filters or changes view parameters in place? ➔ **Use `SegmentedControl`**.
- [ ] **Does `SegmentedControl` have an accessible label?**
  - Every `<SegmentedControl>` must have `aria-label={translate('...')}` or `aria-labelledby`.
- [ ] **Are disabled buttons compliant?**
  - Any disabled `BaseButton` must supply `disabledReason` or `tooltip` per the `waldur-custom/enforce-disabled-button-tooltip` lint rule.
- [ ] **Is single-selection strictly guaranteed?**
  - If the user can deselect the option, do not use `SegmentedControl`.
