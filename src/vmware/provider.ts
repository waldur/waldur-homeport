import { pick } from '@waldur/core/utils';
import * as ProvidersRegistry from '@waldur/providers/registry';

import { VMwareForm } from './VMwareForm';

const serializer = pick([
  'username',
  'password',
]);

ProvidersRegistry.register({
  name: 'VMware',
  type: 'VMware',
  icon: 'icon-vmware.png',
  endpoint: 'vmware',
  component: VMwareForm,
  serializer,
});
