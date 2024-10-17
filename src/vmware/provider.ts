import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ProvidersRegistry from '@waldur/marketplace/offerings/update/integration/registry';

const VMwareForm = lazyComponent(() => import('./VMwareForm'), 'VMwareForm');

ProvidersRegistry.register({
  name: 'VMware',
  type: 'VMware',
  icon: 'icon-vmware.png',
  endpoint: 'vmware',
  component: VMwareForm,
});
