import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { MyOrderItemsFilter } from './MyOrderItemsFilter';
import { MyOrderItemsList } from './MyOrderItemsList';

const OrderItemsContainer = () => (
  <div className="ibox-content">
    <MyOrderItemsFilter/>
    <MyOrderItemsList/>
  </div>
);

export default connectAngularComponent(OrderItemsContainer);
