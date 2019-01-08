import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';

import { getOffering } from '../common/api';
import { Offering } from '../types';
import { ResourceUsageForm } from './ResourceUsageForm';
import { PlanUnit } from './types';

export interface ResourceUsageContainerProps {
  offering_uuid: string;
  plan_unit: PlanUnit;
  submitting: boolean;
}

export const ResourceUsageContainer = (props: ResourceUsageContainerProps) => (
  <Query loader={getOffering} variables={props.offering_uuid}>
    {({ loading, erred, data }: {loading: boolean, erred: boolean, data: Offering}) => {
      if (loading) {
        return <LoadingSpinner/>;
      } else if (erred) {
        return <h3>{translate('Unable to load marketplace offering details.')}</h3>;
      } else if (data.components.filter(component => component.billing_type === 'usage').length === 0) {
        return <h3>{translate('Marketplace offering does not have any usage-based components.')}</h3>;
      } else {
        return (
          <ResourceUsageForm
            components={data.components}
            plan_unit={props.plan_unit}
            submitting={props.submitting}
          />
        );
      }
    }}
  </Query>
);
