import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  proposalProtectedCallsWorkflowDryRun,
  WorkflowDryRun,
  WorkflowDryRunParametersRequest,
} from 'waldur-js-client';

import { OWN_ERROR_STATE } from '@/core/queryRetry';

import { retryBusyPreview } from '../mail/queries';

/** Why the backend refused a run, as it said it: the step and the action. */
export interface DryRunRefusal {
  detail: string;
  action?: number | null;
  step?: string | null;
  status?: number;
}

const refusalOf = (error: any): DryRunRefusal => {
  const body = error?.response?.data ?? error?.body ?? error;
  const status = error?.response?.status ?? error?.status;
  if (body && typeof body === 'object' && 'detail' in body) {
    return { ...body, status } as DryRunRefusal;
  }
  return { detail: String(error?.message ?? error), status };
};

/**
 * A run of the path the request describes. The same path is the same key,
 * so stepping back to a point already shown answers from the cache.
 */
export const useWorkflowDryRun = (
  callUuid: string,
  request: WorkflowDryRunParametersRequest,
) =>
  useQuery<WorkflowDryRun, DryRunRefusal>({
    queryKey: ['callWorkflowDryRun', callUuid, request],
    queryFn: () =>
      proposalProtectedCallsWorkflowDryRun({
        path: { uuid: callUuid },
        body: request,
      })
        .then((response) => response.data)
        .catch((error) => {
          throw refusalOf(error);
        }),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // One dry run of a call at a time: a run still finishing on the server
    // turns the next away as busy; wait for it rather than show an error.
    retry: retryBusyPreview,
    retryDelay: 600,
    meta: OWN_ERROR_STATE,
  });
