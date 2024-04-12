import { lazyComponent } from '@waldur/core/lazyComponent';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';

const OpenStackInstanceActions = lazyComponent(
  () => import('@waldur/openstack/openstack-instance/OpenStackInstanceActions'),
  'OpenStackInstanceActions',
);

const OpenstackVolumeActions = lazyComponent(
  () => import('@waldur/openstack/openstack-volume/OpenStackVolumeActions'),
  'OpenstackVolumeActions',
);

const OpenstackTenantActions = lazyComponent(
  () => import('@waldur/openstack/openstack-tenant/OpenstackTenantActions'),
  'OpenstackTenantActions',
);

export const ActionsLists = {
  [INSTANCE_TYPE]: OpenStackInstanceActions,
  [VOLUME_TYPE]: OpenstackVolumeActions,
  [TENANT_TYPE]: OpenstackTenantActions,
};
