import { lazyComponent } from '@waldur/core/lazyComponent';
import { pick } from '@waldur/core/utils';
import * as ProvidersRegistry from '@waldur/providers/registry';

const AzureForm = lazyComponent(() => import('./AzureForm'), 'AzureForm');

const serializer = pick([
  'tenant_id',
  'client_id',
  'client_secret',
  'subscription_id',
]);

ProvidersRegistry.register({
  name: 'Azure',
  type: 'Azure',
  icon: 'icon-azure.png',
  endpoint: 'azure',
  component: AzureForm,
  serializer,
});
