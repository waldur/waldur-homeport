# Table Component: Visual Customizations

Waldur Homeport tables support standard rendering styles, layouts, and display options.

---

## Visual Styling Classes

Apply standard CSS class strings to target table wrapper elements:

| Prop/Location | Type | Description |
|---|---|---|
| `className` (Column) | `string` | Applied directly to `<td>` tags in that column (e.g. `'text-end'`). |
| `headerClassName` (Column) | `string` | Applied directly to column title `<th>` tags. |
| `headerClassName` (Table) | `string` | Applied to the Card Header toolbar wrapper. |
| `titleClassName` (Table) | `string` | Applied to the card title element. |
| `bodyClassName` (Table) | `string` | Applied to the main `Card.Body` wrapper. |

---

## Grid Mode Layout

Tables can alternate between lists and grid cards. In grid mode, data is displayed as cards in a responsive grid layout.

- **`gridItem`**: React component class used to render each grid cell card.
- **`gridSize`**: Responsive grid column sizes config object (e.g. `gridSize={{ sm: 6, md: 4 }}`).
- **`gridSpace`**: Spacing level (0 to 6) between cards, mapped to the Bootstrap row gutter class `g-{gridSpace}` (defaults to `6`).
- **`gridFixedWidth`**: Boolean. When enabled, renders grid items inside a fixed CSS Grid container (`className="grid-fixed-width"`) with a fixed card size instead of responsive columns.
- **`initialMode`**: Default display mode on load (`'table'` or `'grid'`, defaults to `'table'`).

```tsx
export const GridListItem = ({ row }) => (
  <Card>
    <CardHeader>{renderFieldOrDash(row.name)}</CardHeader>
    <CardBody>{renderFieldOrDash(row.description)}</CardBody>
  </Card>
);

export const GridList = () => {
  const tableProps = useTable({
    table: 'GridList',
    fetchData: createFetcher(itemsList),
  });

  return (
    <Table
      {...tableProps}
      gridItem={GridListItem}
      gridSize={{ sm: 6, md: 4 }}
      gridSpace={4}
      initialMode="grid"
    />
  );
};
```

### Dynamic Layout Resolution (`initialModeResolver`)

Use `initialModeResolver` to choose the default layout dynamically depending on the dataset size:

```tsx
<Table
  {...tableProps}
  gridItem={GridListItem}
  initialModeResolver={(resultCount) => (resultCount < 5 ? 'grid' : 'table')}
/>
```

---

## Headers & ActionBar Visibility

Adjust header toolbar visibility and standalone modes:

- **`hasActionBar={false}`**: Hides the card header toolbar (title, actions, search) entirely.
- **`hasHeaders={false}`**: Hides column titles (`<thead>`).
- **`hideIfEmpty={true}`**: Renders nothing (`null`) if the dataset contains no items.
- **`standalone={true}`**: Renders the table directly without the wrapping Metronic Card layout (prevents double borders/paddings when nested in tabs, drawers, or cards).

---

## Table Title & Resource Customization

- **`title`**: String or React Node overriding the table header title.
- **`hideTitle`**: Boolean to hide the title header.
- **`alterTitle`**: Auto-resolved page title calculated by `useTable` from breadcrumbs. Used as a default fallback when `title` is not provided.
- **`subtitle`**: Secondary text displayed below the title.
- **`verboseName`**: Defines the resource type name. It is automatically title-cased as a fallback for the title header and used dynamically in empty and search-miss placeholder screens (e.g., "There are no projects yet.", "No projects found matching current filters.").
- **`emptyMessage`**: React Node to completely override the text displayed when the table contains zero rows.

---

## Table-Wide Dropdown Actions

For list actions that affect the table globally, instead of using `tableActions` which renders buttons directly in the toolbar, you can group them into a 3-dots dropdown menu using the `dropdownActions` prop. Customize the size using `dropdownActionsSize` (`'sm'` or `'lg'`, default: `'lg'`):

```tsx
<Table
  {...tableProps}
  dropdownActions={
    <>
      <DropdownItem onClick={handleBulkImport}>{translate('Import from file')}</DropdownItem>
      <DropdownItem onClick={handleDeleteAll}>{translate('Clear list')}</DropdownItem>
    </>
  }
/>
```

---

## Cache & Pagination Modifiers

- **`staleTime`**: Pass inside `useTable` (in milliseconds) to configure the underlying React Query cache, preventing the table from executing API queries on remount if data has been fetched within the stale time window.
- **`initialPageSize`**: Pass directly to `<Table>` to override the default pagination page size (which defaults to 10). Use the `PAGE_SIZE_COMPACT` (5) constant from `@/table/constants` for embedded/drawer tables, or `PAGE_SIZE_FULL` (10) for primary list views.
- **`rowClass`**: Pass a callback to apply custom styling to `<tr>` elements based on row data:

  ```ts
  rowClass={({ row }) => row.status === 'erred' ? 'table-danger' : ''}
  ```

- **`equalColWidth`**: Set to `true` to give all columns without an explicit width set the exact same width. By default, the first data column is allocated double the width of the remaining columns.
- **Row & Card Hover Shadows (`hoverShadow`, `hoverable`)**:
  - `hoverShadow`: Defaults to `true`, displaying shadow elevation on cell/card hover. Can be customized with a boolean or a mode config object: `hoverShadow={{ table: true, grid: false }}`.
  - `hoverable`: Set to `true` to enable Bootstrap's `.table-hover` background coloring on row hover. Defaults to `false`.

---

## Placeholders Customization

Customize empty/error displays:

- **`placeholderComponent`**: React Node rendering a custom blank slate instead of the default icon/text.
- **`placeholderActions`**: Action buttons rendered below the placeholder.
- **`placeholderHasRetry`**: Defaults to `true` (renders a retry link on error). Set to `false` to hide the link.
