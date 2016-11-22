import OpenStackTenantConfig from './openstack-tenant-config';
import OpenStackInstanceConfig from './openstack-instance-config';
import OpenStackVolumeConfig from './openstack-volume-config';

export default module => {
  module.config(fieldsConfig);
}

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.registerMap({
    'OpenStack.Tenant': OpenStackTenantConfig,
    'OpenStackTenant.Instance': OpenStackInstanceConfig,
    'OpenStackTenant.Volume': OpenStackVolumeConfig
  });
}
