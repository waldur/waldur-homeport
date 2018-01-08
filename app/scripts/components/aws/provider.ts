import { pick } from '@waldur/core/utils';
import * as ProvidersRegistry from '@waldur/providers/registry';

import { AmazonForm } from './AmazonForm';

ProvidersRegistry.register({
  name: 'Amazon',
  type: 'Amazon',
  icon: 'icon-amazon.png',
  endpoint: 'aws',
  component: AmazonForm,
  serializer: pick(['username', 'token']),
});
