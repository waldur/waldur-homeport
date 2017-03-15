import { openstackInstanceSummary } from './openstack-instance-summary';
import openstackInstanceCheckoutSummary from './openstack-instance-checkout-summary';
import OpenStackInstanceConfig from './openstack-instance-config';
import openstackInstanceSecurityGroupsField from './openstack-instance-security-groups-field';
import openstackInstanceInternalIpsList from './openstack-instance-internal-ips-list';
import openstackInstanceNetworks from './openstack-instance-networks';
import openstackInstanceFloatingIps from './openstack-instance-floating-ips';
import actionConfig from './actions';

export default module => {
  module.component('openstackInstanceSummary', openstackInstanceSummary);
  module.directive('openstackInstanceCheckoutSummary', openstackInstanceCheckoutSummary);
  module.component('openstackInstanceSecurityGroupsField', openstackInstanceSecurityGroupsField);
  module.component('openstackInstanceInternalIpsList', openstackInstanceInternalIpsList);
  module.component('openstackInstanceNetworks', openstackInstanceNetworks);
  module.component('openstackInstanceFloatingIps', openstackInstanceFloatingIps);
  module.config(fieldsConfig);
  module.config(actionConfig);
  module.config(stateConfig);
  module.config(tabsConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('OpenStackTenant.Instance', OpenStackInstanceConfig);
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Instance', {
    error_states: [
      'ERROR'
    ],
    shutdown_states: [
      'SHUTOFF',
      'STOPPED',
      'SUSPENDED'
    ]
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Instance', {
    order: [
      ...DEFAULT_RESOURCE_TABS.order,
      'volumes',
      'backups',
      'backup_schedules',
      'internal_ips_set',
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      volumes: {
        heading: gettext('Volumes'),
        component: 'openstackInstanceVolumes'
      },
      backups: {
        heading: gettext('Backups'),
        component: 'openstackBackupsList'
      },
      backup_schedules: {
        heading: gettext('Backup schedules'),
        component: 'openstackBackupSchedulesList'
      },
      internal_ips_set: {
        heading: gettext('Internal IPs'),
        component: 'openstackInstanceInternalIpsList'
      }
    })
  });
}
