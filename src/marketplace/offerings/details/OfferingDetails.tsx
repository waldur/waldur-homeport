import React, { useMemo } from 'react';

import { Category, Offering } from '@waldur/marketplace/types';
import { useToolbarActions } from '@waldur/navigation/context';
import { PlanUsageRow } from '@waldur/reporting/plan-usage/types';

import { OFFERING_CUSTOMERS_LIST_FILTER } from '../expandable/constants';

import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';

interface OfferingDetailsProps {
  offering: Offering;
  category: Category;
  plansUsage: PlanUsageRow[];
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
    <div className="provider-offering">
      <props.tabSpec.component
        offering={props.offering}
        plansUsage={props.plansUsage}
        uniqueFormId={uniqueFormId}
      />
    </div>
  ) : null;
};
