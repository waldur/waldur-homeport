import { LimitPeriodEnum, OfferingComponent, Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { TENANT_TYPE } from '@/openstack/constants';

import { getBillingTypeLabel } from '../usage/utils';

import { QuotaCell } from './QuotaCell';
import { QuotaSingleView } from './QuotaSingleView';

interface ResourceComponentItemProps {
  component: OfferingComponent;
  resource: any;
  expanded?: boolean;
}

const normalize = (value: number, factor: number) => {
  const result = (value || 0) / (factor || 1);
  return Number.isInteger(result) ? result.toFixed() : result.toFixed(2);
};

const UNIT_CONVERSIONS: Record<string, Record<number, string>> = {
  MB: { 1024: 'GB', 1048576: 'TB' },
  GB: { 1024: 'TB' },
  KB: { 1024: 'MB', 1048576: 'GB' },
};

export const getDisplayUnit = (
  measuredUnit: string | undefined,
  factor: number | null | undefined,
  offeringType?: string,
): string => {
  if (!measuredUnit) return '';
  // For tenants, the measured unit is already in human-readable form
  // The `factor` field is for internal use only
  if (offeringType === TENANT_TYPE) return measuredUnit;
  if (!factor || factor === 1) return measuredUnit;
  return UNIT_CONVERSIONS[measuredUnit]?.[factor] ?? measuredUnit;
};

export const getQuotaCellProps = (
  component: OfferingComponent,
  resource: Pick<
    Resource,
    'current_usages' | 'limits' | 'limit_usage' | 'offering_type'
  >,
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
      (component.billing_type === 'usage' && resource.limits[component.type]) ||
      component.billing_type === 'limit' ||
      (component.billing_type === 'one' && component.is_prepaid)
        ? normalize(resource.limits[component.type], component.factor)
        : null,
    title: component.name,
    displayUnit,
    units: displayUnit,
  };
};

const limitPeriodMap: Record<LimitPeriodEnum, string> = {
  total: translate('Total'),
  quarterly: translate('Quarterly'),
  annual: translate('Annual'),
  month: translate('Monthly'),
};

export const ResourceComponentItem = ({
  component,
  resource,
  expanded = false,
}: ResourceComponentItemProps) => {
  const props = getQuotaCellProps(component, resource);

  const billingType = getBillingTypeLabel(component.billing_type);
  const limitPeriod = component.limit_period;

  const description = props.displayUnit
    ? `${billingType} · ${translate('Measured in')}: ${props.displayUnit}`
    : billingType;

  if (expanded) {
    return (
      <QuotaSingleView
        {...props}
        billingType={billingType}
        displayUnit={props.displayUnit}
        limitFrequency={
          component.billing_type === 'limit' &&
          (limitPeriodMap[limitPeriod as string] || translate('Monthly'))
        }
      />
    );
  }

  return <QuotaCell {...props} description={description} />;
};
