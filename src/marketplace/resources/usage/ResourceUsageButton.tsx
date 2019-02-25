import * as React from 'react';

import { ResourceCreateUsageButton } from './ResourceCreateUsageButton';
import { ResourceShowUsageButton } from './ResourceShowUsageButton';

export const ResourceUsageButton = ({ row }) =>
  row.marketplace_resource_uuid ? (
    <div className="btn-group">
      <ResourceShowUsageButton resource={row.marketplace_resource_uuid}/>
      <ResourceCreateUsageButton
        offering_uuid={row.offering_uuid}
        resource_uuid={row.marketplace_resource_uuid}
        plan_unit={row.plan_unit}
      />
    </div>
  ) : null;
