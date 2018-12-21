import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OpenstackInstanceCheckoutSummary } from '@waldur/openstack/openstack-instance/OpenstackInstanceCheckoutSummary';

import { OpenstackInstanceCreateForm } from './OpenstackInstanceCreateForm';

const serializer = props => {
  const floatingIps = [];
  const subnets = [];
  if (props.networks) {
    props.networks.map(network => {
      subnets.push(network.subnet);
      floatingIps.push(network.floatingIp);
    });
  }
  const data = {
    ...props,
    floating_ips: floatingIps,
    subnets,
  };
  const {networks, ...rest} = data;
  return rest;
};

registerOfferingType({
  type: 'OpenStackTenant.Instance',
  get label() {
    return translate('OpenStack instance');
  },
  component: OpenstackInstanceCreateForm,
  checkoutSummaryComponent: OpenstackInstanceCheckoutSummary,
  serializer,
});
