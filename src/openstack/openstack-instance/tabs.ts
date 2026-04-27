import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ResourceTabsConfiguration } from '@/resource/tabs/types';

import { INSTANCE_TYPE } from '../constants';

export const OpenStackInstanceTabConfiguration: ResourceTabsConfiguration = {
  type: INSTANCE_TYPE,
  tabs: [
    {
      title: translate('Networking'),
      key: 'networking',
      children: [
        {
          key: 'ports',
          title: translate('Internal IPs'),
          component: lazyComponent(() =>
            import('./InternalIpsList').then((module) => ({
              default: module.InternalIpsList,
            })),
          ),
        },
        {
          key: 'floating_ips',
          title: translate('Floating IPs'),
          component: lazyComponent(() =>
            import('./FloatingIpsList').then((module) => ({
              default: module.FloatingIpsList,
            })),
          ),
        },
        {
          key: 'security_groups',
          title: translate('Security groups'),
          component: lazyComponent(() =>
            import('./OpenStackSecurityGroupsList').then((module) => ({
              default: module.OpenStackSecurityGroupsList,
            })),
          ),
        },
      ],
    },
    {
      title: translate('Storage'),
      key: 'storage',
      children: [
        {
          key: 'volumes',
          title: translate('Volumes'),
          component: lazyComponent(() =>
            import('../openstack-volume/InstanceVolumesList').then(
              (module) => ({
                default: module.InstanceVolumesList,
              }),
            ),
          ),
        },
        {
          key: 'backups',
          title: translate('Snapshots'),
          component: lazyComponent(() =>
            import('../openstack-backup/BackupsList').then((module) => ({
              default: module.BackupsList,
            })),
          ),
        },
      ],
    },
  ],
};
