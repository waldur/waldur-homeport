import * as React from 'react';

import { CustomerResourcesFilter } from './CustomerResourcesFilter';
import { CustomerResourcesList } from './CustomerResourcesList';

export const CustomerResourcesContainer = () => (
  <div className="ibox-content">
    <CustomerResourcesFilter />
    <CustomerResourcesList />
  </div>
);
