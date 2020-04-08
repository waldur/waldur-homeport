import jiraIssueModule from './issue/module';
import jiraProjectModule from './project/module';
import jiraRoutes from './routes';
import './provider';

export default module => {
  module.config(jiraRoutes);
  jiraProjectModule(module);
  jiraIssueModule(module);
};
