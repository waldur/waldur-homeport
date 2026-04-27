import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { ResourceTabsConfiguration } from '@/resource/tabs/types';

const DisksList = lazyComponent(() =>
  import('./DisksList').then((module) => ({ default: module.DisksList })),
);
const PortsList = lazyComponent(() =>
  import('./PortsList').then((module) => ({ default: module.PortsList })),
);

export const VMwareVirtualMachineTabConfiguration: ResourceTabsConfiguration = {
  type: 'VMware.VirtualMachine',
  tabs: [
    {
      title: translate('Details'),
      key: 'details',
      children: [
        {
          key: 'disks',
          title: translate('Disks'),
          component: DisksList,
        },
        {
          key: 'ports',
          title: translate('Network adapters'),
          component: PortsList,
        },
      ],
    },
  ],
};
