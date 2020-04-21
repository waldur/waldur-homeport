import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { DisksList } from './DisksList';
import { PortsList } from './PortsList';

ResourceTabsConfiguration.register('VMware.VirtualMachine', () => [
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
