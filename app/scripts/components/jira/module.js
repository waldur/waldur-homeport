import jiraRoutes from './routes';
import registerSidebarExtension from './sidebar';
import jiraProjectModule from './project/module';
import jiraIssueModule from './issue/module';
import './provider';

export default module => {
  module.config(jiraRoutes);
  module.run(registerSidebarExtension);
  jiraProjectModule(module);
  jiraIssueModule(module);
};
