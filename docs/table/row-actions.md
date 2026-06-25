# Table Component: Row Actions & Selection

Tables support interactive items, row actions, expandable sections, and multi-row selection.

---

## Row Actions

Use the `rowActions` prop to render action menus on each row.

### 1. Dropdown Action Menu (Recommended)

For a clean and consistent UI, group row-level actions into a 3-dots dropdown menu using `ActionsDropdownComponent` and `ActionItem`:

```tsx
import { FC } from 'react';
import { PencilSimple, Trash } from '@phosphor-icons/react';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

interface RowActionsProps {
  row: MyRowType;
  refetch: () => void;
}

export const RowActions: FC<RowActionsProps> = ({ row, refetch }) => {
  const onDelete = () => handleDelete(row).then(refetch);

  // Return null if no actions are available
  if (row.status === 'completed') {
    return null;
  }

  return (
    <ActionsDropdownComponent>
      <ActionItem
        title={translate('Edit')}
        action={() => handleEdit(row)}
        iconNode={<PencilSimple weight="bold" />}
      />
      <ActionItem
        title={translate('Delete')}
        action={onDelete}
        iconNode={<Trash weight="bold" />}
        className="text-danger"
        iconColor="danger"
      />
    </ActionsDropdownComponent>
  );
};

// Usage inside Table:
<Table
  {...tableProps}
  columns={columns}
  rowActions={({ row }) => <RowActions row={row} refetch={tableProps.fetch} />}
/>
```

#### ActionItem Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | Action label text. |
| `action` | `() => void` | Click handler callback. |
| `iconNode` | `ReactNode` | Icon element (use Phosphor icons with `weight="bold"`). |
| `disabled` | `boolean` | Disables the menu item. |
| `className` | `string` | Custom CSS class string (e.g. `'text-danger'`). |
| `iconColor` | `string` | Visual variant color theme (e.g. `'danger'`, `'success'`). |

### 2. Inline Row Action Buttons

For simple tables with very few actions, you can render buttons directly in the row cells:

```tsx
import { CompactActionButton } from '@/table/CompactActionButton';

const RowActions = ({ row }) => (
  <div className="d-flex gap-2">
    <CompactActionButton
      action={() => handleEdit(row)}
      title={translate('Edit')}
      iconNode={<PencilSimple />}
    />
  </div>
);

<Table {...tableProps} columns={columns} rowActions={RowActions} />
```

---

## Expandable Rows

Expandable rows show extra details without navigating away.

```tsx
const ExpandableRowContent = ({ row }) => (
  <div className="p-4">
    <h5>{row.name}</h5>
    <p>Description: {row.description}</p>
  </div>
);

<Table
  {...tableProps}
  columns={columns}
  expandableRow={ExpandableRowContent}
/>
```

### Conditional Expandability (`isRowExpandable`)

By default, all rows display carets if `expandableRow` is present. Disable card expansion for specific rows using `isRowExpandable`:

```tsx
<Table
  {...tableProps}
  columns={columns}
  expandableRow={ExpandableRowContent}
  isRowExpandable={(row) => row.has_details} // Returns true or false
/>
```

---

## Bulk Selection and Actions

Tables support row selection and bulk batch actions in the toolbar.

1. Set `enableMultiSelect` to render selection checkboxes on each row.
2. Pass a component to `multiSelectActions` to render bulk operations on the selected items. It receives the selected `rows` and `refetch` callback.
3. For destructive actions, use the `RemovalActionButton` to prompt users with a confirmation panel before execution.

```tsx
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { useManagedMutation } from '@/modal/useManagedMutation';

const BulkDeleteButton = ({ rows, refetch }) => {
  const { mutate, isPending } = useManagedMutation({
    mutationFn: () => deleteMultipleItems(rows.map(r => r.uuid)),
    successMessage: translate('Selected items deleted.'),
    refetch,
    confirmation: {
      title: translate('Delete selected items'),
      body: translate('Are you sure you want to delete {count} items?', { count: rows.length }),
    }
  });

  return (
    <RemovalActionButton
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};

// Usage in Table:
<Table
  {...tableProps}
  columns={columns}
  enableMultiSelect
  multiSelectActions={BulkDeleteButton}
/>
```
