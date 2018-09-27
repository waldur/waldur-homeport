import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { OrderItemsFilter } from './OrderItemsFilter';
import { OrderItemsList } from './OrderItemsList';

const OrderItemsContainer = () => (
  <div className="ibox-content">
    <div className="row">
      <div className="form-group col-sm-3">
        <OrderItemsFilter/>
      </div>
    </div>
    <OrderItemsList/>
  </div>
);

export default connectAngularComponent(OrderItemsContainer);
