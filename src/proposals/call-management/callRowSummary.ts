import {
  NestedRequestedOffering,
  NestedRound,
  ResourcePoolUsage,
  WorkflowProgress,
} from 'waldur-js-client';

import { formatComponentUnit } from '@/proposals/budgets';

/**
 * The round the call's work is about: the open one, else the next one to
 * open. Null once every round has ended.
 */
export const pickCurrentRound = (
  rounds: NestedRound[] | undefined,
): NestedRound | null => {
  const byStart = [...(rounds ?? [])].sort((a, b) =>
    String(a.start_time).localeCompare(String(b.start_time)),
  );
  return (
    byStart.find((round) => round.status === 'open') ??
    byStart.find((round) => round.status === 'scheduled') ??
    null
  );
};

/** The enabled steps proposals are waiting at now, in workflow order. */
export const stepsInFlight = (progress: WorkflowProgress | undefined) =>
  (progress?.steps ?? []).filter((step) => step.enabled && step.waiting > 0);

export interface PoolSummary {
  key: string;
  offering: string;
  component: string;
  unit: string;
  offered: number | null;
  awarded: number;
  remaining: number | null;
}

/**
 * One line per offering component the call pools for the whole call. With
 * `withAwards`, components without a pool but with something awarded are
 * listed too, so an archived call still says what it gave out.
 */
export const summarisePools = (
  usage: ResourcePoolUsage[] | undefined,
  withAwards = false,
): PoolSummary[] =>
  (usage ?? []).flatMap((row) => {
    const cell = row.cells.find((candidate) => !candidate.round_uuid);
    if (!cell) return [];
    if (!cell.pool_uuid && !(withAwards && cell.awarded > 0)) return [];
    return [
      {
        key: `${row.requested_offering_uuid}:${row.offering_component_uuid}`,
        offering: row.offering_name,
        component: row.component_name || row.component_type,
        unit: formatComponentUnit(row.measured_unit, row.limit_period),
        offered: cell.pool_uuid ? cell.offered_total : null,
        awarded: cell.awarded,
        remaining: cell.pool_uuid ? cell.remaining : null,
      },
    ];
  });

/** How many pools the call defines, for the whole call or any round. */
export const countPools = (usage: ResourcePoolUsage[] | undefined) =>
  (usage ?? []).reduce(
    (count, row) => count + row.cells.filter((cell) => cell.pool_uuid).length,
    0,
  );

/** The call's offerings, and how many still wait for their provider. */
export const countOfferings = (offerings: NestedRequestedOffering[]) => {
  const live = (offerings ?? []).filter(
    (offering) => offering.state !== 'canceled',
  );
  return {
    total: live.length,
    pending: live.filter((offering) => offering.state === 'requested').length,
  };
};
