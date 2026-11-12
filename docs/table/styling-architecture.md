# Table Styling Architecture

How `@/table/Table` is drawn, and why it is built that way. Read this before
changing a table cell's padding, a row's background, a pinned column, or the
look of a table nested in something else.

The table styles itself with utilities on its own elements. A context changes
how it looks by setting a custom property on a container. No stylesheet holds
table rules.

## Where things live

| File                                                 | Owns                                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `packages/table/src/components/content/TableView.tsx`         | The `<table>`: edge spacing for a full-width card, the hover background               |
| `packages/table/src/TableHeader.tsx`                          | `<colgroup>` and the header row; picks the visible columns                            |
| `packages/table/src/TableHeaderCell.tsx`                      | A column's `<th>`: title, sort toggle, filter toggle, pin toggle                      |
| `packages/table/src/TableBody.tsx`                            | Rows: state, selection, the form-field wrapper, group headers                         |
| `packages/table/src/TableDataCell.tsx`                        | A data `<td>` / row-header `<th>`: ellipsis, copy button, inline filter, the expander |
| `packages/table/src/TableControlColumn.tsx`                   | The selection column's header and body cells                                          |
| `packages/table/src/TableActionsColumn.tsx`                   | The actions column's header and body cells                                            |
| `packages/table/src/TableExpandable.tsx`                      | The expander buttons and the expanded details row                                     |
| `packages/table/src/styles.ts`                                | Class lists shared by several of the above: pinned cells, header controls, hover      |
| `packages/design-tokens/src/css/components/card.css` | A table card nested in an expanded row                                                |

The cell files are internal to `packages/table`. Nothing outside it imports them; a
page configures the table through `Table`'s props.

## Decisions

### 1. Utilities on the element, not selectors from a stylesheet

A cell's height, padding, colour and alignment are classes on that cell. There
is no `.table td` rule behind them, and `table` is not a class.

**Why.** A stylesheet rule outside the cascade layers outranks every utility, so
a call site that wants a different padding has to answer with a longer selector
or `!important`. With the styles on the element, the cascade is the class list,
and what a cell looks like can be read where it is rendered.

### 2. A context sets a custom property; it never reaches into the table

Where a table sits changes how it looks: in a full-width card, in an expanded
row, in a proposal section. Each of those sets a property on a container, and
the table's own elements read it.

| Property                             | Read by                          | Default                                | Set by                                                                       |
| ------------------------------------ | -------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| `--table-edge-px`                    | First and last cell of a row     | 9.75px (16px for the selection column) | `TableView` when `fullWidth`; the expanded row; `PROPOSAL_FLUSH_TABLE_CLASS` |
| `--table-head-bg`                    | The header row                   | `--bg-secondary`                       | The expanded row (`--bg-tertiary`)                                           |
| `--table-head-border`                | The rule under the header row    | `--border-secondary`                   | The expanded row (`--border-divider`)                                        |
| `--table-body-bg`                    | A plain body row                 | `--bg-primary`                         | The expanded row (`--bg-secondary`)                                          |
| `--table-row-bg`                     | The row itself, its pinned cells | set on every row                       | The row, from its state (decision 3)                                         |
| `--pagination-px`, `--pagination-pt` | waldur-ui `TablePagination`      | 16.25px (0 below `md`), 12px           | `BaseTable` for grid and full-width; the expanded row                        |
| `--card-surface-bg`                  | waldur-ui `Card`                 | `--bg-primary`                         | `card.css`, for a table card in an expanded row                              |

**Why.** A selector written from outside has to restate the table's structure
(`[&_[data-slot=card]_td:first-child]:…`) and breaks when that structure
changes. A property crosses any depth without knowing the structure, and a
nested table reads the nearest value.

**How to apply.** To make a table look different in a new place, set one of
these on the container (`className="[--table-edge-px:16.25px]"`). If none fits,
add a property the table reads, with the current value as its fallback. Do not
write a selector that names the table's cells from outside `packages/table`.

`--card-surface-bg` is registered with `@property … inherits: false`, like the
other card hooks, so a value set on one card never reaches a card nested in it.
The `--table-*` properties do inherit: that is how a nested table picks up the
expanded row's values.

### 3. A row has one background, and exactly one class sets it

Every row sets `--table-row-bg` and paints `bg-[var(--table-row-bg)]`. `TableRow`
chooses the single class that sets the property:

1. expanded or selected → `--bg-secondary`
2. else a `rowVariant` → the status background (`ROW_VARIANT_BG_VARS`)
3. else → `var(--table-body-bg, var(--bg-primary))`

The hover background is set from the `<table>`
(`[&_tbody>tr[data-slot=table-row]:not([data-state]):hover]`), which is more
specific than the row's class, and skips expanded and selected rows.

**Why one property.** A pinned cell is `position: sticky` and must cover what
scrolls under it, so it needs the row's colour as its own background. So does
the inline-filter chip's surround. A pinned cell paints
`bg-[var(--table-row-bg)]` and follows the row in every state and both themes.

**Why exactly one class.** Two classes that set the same property have the same
specificity, so the one emitted later in the stylesheet wins, and Tailwind's
order is not the order in `className`. A row carrying both the default and an
override shows whichever the build happens to emit last. Never add a second
`[--table-row-bg:…]` class to a row; extend the choice in `TableRow`.

For the same reason a row does not also carry `bg-danger-subtle`:
`ROW_VARIANT_CLASSES` is for elements outside `@/table`.

### 4. State is `data-state` on the row, ARIA on the control

| Marks                           | Attribute                                  |
| ------------------------------- | ------------------------------------------ |
| A row is expanded               | `data-state="expanded"` on the `<tr>`      |
| A row is selected (field table) | `data-state="selected"` on the `<tr>`      |
| The expander is open            | `aria-expanded` on the expander `<button>` |
| A column is pinned              | `aria-pressed` on the pin toggle           |
| A column filter is open         | `aria-expanded` on the filter toggle       |
| A column is sorted              | `aria-sort` on the `<th>`                  |

**Why.** `aria-expanded` is not allowed on a row outside a treegrid: axe reports
`aria-conditional-attr`, which fails the integration suite's accessibility
scan. The button already says it. The row's state is a styling hook, which is
what `data-state` is for
([class-names-and-data-attributes.md](../class-names-and-data-attributes.md)).

Carets rotate from their own button (`group/expander` with
`group-aria-expanded/expander:rotate-180`), not from any expanded ancestor.

### 5. Parts are found by `data-slot`, tests by `data-testid`

| Part                           | Hook                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| The scroll container           | `[data-slot="table-responsive"]`                                                       |
| A data row                     | `[data-slot="table-row"]`                                                              |
| A group header row             | `[data-slot="table-group-header"]`                                                     |
| The expanded details           | `[data-slot="expanded-row-content"]`                                                   |
| A selection cell               | `[data-slot="row-control"]`                                                            |
| The actions cells              | `[data-slot="row-actions"]`, `[data-slot="header-actions"]`                            |
| A cell's text beside its tools | `[data-slot="cell-data"]`                                                              |
| The pager                      | `[data-slot="table-pagination"]`                                                       |
| The tabs header of the card    | `[data-table-tabs]`                                                                    |
| Controls, in tests             | `data-testid="inline-filter"`, `"sort-toggle"`, `"row-expander"`, `"pin-toggle-<key>"` |

**Why.** A class that only marks an element styles nothing and reads like one
that does. A selector that names a part by a class which no longer exists
matches nothing and fails silently, so when a part is renamed, search for its
name in `src/**/*.scss`, arbitrary variants (`[&_…]:`) and `e2e*/`.

### 6. Lengths are pixels

Cell padding, the edge spacing and the hover shadow are px (`9.75px`,
`16.25px`).

**Why.** The root font size is 13px, and 12px below `md`, so a rem length
changes with the viewport. The repo pins lengths to px
(`waldur-custom/no-rem-length`; see "Root font size" in
[design-tokens.md](../design-tokens.md)).

### 7. The hovered row is raised

`hoverShadow` draws a shadow around the hovered row. Rows paint their own
background (decision 3), which would cover a neighbour's shadow, so the hovered
row also gets `z-[1]` (`TABLE_HOVER_SHADOW_CLASS`).

### 8. Truncation is per cell

A cell with `ellipsis` (the default) clips to one line at 300px and shows the
full text as a native tooltip when it is cut. This includes the first column of
an expandable table, whose text sits in a wrapper beside the expander.

## What must stay true

These are easy to break, and only the checks below will say so.

- A row carries one `[--table-row-bg:…]` class.
- A pinned cell paints `bg-[var(--table-row-bg)]`, never a fixed colour.
- No selector outside `packages/table` and `card.css` names a table cell.
- Each cell kind repeats the cell box (`h-[44px] py-0 align-middle`) and the
  edge rule (`first:ps-[var(--table-edge-px,9.75px)]`). Change them together: a
  cell kind with a different fallback sits a few pixels off the others.

## How it is checked

| Check                                                                            | Catches                                                                                        |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `packages/table/src/Table.rowStates.stories.tsx` (play functions)                         | Tinted, selected and expanded backgrounds; a pinned cell's tint; the full-width expanded inset |
| `src/proposals/flushTable.stories.tsx` (play functions)                          | `PROPOSAL_FLUSH_TABLE_CLASS`: stripped insets, cell edge spacing, the closing rule             |
| `src/core/CardContext.stories.tsx`                                               | The `--card-*` hooks, including a card in an expanded row                                      |
| `packages/table/src/TableBody.test.tsx`, `components/content/*.test.tsx`                  | Markup, state attributes, the hover class                                                      |
| Storybook comparison with `--styles` ([visual-testing.md](../visual-testing.md)) | A computed style that changed without moving enough pixels to show                             |
| Integration suite: accessibility scan, `docs/screenshots/`                       | ARIA misuse on real pages; hover and layout with real data                                     |

The play functions assert computed values because a pixel comparison cannot see
these states: `--bg-secondary` and `--bg-primary` differ by less than its
threshold. For any change here, run the Storybook comparison with `--styles` and
at `--widths 375,768` as well as the default width: a difference can show only
below `md` or only in the computed styles.
