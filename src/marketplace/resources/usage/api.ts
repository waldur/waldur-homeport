import moment from 'moment-timezone';

import { getAll } from '@waldur/core/api';
import { formatDateTime } from '@waldur/core/dateUtils';
import { generateColors } from '@waldur/customer/divisions/utils';
import {
  getOffering,
  getResourcePlanPeriods,
} from '@waldur/marketplace/common/api';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';

import { UsageReportContext, ResourcePlanPeriod } from './types';

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
  getAll('/marketplace-component-usages/', { params: { resource_uuid } });

export const getOfferingComponentsAndUsages = async ({
  offering_uuid,
  marketplace_resource_uuid,
}: OrderItemResponse) => {
  const offering = await getOffering(offering_uuid);
  const components = offering.components.filter(
    (component) => component.billing_type === 'usage',
  );
  const usages = await getComponentUsages(marketplace_resource_uuid);
  const colors = generateColors(components.length, {
    colorStart: 0.25,
    colorEnd: 0.65,
    useEndAsStart: true,
  });
  return {
    components: components.sort((a, b) => a.name.localeCompare(b.name)),
    usages,
    colors,
  };
};
