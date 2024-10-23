import { DateTime } from 'luxon';

import { formatDateTime, parseDate } from '@waldur/core/dateUtils';
import {
  getComponentUsages,
  getComponentUserUsages,
  getProviderOffering,
  getPublicOffering,
  getProviderResourcePlanPeriods,
} from '@waldur/marketplace/common/api';

import { UsageReportContext, ResourcePlanPeriod } from './types';

export const getPeriodLabel = (
  period: Pick<ResourcePlanPeriod, 'start' | 'end' | 'plan_name'>,
) => {
  const startOfMonth = DateTime.now().startOf('month');
  const start =
    startOfMonth.diff(parseDate(period.start)).as('milliseconds') > 0
      ? formatDateTime(startOfMonth)
      : formatDateTime(period.start);
  const end = period.end && formatDateTime(period.end);
  if (end) {
    return `${period.plan_name} (from ${start} to ${end})`;
  } else {
    return `${period.plan_name} (from ${start})`;
  }
};

export const getProviderUsageComponents = async (
  params: UsageReportContext,
) => {
  let components = null;
  if (params.offering_uuid) {
    const offering = await getProviderOffering(params.offering_uuid);
    components = await getUsageBasedOfferingComponents(offering);
  }
  const periods = await getProviderResourcePlanPeriods(params.resource_uuid);
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

const getUsageBasedOfferingComponents = (offering) => {
  const components = offering.components.filter((component) =>
    // Allow to report usage for limit-based components
    ['usage', 'limit'].includes(component.billing_type),
  );
  return components.sort((a, b) => a.name.localeCompare(b.name));
};

export const getComponentsAndUsages = async (
  resource_uuid: string,
  offering: any,
  months: number,
  offering_uuid: string,
) => {
  if (!resource_uuid) {
    return { components: null, usages: null };
  }

  let components;
  if (!offering) {
    if (!offering_uuid) {
      throw new Error('Offering or offering_uuid is missing.');
    }
    try {
      offering = await getPublicOffering(offering_uuid);
    } catch (error) {
      throw new Error(`Error while getting offering, ${error.message}`);
    }
  }
  try {
    components = await getUsageBasedOfferingComponents(offering);
  } catch (error) {
    throw new Error(
      `Error while getting components for offering, ${error.message}`,
    );
  }

  const date_after = months
    ? DateTime.now().startOf('month').minus({ months }).toFormat('yyyy-MM-dd')
    : undefined;

  let usages;
  let userUsages;
  try {
    usages = await getComponentUsages(resource_uuid, date_after, {
      fields: ['type', 'usage', 'date'],
    });
    userUsages = await getComponentUserUsages(resource_uuid, date_after, {
      fields: ['component_type', 'usage', 'date'],
    });
  } catch (error) {
    throw new Error(
      `Error while getting usages for resource: ${resource_uuid}, ${error.message}`,
    );
  }

  return { components, usages, userUsages };
};
