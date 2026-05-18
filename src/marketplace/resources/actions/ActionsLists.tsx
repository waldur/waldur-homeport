import { lazyComponent } from '@/core/lazyComponent';
import { INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE } from '@/openstack/constants';

export const ActionsLists = {
  [INSTANCE_TYPE]: lazyComponent(() =>
    import('@/openstack/openstack-instance/OpenStackInstanceActions').then(
      (module) => ({ default: module.OpenStackInstanceActions }),
    ),
  ),
  [VOLUME_TYPE]: lazyComponent(() =>
    import('@/openstack/openstack-volume/OpenStackVolumeActions').then(
      (module) => ({ default: module.OpenstackVolumeActions }),
    ),
  ),
  [TENANT_TYPE]: lazyComponent(() =>
    import('@/openstack/openstack-tenant/OpenstackTenantActions').then(
      (module) => ({ default: module.OpenstackTenantActions }),
    ),
  ),
};
