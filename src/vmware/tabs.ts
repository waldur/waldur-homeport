import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';

const DisksList = lazyComponent(() => import('./DisksList'), 'DisksList');
const PortsList = lazyComponent(() => import('./PortsList'), 'PortsList');

NestedResourceTabsConfiguration.register('VMware.VirtualMachine', () => [
  {
    title: translate('Details'),
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
]);
