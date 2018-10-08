import * as ProvidersRegistry from '@waldur/providers/registry';

import { DigitalOceanForm } from './DigitalOceanForm';

ProvidersRegistry.register({
  name: 'DigitalOcean',
  type: 'DigitalOcean',
  icon: 'icon-digitalocean.png',
  endpoint: 'digitalocean',
  component: DigitalOceanForm,
  serializer: data => ({ token: data.token }),
});
