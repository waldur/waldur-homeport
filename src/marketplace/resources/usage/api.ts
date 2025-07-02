import { DateTime } from 'luxon';
import {
  marketplaceProviderOfferingsRetrieve,
  marketplaceProviderResourcesPlanPeriodsList,
  OfferingComponent,
} from 'waldur-js-client';

import { formatDateTime, parseDate } from '@waldur/core/dateUtils';

import { ResourcePlanPeriod, UsageReportContext } from './types';

export const getPeriodRange = (
  period: Pick<ResourcePlanPeriod, 'start' | 'end' | 'plan_name'>,
) => {
  const startOfMonth = DateTime.now().startOf('month');
  const start =
    startOfMonth.diff(parseDate(period.start)).as('milliseconds') > 0
      ? startOfMonth
      : parseDate(period.start);
  const end = period.end && parseDate(period.end);
  return { start, end };
};

const getPeriodLabel = (
  period: Pick<ResourcePlanPeriod, 'start' | 'end' | 'plan_name'>,
) => {
  const periodRange = getPeriodRange(period);
  const start = formatDateTime(periodRange.start);
  const end = periodRange.end && formatDateTime(periodRange.end);
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
    const offering = await marketplaceProviderOfferingsRetrieve({
      path: { uuid: params.offering_uuid },
    }).then((response) => response.data);
    components = getUsageBasedOfferingComponents(offering.components);
  }
  const periods = await marketplaceProviderResourcesPlanPeriodsList({
    path: { uuid: params.resource_uuid },
  }).then((r) => r.data);
  const options =
    periods.length > 0
      ? periods.map((period) => ({
          // @ts-ignore
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

const getUsageBasedOfferingComponents = (components: OfferingComponent[]) => {
  return components
    .filter((component) =>
      // Allow to report usage for limit-based components
      ['usage', 'limit'].includes(component.billing_type),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
};
