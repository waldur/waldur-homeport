import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';

import { DatabasesList } from './DatabasesList';

// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('Azure.SQLServer', () => [
    {
      key: 'databases',
      title: translate('Databases'),
      component: DatabasesList,
    },
    getEventsTab(),
  ]);
}
