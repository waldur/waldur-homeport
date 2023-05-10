import { FunctionComponent } from 'react';

import { useDestroyFilterOnLeave } from '@waldur/core/filters';

import { OrderItemsFilter } from './OrderItemsFilter';
import { OrderItemsList } from './OrderItemsList';

export const OrderItemsContainer: FunctionComponent = () => {
  useDestroyFilterOnLeave('OrderItemFilter');

  return (
    <OrderItemsList
      filters={
        <OrderItemsFilter
          showOrganizationFilter={true}
          showOfferingFilter={true}
        />
      }
    />
  );
};
