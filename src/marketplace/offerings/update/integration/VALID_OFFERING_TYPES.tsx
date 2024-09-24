import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { MARKETPLACE_RANCHER } from '@waldur/rancher/cluster/create/constants';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';

export const VALID_OFFERING_TYPES = [
  TENANT_TYPE,
  VOLUME_TYPE,
  INSTANCE_TYPE,
  SLURM_PLUGIN,
  MARKETPLACE_RANCHER,
  OFFERING_TYPE_CUSTOM_SCRIPTS,
];
