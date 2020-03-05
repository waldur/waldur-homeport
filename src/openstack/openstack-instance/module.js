import openstackInstanceCurrentFlavor from './openstack-instance-current-flavor';
import openstackInstanceSecurityGroupsField from './openstack-instance-security-groups-field';
import openstackInstanceInternalIpsList from './openstack-instance-internal-ips-list';
import openstackInstanceNetworks from './openstack-instance-networks';
import openstackInstanceFloatingIps from './openstack-instance-floating-ips';
import openstackInstanceDataVolume from './openstack-instance-data-volume';
import actions from './actions';
import { OpenStackInstanceSummary } from './OpenStackInstanceSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import './marketplace';
import registerExtensionPoint from './header-extension';
import openStackInstanceTenantButton from './OpenStackInstanceTenantButton';

export default module => {
  ResourceSummary.register(
    'OpenStackTenant.Instance',
    OpenStackInstanceSummary,
  );
  module.component(
    'openstackInstanceCurrentFlavor',
    openstackInstanceCurrentFlavor,
  );
  module.component(
    'openstackInstanceSecurityGroupsField',
    openstackInstanceSecurityGroupsField,
  );
  module.component(
    'openstackInstanceInternalIpsList',
    openstackInstanceInternalIpsList,
  );
  module.component('openstackInstanceDataVolume', openstackInstanceDataVolume);
  module.component('openstackInstanceNetworks', openstackInstanceNetworks);
  module.component(
    'openstackInstanceFloatingIps',
    openstackInstanceFloatingIps,
  );
  module.component(
    'openstackInstanceTenantButton',
    openStackInstanceTenantButton,
  );
  module.config(actionConfig);
  module.config(stateConfig);
  module.config(tabsConfig);
  module.run(registerExtensionPoint);
};

// @ngInject
function actionConfig(ActionConfigurationProvider) {
  ActionConfigurationProvider.register('OpenStackTenant.Instance', actions);
}

// @ngInject
function stateConfig(ResourceStateConfigurationProvider) {
  ResourceStateConfigurationProvider.register('OpenStackTenant.Instance', {
    error_states: ['ERROR'],
    shutdown_states: ['SHUTOFF', 'STOPPED', 'SUSPENDED'],
  });
}

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Instance', {
    order: [
      'volumes',
      'backups',
      'backup_schedules',
      'internal_ips_set',
      ...DEFAULT_RESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      volumes: {
        heading: gettext('Volumes'),
        component: 'openstackInstanceVolumes',
      },
      backups: {
        heading: gettext('Backups'),
        component: 'openstackBackupsList',
      },
      backup_schedules: {
        heading: gettext('Backup schedules'),
        component: 'openstackBackupSchedulesList',
      },
      internal_ips_set: {
        heading: gettext('Internal IPs'),
        component: 'openstackInstanceInternalIpsList',
      },
    }),
  });
}
