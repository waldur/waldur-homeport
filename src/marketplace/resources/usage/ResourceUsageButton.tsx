import * as classNames from 'classnames';
import * as React from 'react';

import { ResourceCreateUsageButton } from './ResourceCreateUsageButton';
import { ResourceShowUsageButton } from './ResourceShowUsageButton';

export const ResourceUsageButton = ({ row }) => {
  const disabled = !row.is_usage_based || !row.plan || !['OK', 'Updating'].includes(row.state);
  const body = (
    <div className={classNames('btn-group', {disabled})}>
      <ResourceShowUsageButton resource={row.uuid}/>
      <ResourceCreateUsageButton
        offering_uuid={row.offering_uuid}
        resource_uuid={row.uuid}
        resource_name={row.name}
      />
    </div>
  );
  if (disabled) {
    return <span>N/A</span>;
  } else {
    return body;
  }
};
