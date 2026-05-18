import { AZURE_VM_TYPE } from '@/azure/constants';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@/marketplace-script/constants';
import { INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE } from '@/openstack/constants';
import { MARKETPLACE_RANCHER } from '@/rancher/cluster/create/constants';

export const VALID_OFFERING_TYPES = [
  TENANT_TYPE,
  VOLUME_TYPE,
  INSTANCE_TYPE,
  MARKETPLACE_RANCHER,
  OFFERING_TYPE_CUSTOM_SCRIPTS,
  AZURE_VM_TYPE,
];
