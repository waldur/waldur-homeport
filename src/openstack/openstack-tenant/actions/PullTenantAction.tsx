import { pullTenant } from '@waldur/openstack/api';
import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

export const PullTenantAction = ({ resource, ...rest }) => (
  <PullActionItem apiMethod={pullTenant} resource={resource} {...rest} />
);
