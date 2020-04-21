import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { NetworkSubnetsList } from '../openstack-subnet/NetworkSubnetsList';

ResourceTabsConfiguration.register('OpenStack.Network', () => [
  {
    key: 'subnets',
    title: translate('Subnets'),
    component: NetworkSubnetsList,
  },
  getEventsTab(),
]);
