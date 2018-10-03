import * as ProvidersRegistry from '@waldur/providers/registry';

import { AzureForm } from './AzureForm';

const serializer = data => ({
  username: data.username,
  certificate: data.certificate,
  cloud_service_name: data.cloud_service_name,
  location: data.location.value,
});

ProvidersRegistry.register({
  name: 'Azure',
  type: 'Azure',
  icon: 'icon-azure.png',
  endpoint: 'azure',
  component: AzureForm,
  serializer,
});
