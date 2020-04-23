import * as React from 'react';

import { Panel } from '@waldur/core/Panel';

import { OrderItemsFilter } from './OrderItemsFilter';
import { SupportOrderItemsList } from './SupportOrderItemsList';

export const SupportOrderItemsContainer = () => (
  <Panel>
    <OrderItemsFilter
      showOrganizationFilter={true}
      showProviderFilter={true}
      showOfferingFilter={true}
    />
    <SupportOrderItemsList />
  </Panel>
);
