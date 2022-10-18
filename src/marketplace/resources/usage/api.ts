import { DateTime } from 'luxon';

import { formatDateTime, parseDate } from '@waldur/core/dateUtils';
import {
  getComponentUsages,
  getResourceOffering,
  getResourcePlanPeriods,
} from '@waldur/marketplace/common/api';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';
import { parseSlurmUsage } from '@waldur/slurm/details/utils';

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

export const getUsageComponents = async (params: UsageReportContext) => {
  let components = null;
  if (params.offering_uuid) {
    const offering = await getResourceOffering(params.resource_uuid);
    components = await getUsageBasedOfferingComponents(offering);
  }
  const periods = await getResourcePlanPeriods(params.resource_uuid);
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

export const getComponentsAndUsages = async (resource_uuid: string) => {
  if (!resource_uuid) {
    return { components: null, usages: null };
  }
  const offering = await getResourceOffering(resource_uuid);
  const components = await getUsageBasedOfferingComponents(offering);
  const date_after = DateTime.now()
    .startOf('month')
    .minus({ months: 12 })
    .toFormat('yyyy-MM-dd');
  let usages = await getComponentUsages(resource_uuid, date_after);
  if (offering.type === SLURM_PLUGIN) {
    usages = usages.map(parseSlurmUsage);
  }
  return { components, usages };
};
