import { FilePdfIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useEffect, useRef, useState } from 'react';
import {
  HpcJob,
  HpcJobPerformance,
  HpcJobPerformanceSummary,
  HpcJobProcess,
  hpcWorkspacesJobsPerformanceRetrieve,
} from 'waldur-js-client';

import { AlertItem, BaseButton, Code, StatCardGrid } from 'waldur-ui';

import { ChartSpecView } from '@/core/charts/ChartSpecView';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { HpcErrorAlert } from './HpcErrorAlert';
import { downloadJobReport, HPC_QUERY_OPTIONS, hpcQueryKey } from './queries';
import {
  getHpcErrorMessage,
  isActiveJobState,
  JOB_POLL_INTERVAL,
} from './utils';

/** "Idle" worth flagging, as the report's tile does. */
const IDLE_FLAG_PERCENT = 20;

const number = (value?: number | null, digits = 1) =>
  value === null || value === undefined
    ? '—'
    : value.toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });

const when = (seconds?: number | null) =>
  seconds ? formatDateTime(DateTime.fromSeconds(seconds)) : '—';

const SummaryTiles: FC<{
  summary: HpcJobPerformanceSummary;
  job: HpcJob;
}> = ({ summary, job }) => (
  <StatCardGrid
    size="sm"
    spaceless
    stats={[
      ...(summary.gpus
        ? [
            {
              label: translate('GPUs'),
              value: summary.gpus,
              footer: translate('{count} node(s)', { count: summary.nodes }),
            },
            {
              label: translate('GPU-hours observed'),
              value: number(summary.gpu_hours_observed),
              footer: translate('Real: {value} (allocated × elapsed)', {
                value: number(job.gpu_hours),
              }),
            },
            {
              label: translate('GPU use'),
              value: `${number(summary.gpu_use_percent, 0)}%`,
              footer: translate('Mean over GPUs and samples'),
            },
            {
              label: translate('Idle share'),
              value: `${number(summary.idle_share_percent, 0)}%`,
              footer: translate('Samples with every GPU under 5%'),
              tone:
                (summary.idle_share_percent ?? 0) >= IDLE_FLAG_PERCENT
                  ? ('warning' as const)
                  : undefined,
            },
            {
              label: translate('GPU memory'),
              value: `${number(summary.gpu_memory_percent, 0)}%`,
              footer: translate('Peak {peak} of {total} GiB', {
                peak: number(summary.gpu_memory_peak_gib),
                total: number(summary.gpu_memory_total_gib, 0),
              }),
            },
            {
              label: translate('GPU power'),
              value: `${number(summary.gpu_power_watts, 0)} W`,
              footer: translate('Mean per GPU'),
            },
          ]
        : [{ label: translate('Nodes'), value: summary.nodes }]),
      {
        label: translate('CPU cores'),
        value: number(summary.cpu_cores_mean),
        footer: translate('Mean, all nodes'),
      },
      {
        label: translate('Host memory'),
        value: `${number(summary.host_memory_peak_gib)} GiB`,
        footer: translate('Peak; mean {mean} GiB', {
          mean: number(summary.host_memory_mean_gib),
        }),
      },
      {
        label: translate('Coverage'),
        value: `${number(summary.coverage_percent, 0)}%`,
        footer: translate('{count} samples, {first} – {last}', {
          count: summary.samples,
          first: when(summary.first_sample),
          last: when(summary.last_sample),
        }),
      },
    ]}
  />
);

const getProcessColumns = (): Column<HpcJobProcess>[] => [
  {
    title: translate('Command'),
    render: ({ row }) => <Code>{row.command}</Code>,
  },
  { title: translate('Nodes'), render: ({ row }) => row.nodes },
  { title: translate('Samples'), render: ({ row }) => row.samples },
  {
    title: translate('Mean CPU %'),
    render: ({ row }) => number(row.mean_cpu_percent),
  },
  {
    title: translate('Max CPU %'),
    render: ({ row }) => number(row.max_cpu_percent),
  },
  {
    title: translate('Peak RSS (GiB)'),
    render: ({ row }) => number(row.peak_rss_gib, 2),
  },
];

const ProcessTable: FC<{ jobId: string; processes: HpcJobProcess[] }> = ({
  jobId,
  processes,
}) => {
  const tableProps = useTable<HpcJobProcess>({
    table: `hpc-job-processes-${jobId}`,
    fetchData: createClientPaginatedFetcher(processes),
  });
  // The performance query refreshes a running job's processes; the fetcher
  // closes over them, so the table fetches again when they change.
  const fetchRef = useRef(tableProps.fetch);
  fetchRef.current = tableProps.fetch;
  useEffect(() => {
    fetchRef.current();
  }, [processes]);
  return (
    <Table<HpcJobProcess>
      {...tableProps}
      columns={getProcessColumns()}
      verboseName={translate('processes')}
      rowKey="command"
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

const DownloadReportButton: FC<{
  resourceUuid: string;
  jobId: string;
}> = ({ resourceUuid, jobId }) => {
  const { showError } = useNotify();
  const [busy, setBusy] = useState(false);
  const download = () => {
    setBusy(true);
    downloadJobReport(resourceUuid, jobId)
      .catch((error) =>
        showError(
          translate('Unable to create the report: {reason}', {
            reason: getHpcErrorMessage(error),
          }),
        ),
      )
      .finally(() => setBusy(false));
  };
  return (
    <BaseButton
      variant="tertiary"
      size="sm"
      onClick={download}
      pending={busy}
      label={translate('Download PDF')}
      iconNode={<FilePdfIcon weight="bold" />}
    />
  );
};

/**
 * The job over its run, as the cluster's probes sampled it: summary figures,
 * a line per GPU, CPU and memory over the job's nodes, and its processes.
 */
export const HpcJobPerformancePane: FC<{
  resourceUuid: string;
  job: HpcJob;
}> = ({ resourceUuid, job }) => {
  const { data, isLoading, error } = useQuery<HpcJobPerformance>({
    queryKey: hpcQueryKey(resourceUuid, 'job-performance', job.job_id),
    queryFn: () =>
      hpcWorkspacesJobsPerformanceRetrieve({
        path: { uuid: resourceUuid, job_id: job.job_id },
      }).then((response) => response.data),
    refetchInterval: isActiveJobState(job.state)
      ? JOB_POLL_INTERVAL * 6
      : false,
    ...HPC_QUERY_OPTIONS,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <HpcErrorAlert error={error} />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-tertiary text-xs">
          {data.available
            ? translate('Sampled every {seconds} s from {start} to {end}.', {
                seconds: data.resolution,
                start: when(data.start_time),
                end: when(data.end_time),
              })
            : data.message}
        </div>
        <DownloadReportButton resourceUuid={resourceUuid} jobId={job.job_id} />
      </div>
      {data.available && data.summary && (
        <>
          <SummaryTiles summary={data.summary} job={job} />
          {data.warnings?.map((warning) => (
            <AlertItem
              key={warning}
              variant="warning"
              type="floating"
              title={translate('From the cluster monitor')}
              body={warning}
            />
          ))}
          <div className="grid gap-8 xl:grid-cols-2">
            {data.charts?.map((chart) => (
              <ChartSpecView key={chart.title} spec={chart} height={260} />
            ))}
          </div>
          {data.processes?.length ? (
            <div>
              <div className="font-semibold mb-1">{translate('Processes')}</div>
              <div className="text-tertiary text-xs mb-3">
                {translate(
                  'Grouped by command; the probes record command names, not full command lines.',
                )}
              </div>
              <ProcessTable jobId={job.job_id} processes={data.processes} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
