import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const SecurityGroupRulesList = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SecurityGroupRulesList" */ './SecurityGroupRulesList'
    ),
  'SecurityGroupRulesList',
);

ResourceTabsConfiguration.register('OpenStack.SecurityGroup', () => [
  {
    key: 'rules',
    title: translate('Rules'),
    component: SecurityGroupRulesList,
  },
  getEventsTab(),
]);
