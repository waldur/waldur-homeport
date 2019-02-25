import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { CustomerResourcesFilter } from './CustomerResourcesFilter';
import { CustomerResourcesList } from './CustomerResourcesList';

const CustomerResourcesContainer = () => (
  <div className="ibox-content">
    <CustomerResourcesFilter/>
    <CustomerResourcesList/>
  </div>
);

export default connectAngularComponent(CustomerResourcesContainer);
