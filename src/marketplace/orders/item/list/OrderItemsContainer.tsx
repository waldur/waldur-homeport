import * as React from 'react';

import { OrderItemsFilter } from './OrderItemsFilter';
import { OrderItemsList } from './OrderItemsList';

export const OrderItemsContainer = () => (
  <div className="ibox-content">
    <OrderItemsFilter showOrganizationFilter={true} showOfferingFilter={true} />
    <OrderItemsList />
  </div>
);
