import { OpenStackSubNet, Offering } from 'waldur-js-client';

import { DataVolume, NodeField } from '@/rancher/types';

import {
  SelfManagedRancherOrderFormData,
  ManagedRancherOrderFormData,
} from './types';

const serializeDataVolume = ({ size, ...volumeRest }: Partial<DataVolume>) => ({
  ...volumeRest,
  size: size * 1024,
});

const serializeNode =
  (subnet: OpenStackSubNet) =>
  ({ system_volume_size, flavor, ...nodeRest }: NodeField) => ({
    ...nodeRest,
    system_volume_size: system_volume_size * 1024,
    flavor: flavor ? flavor.url : undefined,
    subnet,
    data_volumes: (nodeRest.data_volumes || []).map(serializeDataVolume),
  });

const selfManagedRancherOrderSerializer = (
  formData: SelfManagedRancherOrderFormData,
) => ({
  ...formData,
  nodes: formData.nodes
    ? formData.nodes.map(serializeNode(formData.subnet))
    : undefined,
  ssh_public_key: formData.ssh_public_key
    ? formData.ssh_public_key.url
    : undefined,
  security_groups: formData.security_groups
    ? formData.security_groups.map((group) => ({ url: group.url }))
    : undefined,
  tenant: formData.tenant ? formData.tenant.url : undefined,
});

const managedRancherOrderSerializer = (
  formData: ManagedRancherOrderFormData,
) => ({
  ...formData,
  worker_nodes_count: formData.worker_nodes_count,
  worker_nodes_flavor_name: formData.worker_nodes_flavor?.name,
  worker_nodes_data_volume_type_name:
    formData.worker_nodes_data_volume_type_name?.name,
  worker_nodes_longhorn_volume_type_name:
    formData.worker_nodes_longhorn_volume_type_name?.name,
  openstack_offering_uuid_list: formData.openstack_offering
    ? [formData.openstack_offering.uuid]
    : undefined,
});

export const rancherOrderSerializer = (
  formData: SelfManagedRancherOrderFormData | ManagedRancherOrderFormData,
  offering: Offering,
) => {
  if (offering.plugin_options.deployment_mode == 'self_managed') {
    return selfManagedRancherOrderSerializer(
      formData as SelfManagedRancherOrderFormData,
    );
  } else {
    return managedRancherOrderSerializer(
      formData as ManagedRancherOrderFormData,
    );
  }
};
