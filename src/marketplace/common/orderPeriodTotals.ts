import { DateTime } from 'luxon';
import {
  marketplaceProviderResourcesOrderPeriodUsageList,
  marketplaceResourcesOrderPeriodUsageList,
  OfferingComponent,
  OrderPeriodUsage,
  Resource,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { TENANT_TYPE } from '@/openstack/constants';

import { formatMonthCount } from './prepaidTotalDisplay';

/**
 * Whether an offering lets its resources show limit-based components for the
 * whole order period, next to the usual per-period view.
 */
export const showsOrderPeriodTotals = (
  pluginOptions: Resource['offering_plugin_options'] | null | undefined,
): boolean => pluginOptions?.show_order_period_totals === true;

/**
 * Whether resources of this offering type can show order-period totals.
 * OpenStack tenants cannot: their panel shows live quota usage rather than
 * reported usage, and their components are counts that do not add up.
 */
export const supportsOrderPeriodTotals = (
  offeringType: string | null | undefined,
): boolean => offeringType !== TENANT_TYPE;

/**
 * The components the backend totals for the order period: limit-based ones
 * that are not prepaid, which have a total view of their own, and whose limit
 * refills monthly. The whole-order limit is the monthly one times the months,
 * which is wrong for a quarterly or annual limit, and a total limit already
 * covers the order. An unset period reads as monthly, as in the backend.
 */
export const getOrderPeriodComponentTypes = (
  components: OfferingComponent[],
): string[] =>
  (components || [])
    .filter(
      (c) =>
        c.billing_type === 'limit' &&
        !c.is_prepaid &&
        (!c.limit_period || c.limit_period === 'month'),
    )
    .map((c) => c.type);

/** "Jul 2026 – Jun 2027": the months the order runs. */
export const formatOrderPeriod = (created: string, endDate: string): string => {
  const format = (value: string) =>
    DateTime.fromISO(value, { setZone: true }).toLocaleString({
      month: 'short',
      year: 'numeric',
    });
  return `${format(created)} – ${format(endDate)}`;
};

/** "monthly limit × 12 months": how the whole-order limit is calculated. */
export const formatOrderPeriodHint = (months: number): string =>
  translate('monthly limit × {months}', { months: formatMonthCount(months) });

/**
 * A resource's usage for the whole order period, from the provider route in
 * the provider view: a provider-only user gets 404 on the consumer route.
 */
export const fetchOrderPeriodUsage = (
  resourceUuid: string,
  providerView = false,
): Promise<OrderPeriodUsage[]> =>
  (providerView
    ? marketplaceProviderResourcesOrderPeriodUsageList
    : marketplaceResourcesOrderPeriodUsageList)({
    path: { uuid: resourceUuid },
  }).then(({ data }) => data);

interface OrderPeriodResource {
  created?: string;
  end_date?: string | null;
  limits?: Record<string, number>;
  limit_usage?: Record<string, number>;
  spending_limit_status?: { component_type: string }[];
}

/**
 * The billing months an order touches: from the month it was created to the
 * month of its end date, both included, at least one. Billing periods are UTC
 * calendar months, and the backend sums one peak per billing month, so an
 * order from 15 Jun to 14 Oct touches 5 of them and its limit has to cover 5.
 * Undefined without both dates.
 */
export const getOrderBillingMonths = (
  created: string | null | undefined,
  endDate: string | null | undefined,
): number | undefined => {
  if (!created || !endDate) {
    return undefined;
  }
  const start = DateTime.fromISO(created, { zone: 'utc' });
  const end = DateTime.fromISO(endDate, { zone: 'utc' });
  if (!start.isValid || !end.isValid) {
    return undefined;
  }
  const months = (end.year - start.year) * 12 + (end.month - start.month) + 1;
  return Math.max(1, months);
};

/**
 * The resource as the whole-order view shows it: each totalled component's
 * usage summed over the order, against its current limit times the billing
 * months the order touches. Undefined when the order has no end date, so the
 * usual view stays.
 *
 * Only the components both sides agree on are totalled: limit-based in the
 * offering (``componentTypes``) and returned by the backend, which resolves
 * them under the resource's plan. Their spending limits are monthly, so they
 * are left out of the whole-order view. ``types`` lists what was totalled.
 */
export const getOrderPeriodResource = <T extends OrderPeriodResource>(
  resource: T,
  totals: OrderPeriodUsage[],
  componentTypes: string[],
): { resource: T; months: number; types: string[] } | undefined => {
  const months = getOrderBillingMonths(resource.created, resource.end_date);
  if (!months) {
    return undefined;
  }
  const limits = { ...resource.limits };
  const limitUsage = { ...resource.limit_usage };
  const types: string[] = [];
  for (const { type, usage } of totals) {
    if (!componentTypes.includes(type)) {
      continue;
    }
    types.push(type);
    limitUsage[type] = usage;
    if (limits[type] != null) {
      limits[type] = limits[type] * months;
    }
  }
  const view: T = { ...resource, limits, limit_usage: limitUsage };
  if (resource.spending_limit_status) {
    view.spending_limit_status = resource.spending_limit_status.filter(
      (status) => !types.includes(status.component_type),
    );
  }
  return { resource: view, months, types };
};
