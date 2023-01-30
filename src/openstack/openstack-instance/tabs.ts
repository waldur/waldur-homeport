import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';

import { INSTANCE_TYPE } from '../constants';

const BackupsSchedulesList = lazyComponent(
  () => import('../openstack-backup-schedule/BackupSchedulesList'),
  'BackupsSchedulesList',
);
const BackupsList = lazyComponent(
  () => import('../openstack-backup/BackupsList'),
  'BackupsList',
);
const InstanceVolumesList = lazyComponent(
  () => import('../openstack-volume/InstanceVolumesList'),
  'InstanceVolumesList',
);
const InternalIpsList = lazyComponent(
  () => import('./InternalIpsList'),
  'InternalIpsList',
);
const OpenStackSecurityGroupsList = lazyComponent(
  () => import('./OpenStackSecurityGroupsList'),
  'OpenStackSecurityGroupsList',
);

NestedResourceTabsConfiguration.register(INSTANCE_TYPE, () => [
  {
    title: translate('Storage'),
    children: [
      {
        key: 'volumes',
        title: translate('Volumes'),
        component: InstanceVolumesList,
      },
      {
        key: 'backups',
        title: translate('Snapshots'),
        component: BackupsList,
      },
      {
        key: 'backup_schedules',
        title: translate('Snapshot schedules'),
        component: BackupsSchedulesList,
      },
    ],
  },
  {
    title: translate('Networking'),
    children: [
      {
        key: 'internal_ips',
        title: translate('Internal IPs'),
        component: InternalIpsList,
      },
      {
        key: 'security_groups',
        title: translate('Security groups'),
        component: OpenStackSecurityGroupsList,
      },
    ],
  },
]);
