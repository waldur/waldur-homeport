---
name: ui-consistency
description: Waldur HomePort UI/UX consistency patterns and design system rules. Use when creating or modifying UI components, tables, forms, buttons, dialogs, empty states, loading states, tooltips, or notifications. Enforces disabled button tooltips, empty state CTAs, proper null value display, and accessibility patterns.
---

# UI Consistency Guidelines

Ensures consistent, accessible UI across Waldur HomePort.

## Quick Reference (Critical Rules)

**Null/Empty Values**
```tsx
// ALWAYS use renderFieldOrDash - never || 'N/A' or || ''
import { renderFieldOrDash } from '@/table/utils';
{renderFieldOrDash(value)}
```

**Disabled Buttons**
```tsx
// ALWAYS provide tooltip explaining WHY disabled
<Tip label={disabled ? translate('Resource must be in OK state') : null}>
  <Button disabled={disabled}>Action</Button>
</Tip>
```

**Empty States**
```tsx
// ALWAYS use NoResult with actionable CTA
<NoResult
  title={translate('No projects yet')}
  message={translate('Create your first project.')}
  actions={<CreateButton />}
/>
```

**Disabled Styling**
```tsx
// Use solid color tokens - NEVER opacity
className={isDisabled ? 'text-muted' : ''}  // correct
className={isDisabled ? 'opacity-50' : ''}  // wrong
```

## Decision Trees

**Hide vs Disable Button?**
- User PERMANENTLY lacks permission → HIDE
- Temporary/fixable condition → DISABLE + tooltip

**Which Empty State?**
- Active filters, no results → "No results match your filters" + Clear filters button
- First-time use → Encouraging message + Create CTA
- Search query, no match → "Your search '{query}' did not match any {items}"

## Complete Guidelines

For full patterns, examples, and anti-patterns:
**[docs/ui-consistency-guidelines.md](../../../docs/ui-consistency-guidelines.md)**

Sections include:
- Empty states and NoResult component
- Button visibility (hide vs disable matrix)
- Loading states and error handling
- Tables and filter behavior
- Dialogs and confirmations
- Notifications
- Status indicators
- Tooltips
- Accessibility
- Responsive behavior

## Pre-Commit Checklist

Before completing UI work, verify:

- [ ] All null/undefined values use `renderFieldOrDash()`
- [ ] Disabled buttons have tooltips explaining why
- [ ] Empty states use `NoResult` with CTA
- [ ] No `opacity-50` for disabled states (use `text-muted`)
- [ ] Permissions checked with `hasPermission()` utility
- [ ] Buttons hidden (not disabled) when user permanently lacks access
- [ ] Filter tables show filter toggle even when empty
- [ ] Confirmation dialogs name the object being affected

## Key Imports

```tsx
import { NoResult } from '@/navigation/header/search/NoResult';
import { renderFieldOrDash } from '@/table/utils';
import { Tip } from '@/core/Tooltip';
import { hasPermission } from '@/permissions/hasPermission';
import { StateIndicator } from '@/core/StateIndicator';
import { LoadingErred } from '@/core/LoadingErred';
```
