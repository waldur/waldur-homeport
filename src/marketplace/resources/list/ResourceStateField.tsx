import { pick } from '@waldur/core/utils';
import { INSTANCE_TYPE, TENANT_TYPE } from '@waldur/openstack/constants';
import { ResourceState } from '@waldur/resource/state/ResourceState';
import { Resource as ResourceType } from '@waldur/resource/types';

import { Resource } from '../types';

import { MarketplaceResourceStateField } from './MarketplaceResourceStateField';

const pickResource = pick(['action', 'action_details', 'runtime_state']);

const OPENSTACK_OFFERINGS = [
  TENANT_TYPE,
  INSTANCE_TYPE,
  'OpenStackTenant.Volume',
];

export const ResourceStateField = ({
  row,
  roundless,
}: {
  row: Resource;
  roundless?: boolean;
}) => {
  if (OPENSTACK_OFFERINGS.includes(row.offering_type)) {
    const resource = {
      resource_type: row.offering_type,
      service_settings_state: 'OK',
      state: row.backend_metadata.state || 'Erred',
      ...pickResource(row.backend_metadata),
    } as ResourceType;
    return <ResourceState resource={resource} roundless={roundless} />;
  } else {
    return (
      <MarketplaceResourceStateField resource={row} roundless={roundless} />
    );
  }
};
