import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ProvidersRegistry from '@waldur/marketplace/offerings/update/integration/registry';

const RemoteOfferingSecretOptions = lazyComponent(
  () => import('./RemoteOfferingSecretOptions'),
  'RemoteOfferingSecretOptions',
);

ProvidersRegistry.register({
  name: 'Remote',
  type: 'Remote',
  icon: '',
  endpoint: 'remote',
  component: RemoteOfferingSecretOptions,
});
