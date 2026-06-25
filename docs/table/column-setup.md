# Table Component: Column Setup & Configuration

Column behavior and display properties are configured within the `columns` array.

---

## Column Definition Properties

The following properties can be set on each column object inside the `columns` array:

| Property | Type | Description |
|----------|------|-------------|
| `title` | `ReactNode` | Column header title label. |
| `render` | `React.ComponentType<{ row }>` | Render component function for row cell output. |
| `orderField` | `string` | Makes the column sortable. Maps to django-style `?o=<orderField>` sorting queries. |
| `copyField` | `(row) => string &#124; number` | Renders a clipboard-copy button next to the cell text. |
| `ellipsis` | `boolean` | Defaults to `true` (truncates overflow). Set to `false` to wrap text. |
| `disabledClick` | `boolean` | Set to `true` to block row click/expand events when interacting with cells. |
| `width` | `string` | Set custom width (e.g. `'120px'` or `'15%'`). |
| `meta` | `ReactNode` | Node placed in the header in front of the column name (e.g. tooltips). |
| `className` | `string` | CSS class string applied to the cell `<td>` tags (e.g. `'text-end'`). |
| `headerClassName` | `string` | CSS class string applied to the column title `<th>` tags (e.g. `'text-end'`). |
| `optional` | `boolean` | Set to `true` to let users hide/toggle this column. |
| `keys` | `string[]` | API field names required for this optional column to render. |
| `filter` | `string` | Redux filter parameter name to apply cell click inline filtering. |
| `inlineFilter` | `(row) => any` | Callback to extract the filter value payload when clicking cells. |

---

## Behavior Configurations

### 1. Column Sorting (`orderField`)

Set `orderField` to make a column sortable. Clicking on the column header will alternate between ascending (`?o=field`) and descending (`?o=-field`):

```ts
columns={[
  {
    title: translate('Name'),
    render: ({ row }) => renderFieldOrDash(row.name),
    orderField: 'name', // Sorted by name
  },
]}
```

### 2. Clipboard Copying (`copyField`)

Use `copyField` to display a standard copy icon next to cell values:

```ts
{
  title: translate('SSH Key Fingerprint'),
  render: ({ row }) => renderFieldOrDash(row.fingerprint),
  copyField: (row) => row.fingerprint, // Renders a copy icon button
}
```

### 3. Click Propagation (`disabledClick`)

Set `disabledClick: true` to prevent click actions (such as row selection or row expansion) from triggering when a user clicks on buttons, inputs, or links inside column cells:

```ts
{
  title: translate('Actions'),
  render: ({ row }) => <Button onClick={() => triggerAction(row)} />,
  disabledClick: true, // Click event does not bubble up to the row <tr>
}
```

### 4. Text Truncation (`ellipsis`)

By default, columns truncate overflowing text with an ellipsis and display the full text in a browser tooltip on hover. Set `ellipsis: false` to force normal text wrapping instead:

```ts
{
  title: translate('Detailed Description'),
  render: ({ row }) => renderFieldOrDash(row.description),
  ellipsis: false, // Disables truncation, wraps text
}
```

---

## Optional Columns

You can let users customize their view by selecting which columns to show or hide.

1. Set `hasOptionalColumns` directly on the `<Table>` component.
2. Set `optional: true` on optional column definitions.
3. Pass `id` and `keys` (list of API fields required for this column) to optimize API query payloads.
4. Pass `mandatoryFields` to `useTable` options to ensure essential fields are always fetched.

```tsx
export const UsersTable = () => {
  const tableProps = useTable({
    table: 'users',
    fetchData: createFetcher(usersList),
    mandatoryFields: ['uuid', 'name'], // Always requested
  });

  return (
    <Table
      {...tableProps}
      hasOptionalColumns
      columns={[
        {
          id: 'name',
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.name),
          // Mandatory by default (no optional key)
        },
        {
          id: 'email',
          title: translate('Email'),
          render: ({ row }) => renderFieldOrDash(row.email),
          optional: true,
          keys: ['email'], // Requested only when column is enabled
        },
        {
          id: 'role',
          title: translate('Role'),
          render: ({ row }) => renderFieldOrDash(row.role),
          optional: true,
          keys: ['role', 'permissions'],
        },
      ]}
    />
  );
};
```
