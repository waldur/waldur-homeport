import jiraRoutes from './routes';
import registerSidebarExtension from './sidebar';
import jiraProjectsList from './jira-projects-list';
import JiraProjectService from './jira-project-service';

export default module => {
  module.config(jiraRoutes);
  module.run(registerSidebarExtension);
  module.component('jiraProjectsList', jiraProjectsList);
  module.service('JiraProjectService', JiraProjectService);
};
