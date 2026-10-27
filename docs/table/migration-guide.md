# Migrating Hand-Rolled Tables

How to move a react-bootstrap `<Table>` or raw `<table>` off Bootstrap's table
classes, and how to pick what it becomes. Tracked in #563 (part of epic #442);
the end goal is #502: deleting the Bootstrap/Metronic `.table-*` rules and the
`bootstrap/scss/tables` import.

Not every table should become `@/table/Table`. That goal only needs "no
Bootstrap table classes", and a short read-only list gains nothing from a fetch
cycle, a Redux table store and five props to switch its chrome off. Pick the
target by what the table **is**, not by the fact that it is a `<table>`.

---

## Decision tree

```text
Is it a list of records (one row per item, same columns)?
├─ No — label/value pairs about one thing ............ 1. Label/value block
├─ No — a grid of form inputs ........................ 2. Form grid
└─ Yes
   ├─ Does ANY of these hold?
   │    • the rows come from a paginated list endpoint (it takes page /
   │      page_size), so the server has to page them
   │    • users need to search, sort or filter the rows
   │    • it needs selection, expandable rows or a menu of row actions
   │    • it needs export, or an empty state with a call to action (NoResult)
   │  └─ Yes ............................................. 3. @/table/Table
   └─ No: every row is already in memory and is only read
      (dialog summary, preview, reference list, review step, docs table)
                                                       ... 4. SimpleTable
```

**Row count alone is not a reason to use `Table`.** If the rows are already
in memory (one detail or aggregate response, a form value, static data),
paging them in the browser adds clicks and a fetch cycle but saves nothing:
render them with `SimpleTable`, and if the list can be long, cap its height
with a scroll container. Page in the browser
(`createClientPaginatedFetcher`) only when a list in memory runs to hundreds
of rows _and_ needs `Table`'s other features.

Conversely, a list read with a hook that calls a **paginated** endpoint
without `page`/`page_size` silently shows only the backend's first page.
That is the clearest case for `Table` with `createFetcher`: the server pages,
and the table shows every page.

A single button that is the purpose of each row (Link, Select, Retry) is a
column, not a row action, and can stay in `SimpleTable`. Use `Table`'s 3-dots
menu when a row has several actions or ones that are secondary to reading it.

`SimpleTable` takes the same `Column<T>` definitions as `Table`, so moving a
list from 4 to 3 later is a component swap plus `useTable`, not a rewrite.

---

## 1. Label/value block

A details panel, an expandable-row summary or a "Connection" card: each row is
one label and one value about a single object. This is not tabular data.

There are exactly two ways to write one; do not hand-roll a third (a `<dl>`
grid, a local `DetailRow` / `InfoRow`, a borderless `<table>`). Choose by what
the rows do, not by where the block sits:

```text
Can the user act on a row (an edit button, an inline control, an action)?
├─ Yes .................................................... FormTable
└─ No: read-only
   ├─ Must every property show, even when it has no value
   │  (a settings or configuration overview, where "not set" is information)?
   │  └─ Yes ............................................... FormTable
   └─ No: a summary that leaves out what is empty ......... Field
      (always Field in an expandable row, inside ExpandableContainer asTable)
```

|                  | `FormTable` + `FormTable.Item`                                                               | `Field` (+ `ExpandableContainer asTable`)                             |
| :--------------- | :------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| For              | Editable details and settings panels; read-only configuration overviews                      | Read-only summaries: expanded rows, detail dialogs, preview cards     |
| Empty value      | Row stays; pass `renderFieldOrDash(value)` so it reads as a dash                             | Row is left out; pass the raw value                                   |
| Row actions      | `actions` column; `*EditField` adds the edit button                                          | None                                                                  |
| Controls in rows | Label is a `<label>` pointing at the row's control; `required`, `description`, `warnTooltip` | Not for controls                                                      |
| Extras           | `FormTable.Card` (title, refresh, toolbar), grouped rows, `detailsMode`                      | `hasCopy`, help `tooltip`, colon and long-label tooltip added for you |
| In the app today | 118 files; 67 with edit or row actions; one in an expandable row                             | 128 files; 52 in expandable rows                                      |

When a block is half and half (read-only rows plus one editable row), it is
`FormTable`: a single panel should not mix both components.

**`FormTable`**, a page's settings panel with every property shown:

```tsx
import FormTable from '@/form/FormTable';

<FormTable>
  <FormTable.Item
    label={translate('Partner Name')}
    value={renderFieldOrDash(settings.partner_name)}
  />
  <FormTable.Item
    label={translate('Sync Enabled')}
    value={settings.sync_enabled ? translate('Yes') : translate('No')}
  />
</FormTable>;
```

With editable rows, use the `*EditField` exports inside an
`EditFieldProvider` instead of `FormTable.Item` (`docs/forms.md` → Edit Field
Architecture). References: `src/administration/arrow/settings/ArrowSettingsCard.tsx`
(read-only overview), `src/customer/details/CustomerDetailsPanel.tsx`
(editable).

**`Field`**, a read-only summary; in an expandable row, wrapped so labels and
values line up in columns:

```tsx
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

const RecordDetail = ({ row }) => (
  <ExpandableContainer asTable>
    <Field label={translate('Resource')} value={row.resource_name} />
    <Field label={translate('Created')} value={formatDateTime(row.created)} />
    <Field
      label={translate('Final (Sell)')}
      value={row.final_sell ? defaultCurrency(row.final_sell) : null}
      valueClass="font-medium"
    />
  </ExpandableContainer>
);
```

In a dialog or card, list the `Field`s directly. References:
`ConsumptionRecordDetail` in
`src/administration/arrow/consumption/ConsumptionRecordsList.tsx` (expandable
row), the header of
`src/administration/arrow/mappings/CustomerBillingSummaryDialog.tsx` (dialog).

What `Field` does for you, so callers do not repeat it:

- **Empty values:** a row whose value is `undefined`, `null`, `''` or `false`
  is left out. Pass the raw value; do not add `renderFieldOrDash` or a dash
  fallback. `0` is a value and is shown, so pass counts as numbers rather than
  wrapping them in `String(...)`. The one exception is a property whose
  absence is itself information (a final amount not confirmed yet): pass
  `DASH_ESCAPE_CODE` for it, with a comment, so the row stays.
- **Labels:** a string label gets its colon, and a long one a tooltip; do not
  add `:` to the translation.
- **Extras:** `hasCopy` for a copy button, `tooltip` for a help icon,
  `valueClass` / `labelClass` for emphasis or a fixed label width.

`FormTable` itself is still built on react-bootstrap's `Table` and is used in
over a hundred places; rebuilding it on waldur-ui is one change that clears all
of them, so do not migrate its call sites one by one.

## 2. Form grid

One row per item with inputs in the cells: a price editor, quota limits, a
mapping step in a wizard. `@/table/Table` fights this shape: it pages rows
(hiding ones that are being edited or carry a validation error), reserves a
min-height and sizes columns for a page of data.

Build it from waldur-ui's primitives and add the file to the rule's
`ALLOWED_FILES` in
`packages/eslint-plugin-waldur/rules/no-hand-rolled-table.js` with a one-line
reason, as `PricesTable.tsx` already is:

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>{translate('Component')}</TableHead>
      <TableHead>{translate('Limit')}</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {components.map((component) => (
      <TableRow key={component.type}>
        <TableCell>{component.name}</TableCell>
        <TableCell>
          <Field name={`limits.${component.type}`} component={NumberField} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>;
```

Do not reach for the primitives for anything else: they are hand-rolling with
nicer parts, and the lint rule does not see them yet.

## 3. `@/table/Table`

A list that needs the server to page it, or needs search, sorting, filters,
selection, expandable rows or a menu of row actions. Follow the other table
guides; the parts specific to migrating:

- **Server data:** `createFetcher(sdkFunction)` with a memoized `filter`, as
  in [fetching.md](./fetching.md). This replaces a `useQuery` hook that read
  the list endpoint itself; drop the hook if nothing else uses it.

  ```tsx
  const filter = useMemo(
    () => ({ resource_uuid: resource.uuid }),
    [resource.uuid],
  );
  const tableProps = useTable({
    table: `arrow-consumption-history-${resource.uuid}`,
    fetchData: createFetcher(adminArrowConsumptionRecordsList),
    filter,
  });
  ```

  Reference:
  `src/administration/arrow/resources/ViewConsumptionHistoryDialog.tsx`.

- **Rows already in memory that still need `Table`** (hundreds of rows with
  search or sorting): `createClientPaginatedFetcher(rows)`. The fetcher closes
  over the rows and `useTable` does not key its query on them, so refetch when
  they change, or the table keeps its first (often empty) result:

  ```tsx
  const tableProps = useTable({
    table: `my-local-list-${scopeUuid}`,
    fetchData: createClientPaginatedFetcher(rows),
  });
  useEffect(() => {
    tableProps.fetch();
  }, [rows]);
  ```

- **The `table` id is global.** A table rendered once per row, per dialog or per
  scope needs the scope's uuid in its id (`arrow-consumption-lines-${uuid}`), or
  two copies share one store entry.
- **Nested in a dialog, tab or expandable row:** drop the chrome the parent
  already provides:

  ```tsx
  <Table
    {...tableProps}
    columns={columns}
    verboseName={translate('billing lines')}
    hideTitle
    hasActionBar={false}
    placeholderHasRetry={false}
    minHeight="auto"
  />
  ```

- **Several or secondary buttons in a row** become row actions
  (`ActionsDropdown` + `ActionItem`, see [row-actions.md](./row-actions.md)).
- **Tests** that render the list need a table store:

  ```tsx
  import { Provider } from 'react-redux';

  import { createTablesStore } from '@/table/store';

  renderWithProviders(
    <Provider store={createTablesStore()}>
      <DrawerProvider>
        <MyList />
      </DrawerProvider>
    </Provider>,
  );
  ```

  Rows arrive asynchronously: use `findBy*`, not `getBy*`.

## 4. `SimpleTable`

A list already in memory, with the main table's look and none of its
fetching, paging, sorting or filters. No store, no id, no fetch cycle, and new
rows show on the next render with no refetch; tests render it without
providers.

```tsx
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

const columns: Column<ExportType>[] = [
  { title: translate('Export type'), render: ({ row }) => <>{row.name}</> },
  {
    title: translate('Fields'),
    render: ({ row }) => <>{row.required_fields_found}</>,
    className: 'text-end',
    headerClassName: 'text-end',
  },
];

<SimpleTable columns={columns} rows={exportTypes} rowKey="reference" />;
```

It renders only the header when `rows` is empty, so keep the caller's own empty
message (`rows.length === 0 ? <p>…</p> : <SimpleTable … />`). It has no footer
row: put a total in the surrounding card header or below the table.

- **A list that can be long** keeps every row and caps its height instead of
  paging (the header scrolls with the rows):

  ```tsx
  <div className="max-h-[300px] overflow-y-auto">
    <SimpleTable columns={columns} rows={licenses} />
  </div>
  ```

- **A button that is the point of the row** is a column:

  ```tsx
  {
    title: translate('Action'),
    headerClassName: 'text-end',
    className: 'text-end',
    render: ({ row }) => (
      <BaseButton label={translate('Link')} onClick={() => link(row)} />
    ),
  }
  ```

References: `src/administration/arrow/mappings/SuggestedMatches.tsx`
(button column), `src/administration/arrow/mappings/ArrowLicensesList.tsx`
(capped height).

---

## Behaviour changes to call out

Migrating is not a pure restyle. List each of these in the MR when it happens:

| Change                                                                 | Why it matters                                                     |
| :--------------------------------------------------------------------- | :----------------------------------------------------------------- |
| A capped list (`slice(0, 10)` + "Showing 10 of N") now shows every row | Cap the height with a scroll container if it can be long           |
| A list read from a paginated endpoint now pages on the server          | It showed only the first page before; now it shows every row       |
| A `<tfoot>` total is dropped                                           | `Table` and `SimpleTable` have no footer row; show the total above |
| A row button moves into the 3-dots menu                                | One more click; tests that clicked the button must open the menu   |
| A form grid gains a pager                                              | Rows being edited can be paged out of view; use a form grid (2)    |
| An empty table now shows `NoResult`                                    | Check the caller does not also render its own empty message        |

---

## Working a batch

One MR per area (Arrow, Matrix, marketplace policies, proposals, reporting,
OpenStack), as #563 proposes.

1. **Inventory the area.** The issue's grep misses react-bootstrap's `Table`, so
   search for both:

   ```bash
   grep -rlE "<table|from 'react-bootstrap'" src/<area> --include=*.tsx | xargs grep -lE "<table|\bTable\b"
   ```

2. **Classify every site** with the decision tree and write the table into the
   MR description: file, shape, target (1–4), behaviour changes.
3. **Migrate.** Keep translations, cell content and badges as they are; change
   the container, not the content.
4. **Verify:** `yarn tsgo --noEmit`, `yarn lint:check`, targeted `vitest` for
   the area, and before/after screenshots of each dialog or page touched.
5. **Confirm the area is clean:** no `<table`, react-bootstrap `Table` or
   `table-*` class left in it outside files on the rule's allowed list.

---

## Framework work before the remaining batches

These remove the workarounds above; each one is cheaper to do once than to
repeat across the remaining batches.

- **In-memory rows in `useTable`:** accept the rows directly and refetch when
  they change, so the `useEffect` refetch and the hand-scoped id go away.
- **An embedded preset** for `Table`: one prop in place of `hideTitle`,
  `hasActionBar={false}`, `placeholderHasRetry={false}` and `minHeight="auto"`.
- **`SimpleTable`:** an empty message and an optional footer row for totals.
- **`FormTable` rebuilt on waldur-ui**, and `Field` moved off react-bootstrap's
  `Row`/`Col` into the table module next to `SimpleTable`, since it is the
  app's general property list rather than a resource-summary part.
- **The hand-rolled property lists outside Arrow** moved to `Field`: local
  `ClusterInfoRow` (`RabbitMQClusterOverview.tsx`) and `DetailRow`
  (`InvitationDetailsCard.tsx`), and the `<dl>` blocks in
  `TicketDraftCard.tsx`, `RuleTestMatchDialog.tsx`,
  `MergeCheckDetailsDialog.tsx` and `ResourceLimitDetails.tsx`.
- **`no-hand-rolled-table`:** also flag waldur-ui's `Table` primitives outside
  the allowed files, and promote the rule to `error` one directory at a time as
  each batch lands, so a finished area cannot regress.
- **A `renderWithProviders` option** that supplies the table store.
