import { lazyComponent } from '@waldur/core/lazyComponent';
import { pick } from '@waldur/core/utils';
import * as ProvidersRegistry from '@waldur/providers/registry';

const OpenStackForm = lazyComponent(
  () => import('./OpenStackForm'),
  'OpenStackForm',
);
const OpenStackTenantForm = lazyComponent(
  () => import('./OpenStackTenantForm'),
  'OpenStackTenantForm',
);

ProvidersRegistry.register({
  name: 'OpenStack',
  type: 'OpenStackTenant',
  icon: 'icon-openstack.png',
  endpoint: 'openstacktenant',
  component: OpenStackTenantForm,
  serializer: pick([
    'backend_url',
    'username',
    'password',
    'tenant_id',
    'external_network_id',
    'domain',
    'availability_zone',
    'flavor_exclude_regex',
    'verify_ssl',
  ]),
});

ProvidersRegistry.register({
  name: 'OpenStack',
  type: 'OpenStack',
  icon: 'icon-openstack.png',
  endpoint: 'openstack',
  component: OpenStackForm,
  serializer: pick([
    'backend_url',
    'username',
    'password',
    'tenant_name',
    'external_network_id',
    'availability_zone',
    'verify_ssl',
  ]),
});
