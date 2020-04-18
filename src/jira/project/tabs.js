import { translate } from '@waldur/i18n';

import { JiraIssuesList } from '../issue/JiraIssuesList';

// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('JIRA.Project', () => [
    {
      key: 'issues',
      title: translate('Issues'),
      component: JiraIssuesList,
    },
  ]);
}
