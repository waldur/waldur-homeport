import * as ResourceSummary from '@waldur/resource/summary/registry';

import actions from './actions';
import registerExtensionPoint from './header-extension';
import openstackInstanceInternalIpsList from './InternalIpsList';
import openstackInstanceCurrentFlavor from './openstack-instance-current-flavor';
import openstackInstanceDataVolume from './openstack-instance-data-volume';
import openstackInstanceFloatingIps from './openstack-instance-floating-ips';
import openstackInstanceNetworks from './openstack-instance-networks';
import openstackInstanceSecurityGroupsField from './openstack-instance-security-groups-field';
import { OpenStackInstanceSummary } from './OpenStackInstanceSummary';
import openStackInstanceTenantButton from './OpenStackInstanceTenantButton';
import './marketplace';

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
