import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { MARKETPLACE_RANCHER } from './constants';
import { rancherOrderSerializer } from './serializers';

const RancherCredentialsForm = lazyComponent(() =>
  import('@/rancher/RancherCredentialsForm').then((module) => ({
    default: module.RancherCredentialsForm,
  })),
);

const RancherClusterCheckoutSummary = lazyComponent(() =>
  import('./RancherClusterCheckoutSummary').then((module) => ({
    default: module.RancherClusterCheckoutSummary,
  })),
);
const RancherOrderForm = lazyComponent(() =>
  import('./RancherOrderForm').then((module) => ({
    default: module.RancherOrderForm,
  })),
);

const RancherProvisioningConfigurationForm = lazyComponent(() =>
  import('./RancherProvisioningConfigurationForm').then((module) => ({
    default: module.RancherProvisioningConfigurationForm,
  })),
);

export const RancherOffering: OfferingConfiguration = {
  type: MARKETPLACE_RANCHER,
  get label() {
    return translate('Rancher cluster');
  },
  orderFormComponent: RancherOrderForm,
  checkoutSummaryComponent: RancherClusterCheckoutSummary,
  credentialsForm: RancherCredentialsForm,
  provisioningConfigForm: RancherProvisioningConfigurationForm,
  serializer: rancherOrderSerializer,
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
