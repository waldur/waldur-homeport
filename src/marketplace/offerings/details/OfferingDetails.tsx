import classNames from 'classnames';
import React, { useMemo } from 'react';
import {
  PlanUsageResponse,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { Category } from '@/marketplace/types';
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
    // `integration_status` is null — not [] — for callers the backend does not
    // consider offering administrators; see `get_integration_status` in the
    // marketplace serializer and the `| null` in the SDK type. A throw here
    // takes down every tab of the page, since this runs in the shared shell.
    props.offering.integration_status?.length > 0 ? (
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
