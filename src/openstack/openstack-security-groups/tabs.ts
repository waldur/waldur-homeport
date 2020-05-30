import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { SecurityGroupRulesList } from './SecurityGroupRulesList';

ResourceTabsConfiguration.register('OpenStack.SecurityGroup', () => [
  {
    key: 'rules',
    title: translate('Rules'),
    component: SecurityGroupRulesList,
  },
  getEventsTab(),
]);
