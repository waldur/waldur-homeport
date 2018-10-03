// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('JIRA.Project', {
    order: [
      'issues'
    ],
    options: {
      issues: {
        heading: gettext('Issues'),
        component: 'jiraIssuesList'
      },
    }
  });
}
