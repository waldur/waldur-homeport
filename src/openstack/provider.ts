import { lazyComponent } from '@waldur/core/lazyComponent';
import * as ProvidersRegistry from '@waldur/marketplace/offerings/update/integration/registry';

const OpenStackForm = lazyComponent(
  () => import('./OpenStackForm'),
  'OpenStackForm',
);

ProvidersRegistry.register({
  name: 'OpenStack',
  type: 'OpenStack',
  icon: 'icon-openstack.png',
  endpoint: 'openstack',
  component: OpenStackForm,
});
