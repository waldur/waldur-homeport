import { FunctionComponent } from 'react';

import { OrderItemsFilter } from './OrderItemsFilter';
import { OrderItemsList } from './OrderItemsList';

export const OrderItemsContainer: FunctionComponent = () => {
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
