import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { Attribute } from '@waldur/marketplace/types';

import { RancherClusterCheckoutSummary } from './RancherClusterCheckoutSummary';
import { RancherClusterForm } from './RancherClusterForm';
import { RancherPluginOptionsForm } from './RancherPluginOptionsForm';

const ServiceSettingsAttributes = (): Attribute[] => [
  {
    key: 'backend_url',
    title: translate('Rancher server URL'),
    type: 'string',
  },
  {
    key: 'username',
    title: translate('Rancher access key'),
    type: 'string',
  },
  {
    key: 'password',
    title: translate('Rancher secret key'),
    type: 'password',
  },
  {
    key: 'base_image_name',
    title: translate('Base image name'),
    type: 'string',
  },
  {
    key: 'cloud_init_template',
    title: translate('Cloud init template'),
    type: 'string',
  },
];

const serializeDataVolume = ({ size, ...volumeRest }) => ({
  ...volumeRest,
  size: size * 1024,
});

const serializeNode = (subnet) => ({
  system_volume_size,
  flavor,
  ...nodeRest
}) => ({
  ...nodeRest,
  system_volume_size: system_volume_size * 1024,
  flavor: flavor ? flavor.url : undefined,
  subnet,
  data_volumes: (nodeRest.data_volumes || []).map(serializeDataVolume),
});

const serializer = ({
  subnet,
  nodes,
  ssh_public_key,
  security_groups,
  ...clusterRest
}) => ({
  ...clusterRest,
  nodes: nodes ? nodes.map(serializeNode(subnet)) : undefined,
  ssh_public_key: ssh_public_key ? ssh_public_key.url : undefined,
  security_groups: security_groups
    ? security_groups.map((group) => ({ url: group.url }))
    : undefined,
});

registerOfferingType({
  type: 'Marketplace.Rancher',
  get label() {
    return translate('Rancher cluster');
  },
  component: RancherClusterForm,
  checkoutSummaryComponent: RancherClusterCheckoutSummary,
  pluginOptionsForm: RancherPluginOptionsForm,
  providerType: 'Rancher',
  attributes: ServiceSettingsAttributes,
  serializer,
});
