import * as React from 'react';

import { pick } from '@waldur/core/utils';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Resource as ResourceType } from '@waldur/resource/types';

import { Resource } from '../types';

import { MarketplaceResourceStateField } from './MarketplaceResourceStateField';

const pickResource = pick(['action', 'action_details', 'runtime_state']);

const OPENSTACK_OFFERINGS = [
  'Packages.Template',
  'OpenStackTenant.Instance',
  'OpenStackTenant.Volume',
];

export const ResourceStateField = ({ row }: { row: Resource }) => {
  if (OPENSTACK_OFFERINGS.includes(row.offering_type)) {
    const resource = {
      resource_type: row.offering_type,
      service_settings_state: 'OK',
      state: row.backend_metadata.state || 'Erred',
      ...pickResource(row.backend_metadata),
    } as ResourceType;
    return <ResourceState resource={resource} />;
  } else {
    return <MarketplaceResourceStateField resource={row} />;
  }
};
