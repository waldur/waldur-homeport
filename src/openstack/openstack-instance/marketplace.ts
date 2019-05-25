import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OpenstackInstanceCheckoutSummary } from '@waldur/openstack/openstack-instance/OpenstackInstanceCheckoutSummary';

import { OpenstackInstanceCreateForm } from './OpenstackInstanceCreateForm';

const serializeFloatingIPs = networks => {
  if (!networks) {
    return undefined;
  }
  return networks
    .filter(item => item.floatingIp.url !== 'false')
    .map(item => {
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

const serializeInternalIps = networks => {
  if (!networks) {
    return undefined;
  }
  return networks.map(network => ({
    subnet: network.subnet.url,
  }));
};

const serializeSecurityGroups = groups => {
  if (!groups) {
    return undefined;
  }
  return groups.map(group => ({
    url: group.url,
  }));
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
  ssh_public_key,
  security_groups,
  availability_zone,
}) => ({
  name,
  description,
  user_data,
  image: image ? image.url : undefined,
  flavor: flavor ? flavor.url : undefined,
  ssh_public_key: ssh_public_key ? ssh_public_key.url : undefined,
  security_groups: serializeSecurityGroups(security_groups),
  internal_ips_set: serializeInternalIps(networks),
  floating_ips: serializeFloatingIPs(networks),
  system_volume_size,
  data_volume_size,
  availability_zone,
});

registerOfferingType({
  type: 'OpenStackTenant.Instance',
  get label() {
    return translate('OpenStack instance');
  },
  component: OpenstackInstanceCreateForm,
  checkoutSummaryComponent: OpenstackInstanceCheckoutSummary,
  serializer,
  disableOfferingCreation: true,
});
