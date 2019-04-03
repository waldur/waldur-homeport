import { formatDateTime } from '@waldur/core/dateUtils';
import { getOffering, getResourcePlanPeriods } from '@waldur/marketplace/common/api';

import { UsageReportContext, ResourcePlanPeriod } from './types';

const getPeriodLabel = (period: ResourcePlanPeriod) => {
  const start = formatDateTime(period.start);
  const end = period.end && formatDateTime(period.end);
  if (end) {
    return `${period.plan_name} (from ${start} to ${end})`;
  } else {
    return `${period.plan_name} (from ${start})`;
  }
};

// tslint:disable-next-line: variable-name
export const getUsageComponents = async (params: UsageReportContext) => {
  const offering = await getOffering(params.offering_uuid);
  const periods = await getResourcePlanPeriods(params.resource_uuid);
  const components = offering.components.filter(component => component.billing_type === 'usage');
  const options = periods.length > 0 ? periods.map(period => ({
    label: getPeriodLabel(period),
    value: period,
  })) : [{
    label: 'Default plan',
  }];
  return {
    components,
    periods: options,
  };
};
