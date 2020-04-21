import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { BackupsSchedulesList } from '../openstack-backup-schedule/BackupSchedulesList';
import { BackupsList } from '../openstack-backup/BackupsList';
import { InstanceVolumesList } from '../openstack-volume/InstanceVolumesList';

import { InternalIpsList } from './InternalIpsList';

ResourceTabsConfiguration.register('OpenStackTenant.Instance', () => [
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
