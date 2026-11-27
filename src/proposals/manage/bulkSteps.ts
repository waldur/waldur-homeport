import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import {
  BulkStepDecision,
  BulkStepDecisionResult,
  BulkStepDecisionSummary,
  proposalBulkStepDecisionsList,
  proposalBulkStepDecisionsRetrieve,
} from 'waldur-js-client';

/** How often a run in the background is read again while it moves. */
const RUN_POLL_INTERVAL = 2000;

/** How often a run that has stopped moving is read again: the backend
 * picks it up again after ten minutes, or gives it up. */
const SLOW_POLL_INTERVAL = 30000;

/** The most proposals one run takes (the backend's limit). */
export const MAX_BULK_PROPOSALS = 2000;

/** A run that has recorded nothing for this long has stopped moving. */
const STALE_AFTER_MS = 30 * 60 * 1000;

/** Whether the run has stopped: every proposal decided or refused, or the
 * run failed. */
export const isFinished = (run?: Pick<BulkStepDecisionSummary, 'state'>) =>
  run?.state === 'done' || run?.state === 'failed';

/** Whether the run goes on and has recorded a proposal lately. Read
 * against this browser's clock, so it only slows the polling down. */
export const isMoving = (
  run?: Pick<BulkStepDecisionSummary, 'state' | 'modified'>,
) =>
  Boolean(run) &&
  !isFinished(run) &&
  (!run.modified ||
    Date.now() - new Date(run.modified).getTime() < STALE_AFTER_MS);

/** How often to read a run, or runs, again: quickly while one moves,
 * slowly while one is stalled, never once all have stopped. */
const pollInterval = (
  runs: Pick<BulkStepDecisionSummary, 'state' | 'modified'>[],
) => {
  if (runs.some(isMoving)) return RUN_POLL_INTERVAL;
  if (runs.some((run) => !isFinished(run))) return SLOW_POLL_INTERVAL;
  return false;
};

export const refusedOf = (results: BulkStepDecisionResult[]) =>
  results.filter((result) => result.status === 'refused');

/**
 * A run deciding -- or previewing -- one step for many proposals. While it
 * goes on in the background, only its summary is read again (counts, not
 * the results so far); once it has stopped, its results are read once. A
 * run decided within the request comes back finished, with its results,
 * and is not read again.
 */
export const useBulkStepDecision = (
  uuid: string,
  initial?: BulkStepDecision,
) => {
  const initiallyFinished = isFinished(initial);
  const summary = useQuery<BulkStepDecisionSummary>({
    queryKey: ['BulkStepDecisionSummary', uuid],
    queryFn: () =>
      proposalBulkStepDecisionsList({ query: { uuid } }).then(
        (response) => response.data[0],
      ),
    initialData: initial,
    enabled: Boolean(uuid) && !initiallyFinished,
    refetchInterval: (query) =>
      query.state.data ? pollInterval([query.state.data]) : RUN_POLL_INTERVAL,
    refetchOnWindowFocus: false,
  });
  const finished = isFinished(summary.data ?? initial);
  const detail = useQuery<BulkStepDecision>({
    queryKey: ['BulkStepDecision', uuid],
    queryFn: () =>
      proposalBulkStepDecisionsRetrieve({ path: { uuid } }).then(
        (response) => response.data,
      ),
    initialData: initiallyFinished && initial?.results ? initial : undefined,
    enabled: Boolean(uuid) && finished,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const data: BulkStepDecision | undefined =
    detail.data ??
    (summary.data ? { ...summary.data, results: [] } : undefined);
  return { data, isLoading: !data };
};

const runsOfCallKey = (callUuid: string) => ['BulkStepDecisions', callUuid];

/** The call's runs deciding a step in bulk, latest first, as summaries:
 * read again while one of them goes on. */
export const useBulkRunsOfCall = (callUuid: string) =>
  useQuery({
    queryKey: runsOfCallKey(callUuid),
    queryFn: () =>
      proposalBulkStepDecisionsList({
        query: { call_uuid: callUuid, dry_run: false, page_size: 50 },
      }).then((response) => response.data),
    refetchInterval: (query) => pollInterval(query.state.data ?? []),
    refetchOnWindowFocus: false,
  });

export const invalidateRunsOfCall = (queryClient, callUuid: string) =>
  queryClient.invalidateQueries({ queryKey: runsOfCallKey(callUuid) });

/**
 * Watch the call's runs, and once one that was going on stops, read the
 * proposals again: their steps and `onChange` (the proposals list). For a
 * run whose dialog was closed before it ended.
 */
export const useWhenRunsFinish = (callUuid: string, onChange?: () => void) => {
  const queryClient = useQueryClient();
  const { data: runs } = useBulkRunsOfCall(callUuid);
  const going = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!runs) return;
    const finishedNow = runs.filter(
      (run) => going.current.has(run.uuid) && isFinished(run),
    );
    going.current = new Set(
      runs.filter((run) => !isFinished(run)).map((run) => run.uuid),
    );
    if (!finishedNow.length) return;
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === 'proposalWorkflowStates',
    });
    queryClient.invalidateQueries({
      queryKey: ['BulkDecisionSteps', callUuid],
    });
    onChange?.();
  }, [runs, queryClient, callUuid, onChange]);
};
