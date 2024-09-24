import { lazyComponent } from '@waldur/core/lazyComponent';
import { pick } from '@waldur/core/utils';
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
  serializer: pick([
    'backend_url',
    'domain',
    'username',
    'password',
    'tenant_name',
    'external_network_id',
    'availability_zone',
    'verify_ssl',
    'max_concurrent_provision_instance',
    'max_concurrent_provision_volume',
    'max_concurrent_provision_snapshot',
    'flavor_exclude_regex',
    'volume_type_blacklist',
  ]),
});
