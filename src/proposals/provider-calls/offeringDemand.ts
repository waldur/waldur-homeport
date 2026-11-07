import {
  OfferingDemand,
  OfferingDemandComponent,
  OfferingDemandPool,
} from 'waldur-js-client';

import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';
import { formatComponentUnit } from '@/proposals/budgets';

/**
 * One row of the Demand table: a round of a call on one of the provider's
 * offerings, with its pending, accepted and closed proposals side by side.
 */
export interface DemandRoundRow {
  key: string;
  offering_uuid: string;
  offering_name: string;
  call_uuid: string;
  call_name: string;
  call_state: OfferingDemand['call_state'];
  round_uuid: string;
  round_name: string;
  round_status: OfferingDemand['round_status'];
  round_cutoff_time: string | null;
  pending: OfferingDemand | null;
  accepted: OfferingDemand | null;
  closed: OfferingDemand | null;
}

/** "1.2M", the compact figure a dense demand cell reads best with. */
const formatCompact = (value: number | null | undefined): string =>
  value === null || value === undefined ? '' : formatUsageValue(value, true);

/** "1.2M hours per month": a compact amount in the component's unit. */
export const formatDemandAmount = (
  value: number | null | undefined,
  unit?: string | null,
): string => {
  const amount = formatCompact(value);
  if (!amount) return '';
  return unit ? `${amount} ${unit}` : amount;
};

/** The component's unit and the period its amounts are per. */
export const componentUnit = (component: {
  measured_unit?: string | null;
  limit_period?: string | null;
}): string =>
  formatComponentUnit(
    component.measured_unit,
    component.limit_period === 'total' ? '' : component.limit_period,
  );

export const componentLabel = (
  component: Pick<OfferingDemandComponent, 'name' | 'type'>,
): string => component.name || component.type;

/** One component of a round row, its figures side by side. */
export interface DemandComponentRow {
  type: string;
  label: string;
  unit: string;
  pendingRequested: number | null;
  acceptedRequested: number | null;
  awarded: number | null;
  roundPool: OfferingDemandPool | null;
  callPool: OfferingDemandPool | null;
}

/**
 * A round row's components, each with what pending proposals ask, what
 * accepted ones asked and were awarded, and the call's pools on it. Idle
 * components -- nothing asked, nothing awarded, no pool -- are left out.
 */
export const componentRows = (
  row: Pick<DemandRoundRow, 'pending' | 'accepted'>,
): DemandComponentRow[] => {
  const byType = new Map<string, DemandComponentRow>();
  const entry = (component: OfferingDemandComponent) => {
    const existing = byType.get(component.type);
    if (existing) {
      existing.roundPool ??= component.round_pool;
      existing.callPool ??= component.call_pool;
      return existing;
    }
    const created: DemandComponentRow = {
      type: component.type,
      label: componentLabel(component),
      unit: componentUnit(component),
      pendingRequested: null,
      acceptedRequested: null,
      awarded: null,
      roundPool: component.round_pool,
      callPool: component.call_pool,
    };
    byType.set(component.type, created);
    return created;
  };
  for (const component of row.pending?.components ?? []) {
    entry(component).pendingRequested = component.requested;
  }
  for (const component of row.accepted?.components ?? []) {
    const target = entry(component);
    target.acceptedRequested = component.requested;
    target.awarded = component.awarded;
  }
  return [...byType.values()].filter(
    (component) =>
      component.pendingRequested ||
      component.acceptedRequested ||
      component.awarded ||
      component.roundPool ||
      component.callPool,
  );
};

/** "30K of 50K left": what a pool has left of what it offers. */
export const describePoolLeft = (pool: OfferingDemandPool): string =>
  translate('{remaining} of {offered} left', {
    remaining: formatCompact(pool.remaining),
    offered: formatCompact(pool.offered),
  });

/**
 * The demand rows as table rows: one per offering, call and round, with
 * its groups side by side, in the order the rows came in.
 */
export const groupDemandRows = (rows: OfferingDemand[]): DemandRoundRow[] => {
  const result = new Map<string, DemandRoundRow>();
  for (const row of rows) {
    const key = `${row.requested_offering_uuid}:${row.round_uuid}`;
    let grouped = result.get(key);
    if (!grouped) {
      grouped = {
        key,
        offering_uuid: row.offering_uuid,
        offering_name: row.offering_name,
        call_uuid: row.call_uuid,
        call_name: row.call_name,
        call_state: row.call_state,
        round_uuid: row.round_uuid,
        round_name: row.round_name,
        round_status: row.round_status,
        round_cutoff_time: row.round_cutoff_time,
        pending: null,
        accepted: null,
        closed: null,
      };
      result.set(key, grouped);
    }
    grouped[row.state_group] = row;
  }
  return [...result.values()];
};

/** The rounds the rows are in, as filter options naming their call. */
export const roundOptions = (
  rows: OfferingDemand[],
): { value: string; label: string }[] => {
  const seen = new Map<string, string>();
  for (const row of rows) {
    if (!seen.has(row.round_uuid)) {
      seen.set(row.round_uuid, `${row.call_name} · ${row.round_name}`);
    }
  }
  return [...seen].map(([value, label]) => ({ value, label }));
};

/** The Demand page's `call` filter as a link carries it. */
export const callFilterParam = (callUuid: string, callName: string) =>
  `${callUuid}::${callName}`;
