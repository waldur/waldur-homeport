import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { parseQuotas, parseQuotasUsage } from '@waldur/openstack/utils';

import { INSTANCE_TYPE, SHARED_INSTANCE_TYPE } from '../constants';

import { deployOfferingSteps } from './deploy/steps';
import { getVolumeTypeRequirements } from './utils';

const OpenstackInstanceDetails = lazyComponent(
  () => import('@waldur/openstack/openstack-instance/OpenstackInstanceDetails'),
  'OpenstackInstanceDetails',
);
const CheckoutSummary = lazyComponent(
  () => import('@waldur/openstack/openstack-instance/deploy/CheckoutSummary'),
  'CheckoutSummary',
);

const serializeFloatingIPs = (networks) => {
  if (!networks?.length || !networks[0]?.floatingIp) {
    return undefined;
  }
  return networks
    .filter((item) => item.floatingIp.url !== 'false')
    .map((item) => {
      // Auto-assign floating IP
      if (item.floatingIp.url === 'true') {
        return {
          subnet: item.subnet.url,
        };
      } else {
        return {
          subnet: item.subnet.url,
          url: item.floatingIp.url,
        };
      }
    });
};

const serializeInternalIps = (networks) => {
  if (!networks?.length || !networks[0]?.subnet) {
    return undefined;
  }
  return networks.map((network) => ({
    subnet: network.subnet.url,
  }));
};

const serializeSecurityGroups = (groups) => {
  if (!groups) {
    return undefined;
  }
  return groups.map((group) => ({
    url: group.url,
  }));
};

const serializeServerGroup = (group) => {
  if (!group) {
    return undefined;
  }
  return group.url;
};

const serializer = ({
  name,
  description,
  user_data,
  image,
  flavor,
  networks,
  system_volume_size,
  data_volume_size,
  system_volume_type,
  data_volume_type,
  ssh_public_key,
  security_groups,
  server_group,
  availability_zone,
}) => ({
  name,
  description,
  user_data,
  image: image ? image.url : undefined,
  flavor: flavor ? flavor.url : undefined,
  ssh_public_key: ssh_public_key ? ssh_public_key.url : undefined,
  security_groups: serializeSecurityGroups(security_groups),
  server_group: serializeServerGroup(server_group),
  internal_ips_set: serializeInternalIps(networks),
  floating_ips: serializeFloatingIPs(networks),
  system_volume_size,
  data_volume_size: data_volume_size ? data_volume_size : undefined,
  system_volume_type: system_volume_type && system_volume_type.value,
  data_volume_type: data_volume_type && data_volume_type.value,
  availability_zone,
});

const formValidator = (props) => {
  const {
    offering,
    values: { attributes },
  } = props;
  if (!attributes) {
    return;
  }
  if (!offering.quotas) {
    return;
  }
  // TODO: Use memoization to avoid unnecessary quotas parsing
  const limits: Record<string, number> = parseQuotas(offering.quotas);
  const usages: Record<string, number> = parseQuotasUsage(offering.quotas);
  const errors: Record<string, string> = {};
  if (attributes.flavor) {
    if (
      limits.cores !== -1 &&
      attributes.flavor.cores + usages.cores > limits.cores
    ) {
      errors.flavor = translate('vCPU limit is exceeded');
    }
    if (limits.ram !== -1 && attributes.flavor.ram + usages.ram > limits.ram) {
      errors.flavor = translate('RAM limit is exceeded');
    }
  }
  if (
    limits.disk !== -1 &&
    usages.disk +
      attributes.system_volume_size +
      (attributes.data_volume_size || 0) >
      limits.disk
  ) {
    errors.system_volume_size = errors.data_volume_size = translate(
      'Total storage limit is exceeded',
    );
  }
  const volumeTypes = getVolumeTypeRequirements(attributes);
  for (const name in volumeTypes) {
    if (
      limits[name] !== -1 &&
      volumeTypes[name] + usages[name] > limits[name]
    ) {
      errors.system_volume_size = errors.data_volume_size = translate(
        'Volume type storage limit is exceeded',
      );
    }
  }
  if (attributes.networks.length === 0) {
    errors.networks = translate('Please select network.');
  }
  return { attributes: errors };
};

registerOfferingType({
  type: INSTANCE_TYPE,
  get label() {
    return translate('OpenStack instance');
  },
  formSteps: deployOfferingSteps,
  detailsComponent: OpenstackInstanceDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer,
  formValidator,
  disableOfferingCreation: true,
  allowToUpdateService: true,
});

registerOfferingType({
  type: SHARED_INSTANCE_TYPE,
  get label() {
    return translate('OpenStack shared instance');
  },
  formSteps: deployOfferingSteps,
  detailsComponent: OpenstackInstanceDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer,
  formValidator,
  allowToUpdateService: true,
  providerType: 'OpenStackTenant',
});
