import { Resource } from 'waldur-js-client';

import {
  getPrepaidDurationMonths,
  getPrepaidTotalComponentTypes,
  PrepaidTotalResource,
} from '@/marketplace/common/prepaidTotalDisplay';

type QuotaResource = Pick<
  Resource,
  'limits' | 'limit_usage' | 'current_usages' | 'created' | 'end_date'
> &
  PrepaidTotalResource;

/**
 * A resource's limit-based quota summed over its components: what it has used
 * against what it may use.
 *
 * An offering that shows prepaid limits as a total sends a prepaid
 * component's usage for the whole subscription in limit_usage, while limits
 * keeps the monthly figure ordered. Its cap is then that figure times the
 * subscription's months, as on the resource page. Without the dates there is
 * no span to multiply by, so the component sets this month's usage against
 * its monthly limit instead.
 */
export const getQuotaTotals = (
  resource: QuotaResource,
): { usedTotal: number; limitTotal: number } => {
  const limits = (resource.limits || {}) as Record<string, number>;
  const limitUsage = (resource.limit_usage || {}) as Record<string, number>;
  const currentUsages = (resource.current_usages || {}) as Record<
    string,
    number
  >;
  const totalTypes = getPrepaidTotalComponentTypes(resource);
  const months = getPrepaidDurationMonths(resource.created, resource.end_date);
  const isTotal = (type: string) => totalTypes.includes(type);

  const limitTotal = Object.entries(limits).reduce(
    (sum, [type, value]) =>
      sum + (isTotal(type) && months ? value * months : value),
    0,
  );
  const usedTotal = Object.entries(limitUsage).reduce(
    (sum, [type, value]) =>
      sum + (isTotal(type) && !months ? currentUsages[type] || 0 : value),
    0,
  );
  return { usedTotal, limitTotal };
};
