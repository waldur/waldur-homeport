import classNames from 'classnames';
import React, { useMemo } from 'react';
import { PlanUsageResponse } from 'waldur-js-client';

import { Category, Offering } from '@/marketplace/types';
import { useToolbarActions } from '@/navigation/context';

import { OFFERING_CUSTOMERS_LIST_FILTER } from '../expandable/constants';

import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';

interface OfferingDetailsProps {
  offering: Offering;
  category: Category;
  plansUsage: PlanUsageResponse[];
  refetch(): void;
  tabSpec;
}

export const OfferingDetails: React.FC<OfferingDetailsProps> = (props) => {
  useToolbarActions(
    props.offering.integration_status.length > 0 ? (
      <ConnectionStatusIndicator status={props.offering.integration_status} />
    ) : null,
    [props.offering],
  );

  const uniqueFormId = useMemo(
    () => `${OFFERING_CUSTOMERS_LIST_FILTER}-${props.offering.uuid}`,
    [props.offering],
  );

  return props.tabSpec ? (
    <div
      className={classNames(
        'provider-offering',
        props.offering.state === 'Unavailable' && 'disabled-view',
      )}
    >
      <props.tabSpec.component
        offering={props.offering}
        plansUsage={props.plansUsage}
        uniqueFormId={uniqueFormId}
      />
    </div>
  ) : null;
};
