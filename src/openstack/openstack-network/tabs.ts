import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const NetworkSubnetsList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "NetworkSubnetsList" */ '../openstack-subnet/NetworkSubnetsList'
    ),
  'NetworkSubnetsList',
);

ResourceTabsConfiguration.register('OpenStack.Network', () => [
  {
    key: 'subnets',
    title: translate('Subnets'),
    component: NetworkSubnetsList,
  },
  getEventsTab(),
]);
