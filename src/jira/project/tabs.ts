import { translate } from '@waldur/i18n';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { JiraIssuesList } from '../issue/JiraIssuesList';

ResourceTabsConfiguration.register('JIRA.Project', () => [
  {
    key: 'issues',
    title: translate('Issues'),
    component: JiraIssuesList,
  },
]);
