import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';
import { getOffering, getResourcePlanPeriods } from '@waldur/marketplace/common/api';

import { ResourceUsageForm } from './ResourceUsageForm';
import { UsageReportContext, ResourcePlanPeriod } from './types';

export interface ResourceUsageContainerProps {
  params: UsageReportContext;
  submitting: boolean;
}

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
const getUsageComponents = async (params: UsageReportContext) => {
  const offering = await getOffering(params.offering_uuid);
  const periods = await getResourcePlanPeriods(params.resource_uuid);
  const components = offering.components.filter(component => component.billing_type === 'usage');
  const options = periods.length > 0 ? periods.map(period => ({
    label: getPeriodLabel(period),
    value: period.start,
  })) : [{
    label: 'Default plan',
  }];
  return {
    components,
    periods: options,
  };
};

export const ResourceUsageContainer = (props: ResourceUsageContainerProps) => (
  <Query loader={getUsageComponents} variables={props.params}>
    {({ loading, error, data }) => {
      if (loading) {
        return <LoadingSpinner/>;
      } else if (error) {
        return <h3>{translate('Unable to load marketplace offering details.')}</h3>;
      } else if (data.components.length === 0) {
        return <h3>{translate('Marketplace offering does not have any usage-based components.')}</h3>;
      } else {
        return (
          <ResourceUsageForm
            components={data.components}
            periods={data.periods}
            submitting={props.submitting}
          />
        );
      }
    }}
  </Query>
);
