import tabsConfig from './tabs';
import jiraProjectConfig from './jira-project-config';
import JiraProjectService from './jira-project-service';
import jiraProjectsList from './jira-projects-list';
import jiraProjectCheckoutSummary from './jira-project-checkout-summary';
import { JiraProjectSummary } from './JiraProjectSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('JIRA.Project', JiraProjectSummary);
  module.config(tabsConfig);
  module.config(jiraProjectConfig);
  module.service('JiraProjectService', JiraProjectService);
  module.component('jiraProjectsList', jiraProjectsList);
  module.component('jiraProjectCheckoutSummary', jiraProjectCheckoutSummary);
};
