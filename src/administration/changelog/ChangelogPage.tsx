import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo, useState } from 'react';
import {
  ChangelogEntriesRetrieveData,
  changelogEntriesRetrieve,
  changelogReleasesRetrieve,
  ChangelogReleaseSummary,
} from 'waldur-js-client';

import { Badge, Tooltip } from 'waldur-ui';

import { ENTRY_TYPE_CONFIG, RISK_CONFIG } from '@/changelog/constants';
import { ChangelogEntry } from '@/changelog/types';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import {
  ChangelogEntriesFilter,
  ChangelogEntriesFilterFormId,
  ChangelogEntryListCategoryOptions,
  ChangelogEntryListRiskOptions,
  ChangelogEntryListTypeOptions,
  selectChangelogEntriesFilter,
} from '@/table/generated/ChangelogEntriesFilter';
import Table from '@/table/Table';
import { Fetcher } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { ChangelogExpandableRow } from './ChangelogExpandableRow';
import { ChangelogToolbar } from './ChangelogToolbar';
import { PENDING_VIEW, ReleasePicker } from './ReleasePicker';

const TypeCell = ({ row }: { row: ChangelogEntry }) => {
  const config = ENTRY_TYPE_CONFIG[row.type];
  return (
    <StateIndicator
      variant={config?.variant || 'neutral'}
      label={config?.label() || row.type}
      shape="pill"
      tone="outline"
    />
  );
};

const RiskCell = ({ row }: { row: ChangelogEntry }) => {
  const config = RISK_CONFIG[row.impact?.risk];
  if (!config || row.impact?.risk === 'none') return <span>—</span>;
  return (
    <StateIndicator
      variant={config.variant}
      label={config.label()}
      shape="pill"
    />
  );
};

const TitleCell = ({ row }: { row: ChangelogEntry }) => (
  <div>
    <span className="fw-bold">{row.title}</span>
    {row.highlight && (
      <Badge variant="primary" shape="pill" className="ms-2">
        {translate('Key')}
      </Badge>
    )}
  </div>
);

// Explains the backend's relevance verdict: an entry applies when it is not
// tied to a plugin, feature flag or setting, or when this deployment uses one
// it is tied to.
const getRelevanceExplanation = (row: ChangelogEntry) => {
  if (row.relevant) {
    return row.relevance_reasons?.length
      ? row.relevance_reasons.join(', ')
      : translate('Applies to all deployments.');
  }
  if (row.scope === 'dev') {
    return translate('Only affects development and testing.');
  }
  const conditions = [
    ...(row.relevant_when?.plugins ?? []),
    ...(row.relevant_when?.feature_flags ?? []),
    ...(row.relevant_when?.settings ?? []),
  ];
  return conditions.length
    ? translate('Only for deployments using: {conditions}.', {
        conditions: conditions.join(', '),
      })
    : translate('Does not apply to this deployment.');
};

const RelevanceCell = ({ row }: { row: ChangelogEntry }) => {
  if (row.relevant === undefined) return null;
  return (
    <Tooltip label={getRelevanceExplanation(row)}>
      <span>
        <StateIndicator
          variant={row.relevant ? 'success' : 'neutral'}
          label={row.relevant ? translate('Yes') : translate('No')}
          shape="pill"
          tone="light"
        />
      </span>
    </Tooltip>
  );
};

const ChangelogTable: FunctionComponent<{
  releases: ChangelogReleaseSummary[];
}> = ({ releases }) => {
  const hasPending = releases.some((r) => r.status === 'pending');

  // Until someone picks a view: what an upgrade would bring when there is one,
  // otherwise what the running release introduced.
  const [pickedView, setPickedView] = useState<string>(null);
  const defaultView = hasPending
    ? PENDING_VIEW
    : (releases.find((r) => r.status === 'running')?.version ?? PENDING_VIEW);
  const view = pickedView ?? defaultView;

  const fetchChangelogEntries: Fetcher<ChangelogEntry> = useMemo(
    () => async (request) => {
      const { data } = await changelogEntriesRetrieve({
        query: {
          ...(request.filter as ChangelogEntriesRetrieveData['query']),
          page: request.currentPage,
          page_size: request.pageSize,
        },
      });
      return { rows: data.results, resultCount: data.count };
    },
    [],
  );

  const filterValues = useFilterValues('AdminChangelog');
  const filter = useMemo(
    () => ({
      ...selectChangelogEntriesFilter(filterValues),
      ...(view === PENDING_VIEW ? {} : { release: view }),
    }),
    [filterValues, view],
  );
  const tableProps = useTable({
    table: 'AdminChangelog',
    fetchData: fetchChangelogEntries,
    filter,
    queryField: 'search',
  });

  return (
    <Table<ChangelogEntry>
      {...tableProps}
      columns={[
        {
          title: translate('Type'),
          render: TypeCell,
          keys: ['type'],
          filter: 'type',
          inlineFilter: (row) =>
            ChangelogEntryListTypeOptions.find((o) => o.value === row.type),
          orderField: 'type',
          id: 'type',
        },
        {
          title: translate('Title'),
          render: TitleCell,
          keys: ['title'],
          orderField: 'title',
          id: 'title',
        },
        {
          title: translate('Category'),
          render: ({ row }) => (
            <Badge variant="neutral" shape="pill" tone="outline">
              {ChangelogEntryListCategoryOptions.find(
                (o) => o.value === row.category,
              )?.label ?? row.category}
            </Badge>
          ),
          keys: ['category'],
          filter: 'category',
          inlineFilter: (row) =>
            ChangelogEntryListCategoryOptions.find(
              (o) => o.value === row.category,
            ),
          orderField: 'category',
          id: 'category',
        },
        {
          title: translate('Risk'),
          render: RiskCell,
          keys: ['impact'],
          filter: 'risk',
          inlineFilter: (row) =>
            ChangelogEntryListRiskOptions.find(
              (o) => o.value === row.impact?.risk,
            ),
          orderField: 'risk',
          id: 'risk',
        },
        {
          title: translate('Version'),
          render: ({ row }) => <span>{row.version}</span>,
          orderField: 'version',
          id: 'version',
        },
        {
          title: translate('Applies here'),
          render: RelevanceCell,
          keys: ['relevant'],
          id: 'relevant',
        },
      ]}
      hasQuery
      filters={<ChangelogEntriesFilter />}
      formId={ChangelogEntriesFilterFormId}
      expandableRow={ChangelogExpandableRow}
      expandableRowClassName="py-2 pe-2"
      verboseName={translate('changelog entries')}
      subtitle={
        releases.length > 0 && (
          <ReleasePicker
            view={view}
            releases={releases}
            hasPending={hasPending}
            onChange={setPickedView}
          />
        )
      }
      tableActions={view === PENDING_VIEW && hasPending && <ChangelogToolbar />}
    />
  );
};

export const ChangelogPage: FunctionComponent = () => {
  // The default view depends on the release list, so the table waits for it
  // rather than loading the pending view first and switching.
  const { data, isLoading } = useQuery({
    queryKey: ['changelog-releases'],
    queryFn: () => changelogReleasesRetrieve().then(({ data }) => data),
  });
  if (isLoading) {
    return <LoadingSpinner />;
  }
  return <ChangelogTable releases={data?.releases ?? []} />;
};
