import jiraRoutes from './routes';
import registerSidebarExtension from './sidebar';
import jiraProjectsList from './jira-projects-list';
import JiraProjectService from './jira-project-service';
import jiraProjectConfig from './jira-project-config';

export default module => {
  module.config(jiraRoutes);
  module.run(registerSidebarExtension);
  module.component('jiraProjectsList', jiraProjectsList);
  module.service('JiraProjectService', JiraProjectService);
  module.config(jiraProjectConfig);
};
