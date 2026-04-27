import { lazyComponent } from '@/core/lazyComponent';
import { INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE } from '@/openstack/constants';
import { SLURM_PLUGIN } from '@/slurm/constants';

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
  [SLURM_PLUGIN]: lazyComponent(() =>
    import('@/slurm/SlurmAllocationActions').then((module) => ({
      default: module.SlurmAllocationActions,
    })),
  ),
};
