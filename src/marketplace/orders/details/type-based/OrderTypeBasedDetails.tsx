import { useMemo } from 'react';

import { getOrderType } from '../../utils';

import { LimitsUpdate } from './LimitsUpdate';
import { OptionsUpdate } from './OptionsUpdate';
import { OrderTypeBasedProps } from './OrderCommonFields';
import { ResourceCreation } from './ResourceCreation';
import { ResourceRenewal } from './ResourceRenewal';
import { ResourceTerminate } from './ResourceTerminate';
import { SwitchPlan } from './SwitchPlan';

export const OrderTypeBasedDetails = ({
  order,
  offering,
  editable,
}: OrderTypeBasedProps) => {
  const orderType = useMemo(() => getOrderType(order), [order]);

  if (orderType.type === 'limits_update') {
    return (
      <>
        <LimitsUpdate order={order} offering={offering} />
        {/* A changed formula input is ordered with the limits it derives. */}
        {order.attributes?.new_options ? (
          <OptionsUpdate order={order} offering={offering} tableOnly />
        ) : null}
      </>
    );
  }
  if (orderType.type === 'options_update') {
    return <OptionsUpdate order={order} offering={offering} />;
  }
  if (orderType.type === 'switch_plan') {
    return <SwitchPlan order={order} offering={offering} />;
  }
  if (orderType.type === 'renew') {
    return <ResourceRenewal order={order} offering={offering} />;
  }
  if (orderType.type === 'terminate') {
    return <ResourceTerminate order={order} offering={offering} />;
  }
  if (orderType.type === 'create') {
    return (
      <ResourceCreation order={order} offering={offering} editable={editable} />
    );
  }
  return null;
};
