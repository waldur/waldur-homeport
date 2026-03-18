# UI/UX Consistency Guidelines

This document provides comprehensive guidelines for maintaining UI/UX consistency across Waldur HomePort. Following these patterns ensures a predictable, accessible, and professional user experience.

## Table of Contents

1. [Empty States](#1-empty-states)
2. [Button Visibility (Hide vs Disable)](#2-button-visibility-hide-vs-disable)
3. [Loading States](#3-loading-states)
4. [Tables and Filters](#4-tables-and-filters)
5. [Dialogs and Confirmations](#5-dialogs-and-confirmations)
6. [Notifications](#6-notifications)
7. [Status Indicators](#7-status-indicators)
8. [Tooltips](#8-tooltips)
9. [Typography and Content](#9-typography-and-content)
10. [Accessibility](#10-accessibility)
11. [Responsive Behavior](#11-responsive-behavior)
12. [Anti-Patterns](#12-anti-patterns)
13. [Report Filters](#13-report-filters)
14. [Chart Composition](#14-chart-composition)
15. [Report Page Layout](#15-report-page-layout)
16. [Anti-Patterns](#16-anti-patterns)

---

## 1. Empty States

Empty states are critical touchpoints that can either frustrate users or guide them toward productive actions. Never leave users at dead ends.

### 1.1 Empty State Types

| Type | Purpose | Example |
|------|---------|---------|
| **First-use** | Onboarding opportunity | "No projects yet. Create your first project to get started." |
| **No search results** | Help refine search | "Your search 'xyz' did not match any resources." |
| **Filtered empty** | Suggest filter modification | "No resources matching current filters" |
| **User-cleared** | Task completion | "All tasks completed!" |
| **Error state** | Recovery with retry | "Unable to load data." + Reload button |

### 1.2 Table Empty States

Use the `NoResult` component for all table empty states:

```tsx
import { NoResult } from '@waldur/navigation/header/search/NoResult';

// Basic usage - let NoResult provide defaults
<NoResult />

// With custom title and message
<NoResult
  title={translate('No projects found')}
  message={translate('Create a project to start using resources.')}
/>

// With search context and clear action
<NoResult
  title={getNoResultTitle({ verboseName: 'projects', hasFilter: true })}
  message={getNoResultMessage({ query, verboseName: 'projects' })}
  callback={clearFilters}
  buttonTitle={translate('Clear filters')}
/>

// With custom action button
<NoResult
  title={translate('No resources yet')}
  message={translate('Deploy your first resource to get started.')}
  actions={
    <SubmitButton
      label={translate('Deploy resource')}
      onClick={handleDeploy}
    />
  }
/>
```

**Message hierarchy**: Title → Explanation → CTA (call-to-action)

**Utility functions** (from `src/table/utils.tsx`):

```tsx
import { getNoResultTitle, getNoResultMessage } from '@waldur/table/utils';

// For filtered tables
getNoResultTitle({ verboseName: 'users', hasFilter: true });
// → "No users found matching current filters"

// For search queries
getNoResultMessage({ query: 'john', verboseName: 'users' });
// → "Your search "john" did not match any users."

// For empty tables without filters
getNoResultMessage({ verboseName: 'projects', customEmpty: translate('Start by creating a project.') });
```

### 1.3 Inline Empty Values

**Standard**: Use `DASH_ESCAPE_CODE` (—) for null/undefined values in displays:

```tsx
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';

// In table columns
{
  title: translate('Description'),
  render: ({ row }) => renderFieldOrDash(row.description),
}

// In detail views
<Field label={translate('End date')} value={renderFieldOrDash(project.end_date)} />

// Direct usage
{user.phone || DASH_ESCAPE_CODE}
```

**For arrays**:

```tsx
// Empty array - use descriptive message
{items.length > 0 ? items.map(renderItem) : translate('None')}

// Or use dash for consistency
{items.length > 0 ? items.join(', ') : DASH_ESCAPE_CODE}
```

### 1.4 Empty State Message Templates

```tsx
// Default (no context)
translate('No {verboseName} found', { verboseName })

// With search query
translate('Your search "{query}" did not match any {verboseName}.', { query, verboseName })

// With active filters
translate('No {verboseName} found matching current filters', { verboseName })

// First use (encouraging)
translate('No {verboseName} yet. Create your first {singular} to get started.', { verboseName, singular })

// After action completion
translate('All {verboseName} have been processed.')
```

---

## 2. Button Visibility (Hide vs Disable)

The decision to hide vs disable a button significantly impacts user experience. Use this decision matrix consistently.

### 2.1 Decision Matrix

| Scenario | Action | Rationale |
|----------|--------|-----------|
| User lacks permission (role-based) | **HIDE** | User will never be authorized in current context |
| Resource in wrong state | **DISABLE** + tooltip | Temporary; user can fix by changing state |
| Action in progress | **DISABLE** + spinner | Will become available when complete |
| Feature not applicable | **HIDE** | Doesn't apply to this resource type |
| Validation incomplete | **DISABLE** + tooltip | User can complete requirements |
| Quota exceeded | **DISABLE** + tooltip | User can request more quota |

### 2.2 Disabled Button Requirements

**ALWAYS provide a tooltip explaining WHY the button is disabled.**

```tsx
import { useValidators } from '@waldur/resource/actions/useValidators';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

// Using useValidators hook for state-based validation
const validators = [
  ({ resource }) => {
    if (resource.state !== 'OK') {
      return translate('Resource must be in OK state');
    }
  },
  ({ resource }) => {
    if (resource.runtime_state !== 'ACTIVE') {
      return translate('Instance must be running');
    }
  },
];

const MyAction = ({ resource }) => {
  const { tooltip, disabled } = useValidators(validators, resource);

  return (
    <ActionItem
      title={translate('Restart')}
      action={handleRestart}
      disabled={disabled}
      tooltip={tooltip}  // Always provide tooltip when disabled
      iconNode={<ArrowClockwiseIcon weight="bold" />}
    />
  );
};
```

**Visual requirements**:

- Disabled buttons use design token colors (e.g., `text-muted`, `btn-disabled`) - NOT opacity
- Opacity is reserved for overlays only; components use solid colors for predictability, accessibility, and theming
- Keep the same width to prevent layout shift
- Use `aria-disabled` for accessibility

### 2.3 Permission Patterns

Use `hasPermission()` utility consistently:

```tsx
import { hasPermission } from '@waldur/permissions/hasPermission';
import { useUser } from '@waldur/workspace/hooks';

const MyComponent = ({ project }) => {
  const user = useUser();

  // HIDE if user lacks permission (they can never do this)
  if (!hasPermission(user, {
    permission: 'resource.create',
    projectId: project.uuid
  })) {
    return null;  // Early return - hide entire component
  }

  return <CreateResourceButton />;
};
```

**Staff-only actions**:

```tsx
import { StaffOnlyIndicator } from '@waldur/customer/details/StaffOnlyIndicator';

// For staff-only actions that should still be visible
<ActionItem
  title={translate('Admin action')}
  action={handleAction}
  staff  // Shows StaffOnlyIndicator badge
/>

// Check staff status
const user = useUser();
if (!user?.is_staff) {
  return null;  // Hide from non-staff
}
```

---

## 3. Loading States

Consistent loading feedback prevents user confusion and maintains perceived performance.

### 3.1 Table Loading

```tsx
// Table handles this automatically via the loading prop
// Spinner shown when: loading === true && rows.length === 0

// For manual control in custom components:
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

{loading && !data.length ? (
  <LoadingSpinner />
) : (
  <DataContent data={data} />
)}

// With existing data - show subtle indicator, don't replace content
{loading && data.length > 0 && (
  <div className="text-center py-2">
    <LoadingSpinnerIcon className="text-muted" />
  </div>
)}
```

### 3.2 Button Loading

Use the `pending` prop on buttons:

```tsx
import { SubmitButton } from '@waldur/form';
import { BaseButton } from '@waldur/core/buttons/BaseButton';

// Form submit button
<SubmitButton
  label={translate('Save')}
  submitting={isSubmitting}  // Shows spinner, disables button
/>

// Action button
<BaseButton
  label={translate('Process')}
  onClick={handleProcess}
  pending={isProcessing}  // Shows spinner, disables button
  size="sm"
/>
```

**Key behaviors**:

- Button shows spinner and becomes disabled
- Button width stays stable (no layout shift)
- Label remains visible next to spinner

### 3.3 Error States

Use `LoadingErred` component for recoverable errors:

```tsx
import { LoadingErred } from '@waldur/core/LoadingErred';

// In data-fetching components
if (error) {
  return (
    <LoadingErred
      loadData={refetch}
      message={translate('Unable to load projects.')}
    />
  );
}

// Custom error message
<LoadingErred
  loadData={retry}
  message={translate('Connection failed. Please check your network.')}
/>
```

**Always provide a retry action** - never leave users stuck.

---

## 4. Tables and Filters

### 4.1 Filter Visibility Rules

| Filter Position | When Visible | On Empty Table |
|-----------------|--------------|----------------|
| `header` | Always | Always visible |
| `menu` | Toggle button click | Show toggle button |
| `sidebar` | When filters active OR toggled | **Show toggle button** (allow discovery) |

**Important**: Never completely hide filters on empty tables. Users need to discover that filters exist and may be causing the empty state.

**When filters return no results**, show a specific empty state:

- Message: "No results match your filters"
- Actions: "Clear filters" / "View filters"

```tsx
<NoResult
  title={translate('No results match your filters')}
  message={translate('Try adjusting your filters or clear them to see all items.')}
  actions={
    <>
      <Button variant="tertiary" onClick={clearFilters}>
        {translate('Clear filters')}
      </Button>
      <Button variant="outline" onClick={openFilters}>
        {translate('View filters')}
      </Button>
    </>
  }
/>
```

```tsx
// Table configuration
<Table
  filters={<MyFilters />}
  filterPosition="menu"  // 'header' | 'menu' | 'sidebar'
  // ...
/>
```

### 4.2 Filter Behavior Checklist

- [ ] Clear visual indication when filters are active (badge count)
- [ ] Prominent "Clear all" functionality
- [ ] Reset to page 1 when filters change
- [ ] Persist filter state across navigation (when appropriate)
- [ ] Show "No results matching filters" message (not generic empty)

### 4.3 Pagination Rules

```tsx
import { PAGE_SIZE_COMPACT, PAGE_SIZE_FULL } from '@waldur/table/constants';

// PAGE_SIZE_COMPACT = 5 (for embedded/secondary tables)
// PAGE_SIZE_FULL = 10 (for primary tables)

// Hide pagination when items ≤ PAGE_SIZE_COMPACT
{pagination.resultCount > PAGE_SIZE_COMPACT && (
  <TablePagination {...pagination} />
)}

// Show item count
// Format: "Showing 1-10 of 100"
```

---

## 5. Dialogs and Confirmations

### 5.1 Confirmation Dialog Pattern

```tsx
import { waitForConfirmation } from '@waldur/modal/actions';

// Destructive action (deletion) - name the object being deleted
const handleDelete = async () => {
  try {
    await waitForConfirmation(
      dispatch,
      translate('Delete {type}', { type: 'project' }),
      translate('"{name}" will be permanently deleted. This action cannot be undone.', { name: resource.name }),
      {
        forDeletion: true,  // Red styling, warning icon
        size: 'sm',
        positiveButton: translate('Delete'),  // Clear action label
      }
    );
    // User confirmed - proceed with deletion
    await deleteResource(resource.uuid);
    dispatch(showSuccess(translate('Resource deleted')));
  } catch {
    // User cancelled - do nothing
    return;
  }
};

// Non-destructive confirmation
await waitForConfirmation(
  dispatch,
  translate('Confirm action'),
  translate('This will restart all services. Continue?'),
  {
    positiveButton: translate('Restart'),
  }
);
```

**Button order**: Cancel (left), Confirm (right)

**Clear action labels**: Use "Delete", "Restart", "Submit" - not "OK" or "Yes"

### 5.2 Form Dialog Pattern

```tsx
// Standard form dialog footer
<div className="d-flex gap-2 justify-content-end">
  <Button variant="tertiary" onClick={closeDialog}>
    {translate('Cancel')}
  </Button>
  <SubmitButton
    label={translate('Save changes')}
    submitting={isSubmitting}
    disabled={!isValid}
  />
</div>
```

---

## 6. Notifications

Use the notification utilities from `@waldur/store/notify`:

```tsx
import {
  showSuccess,
  showError,
  showErrorResponse,
  showInfo
} from '@waldur/store/notify';

// Success - action completed
dispatch(showSuccess(translate('Project created successfully')));

// Success with details
dispatch(showSuccess(
  translate('Resource deployed'),
  translate('Your resource will be ready in a few minutes.')
));

// Error - action failed
dispatch(showError(translate('Unable to save changes')));

// Error with API response details
try {
  await saveData();
} catch (error) {
  dispatch(showErrorResponse(error, translate('Unable to save changes.')));
}

// Info - informational only
dispatch(showInfo(translate('Changes will take effect after refresh')));
```

**Configuration**:

- Duration: 7000ms (7 seconds)
- Position: top-right
- Dismissible: Yes (show dismiss button)

---

## 7. Status Indicators

### 7.1 StateIndicator Component

```tsx
import { StateIndicator } from '@waldur/core/StateIndicator';

// Basic usage
<StateIndicator
  label={resource.state}
  variant="success"
/>

// With spinner for active/in-progress states
<StateIndicator
  label={translate('Creating')}
  variant="primary"
  active  // Shows spinner
/>

// Common variant options
<StateIndicator label="Active" variant="success" />
<StateIndicator label="Pending" variant="warning" />
<StateIndicator label="Error" variant="danger" />
<StateIndicator label="Inactive" variant="default" />

// Styling options
<StateIndicator
  label="OK"
  variant="success"
  outline  // Outlined style
  pill     // Rounded pill shape
  hasBullet  // Shows bullet indicator
  size="sm"  // 'sm' | 'lg'
/>
```

### 7.2 Variant Mapping Guidelines

| State Category | Variant | Examples |
|---------------|---------|----------|
| Success/Active | `success` | Active, Running, Completed, Approved |
| Warning/Pending | `warning` | Pending, Processing, Updating |
| Error/Failed | `danger` | Error, Failed, Rejected, Unavailable |
| Neutral/Default | `default` | Draft, Archived, Paused, Unknown |
| Info | `info` | New, In Review |

**Custom variants** (for differentiation within same category):
`pink`, `blue`, `teal`, `indigo`, `purple`, `rose`, `orange`, `moss`

---

## 8. Tooltips

### 8.1 Usage Guidelines

Use tooltips for:

- **Disabled buttons**: Explain why disabled (required)
- **Icon-only buttons**: Always provide tooltip describing the action (required)
- **Truncated text**: Show full text
- **Icons without labels**: Describe the element's purpose
- **Complex terms**: Provide definitions

```tsx
import { Tip } from '@waldur/core/Tooltip';

// Basic tooltip
<Tip label={translate('Copy to clipboard')} id="copy-btn">
  <CopyIcon />
</Tip>

// Tooltip with body (title + description)
<Tip
  label={translate('Resource limits')}
  body={translate('Maximum amount of resources that can be allocated.')}
  id="limits-info"
>
  <InfoIcon />
</Tip>

// Light theme tooltip
<Tip label={fullText} id="text-tooltip" theme="light">
  <span className="ellipsis">{truncatedText}</span>
</Tip>
```

### 8.2 Disabled Element Tooltip Pattern

From `ActionItem` - use question icon for disabled action explanation:

```tsx
import { QuestionIcon } from '@phosphor-icons/react';

// When action is disabled, show question icon with tooltip
{props.disabled && props.tooltip && (
  <Tip label={props.tooltip} id={`disabled-reason-${id}`}>
    <QuestionIcon
      size={20}
      weight="bold"
      className="text-muted ms-1"
    />
  </Tip>
)}
```

---

## 9. Typography and Content

### 9.1 Text Truncation

```tsx
import { formatLongText } from '@waldur/table/utils';

// For text > 100 characters - shows tooltip with full text
{formatLongText(description)}

// CSS truncation class
<span className="ellipsis">{text}</span>

// With custom width
<span className="ellipsis d-inline-block" style={{ maxWidth: 200 }}>
  {text}
</span>
```

### 9.2 Internationalization

All user-facing text must use `translate()`:

```tsx
import { translate } from '@waldur/i18n';

// Simple string
translate('Save changes')

// With placeholders
translate('Hello, {name}!', { name: user.name })

// Plural forms
translate('{count} item', '{count} items', { count })

// Never hard-code strings
// ❌ <Button>Submit</Button>
// ✅ <Button>{translate('Submit')}</Button>
```

---

## 10. Accessibility

### 10.1 Disabled State Accessibility

```tsx
// Use aria-disabled for screen reader support
<button
  aria-disabled={isDisabled}
  onClick={!isDisabled ? handleClick : undefined}
  className={isDisabled ? 'text-muted' : ''}
>
  {label}
</button>

// Tooltips on disabled buttons should be accessible
// The Tip component handles this automatically
```

### 10.2 Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use proper focus management in modals
- Maintain logical tab order

### 10.3 Screen Reader Support

```tsx
// Loading states should be announced
<LoadingSpinnerIcon
  role="status"
  aria-label={translate('Loading...')}
/>

// Provide text alternatives for icons
<button aria-label={translate('Delete item')}>
  <TrashIcon />
</button>
```

---

## 11. Responsive Behavior

### 11.1 Breakpoints

```tsx
import { GRID_BREAKPOINTS } from '@waldur/core/constants';

// GRID_BREAKPOINTS = { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400 }

import { useMediaQuery } from 'react-responsive';

const isSm = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });
const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });
```

### 11.2 Filter Position Adaptation

```tsx
// Automatically converts 'menu' to 'sidebar' on small screens
const filterPosition = isSm && originalPosition === 'menu'
  ? 'sidebar'
  : originalPosition;
```

### 11.3 Interactive Element Sizing

**Form controls (inputs, selects, textareas):**

- Minimum height: 40px for adequate touch/click area

**Buttons:**

- Three standard sizes: 44px (large), 36px (default), 28px (small)
- All sizes are acceptable for desktop interfaces
- Use size appropriate to context and hierarchy

**Icon-only buttons:**

- Should maintain adequate click area even with small icons
- Consider padding to reach at least 28px hit area

```tsx
// Button sizes
<Button size="lg">Large (44px)</Button>
<Button>Default (36px)</Button>
<Button size="sm">Small (28px)</Button>
```

> **Note:** The 44px minimum touch target (WCAG) is primarily for mobile/touch interfaces. Desktop applications can use smaller interactive elements.

---

## 12. Anti-Patterns

### What NOT to Do

| Anti-Pattern | Problem | Correct Approach |
|--------------|---------|------------------|
| Redundant `length === 0` checks | Table already handles empty | Trust the Table component |
| Mixed null display (`—`, "N/A", "", "None") | Inconsistent | Always use `DASH_ESCAPE_CODE` or `renderFieldOrDash` |
| Hide + Disable for same scenario | Confusing | Follow decision matrix consistently |
| Disabled button without tooltip | User doesn't know why | Always provide tooltip |
| Hard-coded strings | Not translatable | Always use `translate()` |
| Hidden filters on empty tables | Can't discover filters | Show filter toggle |
| Empty state without CTA | Dead end | Always provide next action |
| `user.is_staff` checks everywhere | Inconsistent | Use `hasPermission()` utility |

### Code Examples - Bad vs Good

```tsx
// ❌ BAD: Inconsistent empty display
{user.email || 'N/A'}
{user.phone || ''}
{user.name || '—'}

// ✅ GOOD: Consistent
{renderFieldOrDash(user.email)}
{renderFieldOrDash(user.phone)}
{renderFieldOrDash(user.name)}
```

```tsx
// ❌ BAD: Disabled without explanation
<Button disabled={!canEdit}>Edit</Button>

// ✅ GOOD: Disabled with tooltip
<Tip label={canEdit ? null : translate('You need edit permission')}>
  <Button disabled={!canEdit}>Edit</Button>
</Tip>
```

```tsx
// ❌ BAD: Inconsistent staff checks
if (user.is_staff) { ... }
if (hasPermission(user, { permission: 'admin.view' })) { ... }
if (user?.is_staff || user?.is_support) { ... }

// ✅ GOOD: Consistent permission checking
if (hasPermission(user, { permission: 'resource.admin', projectId })) { ... }
```

```tsx
// ❌ BAD: Empty state dead end
{items.length === 0 && <p>No items</p>}

// ✅ GOOD: Actionable empty state
{items.length === 0 && (
  <NoResult
    title={translate('No items yet')}
    message={translate('Create your first item to get started.')}
    actions={<CreateButton />}
  />
)}
```

---

## Quick Reference

### Key Imports

```tsx
// Empty states
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash, getNoResultTitle, getNoResultMessage } from '@waldur/table/utils';

// Buttons & Actions
import { BaseButton } from '@waldur/core/buttons/BaseButton';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { useValidators } from '@waldur/resource/actions/useValidators';

// Loading & Errors
import { LoadingSpinner, LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { LoadingErred } from '@waldur/core/LoadingErred';

// Indicators
import { StateIndicator } from '@waldur/core/StateIndicator';
import { Badge } from '@waldur/core/Badge';

// Tooltips
import { Tip } from '@waldur/core/Tooltip';

// Permissions
import { hasPermission } from '@waldur/permissions/hasPermission';
import { StaffOnlyIndicator } from '@waldur/customer/details/StaffOnlyIndicator';

// Notifications
import { showSuccess, showError, showErrorResponse, showInfo } from '@waldur/store/notify';

// Modals
import { waitForConfirmation } from '@waldur/modal/actions';

// i18n
import { translate } from '@waldur/i18n';

// Constants
import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { PAGE_SIZE_COMPACT, PAGE_SIZE_FULL } from '@waldur/table/constants';
```

### Decision Trees

**Should I hide or disable this button?**

```text
Is the user PERMANENTLY unable to perform this action in current context?
├─ YES → HIDE the button
│   Examples: lacks role, feature not applicable, wrong resource type
│
└─ NO (temporary or user-fixable) → DISABLE with tooltip
    Examples: wrong state, validation incomplete, quota exceeded, action in progress
```

**What empty state should I show?**

```text
Is there an active search/filter?
├─ YES (search) → "Your search '{query}' did not match any {items}"
├─ YES (filter) → "No {items} found matching current filters" + Clear button
│
└─ NO → Is this first-time use?
    ├─ YES → Encouraging message + Create CTA
    └─ NO → "No {items} found" + relevant action
```

---

## Top 10 Inconsistencies to Fix

Based on a codebase analysis, these are prioritized inconsistencies that should be addressed:

### 1. Mixed Null/Empty Display Values

**Files affected**: `src/vmware/PortsList.tsx`, `src/project/manage/ProjectGeneral.tsx`, `src/user/hooks/HooksList.tsx`, and others

**Problem**: Using `|| 'N/A'` instead of `renderFieldOrDash()`

```tsx
// Current (inconsistent)
row.network_name || 'N/A'
project.name || 'N/A'
row.destination_url || row.email || 'N/A'

// Should be
renderFieldOrDash(row.network_name)
renderFieldOrDash(project.name)
```

### 2. Scattered Staff Permission Checks

**Files affected**: Multiple files with direct `user.is_staff` checks

**Problem**: Permission checks done inconsistently across components

```tsx
// Current (scattered)
if (user.is_staff) { ... }

// Should use centralized utility
if (hasPermission(user, { permission: 'staff.action', ... })) { ... }
```

### 3. Sidebar Filters Hidden on Empty Tables

**Files affected**: `src/table/Table.tsx:301-323`

**Problem**: Sidebar filters only show when `filtersStorage.length > 0`, preventing filter discovery

```tsx
// Current behavior
{props.filterPosition === 'sidebar' && props.filtersStorage.length > 0 && ...}

// Should show toggle button even when no filters active
```

### 4. Disabled Buttons Without Tooltips

Various components have disabled buttons that don't explain why they're disabled.

**Fix**: Audit all `disabled` props and ensure accompanying `tooltip` prop

### 5. Empty Copy Field Values

**Files affected**: `src/proposals/manage/CallProposalsList.tsx`, `src/openstack/openstack-tenant/TenantPortsList.tsx`

**Problem**: Using `|| ''` for copy fields can result in copying empty string

```tsx
// Current
copyField: (row) => row.mac_address || ''

// Should provide fallback or hide copy when empty
copyField: (row) => row.mac_address || undefined
```

### 6. Inconsistent Empty State Messages

Various list components show plain text instead of using the `NoResult` component.

**Fix**: All list empty states should use `NoResult` with appropriate messaging

### 7. Mixed Boolean Permission Returns

**Files affected**: `src/permissions/hasPermission.ts`

**Problem**: Function returns `true` or `undefined` instead of `true` or `false`

```tsx
// Current
if (...) return true;
// Falls through to undefined

// Should be explicit
return false;
```

### 8. Invitation Display Inconsistencies

**Files affected**: `src/invitations/join-organization/submission.tsx`

**Problem**: Using `|| 'N/A'` in user-facing messages

```tsx
// Current
organization: groupInvitation.scope_name || 'N/A'

// Should handle missing data more gracefully
```

### 9. Form Field Empty Fallbacks

**Files affected**: Various form components using `|| ''`

**Problem**: Inconsistent handling of empty form values

### 10. Missing Error State Handling

Various data-fetching components don't show `LoadingErred` on fetch failure.

**Fix**: Audit all data-fetching components for proper error state handling



---

## 13. Report Filters

### When to use which filter pattern

| Pattern | Use |
|---|---|
| Page-level filters (top of page) | Used on report pages |
| Header global filters | Used as system-wide filters affecting multiple pages |
| Table dropdown filters | Used for table column filtering |

### Standard filter component composition

There is no fixed standard set — filters vary per report depending on the dataset.

Filters used in reports:

- Organization
- Project
- Date range (start–end)

Optional shortcut selectors that populate the date range:

- 7 days
- 30 days
- 1 year

Other filters depend on the report dataset.

### Filter visibility rules

Filters are visible at the top of the page. Even when result data is empty, filters remain visible so the user can adjust them to change the dataset.

**Fix**: Always render filter components unconditionally — never gate them on data state or loading.

```tsx
// ❌ BAD
{data.length > 0 && <ReportFilters />}
{!loading && <FilterBar />}

// ✅ GOOD
<ReportFilters />
<FilterBar />
```

```js
module.exports = {
  create(context) {
    return {
      JSXExpressionContainer(node) {
        const expr = node.expression;
        if (expr.type === 'LogicalExpression' && expr.operator === '&&') {
          const left = context.getSourceCode().getText(expr.left);
          if (left.includes('.length') || left.includes('loading') || left.includes('isEmpty')) {
            context.report({
              node,
              message: 'Filters must not be conditionally hidden based on data or loading state. Always render filters.',
            });
          }
        }
      },
    };
  },
};
```

### Mobile behavior

Report filters remain at the top of the page. On smaller screens filters may wrap to multiple rows, and remain visible above charts and tables. Filters must stay accessible without opening a separate panel.

### Default filter states per report type

| Default state | Meaning |
|---|---|
| No filters applied | Report loads full dataset |
| Pre-filled date range | Report loads recent data (e.g. last 30 days) |
| Required filters empty | User must select filters before results appear |

---

## 14. Chart Composition

### When to use each chart type

| Chart | Use |
|---|---|
| Donut / Pie | Showing how something breaks down as a share of the whole |
| Bar | Comparing values across categories |
| Line | Showing how something changes over time |
| Stacked bar | Comparing totals AND showing what's inside each total |

- Use **line** when continuity matters — when the shape of the trend is the point.
- Use **stacked bar** only when both the total and the breakdown are meaningful. Keep it to 4–5 segments max, otherwise it gets hard to read.
- Avoid **donut/pie** when you have more than 5 segments or when users need to compare values precisely — a bar chart does that job better.

### Chart-to-filter binding

Charts must reflect the same filtered dataset as the report. Filters affect charts and tables simultaneously. There is no separate filter state for charts.

**Fix**: Charts must receive already-filtered data from the parent report, not manage filters themselves.

```tsx
// ❌ BAD
const MyChart = () => {
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState(null);
}

// ✅ GOOD
const MyChart = ({ data }) => {
  // receives already-filtered data from parent report
}
```

```js
module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        const isUseState =
          node.callee.name === 'useState' ||
          (node.callee.property && node.callee.property.name === 'useState');
        if (!isUseState) return;

        const varName = node.parent?.id?.elements?.[0]?.name || '';
        const filterKeywords = ['filter', 'Filter', 'dateRange', 'DateRange', 'period', 'Period'];
        const componentName = context.getScope().block?.id?.name || '';

        if (
          componentName.toLowerCase().includes('chart') &&
          filterKeywords.some((k) => varName.includes(k))
        ) {
          context.report({
            node,
            message: 'Chart components must not manage their own filter state. Receive filtered data from the parent report instead.',
          });
        }
      },
    };
  },
};
```

### Data provenance display

Charts should include:

- Title describing the metric
- Totals or summary values
- Legend

Tooltips show the specific value and aggregation context (e.g. *Sum of invoices in March — $12,400*).

### Chart empty and loading states

| State | UI |
|---|---|
| Loading | Chart skeleton |
| Empty | "No data for selected filters. Try adjusting your filters." |
| Error | Inline message or alert |

Keep the chart container at its normal height even when empty. Never return `null` from a chart component.

**Fix**: Always render the chart container. Show an empty state when there is no data.

```tsx
// ❌ BAD
if (!data.length) return null;

// ✅ GOOD
{data.length === 0
  ? <NoResult title={translate('No data for selected filters. Try adjusting your filters.')} />
  : <Chart data={data} />
}
```

```js
module.exports = {
  create(context) {
    return {
      ReturnStatement(node) {
        const src = context.getSourceCode().getText(node);
        const componentName = context.getScope().block?.id?.name || '';
        if (componentName.toLowerCase().includes('chart') && src.includes('return null')) {
          context.report({
            node,
            message: 'Chart components must not return null on empty data. Keep the container and show an empty state instead.',
          });
        }
      },
    };
  },
};
```

### Responsive chart behavior

Charts should resize to container width and remain readable without horizontal scroll.

---

## 15. Report Page Layout

### Standard page structure

Page title → Report filters → Charts → Data table.

**Fix**: Always follow this order — never render a chart or table before filters.

```tsx
// ❌ BAD
const ReportPage = () => (
  <>
    <DataTable />
    <ReportFilters />
  </>
);

// ✅ GOOD
const ReportPage = () => (
  <>
    <PageTitle />
    <ReportFilters />
    <Charts />
    <DataTable />
  </>
);
```

```js
module.exports = {
  create(context) {
    return {
      JSXElement(node) {
        const children = node.children.filter((c) => c.type === 'JSXElement');
        const names = children.map((c) => c.openingElement?.name?.name || '');

        const filterIdx = names.findIndex((n) => n.includes('Filter'));
        const tableIdx = names.findIndex((n) => n.includes('Table') || n.includes('DataTable'));
        const chartIdx = names.findIndex((n) => n.includes('Chart'));

        if (filterIdx !== -1 && tableIdx !== -1 && tableIdx < filterIdx) {
          context.report({
            node,
            message: 'DataTable must come after ReportFilters in report page layout.',
          });
        }
        if (filterIdx !== -1 && chartIdx !== -1 && chartIdx < filterIdx) {
          context.report({
            node,
            message: 'Chart must come after ReportFilters in report page layout.',
          });
        }
      },
    };
  },
};
```

### Spacing

16px between blocks. Not enforceable via ESLint — enforce via design review.

### State label placement

Use existing label hierarchy from current mocks. Mocks must follow the same placement used in existing pages. Do not introduce new state layouts. Not enforceable via ESLint — enforce via design review.

---

## Implementation Checklist

When fixing these inconsistencies:

- [ ] Run `yarn lint:check` after changes
- [ ] Verify no TypeScript errors with `yarn build`
- [ ] Test empty states manually
- [ ] Verify disabled button tooltips appear
- [ ] Check responsive behavior on mobile
- [ ] Run relevant unit tests
