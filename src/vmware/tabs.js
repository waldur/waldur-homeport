import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';

import { DisksList } from './DisksList';
import { PortsList } from './PortsList';

// @ngInject
export function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('VMware.VirtualMachine', () => [
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
    ...getDefaultResourceTabs(),
  ]);
}
