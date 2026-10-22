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

// Zero means "no limit", as for resource limits.
const positive = (value?: number | null) =>
  typeof value === 'number' && value > 0 ? value : undefined;

// Limits are monthly, in UTC months as the backend counts them: usage reported
// for an earlier month counts as none, e.g. before the agent's first report of
// a new month.
const getCurrentUsages = (row: ApiKeyRow, now = new Date()) =>
  row.usage_period?.slice(0, 7) === now.toISOString().slice(0, 7)
    ? row.current_usages
    : undefined;

export const getComponentUsage = (
  row: ApiKeyRow,
  component: KeyComponent,
  resourceLimits: Record<string, number>,
  now = new Date(),
): ComponentUsage => {
  const own = positive(row.limits?.[component.type]);
  const governing = positive(resourceLimits[component.type]);
  // No key can use more than its resource may, so the tighter limit is the one in force.
  const limit =
    own !== undefined && governing !== undefined
      ? Math.min(own, governing)
      : (own ?? governing);
  const used = getCurrentUsages(row, now)?.[component.type];
  // A limited key that reported nothing has used none of its limit.
  const ratio = limit !== undefined ? ((used ?? 0) / limit) * 100 : undefined;
  return {
    component,
    used,
    limit,
    // The applied limit is the resource's unless the key's own limit is the one in force.
    inherited: limit !== undefined && own !== limit,
    ratio,
    overLimit: ratio !== undefined && ratio > 100,
  };
};

/**
 * The key's limits on periods other than the month, as the backend measured
 * them. The month reading comes from getComponentUsage, which also falls back
 * to the resource's limit.
 */
export const getPeriodUsages = (
  row: ApiKeyRow,
  component: KeyComponent,
): ComponentUsage[] =>
  (row.spending_limit_status ?? [])
    .filter(
      (status) =>
        status.component_type === component.type && status.period !== 'month',
    )
    .map((status) => {
      // Key limits are above 0; guarded all the same.
      const ratio = status.limit > 0 ? (status.used / status.limit) * 100 : 100;
      return {
        component,
        period: status.period,
        used: status.used,
        limit: status.limit,
        inherited: false,
        ratio,
        overLimit: status.used > status.limit,
      };
    });

/** "Token cost", or "Token cost · Daily limit" for a limit other than the month's. */
export const getReadingLabel = (reading: ComponentUsage) =>
  reading.period
    ? translate('{component} · {limit}', {
        component: componentLabel(reading.component),
        limit: getSpendingLimitLabel(reading.period),
      })
    : componentLabel(reading.component);

/** Every reading of a component: the month's first, then the other periods' limits. */
export const getComponentReadings = (
  row: ApiKeyRow,
  component: KeyComponent,
  resourceLimits: Record<string, number>,
) => [
  getComponentUsage(row, component, resourceLimits),
  ...getPeriodUsages(row, component),
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
  resourceLimits: Record<string, number>,
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
