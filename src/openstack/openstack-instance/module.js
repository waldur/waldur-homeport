import { translate } from '@waldur/i18n';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';

import { BackupsSchedulesList } from '../openstack-backup-schedule/BackupSchedulesList';
import { BackupsList } from '../openstack-backup/BackupsList';
import { InstanceVolumesList } from '../openstack-volume/InstanceVolumesList';

import actions from './actions';
import { InternalIpsList } from './InternalIpsList';
import openstackInstanceCurrentFlavor from './openstack-instance-current-flavor';
import openstackInstanceDataVolume from './openstack-instance-data-volume';
import openstackInstanceFloatingIps from './openstack-instance-floating-ips';
import openstackInstanceNetworks from './openstack-instance-networks';
import openstackInstanceSecurityGroupsField from './openstack-instance-security-groups-field';
import { OpenStackInstanceSummary } from './OpenStackInstanceSummary';
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
function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('OpenStackTenant.Instance', () => [
    {
      key: 'volumes',
      title: translate('Volumes'),
      component: InstanceVolumesList,
    },
    {
      key: 'backups',
      title: translate('Backups'),
      component: BackupsList,
    },
    {
      key: 'backup_schedules',
      title: translate('Backup schedules'),
      component: BackupsSchedulesList,
    },
    {
      key: 'internal_ips_set',
      title: translate('Internal IPs'),
      component: InternalIpsList,
    },
    ...getDefaultResourceTabs(),
  ]);
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
  module.component('openstackInstanceDataVolume', openstackInstanceDataVolume);
  module.component('openstackInstanceNetworks', openstackInstanceNetworks);
  module.component(
    'openstackInstanceFloatingIps',
    openstackInstanceFloatingIps,
  );
  module.config(actionConfig);
  module.config(stateConfig);
  module.config(tabsConfig);
};
