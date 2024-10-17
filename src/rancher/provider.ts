import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ProvidersRegistry from '@waldur/marketplace/offerings/update/integration/registry';

const RancherProviderForm = lazyComponent(
  () => import('./RancherProviderForm'),
  'RancherProviderForm',
);

ProvidersRegistry.register({
  name: 'Rancher',
  type: 'Rancher',
  icon: 'icon-rancher.png',
  endpoint: 'rancher',
  component: RancherProviderForm,
});
