import { pick } from '@waldur/core/utils';
import * as ProvidersRegistry from '@waldur/providers/registry';

import { RancherProviderForm } from './RancherProviderForm';

const serializer = pick([
  'backend_url',
  'username',
  'password',
  'base_image_name',
  'cloud_init_template',
]);

ProvidersRegistry.register({
  name: 'Rancher',
  type: 'Rancher',
  icon: 'icon-rancher.png',
  endpoint: 'rancher',
  component: RancherProviderForm,
  serializer,
});
