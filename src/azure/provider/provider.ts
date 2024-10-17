import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ProvidersRegistry from '@waldur/marketplace/offerings/update/integration/registry';

const AzureForm = lazyComponent(() => import('./AzureForm'), 'AzureForm');

ProvidersRegistry.register({
  name: 'Azure',
  type: 'Azure',
  icon: 'icon-azure.png',
  endpoint: 'azure',
  component: AzureForm,
});
