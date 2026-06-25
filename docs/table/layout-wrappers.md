# Table Component: Layout Wrappers & Portals

When rendering multiple tables within tabs, use the `TableWithTabs` wrapper component.

---

## Table with Tabs Wrapper Component (`TableWithTabs`)

`TableWithTabs` (`src/table/TableWithTabs.tsx`) is a layout wrapper that renders standard Bootstrap Nav tabs. Each tab maps to a lazy-loaded child component.

This wrapper manages:

- Active tab state.
- Query parameter synchronization in the URL.
- **Portals** passed down to child tables, allowing them to render search bars, reload triggers, and action buttons directly into the parent card's shared header toolbar.

### Basic Usage

```tsx
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

// Tabs should define a lazy-loaded component to render inside the panel
const tabs = [
  {
    key: 'checklists',
    title: translate('Checklists'),
    component: lazyComponent(() =>
      import('./checklists/ChecklistsTable').then((module) => ({
        default: module.ChecklistsTable,
      })),
    ),
  },
  {
    key: 'analytics',
    title: translate('Analytics'),
    component: lazyComponent(() =>
      import('./analytics/AnalyticsAndReports').then((module) => ({
        default: module.AnalyticsAndReports,
      })),
    ),
  },
];

export const ChecklistManagement = () => {
  return (
    <TableWithTabs
      title={translate('Checklist Management')}
      tabs={tabs}
      syncWithUrlKey="tab" // Syncs tab key state to ?tab=checklists in the URL
    />
  );
};
```

---

## Component Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | `ReactNode` | Card title text / elements. |
| `subtitle` | `ReactNode` | Optional card subtitle. |
| `tabs` | `TableTab[]` | Array of tab settings (each must have a `component` key). |
| `syncWithUrlKey` | `string` | Query parameter key used to sync the active tab in the URL (optional). |
| `data` | `Record<string, any>` | Optional properties/payload automatically passed down to all child tab components. |
| `headerActions` | `ReactNode` | Actions rendered directly next to the tab navigation list. |
| `actions` | `ReactNode` or `Array<{ activeKeys, component }>` | Actions rendered in the header toolbar. |

---

## Child Components Integration (Portals)

When rendering a standard `<Table>` component inside a `TableWithTabs` pane, the tab wrapper automatically passes a `portal` prop containing DOM element references. You **must** forward this `portal` prop to your `<Table>` component to ensure its toolbar buttons and refresh buttons render in the correct card header slot:

```tsx
// Inside ChecklistsTable component:
export const ChecklistsTable = ({ portal, ...props }) => {
  const tableProps = useTable({
    table: 'checklists',
    fetchData: createFetcher(checklistsList),
  });

  return (
    <Table
      {...tableProps}
      portal={portal} // Critical for card toolbar styling!
      columns={columns}
      hasQuery
    />
  );
};
```
