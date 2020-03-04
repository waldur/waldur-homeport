import * as classNames from 'classnames';
import * as React from 'react';

import { Resource } from '@waldur/marketplace/resources/types';

import { ResourceCreateUsageButton } from './ResourceCreateUsageButton';
import { ResourceShowUsageButton } from './ResourceShowUsageButton';

interface Props {
  row: Pick<
    Resource,
    'state' | 'plan' | 'is_usage_based' | 'uuid' | 'offering_uuid' | 'name'
  >;
}

export const ResourceUsageButton = ({ row }: Props) => {
  const disabled =
    !row.is_usage_based ||
    !row.plan ||
    !['OK', 'Updating', 'Terminating', 'Terminated'].includes(row.state);
  const body = (
    <div className={classNames('btn-group', { disabled })}>
      <ResourceShowUsageButton resource={row.uuid} />
      {['OK', 'Updating'].includes(row.state) && (
        <ResourceCreateUsageButton
          offering_uuid={row.offering_uuid}
          resource_uuid={row.uuid}
          resource_name={row.name}
        />
      )}
    </div>
  );
  if (disabled) {
    return <span>N/A</span>;
  } else {
    return body;
  }
};
