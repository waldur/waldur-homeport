import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { MyOrderItemsList } from './MyOrderItemsList';
import { OrderItemsFilter } from './OrderItemsFilter';

const OrderItemsContainer = () => (
  <div className="ibox-content">
    <OrderItemsFilter/>
    <MyOrderItemsList/>
  </div>
);

export default connectAngularComponent(OrderItemsContainer);
