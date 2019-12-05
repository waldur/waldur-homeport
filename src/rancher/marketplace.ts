import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { Attribute } from '@waldur/marketplace/types';

import { RancherClusterCheckoutSummary } from './RancherClusterCheckoutSummary';
import { RancherClusterForm } from './RancherClusterForm';

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
];

const serializer = ({ nodes, ...clusterRest }) => ({
  ...clusterRest,
  nodes: nodes.map(({ storage, memory, ...nodeRest }) => ({
    ...nodeRest,
    storage: storage * 1024,
    memory: memory * 1024,
  })),
});

registerOfferingType({
  type: 'Marketplace.Rancher',
  get label() {
    return translate('Rancher cluster');
  },
  component: RancherClusterForm,
  checkoutSummaryComponent: RancherClusterCheckoutSummary,
  providerType: 'Rancher',
  attributes: ServiceSettingsAttributes,
  serializer,
});
