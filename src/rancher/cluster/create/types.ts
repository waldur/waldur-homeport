import {
  Offering,
  OpenStackFlavor,
  OpenStackSecurityGroup,
  OpenStackSubNet,
  OpenStackTenant,
  OpenStackVolumeType,
  SshKey,
} from 'waldur-js-client';

import { NodeField } from '@/rancher/types';

export interface SelfManagedRancherOrderFormData {
  nodes: NodeField[];
  ssh_public_key: SshKey;
  security_groups: OpenStackSecurityGroup[];
  data_volume_type: OpenStackVolumeType;
  data_volume_size: number;
  system_volume_type: OpenStackVolumeType;
  system_volume_size: number;
  tenant: OpenStackTenant;
  subnet: OpenStackSubNet;
}

export interface ManagedRancherOrderFormData {
  worker_nodes_count: number;
  worker_nodes_flavor: OpenStackFlavor;
  worker_nodes_data_volume_size: number;
  worker_nodes_data_volume_type_name: OpenStackVolumeType;
  openstack_offering: Offering;
  install_longhorn: boolean;
  worker_nodes_longhorn_volume_size: number;
  worker_nodes_longhorn_volume_type_name: OpenStackVolumeType;
}
