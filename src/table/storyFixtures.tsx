import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';

import { BadgeVariant } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { AlertItem } from '@/core/AlertItem';
import { BaseButton } from '@/core/buttons/BaseButton';
import { ModelCard1 } from '@/core/ModelCard1';
import { Field } from '@/resource/summary';

import { CompactActionButton } from './CompactActionButton';
import { ExpandableContainer } from './ExpandableContainer';
import { BooleanFilter, SelectFilter, StringFilter } from './filters';
import { RemovalActionButton } from './RemovalActionButton';
import { tableStoryNoopHandlers } from './storyProviders';
import Table from './Table';
import { TableSidebarFilterValues } from './TableFilterItem';
import { TableFiltersGroup } from './TableFilterService';
import { Column, FilterItem } from './types';

export interface TableStoryRow {
  uuid: string;
  name: string;
  status: 'OK' | 'Erred' | 'Creating';
  owner: string;
  created: string;
  region: string;
  plan: string;
  monthlyCost: string;
  tags: string;
}

/**
 * Fixed ids/dates/owners — no relative time (`3 days ago`), no random
 * values. Every story built from this must render byte-identical output on
 * every run, since these fixtures are the deterministic baseline the
 * upcoming Playwright `toHaveScreenshot()` golden-master captures depend on
 * (see docs/tailwind-shadcn-migration-notes.md and the Table.stories.tsx
 * file comment).
 */
export const tableStoryRows: TableStoryRow[] = [
  {
    uuid: 'a1f4b6c2-11e1-4b8a-9c3d-2f6e7a9b0c11',
    name: 'production-cluster',
    status: 'OK',
    owner: 'Alice Grown',
    created: '2024-01-15',
    region: 'eu-north-1',
    plan: 'Enterprise',
    monthlyCost: '$410.00',
    tags: 'production, critical',
  },
  {
    uuid: 'b2a5c7d3-22f2-4c9b-8d4e-3a7f8b0c1d22',
    name: 'staging-cluster',
    status: 'Creating',
    owner: 'Dereck Benon',
    created: '2024-02-03',
    region: 'us-east-1',
    plan: 'Standard',
    monthlyCost: '$180.00',
    tags: 'staging',
  },
  {
    uuid: 'c3b6d8e4-33a3-4dac-9e5f-4b8a9c1d2e33',
    name: 'analytics-pipeline',
    status: 'Erred',
    owner: 'Alice Grown',
    created: '2024-02-20',
    region: 'eu-west-2',
    plan: 'Premium',
    monthlyCost: '$240.00',
    tags: 'analytics',
  },
  {
    uuid: 'd4c7e9f5-44b4-4ebd-af6a-5c9bad2e3f44',
    name: 'backup-storage',
    status: 'OK',
    owner: 'Marta Novak',
    created: '2024-03-01',
    region: 'ap-south-1',
    plan: 'Standard',
    monthlyCost: '$95.00',
    tags: 'backup, critical',
  },
];

const STATUS_VARIANT: Record<TableStoryRow['status'], BadgeVariant> = {
  OK: 'success',
  Erred: 'danger',
  Creating: 'warning',
};

/**
 * Grid-mode card, built from the same primitives real `gridItem` renderers
 * use (`ModelCard1` + `Field` — see `ProjectCard.tsx`/`OrganizationCard.tsx`
 * for the production shape this mirrors), rather than an ad hoc `<div>`.
 * Skips `ProjectCard`'s `onClick`/router navigation and user/feature
 * checks — those need `@uirouter/react` and workspace context this story
 * deliberately doesn't pull in (see Table.stories.tsx's file comment).
 */
export const TableStoryGridItem = ({ row }: { row: TableStoryRow }) => (
  <ModelCard1
    title={row.name}
    body={
      <div className="fs-6">
        <Field
          label="Status"
          value={
            <Badge variant={STATUS_VARIANT[row.status]} tone="light">
              {row.status}
            </Badge>
          }
          space={2}
          labelCol={6}
          valueCol={6}
        />
        <Field
          label="Owner"
          value={row.owner}
          space={2}
          labelCol={6}
          valueCol={6}
        />
        <Field
          label="Created"
          value={row.created}
          space={2}
          labelCol={6}
          valueCol={6}
        />
      </div>
    }
    footer={
      <div className="d-flex justify-content-end">
        <BaseButton label="Details" variant="text-primary" size="sm" />
      </div>
    }
  />
);

const ALERT_VARIANT: Record<
  TableStoryRow['status'],
  'info' | 'warning' | 'error'
> = {
  OK: 'info',
  Erred: 'error',
  Creating: 'warning',
};

/**
 * The other real `gridItem` shape besides `ModelCard1` — `AlertItem`, used
 * by `PendingActionAlertItem.tsx` for the dashboard's full-width, no-gutter
 * grid (`gridSize={{ xs: 12 }} gridSpace={0}`, see `UserPendingActionsList`
 * — the `GridModeCompact` story below). Simplified from that real
 * component: no `ActionsDropdown`/`usePendingActionActions`, just a plain
 * button, since those pull in the same router/action-menu machinery this
 * file otherwise avoids (see Table.stories.tsx's file comment).
 */
export const TableStoryCompactGridItem = ({ row }: { row: TableStoryRow }) => (
  <AlertItem
    variant={ALERT_VARIANT[row.status]}
    title={row.name}
    titleAfter={
      <Badge variant="secondary" size="sm">
        {row.plan}
      </Badge>
    }
    body={
      <div className="text-muted small">
        {row.region} · {row.monthlyCost}/mo
      </div>
    }
    actions={<BaseButton label="Review" variant="tertiary" size="sm" />}
  />
);

/**
 * The `filters` prop content for the `Filterable`/`WithActiveFilters`
 * stories — the standard `withTableFilter`-wrapped field components (see
 * CLAUDE.md's filter-field convention), same as any production filter list
 * (e.g. `UserAffiliationsFilter.tsx`). These need only `TableFilterContext`
 * (always supplied by `Table.tsx`'s `FilterContextProvider`) and Redux
 * (`withTableProviders`) — no form wrapper, since `withTableFilter`
 * constructs `input`/`meta` itself rather than going through
 * react-final-form.
 */
export const tableStoryFilters = (
  <>
    <StringFilter
      title="Name"
      name="name"
      getValueLabel={(value) => value}
      placeholder="Search by name"
    />
    <BooleanFilter title="Active only" name="active" label="Active only" />
  </>
);

/**
 * A `SelectFilter` example — a fixed-options dropdown (as opposed to
 * `AsyncSelectFilter`'s API-backed one), matching the shape real code uses
 * (see `UserAffiliationsFilter.tsx`'s "Role status" filter). Kept separate
 * from `tableStoryFilters` rather than folded in, so the `TableFiltersMenu`/
 * `TableFilterContainer` stories built on the smaller set don't pick up a
 * third field they're not demonstrating.
 */
export const tableStoryFiltersWithSelect = (
  <SelectFilter
    title="Status"
    name="status"
    options={[
      { label: 'OK', value: 'OK' },
      { label: 'Erred', value: 'Erred' },
      { label: 'Creating', value: 'Creating' },
    ]}
  />
);

/**
 * `multiSelectActions` example, matching `docs/table/row-actions.md`'s own
 * `BulkDeleteButton` reference implementation almost verbatim: a bare
 * `RemovalActionButton` as the entire bulk-action component, not nested in
 * a dropdown. Simplified from the doc's version by dropping
 * `useManagedMutation`/a confirmation dialog — both pull in the same
 * modal/mutation machinery this file otherwise avoids (see
 * Table.stories.tsx's file comment).
 */
export const TableStoryBulkDeleteButton = ({
  rows,
}: {
  rows: TableStoryRow[];
}) => (
  <RemovalActionButton
    title={`Delete (${rows.length})`}
    action={() => undefined}
  />
);

/**
 * The documented alternative to `ActionsDropdown` for a very short action
 * list — `CompactActionButton`s rendered directly in the row, not grouped
 * behind a 3-dots menu (`docs/table/row-actions.md`'s "Inline Row Action
 * Buttons" section). No current production call site actually uses this
 * for `rowActions` specifically (`AdminCategoriesPage.tsx`'s own
 * `CompactActionButton` is a toolbar refresh button, not a row action), but
 * it's a real, documented, working code path, not a hypothetical one.
 */
export const TableStoryInlineRowActions = () => (
  <div className="d-flex gap-2">
    <CompactActionButton
      action={() => undefined}
      title="Edit"
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
    <CompactActionButton
      action={() => undefined}
      title="Delete"
      iconNode={<TrashIcon weight="bold" />}
    />
  </div>
);

/**
 * A pre-applied "Name" filter chip, for the `WithActiveFilters` story.
 * `component` mirrors what `TableFilterItem.tsx`'s own `_setFilter` builds
 * on a real apply (`TableSidebarFilterValues`, the same chip-plus-remove-
 * button renderer) — hand-built here since this story seeds
 * `filtersStorage` directly rather than driving the real apply flow through
 * Redux.
 */
export const tableStoryActiveFilters: FilterItem[] = [
  {
    name: 'name',
    label: 'Name',
    value: 'production',
    component: () => (
      <TableSidebarFilterValues
        value="production"
        getValueLabel={(value) => value}
        remove={() => undefined}
      />
    ),
  },
];

/**
 * Two previously-saved filter groups — shared by `TableFiltersMenu.stories.tsx`
 * and `TableFilterContainer.stories.tsx` (the "menu"/popover and "sidebar"/
 * mobile-drawer filter surfaces both read the same `savedFilters` Redux
 * state via `SavedFilterSelect`).
 */
export const tableStorySavedFilters: TableFiltersGroup[] = [
  {
    id: 'story-saved-filter-1',
    title: 'Erred clusters',
    date: '2024-02-20T10:00:00.000Z',
    values: { name: '', active: true },
  },
  {
    id: 'story-saved-filter-2',
    title: 'My production view',
    date: '2024-01-15T10:00:00.000Z',
    values: { name: 'production' },
  },
];

export const tableStoryColumns: Column<TableStoryRow>[] = [
  {
    id: 'name',
    title: 'Name',
    render: ({ row }) => (
      <span className="fw-semibold text-dark">{row.name}</span>
    ),
  },
  {
    id: 'status',
    title: 'Status',
    render: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.status]} tone="light">
        {row.status}
      </Badge>
    ),
  },
  {
    id: 'owner',
    title: 'Owner',
    render: ({ row }) => <>{row.owner}</>,
  },
  {
    id: 'created',
    title: 'Created',
    render: ({ row }) => <>{row.created}</>,
  },
];

const baseNoop = () => undefined;

/**
 * Fields every `<Table>` story across `Table.*.stories.tsx` needs, defaulted
 * to the shape most of them share (4 populated rows, one of 3 pages) — a
 * story only needs to spread this and override what it's actually
 * demonstrating. Shared across files (rather than each file redefining its
 * own copy) so the grouping split (Table.stories.tsx / Table.rows.stories.tsx
 * / Table.expandableRow.stories.tsx / Table.gridMode.stories.tsx /
 * Table.filtersAndLayout.stories.tsx) doesn't reintroduce the duplication
 * the single-file version was refactored to avoid.
 *
 * Deliberately not typed as `Partial<TableProps>` — that would mark `fetch`
 * (required on `TableProps`) as optional on this object's own type, which
 * then infects every spread wherever this is used, even though a value is
 * always provided here. Left to inference instead, so `fetch` stays a
 * required, non-optional field.
 */
export const tableStoryBaseProps = {
  ...tableStoryNoopHandlers,
  table: 'story-table',
  columns: tableStoryColumns,
  fetch: baseNoop,
  verboseName: 'clusters',
  rows: tableStoryRows,
  loading: false,
  pagination: { pageSize: 4, resultCount: 4, currentPage: 1 },
};

/**
 * `tableStoryColumns` plus enough extra, explicitly-widened columns that
 * the row overflows any realistic canvas width — for the `PinnedColumn`
 * story only. Pinning is inert without a horizontal scrollbar to pin
 * against (the point being demonstrated: the `name` column stays put while
 * the rest scrolls underneath it), and the base 4-column fixture is narrow
 * enough to fit most viewports unscrolled.
 */
export const tableStoryWideColumns: Column<TableStoryRow>[] = [
  { ...tableStoryColumns[0], width: '200px' },
  { ...tableStoryColumns[1], width: '140px' },
  { ...tableStoryColumns[2], width: '160px' },
  { ...tableStoryColumns[3], width: '140px' },
  {
    id: 'region',
    title: 'Region',
    width: '140px',
    render: ({ row }) => <>{row.region}</>,
  },
  {
    id: 'plan',
    title: 'Plan',
    width: '140px',
    render: ({ row }) => <>{row.plan}</>,
  },
  {
    id: 'monthlyCost',
    title: 'Monthly cost',
    width: '160px',
    render: ({ row }) => <>{row.monthlyCost}</>,
  },
  {
    id: 'tags',
    title: 'Tags',
    width: '220px',
    render: ({ row }) => <>{row.tags}</>,
  },
];

const noop = () => undefined;

/**
 * Expanded-row detail content, built from `Field` the same way real
 * `expandableRow` renderers are (see `CreditExpandableRow.tsx`). `asTable`
 * switches `ExpandableContainer`'s CSS between its default flow layout and
 * the `.as-table` field-grid layout (`ExpandableContainer.scss`) — same
 * content, different container, so the two story variants share this one
 * renderer rather than duplicating the fields.
 */
export const TableStoryExpandableRow = ({
  row,
  asTable,
  hasMultiSelect,
}: {
  row: TableStoryRow;
  asTable?: boolean;
  hasMultiSelect?: boolean;
}) => (
  <ExpandableContainer asTable={asTable} hasMultiSelect={hasMultiSelect}>
    <Field label="Region" value={row.region} />
    <Field label="Plan" value={row.plan} />
    <Field label="Monthly cost" value={row.monthlyCost} />
    <Field label="Tags" value={row.tags} />
  </ExpandableContainer>
);

/**
 * A nested table inside the expanded row — the `.card-table` CSS branch in
 * `ExpandableContainer.scss` (distinct thead/tbody background tokens,
 * pinned-column background overrides). Mirrors `RoleUsersExpandableRow.tsx`
 * (CLAUDE.md's canonical nested-table reference): a real `<Table>`,
 * `hideTitle`/`hasActionBar={false}` to drop the chrome the parent already
 * provides, driven by plain props rather than `useTable()` for the same
 * reason every other story here is (see Table.stories.tsx's file comment).
 */
export const TableStoryNestedExpandableRow = () => (
  <ExpandableContainer>
    <Table
      {...tableStoryNoopHandlers}
      table="story-table-nested"
      columns={tableStoryColumns.slice(0, 2)}
      rows={tableStoryRows}
      fetch={noop}
      loading={false}
      pagination={{ pageSize: 4, resultCount: 4, currentPage: 1 }}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  </ExpandableContainer>
);
