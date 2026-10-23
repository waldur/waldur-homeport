import { DateTime } from 'luxon';
import {
  LimitPeriodEnum,
  OfferingComponent,
  Resource,
  SpendingLimitStatus,
} from 'waldur-js-client';

import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import {
  formatSpendingAmount,
  getSpendingLimitLabel,
} from '@/marketplace/common/spendingLimits';
import { TENANT_TYPE } from '@/openstack/constants';
import { VMWARE_VM } from '@/vmware/constants';

import { ResourceDisplayLimits } from '../types';
import { getBillingTypeLabelOrDash } from '../usage/utils';

import { QuotaCell } from './QuotaCell';
import { QuotaSingleView } from './QuotaSingleView';

interface ResourceComponentItemProps {
  component: OfferingComponent;
  resource: any;
  // One period's spending limit on the component, shown instead of its usage.
  spendingLimit?: SpendingLimitStatus;
  // The usage is this month's, named so beside the component's limits.
  thisMonth?: boolean;
  // Nothing is reported for this month yet, so this month's usage is 0.
  noUsageThisMonth?: boolean;
  expanded?: boolean;
  stacked?: boolean;
}

export interface ResourceComponentEntry {
  key: string;
  component: OfferingComponent;
  spendingLimit?: SpendingLimitStatus;
  thisMonth?: boolean;
  noUsageThisMonth?: boolean;
}

type EntriesResource = Partial<
  Pick<Resource, 'spending_limit_status' | 'limits'>
> &
  ResourceDisplayLimits;

/**
 * The limit a usage-based component has of its own: one the resource stores,
 * or a resource option shown as one (display_limits). It is not a spending
 * limit, and shows only on the component's own entry.
 */
const getUsageComponentLimit = (
  component: OfferingComponent,
  resource: EntriesResource,
) =>
  component.billing_type === 'usage'
    ? (resource.limits?.[component.type] ??
      resource.display_limits?.[component.type])
    : undefined;

/**
 * Whether the component's latest report predates this month. current_usages
 * keeps the latest usage row, whichever month it is for: the backend does not
 * reset it when a month begins. With no report since the 1st (UTC, as billing
 * periods are), nothing is reported for this month yet. A usage row cannot be
 * reported ahead, so a report this month is the only way to have one.
 */
export const isReportedBeforeThisMonth = (
  reportedAt: string | null | undefined,
  now: DateTime = DateTime.utc(),
) =>
  Boolean(reportedAt) &&
  DateTime.fromISO(reportedAt, { zone: 'utc' }) < now.toUTC().startOf('month');

/**
 * What the resource's components panel lists: each component, followed by
 * one entry per period it has a spending limit for, as a key's row does.
 *
 * A component's own usage is this month's. Where it has a month limit, that
 * entry shows the same figure, so the component's own is left out unless it
 * carries a limit of its own. Beside limits it is named as this month's, so
 * it does not read as all time; and when nothing is reported for this month
 * yet, its figure is 0 rather than an earlier month's usage.
 */
export const getResourceComponentEntries = (
  resource: EntriesResource,
  components: OfferingComponent[],
): ResourceComponentEntry[] =>
  components.flatMap((component) => {
    const limits = (resource.spending_limit_status ?? [])
      .filter((status) => status.component_type === component.type)
      .map((status) => ({
        key: `${component.type}-${status.period}`,
        component,
        spendingLimit: status,
      }));
    if (!limits.length) {
      return [{ key: component.type, component }];
    }
    if (
      limits.some((entry) => entry.spendingLimit.period === 'month') &&
      !getUsageComponentLimit(component, resource)
    ) {
      return limits;
    }
    // Every status of a component carries its latest report time.
    const own: ResourceComponentEntry = isReportedBeforeThisMonth(
      limits[0].spendingLimit.last_reported_at,
    )
      ? {
          key: component.type,
          component,
          thisMonth: true,
          noUsageThisMonth: true,
        }
      : { key: component.type, component, thisMonth: true };
    return [own, ...limits];
  });

const normalize = (value: number, factor: number) => {
  const result = (value || 0) / (factor || 1);
  return Number.isInteger(result) ? result.toFixed() : result.toFixed(2);
};

const UNIT_CONVERSIONS: Record<string, Record<number, string>> = {
  MB: { 1024: 'GB', 1048576: 'TB' },
  GB: { 1024: 'TB' },
  KB: { 1024: 'MB', 1048576: 'GB' },
};

// Offering types whose components declare the unit a value is shown in, with
// `factor` only converting the stored amount into it: VMware and OpenStack
// tenants store RAM and disk in MiB under measured_unit "GB" and factor 1024.
// Promoting that unit again would render gigabytes as terabytes.
const OFFERING_TYPES_WITH_DISPLAY_UNITS = [TENANT_TYPE, VMWARE_VM];

export const getDisplayUnit = (
  measuredUnit: string | undefined,
  factor: number | null | undefined,
  offeringType?: string,
): string => {
  if (!measuredUnit) return '';
  if (OFFERING_TYPES_WITH_DISPLAY_UNITS.includes(offeringType)) {
    return measuredUnit;
  }
  if (!factor || factor === 1) return measuredUnit;
  return UNIT_CONVERSIONS[measuredUnit]?.[factor] ?? measuredUnit;
};

export const getQuotaCellProps = (
  component: OfferingComponent,
  resource: Pick<
    Resource,
    'current_usages' | 'limits' | 'limit_usage' | 'offering_type'
  > &
    ResourceDisplayLimits,
) => {
  if (!component) {
    return { usage: '', limit: '', title: '', units: '', displayUnit: '' };
  }
  const displayUnit = getDisplayUnit(
    component.measured_unit,
    component.factor,
    resource.offering_type,
  );
  // OpenStack tenant usage is live backend quota that legitimately decreases
  // (volumes deleted, VMs stopped), so it must reflect current consumption and
  // stay in step with the Quotas panel. limit_usage is a monthly high-watermark
  // that can only grow within a billing period — correct for other limit-based
  // offerings, misleading here. Fall back to the live current_usages instead.
  const isTenant = resource.offering_type === TENANT_TYPE;
  // A usage-based component has a limit only when the resource stores one or
  // a resource option is shown as one (display_limits).
  const usageLimit = getUsageComponentLimit(component, resource);
  return {
    usage:
      !isTenant &&
      component.billing_type === 'limit' &&
      resource.limit_usage?.[component.type] != null
        ? normalize(resource.limit_usage[component.type], component.factor)
        : normalize(
            resource.current_usages?.[component.type],
            component.factor,
          ),
    limit:
      component.billing_type === 'usage'
        ? usageLimit
          ? normalize(usageLimit, component.factor)
          : null
        : component.billing_type === 'limit' ||
            (component.billing_type === 'one' && component.is_prepaid)
          ? normalize(resource.limits?.[component.type], component.factor)
          : null,
    title: component.name,
    displayUnit,
    units: displayUnit,
  };
};

export const getSpendingLimitCellProps = (
  component: OfferingComponent,
  status: SpendingLimitStatus,
  offeringType?: string,
) => {
  const displayUnit = getDisplayUnit(
    component.measured_unit,
    component.factor,
    offeringType,
  );
  return {
    usage: formatSpendingAmount(status.used),
    limit: formatSpendingAmount(status.limit),
    title: `${component.name || component.type} · ${getSpendingLimitLabel(status.period)}`,
    displayUnit,
    units: displayUnit,
  };
};

// When a period's usage starts from zero, as the "Resets" detail of the
// expanded view says it. An all-time limit has no reset time.
export const getResetsValue = (status: SpendingLimitStatus) =>
  !status.resets_at
    ? translate('Never')
    : new Date(status.resets_at).getTime() <= Date.now()
      ? translate('Shortly')
      : translate('{relative}, on {date}', {
          relative: formatRelative(status.resets_at),
          date: formatMediumDateTime(status.resets_at),
        });

// An all-time limit has no reset time (waldur/waldur-mastermind#841).
export const getResetsText = (status: SpendingLimitStatus) =>
  !status.resets_at
    ? translate('Never resets')
    : new Date(status.resets_at).getTime() <= Date.now()
      ? translate('Resets shortly')
      : translate('Resets {relative}, on {date}', {
          relative: formatRelative(status.resets_at),
          date: formatMediumDateTime(status.resets_at),
        });

const limitPeriodMap: Record<LimitPeriodEnum, string> = {
  total: translate('Total'),
  quarterly: translate('Quarterly'),
  annual: translate('Annual'),
  month: translate('Monthly'),
};

export const ResourceComponentItem = ({
  component,
  resource,
  spendingLimit,
  thisMonth = false,
  noUsageThisMonth = false,
  expanded = false,
  stacked = false,
}: ResourceComponentItemProps) => {
  if (spendingLimit) {
    const props = getSpendingLimitCellProps(
      component,
      spendingLimit,
      resource.offering_type,
    );
    return expanded ? (
      <QuotaSingleView
        usage={props.usage}
        limit={props.limit}
        title={props.title}
        displayUnit={props.displayUnit}
        resets={getResetsValue(spendingLimit)}
        stacked={stacked}
      />
    ) : (
      <QuotaCell {...props} description={getResetsText(spendingLimit)} />
    );
  }

  const cellProps = getQuotaCellProps(component, resource);
  const props = thisMonth
    ? {
        ...cellProps,
        usage: noUsageThisMonth ? '0' : cellProps.usage,
        title: `${component.name || component.type} · ${translate('This month')}`,
      }
    : cellProps;

  const billingType = getBillingTypeLabelOrDash(component.billing_type);
  const limitPeriod = component.limit_period;

  const description = props.displayUnit
    ? `${billingType} · ${translate('Measured in')}: ${props.displayUnit}`
    : billingType;

  if (expanded) {
    return (
      <QuotaSingleView
        usage={props.usage}
        limit={props.limit}
        title={props.title}
        billingType={billingType}
        displayUnit={props.displayUnit}
        stacked={stacked}
        limitFrequency={
          component.billing_type === 'limit' &&
          (limitPeriodMap[limitPeriod as string] || translate('Monthly'))
        }
      />
    );
  }

  return <QuotaCell {...props} description={description} />;
};
