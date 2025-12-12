import { lazyComponent } from '@waldur/core/lazyComponent';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';

export const ActionsLists = {
  [INSTANCE_TYPE]: lazyComponent(() =>
    import('@waldur/openstack/openstack-instance/OpenStackInstanceActions').then(
      (module) => ({ default: module.OpenStackInstanceActions }),
    ),
  ),
  [VOLUME_TYPE]: lazyComponent(() =>
    import('@waldur/openstack/openstack-volume/OpenStackVolumeActions').then(
      (module) => ({ default: module.OpenstackVolumeActions }),
    ),
  ),
  [TENANT_TYPE]: lazyComponent(() =>
    import('@waldur/openstack/openstack-tenant/OpenstackTenantActions').then(
      (module) => ({ default: module.OpenstackTenantActions }),
    ),
  ),
  [SLURM_PLUGIN]: lazyComponent(() =>
    import('@waldur/slurm/SlurmAllocationActions').then((module) => ({
      default: module.SlurmAllocationActions,
    })),
  ),
};
