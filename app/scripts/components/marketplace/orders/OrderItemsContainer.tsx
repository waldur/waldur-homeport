import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { OrderItemsFilter } from './OrderItemsFilter';
import { OrderItemsList } from './OrderItemsList';

const OrderItemsContainer = () => (
  <div className="ibox-content">
    <div className="form-group">
      <OrderItemsFilter/>
    </div>
    <OrderItemsList/>
  </div>
);

export default connectAngularComponent(OrderItemsContainer);
