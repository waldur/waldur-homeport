import { Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  getSpendingLimitLabel,
  SpendingLimitPeriod,
} from '@/marketplace/common/spendingLimits';

import { ApiKeyRow, KeyComponent } from './types';

const componentLabel = (component: KeyComponent) =>
  component.name || component.type;

export interface ComponentUsage {
  component: KeyComponent;
  // Set on a limit other than the month's; the month reading has none.
  period?: SpendingLimitPeriod;
  used?: number;
  limit?: number;
  inherited: boolean;
  ratio?: number;
  overLimit: boolean;
}

/** The resource's spending limits, `{component_type: {period: amount}}`. */
export type ResourceSpendingLimits = Resource['spending_limits'] | undefined;

// Zero means "no limit", as for resource limits.
const positive = (value?: number | null) =>
  typeof value === 'number' && value > 0 ? value : undefined;

/**
 * The limit in force on a key for one period: the tighter of its own and its
 * resource's spending limit for the period, as no key can use more than its
 * resource may. It is inherited when the resource's is the one in force: the
 * key has no limit of its own for the period, or its own is higher. A tie
 * counts as the key's own.
 */
const getLimitInForce = (own?: number, resource?: number) => {
  const limit =
    own !== undefined && resource !== undefined
      ? Math.min(own, resource)
      : (own ?? resource);
  return { limit, inherited: limit !== undefined && own !== limit };
};

// Limits are monthly, in UTC months as the backend counts them: usage reported
// for an earlier month counts as none, e.g. before the agent's first report of
// a new month.
const getCurrentUsages = (row: ApiKeyRow, now = new Date()) =>
  row.usage_period?.slice(0, 7) === now.toISOString().slice(0, 7)
    ? row.current_usages
    : undefined;

/** The month's usage of a component against the month limit in force on the key. */
export const getComponentUsage = (
  row: ApiKeyRow,
  component: KeyComponent,
  resourceLimits: ResourceSpendingLimits,
  now = new Date(),
): ComponentUsage => {
  const { limit, inherited } = getLimitInForce(
    positive(
      row.spending_limits?.[component.type]?.month ??
        row.limits?.[component.type],
    ),
    positive(resourceLimits?.[component.type]?.month),
  );
  const used = getCurrentUsages(row, now)?.[component.type];
  // A limited key that reported nothing has used none of its limit.
  const ratio = limit !== undefined ? ((used ?? 0) / limit) * 100 : undefined;
  return {
    component,
    used,
    limit,
    inherited,
    ratio,
    overLimit: ratio !== undefined && ratio > 100,
  };
};

/**
 * The key's limits on periods other than the month, with the usage the
 * backend measured for them, each against the limit in force for its period.
 * Only the key's own limits are measured, so a period the key has no limit of
 * its own on has no reading; the month reading comes from getComponentUsage,
 * which reads the month's usage either way.
 */
export const getPeriodUsages = (
  row: ApiKeyRow,
  component: KeyComponent,
  resourceLimits: ResourceSpendingLimits,
): ComponentUsage[] =>
  (row.spending_limit_status ?? [])
    .filter(
      (status) =>
        status.component_type === component.type && status.period !== 'month',
    )
    .map((status) => {
      const { limit, inherited } = getLimitInForce(
        positive(status.limit),
        positive(resourceLimits?.[component.type]?.[status.period]),
      );
      // Key limits are above 0; guarded all the same.
      const ratio = limit ? (status.used / limit) * 100 : 100;
      return {
        component,
        period: status.period,
        used: status.used,
        limit: limit ?? status.limit,
        inherited,
        ratio,
        overLimit: limit !== undefined && status.used > limit,
      };
    });

/**
 * "Token cost · Daily limit", "Token cost · Monthly limit", or just "Token
 * cost" for the month's usage of a component with no month limit.
 */
export const getReadingLabel = (reading: ComponentUsage) => {
  // The month reading carries no period; its limit, own or inherited, is the month's.
  const period =
    reading.period ?? (reading.limit !== undefined ? 'month' : undefined);
  return period
    ? translate('{component} · {limit}', {
        component: componentLabel(reading.component),
        limit: getSpendingLimitLabel(period),
      })
    : componentLabel(reading.component);
};

/** Every reading of a component: the month's first, then the other periods' limits. */
export const getComponentReadings = (
  row: ApiKeyRow,
  component: KeyComponent,
  resourceLimits: ResourceSpendingLimits,
) => [
  getComponentUsage(row, component, resourceLimits),
  ...getPeriodUsages(row, component, resourceLimits),
];

// Colours a meter by how close the key is to its limit. A key's own limit pauses
// the key once reached; an inherited one is the resource's, which limits the
// whole resource instead.
export const getMeterVariant = (ratio?: number) =>
  ratio === undefined
    ? undefined
    : ratio >= 100
      ? 'danger'
      : ratio >= 80
        ? 'warning'
        : undefined;

// The limit closest to being reached, of any component and period, so a
// nearly exhausted key stands out.
export const getHeadlineUsage = (
  row: ApiKeyRow,
  components: KeyComponent[],
  resourceLimits: ResourceSpendingLimits,
) =>
  components
    .flatMap((component) =>
      getComponentReadings(row, component, resourceLimits),
    )
    .filter((reading) => reading.ratio !== undefined)
    .reduce<ComponentUsage | undefined>(
      (worst, reading) =>
        !worst || reading.ratio! > worst.ratio! ? reading : worst,
      undefined,
    );
