import { pullTenant } from '@waldur/openstack/api';
import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

export const PullTenantAction = ({ resource }) => (
  <PullActionItem apiMethod={pullTenant} resource={resource} />
);
