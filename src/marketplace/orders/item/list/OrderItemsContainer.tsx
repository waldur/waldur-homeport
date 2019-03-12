import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { OrderItemsFilter } from './OrderItemsFilter';
import { OrderItemsList } from './OrderItemsList';

const OrderItemsContainer = () => (
  <div className="ibox-content">
    <OrderItemsFilter showOrganizationFilter={true} showOfferingFilter={true}/>
    <OrderItemsList/>
  </div>
);

export default connectAngularComponent(OrderItemsContainer);
