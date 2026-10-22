/**
 * Per-period limits of a resource API key.
 *
 * A key's limits have the shape of its resource's spending limits
 * (`{component_type: {period: amount}}`): `month` on every component, the
 * other periods where the component offers them to resources, and each capped
 * by the resource's own limit for the period. They mirror
 * `marketplace/api_key_spending_limits.py` in waldur-mastermind; the backend
 * has the final word.
 */
import { Resource } from 'waldur-js-client';

import {
  getOfferedPeriods,
  isEmptyAmount,
  SPENDING_LIMIT_PERIODS,
  SpendingLimitFieldBounds,
  SpendingLimitFormValues,
  SpendingLimitPeriod,
  SpendingLimitsPayload,
} from '@/marketplace/common/spendingLimits';

import { KeyComponent } from './types';

/** A component as the key dialog's limit fields take it: its periods carry the key's maximum. */
export type KeyLimitComponent = Omit<KeyComponent, 'measured_unit'> & {
  name: string;
  measured_unit?: string;
  spending_limit_periods: Record<string, SpendingLimitFieldBounds>;
};

type Limits = Resource['spending_limits'] | null | undefined;

/**
 * The periods a key may limit on each component, each with the resource's
 * limit for it as the maximum of any new amount. As in the backend, a limit
 * the key already holds is accepted again only as it is (the fields'
 * `keepHeld`): above a resource limit lowered since, or on a period no longer
 * offered, which stays shown as `heldOnly` so it can be kept or cleared.
 */
export const getKeyLimitComponents = (
  components: KeyComponent[],
  resourceLimits: Limits,
  held?: Limits,
): KeyLimitComponent[] =>
  components.map((component) => {
    const offered = new Set<string>(['month']);
    if (component.billing_type === 'usage') {
      Object.keys(component.spending_limit_periods ?? {}).forEach((period) =>
        offered.add(period),
      );
    }
    const own = held?.[component.type] ?? {};
    const periods: Record<string, SpendingLimitFieldBounds> = {};
    for (const period of SPENDING_LIMIT_PERIODS) {
      const isHeld = !isEmptyAmount(own[period]);
      if (!offered.has(period) && !isHeld) continue;
      const cap = resourceLimits?.[component.type]?.[period];
      periods[period] = {
        ...(isEmptyAmount(cap) ? {} : { maximum: Number(cap) }),
        ...(offered.has(period) ? {} : { heldOnly: true }),
      };
    }
    return {
      ...component,
      name: component.name || component.type,
      measured_unit: component.measured_unit || undefined,
      spending_limit_periods: periods,
    };
  });

/**
 * The `spending_limits` payload of a key: the limits of every shown period,
 * with empty fields left out. It replaces the key's limits, so `{}` clears
 * them all.
 */
export const formatKeySpendingLimits = (
  values: SpendingLimitFormValues | undefined,
  components: KeyLimitComponent[],
): SpendingLimitsPayload => {
  const result: SpendingLimitsPayload = {};
  for (const component of components) {
    const amounts: Partial<Record<SpendingLimitPeriod, number>> = {};
    for (const period of getOfferedPeriods(component)) {
      const value = values?.[component.type]?.[period];
      if (!isEmptyAmount(value)) {
        amounts[period] = Number(value);
      }
    }
    if (Object.keys(amounts).length > 0) {
      result[component.type] = amounts;
    }
  }
  return result;
};
