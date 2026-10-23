/**
 * Per-period limits of a resource API key.
 *
 * A key's limits have the shape of its resource's spending limits
 * (`{component_type: {period: amount}}`): `month` on every component the
 * resource's plan charges for, the other periods where the component offers
 * them to resources, and each capped by the resource's own limits for the
 * period and every longer one. They mirror
 * `marketplace/api_key_spending_limits.py` in waldur-mastermind; the backend
 * has the final word.
 */
import { Offering, Resource } from 'waldur-js-client';

import {
  getOfferedPeriods,
  isEmptyAmount,
  SPENDING_LIMIT_PERIODS,
  SpendingLimitFieldBounds,
  SpendingLimitFormValues,
  SpendingLimitPeriod,
  SpendingLimitsPayload,
} from '@/marketplace/common/spendingLimits';
import {
  findResourcePlan,
  resolvePlanComponents,
} from '@/marketplace/details/plan/effectiveComponents';

import { KeyComponent } from './types';

/** A component as the key dialog's limit fields take it: its periods carry the key's maximum. */
export type KeyLimitComponent = Omit<KeyComponent, 'measured_unit'> & {
  name: string;
  measured_unit?: string;
  spending_limit_periods: Record<string, SpendingLimitFieldBounds>;
};

type Limits = Resource['spending_limits'] | null | undefined;

/**
 * The periods a key may limit on a component, shortest first: `month`, and,
 * where the provider reports each key's usage per day, the component's own
 * periods if it is billed by usage. Without per-day usage, day and week limits
 * would never be reached, and quarter and year would count the current month
 * alone.
 */
const getComponentKeyPeriods = (
  component: KeyComponent,
  dailyUsage = true,
): SpendingLimitPeriod[] => {
  const own =
    dailyUsage && component.billing_type === 'usage'
      ? Object.keys(component.spending_limit_periods ?? {})
      : [];
  return SPENDING_LIMIT_PERIODS.filter(
    (period) => period === 'month' || own.includes(period),
  );
};

/**
 * The offering's components as billed under the resource's plan, each with
 * the periods a key may limit on it (`keyPeriods`), as the backend offers
 * them:
 *
 * - none on any component when the offering turns key limits off
 *   (`plugin_options.api_key_limits`, on unless set to false);
 * - only `month` unless the offering declares per-key daily usage
 *   (`plugin_options.api_key_daily_usage`, off unless set).
 *
 * The plan's price does not matter: a LiteLLM cost cap is priced at zero, as
 * the plan bills a limit component on the limit itself, yet it is what a
 * key's spend is capped on.
 *
 * A plan may bill a usage component by limit, and then it takes no spending
 * limit; the backend reads the periods a key may limit from the plan, so the
 * dialogs must too. Every component stays, for its usage readings.
 */
export const getResourceKeyComponents = (
  offering:
    Pick<Offering, 'components' | 'plans' | 'plugin_options'> | undefined,
  planUuid: string | null | undefined,
): KeyComponent[] => {
  const options = offering?.plugin_options;
  const limitsOffered = options?.api_key_limits !== false;
  const dailyUsage = options?.api_key_daily_usage === true;
  const plan = findResourcePlan(offering?.plans, planUuid);
  return resolvePlanComponents(offering?.components ?? [], plan).map(
    (component) => ({
      ...component,
      keyPeriods: limitsOffered
        ? getComponentKeyPeriods(component, dailyUsage)
        : [],
    }),
  );
};

/**
 * The most a key may set for a period: the resource's lowest limit on the
 * period or any longer one, as a key can never spend more in a day than its
 * resource may in the month. The provider's maximum is for resources and does
 * not apply.
 */
const getKeyMaximum = (
  resourceLimits: Limits,
  componentType: string,
  period: SpendingLimitPeriod,
): number | undefined => {
  const caps = SPENDING_LIMIT_PERIODS.slice(
    SPENDING_LIMIT_PERIODS.indexOf(period),
  )
    .map((longer) => resourceLimits?.[componentType]?.[longer])
    .filter((cap) => !isEmptyAmount(cap))
    .map(Number);
  return caps.length ? Math.min(...caps) : undefined;
};

/**
 * The periods a key may limit on each component, each with the most a new
 * amount may be (getKeyMaximum). As in the backend, a limit the key already
 * holds is accepted again only as it is (the fields' `keepHeld`): above a
 * resource limit lowered since, or on a period no longer offered, which stays
 * shown as `heldOnly` so it can be kept or cleared. A component with no period
 * to limit and no limit held gets no fields.
 */
export const getKeyLimitComponents = (
  components: KeyComponent[],
  resourceLimits: Limits,
  held?: Limits,
): KeyLimitComponent[] =>
  components.flatMap((component) => {
    const offered = new Set<SpendingLimitPeriod>(
      component.keyPeriods ?? getComponentKeyPeriods(component),
    );
    const own = held?.[component.type] ?? {};
    const periods: Record<string, SpendingLimitFieldBounds> = {};
    for (const period of SPENDING_LIMIT_PERIODS) {
      const isHeld = !isEmptyAmount(own[period]);
      if (!offered.has(period) && !isHeld) continue;
      const maximum = getKeyMaximum(resourceLimits, component.type, period);
      periods[period] = {
        ...(maximum === undefined ? {} : { maximum }),
        ...(offered.has(period) ? {} : { heldOnly: true }),
      };
    }
    if (Object.keys(periods).length === 0) {
      return [];
    }
    return [
      {
        ...component,
        name: component.name || component.type,
        measured_unit: component.measured_unit || undefined,
        spending_limit_periods: periods,
      },
    ];
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
