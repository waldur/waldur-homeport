import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ProvidersRegistry from '@waldur/providers/registry';

const DigitalOceanForm = lazyComponent(
  () => import('./DigitalOceanForm'),
  'DigitalOceanForm',
);

ProvidersRegistry.register({
  name: 'DigitalOcean',
  type: 'DigitalOcean',
  icon: 'icon-digitalocean.png',
  endpoint: 'digitalocean',
  component: DigitalOceanForm,
  serializer: (data) => ({ token: data.token }),
});
