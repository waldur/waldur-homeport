import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  CallWorkflowScenarios,
  proposalProtectedCallsRunWorkflowScenarios,
  proposalProtectedCallsWorkflowScenariosRetrieve,
} from 'waldur-js-client';

import { OWN_ERROR_STATE } from '@/core/queryRetry';

/** How often the checks are polled while a run is on its way. */
export const CHECKS_POLL_MS = 3000;

/** Poll while a run asked for is on its way, and stop once it is done. */
export const pollWhileRunning = (status?: string) =>
  status === 'running' ? CHECKS_POLL_MS : false;

const callScenariosKey = (callUuid: string) =>
  ['callWorkflowScenarios', callUuid] as const;

/** The call's saved scenarios, with how they went when last run on it.
 * Polled while a run is on its way. */
export const useCallScenarios = (callUuid: string) =>
  useQuery<CallWorkflowScenarios>({
    queryKey: callScenariosKey(callUuid),
    queryFn: () =>
      proposalProtectedCallsWorkflowScenariosRetrieve({
        path: { uuid: callUuid },
      }).then((response) => response.data),
    enabled: Boolean(callUuid),
    refetchOnWindowFocus: false,
    refetchInterval: (query) => pollWhileRunning(query.state.data?.status),
    retry: false,
    meta: OWN_ERROR_STATE,
  });

/** Ask for the call's saved scenarios to run in the background: the answer
 * says a run is on its way, and the scenarios are polled until it has
 * finished. */
export const useRunCallScenarios = (callUuid: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () =>
      proposalProtectedCallsRunWorkflowScenarios({
        path: { uuid: callUuid },
      }).then((response) => response.data),
    onSuccess: (data) => {
      client.setQueryData(callScenariosKey(callUuid), data);
    },
  });
};

/** The paths panel reads what the scenarios walked: once a run has
 * finished, it reads them again. */
export const callScenariosFinished = (client: QueryClient, callUuid: string) =>
  client.invalidateQueries({ queryKey: ['callWorkflowPaths', callUuid] });
