import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { HpcJob, hpcWorkspacesJobsList, Resource } from 'waldur-js-client';

import { BaseButton, Code, Tooltip } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import {
  HpcJobTimeWindowOptions,
  HpcWorkspacesJobsFilter,
  selectHpcWorkspacesJobsFilter,
} from '@/table/generated/HpcWorkspacesJobsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { HpcErrorAlert } from './HpcErrorAlert';
import { HpcJobActions } from './HpcJobActions';
import { HpcJobDetails } from './HpcJobDetails';
import {
  HPC_QUERY_OPTIONS,
  HpcWorkspaceMode,
  hpcQueryKey,
  subscribeHpcJobSubmitted,
} from './queries';
import {
  formatElapsed,
  getInMemoryPage,
  matchesJobQuery,
  getJobStateVariant,
  hasActiveJobs,
  isActiveJobState,
  JOB_POLL_INTERVAL,
} from './utils';

// Shorter than the refresh while jobs run, so polling still sees changes.
const JOBS_CACHE_MS = JOB_POLL_INTERVAL / 2;

const DEFAULT_TIME_WINDOW = HpcJobTimeWindowOptions.find(
  (option) => option.value === '24h',
);

const HpcSubmitJobDialog = lazyComponent(() =>
  import('./HpcSubmitJobDialog').then((module) => ({
    default: module.HpcSubmitJobDialog,
  })),
);

const getColumns = (): Column<HpcJob>[] => [
  {
    title: translate('Job ID'),
    render: ({ row }) => <Code>{row.job_id}</Code>,
    copyField: (row) => row.job_id,
  },
  {
    title: translate('Name'),
    render: ({ row }) => renderFieldOrDash(row.name),
  },
  {
    title: translate('State'),
    render: ({ row }) => (
      <StateIndicator
        label={row.state || translate('Unknown')}
        variant={getJobStateVariant(row.state)}
        active={isActiveJobState(row.state)}
        tooltip={row.state_reason || undefined}
        shape="pill"
        tone="outline"
      />
    ),
  },
  {
    title: translate('Partition'),
    render: ({ row }) => renderFieldOrDash(row.partition),
  },
  {
    title: translate('Nodes'),
    render: ({ row }) =>
      row.nodes ? (
        <Tooltip label={row.nodes}>
          <span>{row.allocation_nodes ?? row.nodes}</span>
        </Tooltip>
      ) : (
        renderFieldOrDash(row.allocation_nodes)
      ),
  },
  {
    title: translate('Elapsed'),
    render: ({ row }) => renderFieldOrDash(formatElapsed(row.elapsed)),
  },
  {
    title: translate('Exit code'),
    render: ({ row }) =>
      row.exit_code === null || row.exit_code === undefined
        ? renderFieldOrDash(null)
        : String(row.exit_code),
  },
];

export const HpcJobsTab: FC<{
  resource: Resource;
  hpcMode?: HpcWorkspaceMode | null;
}> = ({ resource, hpcMode }) => {
  const resourceUuid = resource.uuid;
  const { openDialog } = useModal();
  const table = `hpc-jobs-${resourceUuid}`;
  const values = useFilterValues(table);
  const filter = useMemo(() => selectHpcWorkspacesJobsFilter(values), [values]);

  // FireCREST returns the whole window at once; search and paging happen
  // here. A short cache keeps typing in the search box from re-listing.
  const queryClient = useQueryClient();
  const fetchData = useCallback(
    (request) => {
      const timeWindow = request.filter?.time_window;
      return queryClient
        .fetchQuery({
          queryKey: hpcQueryKey(resourceUuid, 'jobs', timeWindow),
          queryFn: ({ signal }) =>
            hpcWorkspacesJobsList({
              path: { uuid: resourceUuid },
              query: { time_window: timeWindow },
              signal,
            }).then((response) => response.data),
          staleTime: JOBS_CACHE_MS,
        })
        .then((jobs) =>
          getInMemoryPage(
            jobs.filter((job) => matchesJobQuery(job, request.filter?.query)),
            request,
          ),
        );
    },
    [resourceUuid, queryClient],
  );

  const tableProps = useTable<HpcJob>({
    table,
    fetchData,
    filter,
    syncFiltersToURL: true,
    queryField: 'query',
    // FireCREST's own default; cleared, the filter falls back to it too.
    initialFilters: { time_window: DEFAULT_TIME_WINDOW },
    meta: HPC_QUERY_OPTIONS.meta,
    retry: HPC_QUERY_OPTIONS.retry,
  });

  // useTable has no polling of its own: refresh while a job can still change.
  const active = hasActiveJobs(tableProps.rows as HpcJob[]);
  const fetchRef = useRef(tableProps.fetch);
  fetchRef.current = tableProps.fetch;
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => fetchRef.current(true), JOB_POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [active]);

  const monitoringEnabled = Boolean(hpcMode?.monitoring);
  // Without FirecREST the jobs come from the cluster monitor, read-only.
  const firecrestEnabled = Boolean(hpcMode?.firecrest);
  const JobRow = useMemo(
    () =>
      function JobRow({ row }: { row: HpcJob }) {
        return (
          <HpcJobDetails
            row={row}
            resourceUuid={resourceUuid}
            monitoringEnabled={monitoringEnabled}
            firecrestEnabled={firecrestEnabled}
          />
        );
      },
    [resourceUuid, monitoringEnabled, firecrestEnabled],
  );

  // After a submit or cancel the cached list is out of date, however recent.
  const refreshJobs = useCallback(
    () =>
      queryClient
        .invalidateQueries({ queryKey: hpcQueryKey(resourceUuid, 'jobs') })
        .then(() => fetchRef.current(true)),
    [queryClient, resourceUuid],
  );

  // A job submitted from the assistant: the cached list does not have it.
  useEffect(
    () => subscribeHpcJobSubmitted(resourceUuid, refreshJobs),
    [resourceUuid, refreshJobs],
  );

  const openSubmitDialog = useCallback(
    () =>
      openDialog(HpcSubmitJobDialog, {
        resolve: { resource, refetch: refreshJobs },
        size: 'xl',
      }),
    [openDialog, resource, refreshJobs],
  );

  return (
    <>
      <HpcErrorAlert error={tableProps.error} />
      <Table<HpcJob>
        {...tableProps}
        title={translate('Jobs')}
        subtitle={
          active
            ? translate('Refreshing every {seconds} seconds while jobs run.', {
                seconds: JOB_POLL_INTERVAL / 1000,
              })
            : undefined
        }
        verboseName={translate('jobs')}
        rowKey="job_id"
        cardBordered
        columns={getColumns()}
        expandableRow={JobRow}
        hasQuery
        filters={<HpcWorkspacesJobsFilter />}
        tableActions={
          firecrestEnabled ? (
            <BaseButton
              variant="primary"
              onClick={openSubmitDialog}
              label={translate('Submit job')}
              iconNode={<PaperPlaneTiltIcon weight="bold" />}
              size="lg"
            />
          ) : null
        }
        rowActions={({ row }) => (
          <HpcJobActions
            row={row}
            resourceUuid={resourceUuid}
            refetch={refreshJobs}
            firecrestEnabled={firecrestEnabled}
          />
        )}
      />
    </>
  );
};
