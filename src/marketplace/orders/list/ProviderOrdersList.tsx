import { FunctionComponent } from 'react';

import { useDestroyFilterOnLeave } from '@waldur/core/filters';

import { OrdersFilter } from './OrdersFilter';
import { OrdersList } from './OrdersList';

export const ProviderOrdersList: FunctionComponent = () => {
  useDestroyFilterOnLeave('OrderFilter');

  return (
    <OrdersList
      filters={
        <OrdersFilter showOrganizationFilter={true} showOfferingFilter={true} />
      }
    />
  );
};
