import { useQuery } from '@tanstack/react-query';
import {
  hpcWorkspacesClusterLoadRetrieve,
  hpcWorkspacesJobStatsRetrieve,
  hpcWorkspacesList,
  hpcWorkspacesOutputSeriesRetrieve,
  hpcWorkspacesPartitionsList,
  hpcWorkspacesJobsPerformancePdfRetrieve,
  hpcWorkspacesRetrieve,
  hpcWorkspacesUsageRetrieve,
} from 'waldur-js-client';

import { OWN_ERROR_STATE, retryServerErrors } from '@/core/queryRetry';
import { saveFile } from '@/core/saveFile';

/**
 * Every HPC query renders its own error: FirecREST answers a missing sign-in
 * with 403 and an outage with 502, neither of which should take the user off
 * the resource page.
 */
export const HPC_QUERY_OPTIONS = {
  meta: OWN_ERROR_STATE,
  retry: retryServerErrors(1),
  refetchOnWindowFocus: false,
} as const;

export const hpcQueryKey = (uuid: string, ...rest: unknown[]) => [
  'hpc-workspace',
  uuid,
  ...rest,
];

const sameUuid = (a: string, b: string) =>
  a.replaceAll('-', '') === b.replaceAll('-', '');

const jobSubmittedListeners = new Set<(uuid: string) => void>();

/**
 * Tells a jobs table on screen that its allocation has a new job. A job
 * submitted outside the table, from the assistant, is not in the table's
 * cached list, and the table refreshes by itself only while a job it shows is
 * still pending or running.
 */
export const notifyHpcJobSubmitted = (allocationUuid: string) =>
  jobSubmittedListeners.forEach((listener) => listener(allocationUuid));

/** Calls `onSubmitted` for each job submitted to the allocation elsewhere. */
export const subscribeHpcJobSubmitted = (
  allocationUuid: string,
  onSubmitted: () => void,
) => {
  const listener = (uuid: string) => {
    if (sameUuid(uuid, allocationUuid)) onSubmitted();
  };
  jobSubmittedListeners.add(listener);
  return () => {
    jobSubmittedListeners.delete(listener);
  };
};

export const useHpcOverview = (uuid: string) =>
  useQuery({
    queryKey: hpcQueryKey(uuid, 'overview'),
    queryFn: () =>
      hpcWorkspacesRetrieve({ path: { uuid } }).then(
        (response) => response.data,
      ),
    ...HPC_QUERY_OPTIONS,
  });

export const useHpcPartitions = (uuid: string) =>
  useQuery({
    queryKey: hpcQueryKey(uuid, 'partitions'),
    queryFn: () =>
      hpcWorkspacesPartitionsList({ path: { uuid } }).then(
        (response) => response.data,
      ),
    ...HPC_QUERY_OPTIONS,
  });

export const useHpcUsage = (uuid: string) =>
  useQuery({
    queryKey: hpcQueryKey(uuid, 'usage'),
    queryFn: () =>
      hpcWorkspacesUsageRetrieve({ path: { uuid } }).then(
        (response) => response.data,
      ),
    ...HPC_QUERY_OPTIONS,
  });

export const useHpcJobStats = (uuid: string, days: number) =>
  useQuery({
    queryKey: hpcQueryKey(uuid, 'job-stats', days),
    queryFn: () =>
      hpcWorkspacesJobStatsRetrieve({ path: { uuid }, query: { days } }).then(
        (response) => response.data,
      ),
    ...HPC_QUERY_OPTIONS,
  });

export const useHpcClusterLoad = (uuid: string) =>
  useQuery({
    queryKey: hpcQueryKey(uuid, 'cluster-load'),
    queryFn: () =>
      hpcWorkspacesClusterLoadRetrieve({ path: { uuid } }).then(
        (response) => response.data,
      ),
    ...HPC_QUERY_OPTIONS,
  });

export const useHpcOutputSeries = (uuid: string, path: string) =>
  useQuery({
    queryKey: hpcQueryKey(uuid, 'output-series', path),
    queryFn: () =>
      hpcWorkspacesOutputSeriesRetrieve({
        path: { uuid },
        query: { path },
      }).then((response) => response.data),
    ...HPC_QUERY_OPTIONS,
  });

const normalizeUuid = (uuid?: string) =>
  (uuid || '').replace(/-/g, '').toLowerCase();

/**
 * The workspace runs jobs, cancels them and opens files through FirecREST;
 * without it, a cluster monitor only lets the user follow their jobs. A
 * backend from before such read-only workspaces leaves `firecrest_enabled`
 * out: every workspace it had was on FirecREST.
 */
export const hasFirecrest = (
  workspace: { firecrest_enabled?: boolean } | null | undefined,
): boolean => Boolean(workspace) && workspace.firecrest_enabled !== false;

/** What a resource's HPC workspace can do. */
export interface HpcWorkspaceMode {
  /** Runs jobs, cancels them and opens files: FirecREST is connected. */
  firecrest: boolean;
  /** Shows job performance: a cluster monitor is connected. */
  monitoring: boolean;
}

/**
 * Whether the resource is an HPC workspace, and what it can do. The offering
 * names its FirecREST and cluster monitor endpoints in plugin options, but
 * only staff-allowed endpoints are served, so the workspace list is the
 * authority.
 */
export const getHpcWorkspaceMode = (
  resourceUuid: string,
  pluginOptions: unknown,
): Promise<HpcWorkspaceMode | null> => {
  const options = (pluginOptions || {}) as {
    firecrest_api_url?: string;
    firecrest_system_name?: string;
    slurm_monitor_api_url?: string;
    slurm_monitor_cluster_name?: string;
  };
  const named =
    (options.firecrest_api_url && options.firecrest_system_name) ||
    (options.slurm_monitor_api_url && options.slurm_monitor_cluster_name);
  if (!named) {
    return Promise.resolve(null);
  }
  // resource_uuid narrows the list to this resource; a backend without the
  // filter lists the first page, searched here.
  return hpcWorkspacesList({
    query: { resource_uuid: resourceUuid, page_size: 200 },
  })
    .then((response) => {
      const workspace = response.data.find(
        (item) =>
          normalizeUuid(item.resource_uuid) === normalizeUuid(resourceUuid),
      );
      return workspace
        ? {
            firecrest: hasFirecrest(workspace),
            monitoring: Boolean(workspace.monitoring_enabled),
          }
        : null;
    })
    .catch(() => null);
};

/** The job's performance report, rendered by the backend as a PDF. */
export const downloadJobReport = (uuid: string, jobId: string) =>
  hpcWorkspacesJobsPerformancePdfRetrieve({
    path: { uuid, job_id: jobId },
    parseAs: 'blob',
  }).then((response) =>
    saveFile(response.data as Blob, `job-${jobId}-report.pdf`),
  );
