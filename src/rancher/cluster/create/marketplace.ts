import { OpenStackFlavor, OpenStackVolumeType } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';
import { Offering } from '@waldur/marketplace/types';

import { MANAGED_RANCHER, MARKETPLACE_RANCHER } from './constants';

const RancherClusterCheckoutSummary = lazyComponent(() =>
  import('./RancherClusterCheckoutSummary').then((module) => ({
    default: module.RancherClusterCheckoutSummary,
  })),
);
const RancherPluginOptionsForm = lazyComponent(() =>
  import('./RancherPluginOptionsForm').then((module) => ({
    default: module.RancherPluginOptionsForm,
  })),
);
const RancherOrderForm = lazyComponent(() =>
  import('./RancherOrderForm').then((module) => ({
    default: module.RancherOrderForm,
  })),
);

const ManagedRancherProvisioningConfigurationForm = lazyComponent(() =>
  import('./ManagedRancherProvisioningConfigurationForm').then((module) => ({
    default: module.ManagedRancherProvisioningConfigurationForm,
  })),
);

const ManagedRancherOrderForm = lazyComponent(() =>
  import('./ManagedRancherOrderForm').then((module) => ({
    default: module.ManagedRancherOrderForm,
  })),
);

const serializeDataVolume = ({ size, ...volumeRest }) => ({
  ...volumeRest,
  size: size * 1024,
});

const serializeNode =
  (subnet) =>
  ({ system_volume_size, flavor, ...nodeRest }) => ({
    ...nodeRest,
    system_volume_size: system_volume_size * 1024,
    flavor: flavor ? flavor.url : undefined,
    subnet,
    data_volumes: (nodeRest.data_volumes || []).map(serializeDataVolume),
  });

const standaloneRancherOrderSerializer = ({
  subnet,
  nodes,
  ssh_public_key,
  security_groups,
  tenant,
  ...clusterRest
}) => ({
  ...clusterRest,
  nodes: nodes ? nodes.map(serializeNode(subnet)) : undefined,
  ssh_public_key: ssh_public_key ? ssh_public_key.url : undefined,
  security_groups: security_groups
    ? security_groups.map((group) => ({ url: group.url }))
    : undefined,
  tenant: tenant ? tenant.url : undefined,
});

interface ManagedRancherOrderFormData {
  worker_nodes_count: number;
  worker_nodes_flavor: OpenStackFlavor;
  worker_nodes_data_volume_size: number;
  worker_nodes_data_volume_type_name: OpenStackVolumeType;
  openstack_offering: Offering;
  install_longhorn: boolean;
  worker_nodes_longhorn_volume_size: number;
  worker_nodes_longhorn_volume_type_name: OpenStackVolumeType;
}

const managedRancherOrderSerializer = (
  formData: ManagedRancherOrderFormData,
) => ({
  ...formData,
  worker_nodes_flavor_name: formData.worker_nodes_flavor?.name,
  worker_nodes_data_volume_type_name:
    formData.worker_nodes_data_volume_type_name?.name,
  worker_nodes_longhorn_volume_type_name:
    formData.worker_nodes_longhorn_volume_type_name?.name,
  openstack_offering_uuid_list: formData.openstack_offering
    ? [formData.openstack_offering.uuid]
    : undefined,
});

export const RancherOffering: OfferingConfiguration = {
  type: MARKETPLACE_RANCHER,
  get label() {
    return translate('Rancher cluster');
  },
  orderFormComponent: RancherOrderForm,
  checkoutSummaryComponent: RancherClusterCheckoutSummary,
  pluginOptionsForm: RancherPluginOptionsForm,
  providerType: 'Rancher',
  serializer: standaloneRancherOrderSerializer,
  allowToUpdateService: true,
};

export const ManagedRancherOffering: OfferingConfiguration = {
  type: MANAGED_RANCHER,
  get label() {
    return translate('Managed Rancher cluster');
  },
  provisioningConfigForm: ManagedRancherProvisioningConfigurationForm,
  orderFormComponent: ManagedRancherOrderForm,
  serializer: managedRancherOrderSerializer,
  secretOptionsSerializer: ({ customer_uuid, ...formData }) => ({
    ...formData,
    customer_uuid: customer_uuid ? customer_uuid.uuid : undefined,
  }),
  pluginOptionsSerializer: (formData) => ({
    ...formData,
    openstack_offering_uuid_list: formData.openstack_offering_uuid_list
      ? formData.openstack_offering_uuid_list.map((offering) => offering.uuid)
      : undefined,
    managed_rancher_server_flavor_name:
      formData.managed_rancher_server_flavor_name?.name,

    managed_rancher_server_system_volume_type_name:
      formData.managed_rancher_server_system_volume_type_name?.name,

    managed_rancher_server_data_volume_type_name:
      formData.managed_rancher_server_data_volume_type_name?.name,

    managed_rancher_worker_system_volume_type_name:
      formData.managed_rancher_worker_system_volume_type_name?.name,

    managed_rancher_worker_data_volume_type_name:
      formData.managed_rancher_worker_data_volume_type_name?.name,

    managed_rancher_load_balancer_flavor_name:
      formData.managed_rancher_load_balancer_flavor_name?.name,

    managed_rancher_load_balancer_system_volume_type_name:
      formData.managed_rancher_load_balancer_system_volume_type_name?.name,

    managed_rancher_load_balancer_data_volume_type_name:
      formData.managed_rancher_load_balancer_data_volume_type_name?.name,
  }),
};
