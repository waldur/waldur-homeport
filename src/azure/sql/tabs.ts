import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const DatabasesList = lazyComponent(
  () => import(/* webpackChunkName: "DatabasesList" */ './DatabasesList'),
  'DatabasesList',
);

ResourceTabsConfiguration.register('Azure.SQLServer', () => [
  {
    key: 'databases',
    title: translate('Databases'),
    component: DatabasesList,
  },
  getEventsTab(),
]);
