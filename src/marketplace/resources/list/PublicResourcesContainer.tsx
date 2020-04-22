import * as React from 'react';

import { PublicResourcesFilter } from './PublicResourcesFilter';
import { PublicResourcesList } from './PublicResourcesList';

export const PublicResourcesContainer = () => (
  <div className="ibox-content">
    <PublicResourcesFilter />
    <PublicResourcesList />
  </div>
);
