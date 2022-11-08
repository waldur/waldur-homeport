import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';

import { INSTANCE_TYPE } from '../constants';

const BackupsSchedulesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "BackupSchedulesList" */ '../openstack-backup-schedule/BackupSchedulesList'
    ),
  'BackupsSchedulesList',
);
const BackupsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "BackupsList" */ '../openstack-backup/BackupsList'
    ),
  'BackupsList',
);
const InstanceVolumesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "InstanceVolumesList" */ '../openstack-volume/InstanceVolumesList'
    ),
  'InstanceVolumesList',
);
const InternalIpsList = lazyComponent(
  () => import(/* webpackChunkName: "InternalIpsList" */ './InternalIpsList'),
  'InternalIpsList',
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
        title: translate('VM snapshots'),
        component: BackupsList,
      },
      {
        key: 'backup_schedules',
        title: translate('VM snapshot schedules'),
        component: BackupsSchedulesList,
      },
    ],
  },
  {
    title: translate('Networking'),
    children: [
      {
        key: 'internal_ips_set',
        title: translate('Internal IPs'),
        component: InternalIpsList,
      },
      {
        key: 'security_group',
        title: translate('Security groups'),
        component: InternalIpsList,
      },
    ],
  },
]);
