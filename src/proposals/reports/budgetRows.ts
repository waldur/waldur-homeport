import { BudgetReportPool } from 'waldur-js-client';

import { translate } from '@/i18n';

/**
 * The budgets in the order they nest: each offering component of a call
 * together, its call-wide pool first and the rounds under it -- a round's
 * pool within the call-wide pool directly below the pool it draws on.
 * Otherwise in the order the report lists them.
 */
export const orderBudgetRows = <T extends BudgetReportPool>(
  pools: T[],
): T[] => {
  const groups = new Map<string, T[]>();
  pools.forEach((pool) => {
    const key = [pool.call_uuid, pool.offering_name, pool.component_type].join(
      '|',
    );
    groups.set(key, [...(groups.get(key) ?? []), pool]);
  });
  return [...groups.values()].flatMap((group) => [
    ...group.filter((pool) => !pool.round_uuid),
    ...group.filter((pool) => pool.round_uuid),
  ]);
};

/** What budget a row is, in words, for an export or a tooltip. */
export const describeBudget = (pool: BudgetReportPool): string => {
  if (!pool.round_uuid) {
    return translate('Call-wide pool');
  }
  if (pool.within_call_pool) {
    return translate('{round}, part of the call-wide pool', {
      round: pool.round_name,
    });
  }
  if (!pool.pool_uuid) {
    return translate('{round} · no pool of its own', {
      round: pool.round_name,
    });
  }
  return pool.round_name;
};

/** More was awarded than the pool offers: what it has left is below nothing. */
export const isOverspent = (pool: BudgetReportPool) =>
  pool.remaining !== null && pool.remaining < 0;
