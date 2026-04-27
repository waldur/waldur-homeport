import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ResourceTabsConfiguration } from '@/resource/tabs/types';

import { VOLUME_TYPE } from '../constants';

const VolumeSnapshotsList = lazyComponent(() =>
  import('./VolumeSnapshotsList').then((module) => ({
    default: module.VolumeSnapshotsList,
  })),
);

export const OpenStackVolumeTabConfiguration: ResourceTabsConfiguration = {
  type: VOLUME_TYPE,
  tabs: [
    {
      title: translate('Snapshots'),
      key: 'snapshots',
      children: [
        {
          key: 'snapshots',
          title: translate('Snapshots'),
          component: VolumeSnapshotsList,
        },
      ],
    },
  ],
};
