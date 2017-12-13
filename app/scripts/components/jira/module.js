import jiraRoutes from './routes';
import registerSidebarExtension from './sidebar';
import jiraProjectsList from './jira-projects-list';
import JiraProjectService from './jira-project-service';
import jiraProjectConfig from './jira-project-config';
import jiraProjectSummary from './jira-project-summary';

export default module => {
  module.config(jiraRoutes);
  module.config(jiraProjectConfig);
  module.run(registerSidebarExtension);
  module.component('jiraProjectsList', jiraProjectsList);
  module.component('jiraProjectSummary', jiraProjectSummary);
  module.service('JiraProjectService', JiraProjectService);
};
