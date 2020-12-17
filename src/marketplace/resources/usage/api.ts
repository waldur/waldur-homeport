import moment from 'moment-timezone';

import { getAll } from '@waldur/core/api';
import { formatDateTime } from '@waldur/core/dateUtils';
import {
  getOffering,
  getResourcePlanPeriods,
} from '@waldur/marketplace/common/api';

import {
  UsageReportContext,
  ResourcePlanPeriod,
  ComponentUsage,
} from './types';

export const getPeriodLabel = (
  period: Pick<ResourcePlanPeriod, 'start' | 'end' | 'plan_name'>,
) => {
  const startOfMonth = moment().startOf('month');
  const start =
    startOfMonth.diff(period.start) > 0
      ? formatDateTime(startOfMonth)
      : formatDateTime(period.start);
  const end = period.end && formatDateTime(period.end);
  if (end) {
    return `${period.plan_name} (from ${start} to ${end})`;
  } else {
    return `${period.plan_name} (from ${start})`;
  }
};

export const getUsageComponents = async (params: UsageReportContext) => {
  const offering = await getOffering(params.offering_uuid);
  const periods = await getResourcePlanPeriods(params.resource_uuid);
  const components = offering.components.filter(
    (component) => component.billing_type === 'usage',
  );
  const options =
    periods.length > 0
      ? periods.map((period) => ({
          label: getPeriodLabel(period),
          value: period,
        }))
      : [
          {
            label: 'Default plan',
          },
        ];
  return {
    components,
    periods: options,
  };
};

const getComponentUsages = (resource_uuid: string) =>
  getAll<ComponentUsage>('/marketplace-component-usages/', {
    params: { resource_uuid },
  });

const getUsageBasedOfferingComponents = async (offering_uuid: string) => {
  if (!offering_uuid) {
    return null;
  }
  const offering = await getOffering(offering_uuid);
  const components = offering.components.filter(
    (component) => component.billing_type === 'usage',
  );
  return components.sort((a, b) => a.name.localeCompare(b.name));
};

const getUsages = async (resource_uuid: string) =>
  resource_uuid ? await getComponentUsages(resource_uuid) : null;

export const getComponentsAndUsages = async (
  offering_uuid: string,
  resource_uuid: string,
) => {
  const components = await getUsageBasedOfferingComponents(offering_uuid);
  const usages = await getUsages(resource_uuid);
  return { components, usages };
};
