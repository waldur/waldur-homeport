import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';
import { angular2react } from '@waldur/shims/angular2react';

const SecurityGroupRulesList = angular2react('securityGroupRulesList', [
  'resource',
]);

ResourceTabsConfiguration.register('OpenStack.SecurityGroup', () => [
  {
    key: 'rules',
    title: translate('Rules'),
    component: SecurityGroupRulesList,
  },
  getEventsTab(),
]);
