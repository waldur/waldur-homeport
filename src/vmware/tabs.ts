import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const DisksList = lazyComponent(
  () => import(/* webpackChunkName: "DisksList" */ './DisksList'),
  'DisksList',
);
const PortsList = lazyComponent(
  () => import(/* webpackChunkName: "PortsList" */ './PortsList'),
  'PortsList',
);

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
