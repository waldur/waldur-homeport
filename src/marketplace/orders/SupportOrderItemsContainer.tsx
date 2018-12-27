import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { OrderItemsFilter } from './OrderItemsFilter';
import { SupportOrderItemsList } from './SupportOrderItemsList';

const SupportOrderItemsContainer = () => (
  <div className="ibox-content">
    <OrderItemsFilter
      showOrganizationFilter={true}
      showProviderFilter={true}
    />
    <SupportOrderItemsList/>
  </div>
);

export default connectAngularComponent(SupportOrderItemsContainer);
