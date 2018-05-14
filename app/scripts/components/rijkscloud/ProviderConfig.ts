import { pick } from '@waldur/core/utils';
import * as ProvidersRegistry from '@waldur/providers/registry';

import { ProviderForm } from './ProviderForm';

ProvidersRegistry.register({
  name: 'Rijkscloud',
  type: 'Rijkscloud',
  icon: 'icon-rijkscloud.png',
  endpoint: 'rijkscloud',
  component: ProviderForm,
  serializer: pick(['username', 'token']),
});
