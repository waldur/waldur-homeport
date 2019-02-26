import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { PublicResourcesFilter } from './PublicResourcesFilter';
import { PublicResourcesList } from './PublicResourcesList';

const PublicResourcesContainer = () => (
  <div className="ibox-content">
    <PublicResourcesFilter/>
    <PublicResourcesList/>
  </div>
);

export default connectAngularComponent(PublicResourcesContainer);
