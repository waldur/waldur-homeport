import * as React from 'react';

import { ResourceCreateUsageButton } from './ResourceCreateUsageButton';
import { ResourceShowUsageButton } from './ResourceShowUsageButton';

export const ResourceUsageButton = ({ row }) => (
  <div className="btn-group">
    <ResourceShowUsageButton resource={row.uuid}/>
    <ResourceCreateUsageButton
      offering_uuid={row.offering_uuid}
      resource_uuid={row.uuid}
      plan_unit={row.plan_unit}
    />
  </div>
);
