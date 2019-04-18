import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { SupportResourcesFilter } from './SupportResourcesFilter';
import { SupportResourcesList } from './SupportResourcesList';

const SupportResourcesContainer = () => (
  <div className="ibox-content">
    <SupportResourcesFilter/>
    <SupportResourcesList/>
  </div>
);

export default connectAngularComponent(SupportResourcesContainer);
