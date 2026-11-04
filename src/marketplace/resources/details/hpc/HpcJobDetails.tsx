import { useQuery } from '@tanstack/react-query';
import { FC, ReactNode, useState } from 'react';
import {
  HpcJob,
  HpcJobOutput,
  hpcWorkspacesJobsOutputRetrieve,
} from 'waldur-js-client';

import {
  Progress,
  ProgressVariant,
  PropertyItem,
  PropertyList,
  SegmentedControl,
} from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { HpcErrorAlert } from './HpcErrorAlert';
import { HpcTextPane } from './HpcJobOutputDialog';
import { HpcJobPerformancePane } from './HpcJobPerformance';
import { HPC_QUERY_OPTIONS, hpcQueryKey } from './queries';
import { formatElapsed, isActiveJobState, JOB_POLL_INTERVAL } from './utils';

const LINE_OPTIONS = [100, 500, 2000];
// The row keeps one height whichever tab is open (Performance, a report,
// may grow past it); text panes scroll within it.
const PANEL_CLASS = 'min-h-[180px]';
const TEXT_HEIGHT = 200;

// Slurm reports a time it does not know yet as 0.
const epoch = (seconds?: number | null) =>
  propVal.date(seconds || null, { epoch: true, precision: 'datetime' });

const formatMemory = (mb?: number | null) => {
  if (mb === null || mb === undefined) return null;
  return mb >= 1024
    ? translate('{value} GB', { value: (mb / 1024).toFixed(1) })
    : translate('{value} MB', { value: Math.round(mb) });
};

const formatPercent = (ratio: number) => `${Math.round(ratio * 100)}%`;

/** Low efficiency is wasted allocation, not an error: warn below a third. */
const efficiencyVariant = (ratio: number): ProgressVariant =>
  ratio < 0.33 ? 'warning' : ratio < 0.66 ? 'info' : 'success';

const Ratio: FC<{ value?: number | null; detail?: ReactNode }> = ({
  value,
  detail,
}) =>
  value === null || value === undefined ? null : (
    <div className="flex items-center gap-3" style={{ maxWidth: 420 }}>
      <Progress
        value={value * 100}
        variant={efficiencyVariant(value)}
        size="sm"
        className="flex-1"
        label={formatPercent(value)}
      />
      <span className="whitespace-nowrap">
        {formatPercent(value)}
        {detail ? <span className="text-tertiary"> · {detail}</span> : null}
      </span>
    </div>
  );

const DetailsPane: FC<{ job: HpcJob }> = ({ job }) => {
  const limitShare =
    job.elapsed && job.time_limit ? job.elapsed / job.time_limit : null;
  return (
    <div className="grid gap-x-8 lg:grid-cols-2">
      <PropertyList variant="summary" termWidth="sm">
        <PropertyItem label={translate('Account')} value={job.account} />
        <PropertyItem label={translate('User')} value={job.user} />
        <PropertyItem label={translate('Partition')} value={job.partition} />
        <PropertyItem
          label={translate('Nodes')}
          value={
            job.nodes
              ? `${job.nodes}${job.allocation_nodes ? ` (${job.allocation_nodes})` : ''}`
              : null
          }
        />
        <PropertyItem
          label={translate('Working directory')}
          value={propVal.code(job.working_directory)}
        />
        <PropertyItem
          label={translate('Reason')}
          value={
            job.state_reason && job.state_reason !== 'None'
              ? job.state_reason
              : null
          }
        />
        <PropertyItem
          label={translate('Exit code')}
          value={propVal.text(job.exit_code)}
        />
      </PropertyList>
      <PropertyList variant="summary" termWidth="sm">
        <PropertyItem
          label={translate('Submitted')}
          value={epoch(job.submit_time)}
        />
        <PropertyItem
          label={translate('Queue wait')}
          value={formatElapsed(job.wait_seconds)}
        />
        <PropertyItem
          label={translate('Started')}
          value={epoch(job.start_time)}
        />
        <PropertyItem label={translate('Ended')} value={epoch(job.end_time)} />
        <PropertyItem
          label={translate('Elapsed')}
          value={formatElapsed(job.elapsed)}
        />
        <PropertyItem
          label={translate('Time limit')}
          value={formatElapsed(job.time_limit)}
        />
        <PropertyItem
          label={translate('Time limit used')}
          value={
            limitShare === null ? null : (
              <Ratio value={Math.min(limitShare, 1)} />
            )
          }
          tooltip={translate(
            'Jobs that finish far below their limit start sooner with a tighter one.',
          )}
        />
      </PropertyList>
    </div>
  );
};

const ResourcesPane: FC<{ job: HpcJob }> = ({ job }) => {
  const known =
    job.allocation_cpus ||
    job.requested_memory_mb ||
    job.cpu_time_seconds ||
    job.max_rss_mb ||
    job.allocation_gpus ||
    job.energy_kwh;
  if (!known) {
    return (
      <div className="text-tertiary">
        {isActiveJobState(job.state)
          ? translate('Resource use is known once the job has run.')
          : translate('The cluster did not report resource use for this job.')}
      </div>
    );
  }
  return (
    <PropertyList variant="summary" termWidth="sm">
      <PropertyItem
        label={translate('CPUs')}
        value={propVal.count(job.allocation_cpus || null)}
      />
      <PropertyItem
        label={translate('CPU time')}
        value={
          job.cpu_time_seconds
            ? `${formatElapsed(job.cpu_time_seconds)}${
                job.cpu_hours
                  ? ` · ${translate('{value} core-hours', { value: job.cpu_hours.toFixed(1) })}`
                  : ''
              }`
            : null
        }
      />
      <PropertyItem
        label={translate('CPU efficiency')}
        value={
          job.cpu_efficiency == null ? null : (
            <Ratio value={job.cpu_efficiency} />
          )
        }
        tooltip={translate('CPU time used out of CPUs × elapsed time.')}
      />
      <PropertyItem
        label={translate('Memory requested')}
        value={formatMemory(job.requested_memory_mb)}
      />
      <PropertyItem
        label={translate('Peak memory')}
        value={formatMemory(job.max_rss_mb)}
      />
      <PropertyItem
        label={translate('Memory efficiency')}
        value={
          job.memory_efficiency == null ? null : (
            <Ratio value={job.memory_efficiency} />
          )
        }
        tooltip={translate('Peak memory out of the memory requested.')}
      />
      {job.allocation_gpus ? (
        <PropertyItem
          label={translate('GPUs')}
          value={`${job.allocation_gpus}${
            job.gpu_hours
              ? ` · ${translate('{value} GPU-hours', { value: job.gpu_hours.toFixed(1) })}`
              : ''
          }`}
        />
      ) : null}
      <PropertyItem
        label={translate('Energy')}
        value={
          job.energy_kwh
            ? `${translate('{value} kWh', { value: job.energy_kwh.toFixed(1) })}${
                job.mean_power_w
                  ? ` · ${translate('{value} W mean', { value: job.mean_power_w })}`
                  : ''
              }`
            : null
        }
        tooltip={translate(
          "All of the job's nodes, as the cluster metered it.",
        )}
      />
    </PropertyList>
  );
};

type OutputPart = 'standard_output' | 'standard_error' | 'script';

/** One part of the job's output; the tabs share a single request per line count. */
const OutputPane: FC<{
  resourceUuid: string;
  job: HpcJob;
  part: OutputPart;
}> = ({ resourceUuid, job, part }) => {
  const [lines, setLines] = useState(100);
  const { data, isLoading, error } = useQuery<HpcJobOutput>({
    queryKey: hpcQueryKey(resourceUuid, 'job-output', job.job_id, lines),
    queryFn: () =>
      hpcWorkspacesJobsOutputRetrieve({
        path: { uuid: resourceUuid, job_id: job.job_id },
        query: { lines },
      }).then((response) => response.data),
    refetchInterval: isActiveJobState(job.state) ? JOB_POLL_INTERVAL : false,
    ...HPC_QUERY_OPTIONS,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <HpcErrorAlert error={error} />;
  if (part === 'script') {
    return (
      <HpcTextPane
        content={data?.script}
        empty={translate('The cluster did not return the script.')}
        verbose={translate('Script')}
        maxHeight={TEXT_HEIGHT}
      />
    );
  }
  const stream = data?.[part];
  const verbose =
    part === 'standard_output'
      ? translate('Standard output')
      : translate('Standard error');
  return (
    <div>
      <div className="flex items-center justify-end gap-3 mb-3">
        <span className="text-tertiary text-xs">{translate('Last lines')}</span>
        <SegmentedControl<string>
          aria-label={translate('Last lines')}
          options={LINE_OPTIONS.map((value) => ({
            value: String(value),
            label: String(value),
          }))}
          value={String(lines)}
          onValueChange={(value) => setLines(Number(value))}
          size="sm"
        />
      </div>
      <HpcTextPane
        content={stream?.content}
        path={stream?.path}
        empty={translate('No output yet.')}
        verbose={verbose}
        maxHeight={TEXT_HEIGHT}
      />
    </div>
  );
};

/** A job's details, resource use and output, in the jobs table's expanded row. */
export const HpcJobDetails: FC<{
  row: HpcJob;
  resourceUuid: string;
  /** The offering has a cluster monitor: show the job's samples over its run. */
  monitoringEnabled?: boolean;
  /** FirecREST reads the job's output and script; a cluster monitor cannot. */
  firecrestEnabled?: boolean;
}> = ({ row, resourceUuid, monitoringEnabled, firecrestEnabled = true }) => (
  <ExpandableContainer>
    <EmbeddedTabs
      defaultValue="details"
      listClassName="mb-4"
      panelsClassName={PANEL_CLASS}
      tabs={[
        {
          key: 'details',
          title: translate('Details'),
          content: <DetailsPane job={row} />,
        },
        {
          key: 'resources',
          title: translate('Resource use'),
          content: <ResourcesPane job={row} />,
        },
        ...(monitoringEnabled
          ? [
              {
                key: 'performance',
                title: translate('Performance'),
                content: (
                  <HpcJobPerformancePane
                    resourceUuid={resourceUuid}
                    job={row}
                  />
                ),
              },
            ]
          : []),
        ...(firecrestEnabled
          ? [
              {
                key: 'stdout',
                title: translate('Standard output'),
                content: (
                  <OutputPane
                    resourceUuid={resourceUuid}
                    job={row}
                    part="standard_output"
                  />
                ),
              },
              {
                key: 'stderr',
                title: translate('Standard error'),
                content: (
                  <OutputPane
                    resourceUuid={resourceUuid}
                    job={row}
                    part="standard_error"
                  />
                ),
              },
              {
                key: 'script',
                title: translate('Script'),
                content: (
                  <OutputPane
                    resourceUuid={resourceUuid}
                    job={row}
                    part="script"
                  />
                ),
              },
            ]
          : []),
      ]}
    />
  </ExpandableContainer>
);
