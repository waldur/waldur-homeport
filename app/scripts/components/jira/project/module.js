import tabsConfig from './tabs';
import jiraProjectConfig from './jira-project-config';
import JiraProjectService from './jira-project-service';
import jiraProjectsList from './jira-projects-list';
import jiraProjectSummary from './jira-project-summary';
import jiraProjectCheckoutSummary from './jira-project-checkout-summary';

export default module => {
  module.config(tabsConfig);
  module.config(jiraProjectConfig);
  module.service('JiraProjectService', JiraProjectService);
  module.component('jiraProjectsList', jiraProjectsList);
  module.component('jiraProjectSummary', jiraProjectSummary);
  module.component('jiraProjectCheckoutSummary', jiraProjectCheckoutSummary);
};
